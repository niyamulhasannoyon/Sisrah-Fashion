import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Settings from '@/models/Settings';
import Product from '@/models/Product';
import { cleanMarkdownArtifacts } from '@/lib/utils';
import { aiChatLimiter } from '@/lib/rateLimiter';

export const dynamic = 'force-dynamic';

interface Message {
  role: 'user' | 'assistant' | 'system' | 'model';
  content: string;
}

// In-memory cache for product catalog context (3-minute TTL)
let productContextCache: { context: string; products: any[]; expiresAt: number } | null = null;
const CACHE_TTL_MS = 3 * 60 * 1000;

async function getCachedProductContext(): Promise<{ context: string; products: any[] }> {
  const now = Date.now();
  if (productContextCache && productContextCache.expiresAt > now) {
    return {
      context: productContextCache.context,
      products: productContextCache.products,
    };
  }

  let products: any[] = [];
  try {
    await dbConnect();
    products = await Product.find({ isPublished: { $ne: false } })
      .limit(30)
      .select('title name slug price salePrice category stock stockCount sizes colors description images')
      .lean();
  } catch (e) {
    console.error('Failed to fetch products for AI context:', e);
    // If cache exists even if expired, reuse as fallback under DB error
    if (productContextCache) {
      return {
        context: productContextCache.context,
        products: productContextCache.products,
      };
    }
  }

  const context = products
    .map((p, idx) => {
      const pName = p.title || p.name || 'Product';
      const price = p.salePrice || p.price;
      const originalPrice = p.price;
      const availableSizes = p.sizes
        ? Array.isArray(p.sizes)
          ? p.sizes.join(', ')
          : p.sizes
        : 'S, M, L, XL, XXL';
      const stockStatus =
        (p.stockCount !== undefined ? p.stockCount > 0 : p.stock !== false)
          ? 'In Stock'
          : 'Out of Stock';
      return `${idx + 1}. ${pName} | Category: ${p.category || 'Fashion'} | Price: ৳${price} ${
        originalPrice > price ? `(Original: ৳${originalPrice})` : ''
      } | Sizes: [${availableSizes}] | Stock: ${stockStatus} | Link: /product/${p.slug || ''}`;
    })
    .join('\n');

  productContextCache = {
    context,
    products,
    expiresAt: now + CACHE_TTL_MS,
  };

  return { context, products };
}

