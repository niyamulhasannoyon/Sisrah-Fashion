import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Settings from '@/models/Settings';
import Product from '@/models/Product';
import { cleanMarkdownArtifacts } from '@/lib/utils';

export const dynamic = 'force-dynamic';

interface Message {
  role: 'user' | 'assistant' | 'system' | 'model';
  content: string;
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    const { messages = [], activeProductId, stream = true } = body;

    // 1. Fetch AI & Store Settings
    const settingsObj: any = await Settings.findOne().lean();
    const settings = settingsObj || {};

    const aiEnabled = settings.aiEnabled ?? true;
    const whatsappNum = settings.whatsappNumber || '+8801975745270';

    if (!aiEnabled) {
      const disabledMsg = 'আমাদের AI অ্যাসিস্ট্যান্ট বর্তমানে সাময়িকভাবে বন্ধ আছে। যেকোনো তথ্যের জন্য আমাদের অফিশিয়াল হোয়াটসঅ্যাপে সরাসরি যোগাযোগ করুন।';
      if (!stream) {
        return NextResponse.json({
          success: true,
          reply: disabledMsg,
          disabled: true,
          whatsappNumber: whatsappNum
        });
      }
      const streamEncoder = new TextEncoder();
      const customReadable = new ReadableStream({
        start(controller) {
          controller.enqueue(streamEncoder.encode(`data: ${JSON.stringify({ text: disabledMsg })}\n\n`));
          controller.enqueue(streamEncoder.encode(`data: ${JSON.stringify({ done: true, disabled: true, whatsappNumber: whatsappNum })}\n\n`));
          controller.enqueue(streamEncoder.encode('data: [DONE]\n\n'));
          controller.close();
        }
      });
      return new Response(customReadable, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache, no-transform',
          'Connection': 'keep-alive'
        }
      });
    }

    const apiKey = settings.aiApiKey || process.env.GEMINI_API_KEY || '';
    const primaryApiKey = (apiKey === 'v84Ftx7BcJBugkq0Cig51Kwcl2lYjWav' && process.env.GEMINI_API_KEY)
      ? process.env.GEMINI_API_KEY
      : apiKey;

    // Ensure we use active model (default to gemini-3.6-flash or gemini-2.0-flash)
    let modelName = settings.aiModel || 'gemini-3.6-flash';
    if (modelName === 'gemini-3.5-flash' || modelName === 'gemini-2.5-flash') {
      modelName = 'gemini-3.6-flash';
    }

    // 2. Fetch Real-time Products Data from Store Database
    let products: any[] = [];
    try {
      products = await Product.find({ isPublished: { $ne: false } })
        .limit(30)
        .select('title name slug price salePrice category stock stockCount sizes colors description images')
        .lean();
    } catch (e) {
      console.error('Failed to fetch products for AI context:', e);
    }

    const productContext = products.map((p, idx) => {
      const pName = p.title || p.name || 'Product';
      const price = p.salePrice || p.price;
      const originalPrice = p.price;
      const availableSizes = p.sizes ? (Array.isArray(p.sizes) ? p.sizes.join(', ') : p.sizes) : 'S, M, L, XL, XXL';
      const stockStatus = (p.stockCount !== undefined ? p.stockCount > 0 : p.stock !== false) ? 'In Stock' : 'Out of Stock';
      return `${idx + 1}. ${pName} | Category: ${p.category || 'Fashion'} | Price: ৳${price} ${originalPrice > price ? `(Original: ৳${originalPrice})` : ''} | Sizes: [${availableSizes}] | Stock: ${stockStatus} | Link: /product/${p.slug || ''}`;
    }).join('\n');

    // 3. System Instruction Prompt
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

    // 4. Build Gemini API Payload
    const formattedContents = messages
      .filter((m: Message) => m.role !== 'system')
      .map((m: Message) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
      }));

    // If no messages sent, provide default greeting
    if (formattedContents.length === 0) {
      formattedContents.push({
        role: 'user',
        parts: [{ text: 'Hello' }]
      });
    }

    const payload = {
      systemInstruction: {
        parts: [{ text: fullSystemInstruction }]
      },
      contents: formattedContents,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 600
      }
    };

    // Helper to match referenced products
    const getMatchedProducts = (responseText: string) => {
      const matched: any[] = [];
      if (products.length > 0) {
        products.forEach((p) => {
          const pTitle = (p.title || p.name || '').toLowerCase();
          const pSlug = (p.slug || '').toLowerCase();
          if (pSlug && (responseText.toLowerCase().includes(pSlug) || (pTitle.length >= 4 && responseText.toLowerCase().includes(pTitle.substring(0, 8))))) {
            if (matched.length < 2) {
              matched.push({
                _id: p._id,
                title: p.title || p.name,
                slug: p.slug,
                price: p.salePrice || p.price,
                originalPrice: p.price,
                image: p.images && p.images[0] ? (p.images[0].url || p.images[0]) : null
              });
            }
          }
        });
      }
      return matched;
    };

    // 5. Handle Non-Streaming Request
    if (!stream) {
      let aiReplyText = '';
      const apiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${primaryApiKey}`;
      try {
        const response = await fetch(apiEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const resData = await response.json();
        if (resData.candidates && resData.candidates[0]?.content?.parts[0]?.text) {
          aiReplyText = resData.candidates[0].content.parts[0].text;
        } else {
          // Fallback to gemini-2.0-flash
          const fallbackRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${primaryApiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          const fallbackData = await fallbackRes.json();
          if (fallbackData.candidates && fallbackData.candidates[0]?.content?.parts[0]?.text) {
            aiReplyText = fallbackData.candidates[0].content.parts[0].text;
          }
        }
      } catch (err) {
        console.error('Non-streaming Gemini API error:', err);
      }

      const cleanText = cleanMarkdownArtifacts(aiReplyText || 'আসসালামু আলাইকুম! আস সিদরাহ্-তে আপনাকে স্বাগতম। আজ আপনাকে কীভাবে সাহায্য করতে পারি?');
      return NextResponse.json({
        success: true,
        reply: cleanText,
        suggestedProducts: getMatchedProducts(cleanText),
        whatsappNumber: whatsappNum
      });
    }

    // 6. Handle Real-Time Streaming Request via SSE
    const streamEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:streamGenerateContent?alt=sse&key=${primaryApiKey}`;

    let geminiStreamRes = await fetch(streamEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!geminiStreamRes.ok) {
      console.warn(`Primary model ${modelName} streaming failed, falling back to gemini-2.0-flash`);
      geminiStreamRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent?alt=sse&key=${primaryApiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    }

    if (!geminiStreamRes.ok || !geminiStreamRes.body) {
      throw new Error(`Gemini Stream Error with status ${geminiStreamRes.status}`);
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
                  // Clean raw markdown artifacts from chunk
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

          // Ensure full text has all markdown removed
          const sanitizedFinal = cleanMarkdownArtifacts(fullAccumulatedText);
          const suggested = getMatchedProducts(sanitizedFinal);

          // Send finish event with metadata
          const endData = `data: ${JSON.stringify({
            done: true,
            fullText: sanitizedFinal,
            suggestedProducts: suggested,
            whatsappNumber: whatsappNum
          })}\n\n`;
          controller.enqueue(textEncoder.encode(endData));
          controller.enqueue(textEncoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (streamErr) {
          console.error('Stream processing error:', streamErr);
          const fallbackText = 'আসসালামু আলাইকুম! আস সিদরাহ্-তে আপনাকে স্বাগতম। আজ আপনাকে কীভাবে সাহায্য করতে পারি?';
          controller.enqueue(textEncoder.encode(`data: ${JSON.stringify({ text: fallbackText })}\n\n`));
          controller.enqueue(textEncoder.encode(`data: ${JSON.stringify({ done: true, fullText: fallbackText, suggestedProducts: [], whatsappNumber: whatsappNum })}\n\n`));
          controller.enqueue(textEncoder.encode('data: [DONE]\n\n'));
          controller.close();
        }
      }
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive'
      }
    });

  } catch (error: any) {
    console.error('AI Chat Route Error:', error);
    return NextResponse.json({
      success: false,
      reply: 'দুঃখিত, প্রযুক্তিগত সমস্যার কারণে উত্তর দেওয়া সম্ভব হয়নি। অনুগ্রহ করে আমাদের হোয়াটসঅ্যাপে যোগাযোগ করুন।',
      error: error.message
    }, { status: 500 });
  }
}