export async function POST(req: Request) {
  // 1. Ingress Rate Limiting (Prevents AI quota and thread exhaustion)
  const limitCheck = aiChatLimiter.check(req);
  if (limitCheck.blocked) {
    return limitCheck.response!;
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { messages = [], stream = true } = body;

    // 2. Fetch AI & Store Settings
    await dbConnect();
    const settingsObj: any = await Settings.findOne().lean().catch(() => ({}));
    const settings = settingsObj || {};

    const aiEnabled = settings.aiEnabled ?? true;
    const whatsappNum = settings.whatsappNumber || '+8801975745270';

    if (!aiEnabled) {
      const disabledMsg =
        'আমাদের AI অ্যাসিস্ট্যান্ট বর্তমানে সাময়িকভাবে বন্ধ আছে। যেকোনো তথ্যের জন্য আমাদের অফিশিয়াল হোয়াটসঅ্যাপে সরাসরি যোগাযোগ করুন।';
      if (!stream) {
        return NextResponse.json({
          success: true,
          reply: disabledMsg,
          disabled: true,
          whatsappNumber: whatsappNum,
        });
      }
      const streamEncoder = new TextEncoder();
      const customReadable = new ReadableStream({
        start(controller) {
          controller.enqueue(streamEncoder.encode(`data: ${JSON.stringify({ text: disabledMsg })}\n\n`));
          controller.enqueue(
            streamEncoder.encode(
              `data: ${JSON.stringify({ done: true, disabled: true, whatsappNumber: whatsappNum })}\n\n`
            )
          );
          controller.enqueue(streamEncoder.encode('data: [DONE]\n\n'));
          controller.close();
        },
      });
      return new Response(customReadable, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache, no-transform',
          Connection: 'keep-alive',
        },
      });
    }

    const apiKey = settings.aiApiKey || process.env.GEMINI_API_KEY || '';
    const primaryApiKey =
      apiKey === 'v84Ftx7BcJBugkq0Cig51Kwcl2lYjWav' && process.env.GEMINI_API_KEY
        ? process.env.GEMINI_API_KEY
        : apiKey;

    let modelName = settings.aiModel || 'gemini-3.6-flash';
    if (modelName === 'gemini-3.5-flash' || modelName === 'gemini-2.5-flash') {
      modelName = 'gemini-3.6-flash';
    }

    // 3. Cached Product Context (Zero DB load on repeated chats)
    const { context: productContext, products } = await getCachedProductContext();

    // 4. System Instruction Prompt
    const baseSystemPrompt = `Role: You are the real-time customer support chat agent for the Bangladeshi clothing brand "AS SIDRAT" (assidrat.vercel.app).

Tone and Personality:
- Friendly, warm, polite, and natural—like talking to a helpful Bangladeshi store representative.
- Reply in Bengali by default, or match the user's language (Banglish/English).
- Keep replies brief and conversational (1-2 sentences maximum).

Strict Formatting Rules:
- NEVER use markdown symbols (*, **, _, #, -, etc.).
- Output ONLY plain text with normal spacing and line breaks.

Knowledge Base:
- Products: Premium linen shirts, pure combed cotton t-shirts.
- Delivery Charge and Time: Inside Dhaka 80 TK (2-3 business days), Outside Dhaka 120 TK (3-5 business days).
- Return and Exchange: 7-day hassle-free exchange for unused items with tags.
- Payment Methods: Cash on Delivery (COD), bKash, Nagad.
- WhatsApp Support: +880 1975745270.

Boundary:
- If asked about unrelated topics, politely guide them back to AS SIDRAT shopping.`;

    const fullSystemInstruction = `${baseSystemPrompt}

${productContext.length > 0 ? `Real-time Live Store Product Catalog Snapshot:\n${productContext}` : ''}`;

    // 5. Build Gemini API Payload
    const formattedContents = messages
      .filter((m: Message) => m.role !== 'system')
      .map((m: Message) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }],
      }));

    if (formattedContents.length === 0) {
      formattedContents.push({
        role: 'user',
        parts: [{ text: 'Hello' }],
      });
    }

    const payload = {
      systemInstruction: {
        parts: [{ text: fullSystemInstruction }],
      },
      contents: formattedContents,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 600,
      },
    };

    const getMatchedProducts = (responseText: string) => {
      const matched: any[] = [];
      if (products.length > 0) {
        products.forEach((p) => {
          const pTitle = (p.title || p.name || '').toLowerCase();
          const pSlug = (p.slug || '').toLowerCase();
          if (
            pSlug &&
            (responseText.toLowerCase().includes(pSlug) ||
              (pTitle.length >= 4 && responseText.toLowerCase().includes(pTitle.substring(0, 8))))
          ) {
            if (matched.length < 2) {
              matched.push({
                _id: p._id,
                title: p.title || p.name,
                slug: p.slug,
                price: p.salePrice || p.price,
                originalPrice: p.price,
                image: p.images && p.images[0] ? p.images[0].url || p.images[0] : null,
              });
            }
          }
        });
      }
      return matched;
    };

    // 6. Handle Non-Streaming Request with Strict Timeout (8s)
    if (!stream) {
      let aiReplyText = '';
      const apiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${primaryApiKey}`;
      try {
        const response = await fetch(apiEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(8000),
        });
        const resData = await response.json();
        if (resData.candidates && resData.candidates[0]?.content?.parts[0]?.text) {
          aiReplyText = resData.candidates[0].content.parts[0].text;
        } else {
          // Fallback to gemini-2.0-flash
          const fallbackRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${primaryApiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
              signal: AbortSignal.timeout(6000),
            }
          );
          const fallbackData = await fallbackRes.json();
          if (fallbackData.candidates && fallbackData.candidates[0]?.content?.parts[0]?.text) {
            aiReplyText = fallbackData.candidates[0].content.parts[0].text;
          }
        }
      } catch (err) {
        console.error('Non-streaming Gemini API error/timeout:', err);
      }

      const cleanText = cleanMarkdownArtifacts(
        aiReplyText || 'আসসালামু আলাইকুম! আস সিদরাহ্-তে আপনাকে স্বাগতম। আজ আপনাকে কীভাবে সাহায্য করতে পারি?'
      );
      return NextResponse.json({
        success: true,
        reply: cleanText,
        suggestedProducts: getMatchedProducts(cleanText),
        whatsappNumber: whatsappNum,
      });
    }

    // 7. Handle Real-Time Streaming Request via SSE with Timeout & Circuit Breaker
    const streamEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:streamGenerateContent?alt=sse&key=${primaryApiKey}`;

    let geminiStreamRes: Response | null = null;
    try {
      geminiStreamRes = await fetch(streamEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(8000),
      });

      if (!geminiStreamRes.ok) {
        console.warn(`Primary model ${modelName} streaming failed, falling back to gemini-2.0-flash`);
        geminiStreamRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent?alt=sse&key=${primaryApiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            signal: AbortSignal.timeout(6000),
          }
        );
      }
    } catch (fetchErr: any) {
      console.warn('Gemini stream connection timeout or failure:', fetchErr?.message);
    }

    if (!geminiStreamRes || !geminiStreamRes.ok || !geminiStreamRes.body) {
      const fallbackText =
        'আসসালামু আলাইকুম! আস সিদরাহ্-তে আপনাকে স্বাগতম। আজ আপনাকে কীভাবে সাহায্য করতে পারি? যেকোনো তথ্যের জন্য আমাদের হোয়াটসঅ্যাপে যোগাযোগ করতে পারেন।';
      const streamEncoder = new TextEncoder();
      const fallbackStream = new ReadableStream({
        start(controller) {
          controller.enqueue(streamEncoder.encode(`data: ${JSON.stringify({ text: fallbackText })}\n\n`));
          controller.enqueue(
            streamEncoder.encode(
              `data: ${JSON.stringify({
                done: true,
                fullText: fallbackText,
                suggestedProducts: [],
                whatsappNumber: whatsappNum,
              })}\n\n`
            )
          );
          controller.enqueue(streamEncoder.encode('data: [DONE]\n\n'));
          controller.close();
        },
      });
      return new Response(fallbackStream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache, no-transform',
          Connection: 'keep-alive',
        },
      });
    }

    const textEncoder = new TextEncoder();
    const textDecoder = new TextDecoder();
    const geminiReader = geminiStreamRes.body.getReader();

    let fullAccumulatedText = '';
    let buffer = '';

    const readable = new ReadableStream({
      async start(controller) {
        try {
          while (true) {
            const { done, value } = await geminiReader.read();
            if (done) break;

            buffer += textDecoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed || !trimmed.startsWith('data:')) continue;
              const jsonStr = trimmed.replace(/^data:\s*/, '');
              try {
                const parsed = JSON.parse(jsonStr);
                const chunkText = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
                if (chunkText) {
                  const cleanChunk = chunkText.replace(/[\*_`#~]/g, '');
                  fullAccumulatedText += cleanChunk;
                  const sseData = `data: ${JSON.stringify({ text: cleanChunk })}\n\n`;
                  controller.enqueue(textEncoder.encode(sseData));
                }
              } catch (e) {
                // Ignore partial JSON parse errors in stream
              }
            }
          }

          const sanitizedFinal = cleanMarkdownArtifacts(fullAccumulatedText);
          const suggested = getMatchedProducts(sanitizedFinal);

          const endData = `data: ${JSON.stringify({
            done: true,
            fullText: sanitizedFinal,
            suggestedProducts: suggested,
            whatsappNumber: whatsappNum,
          })}\n\n`;
          controller.enqueue(textEncoder.encode(endData));
          controller.enqueue(textEncoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (streamErr) {
          console.error('Stream processing error:', streamErr);
          const fallbackText =
            'আসসালামু আলাইকুম! আস সিদরাহ্-তে আপনাকে স্বাগতম। আজ আপনাকে কীভাবে সাহায্য করতে পারি?';
          controller.enqueue(textEncoder.encode(`data: ${JSON.stringify({ text: fallbackText })}\n\n`));
          controller.enqueue(
            textEncoder.encode(
              `data: ${JSON.stringify({
                done: true,
                fullText: fallbackText,
                suggestedProducts: [],
                whatsappNumber: whatsappNum,
              })}\n\n`
            )
          );
          controller.enqueue(textEncoder.encode('data: [DONE]\n\n'));
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
      },
    });
  } catch (error: any) {
    console.error('AI Chat Route Error:', error);
    return NextResponse.json(
      {
        success: false,
        reply:
          'দুঃখিত, প্রযুক্তিগত সমস্যার কারণে উত্তর দেওয়া সম্ভব হয়নি। অনুগ্রহ করে আমাদের হোয়াটসঅ্যাপে যোগাযোগ করুন।',
        error: error.message,
      },
      { status: 500 }
    );
  }
}

