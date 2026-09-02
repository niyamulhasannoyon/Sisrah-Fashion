import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Settings from '@/models/Settings';
import Product from '@/models/Product';
import { cleanMarkdownArtifacts, getDirectImageLink } from '@/lib/utils';
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
    products = await Product.find({})
      .limit(50)
      .select('title slug description category subCategory tags images variants lowStockThreshold rating numReviews basePrice offerPrice')
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
      const pName = p.title || 'Product';
      const regularPrice = p.basePrice || 0;
      const offerPrice = p.offerPrice && p.offerPrice > 0 && p.offerPrice < regularPrice ? p.offerPrice : null;
      const effectivePrice = offerPrice || regularPrice;
      
      const variantList = Array.isArray(p.variants) ? p.variants : [];
      const availableSizes = Array.from(new Set(variantList.map((v: any) => v.size).filter(Boolean)));
      const availableColors = Array.from(new Set(variantList.map((v: any) => v.color).filter(Boolean)));
      const totalStock = variantList.reduce((sum: number, v: any) => sum + (Number(v.stock) || 0), 0);

      let stockStatus = 'In Stock';
      if (variantList.length > 0 && totalStock <= 0) {
        stockStatus = 'Out of Stock';
      } else if (totalStock > 0 && totalStock <= (p.lowStockThreshold || 5)) {
        stockStatus = 'Low Stock (Few items left)';
      }

      const sizesStr = availableSizes.length > 0 ? availableSizes.join(', ') : 'Standard Sizes';
      const colorsStr = availableColors.length > 0 ? ` | Colors: [${availableColors.join(', ')}]` : '';
      const priceStr = offerPrice
        ? `৳${offerPrice} (Special Offer, Regular: ৳${regularPrice})`
        : `৳${regularPrice}`;

      return `${idx + 1}. ${pName} | Category: ${p.category || 'Fashion'}${p.subCategory ? ` (${p.subCategory})` : ''} | Price: ${priceStr} | Sizes: [${sizesStr}]${colorsStr} | Stock: ${stockStatus} | URL: /product/${p.slug || ''}`;
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
  // 1. Ingress Rate Limiting (Prevents AI quota exhaustion)
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
    const email = settings.contactEmail || 'support@assidrat.com';
    const address = settings.contactAddress || 'Dhaka, Bangladesh';
    const shippingInside = settings.shippingInsideDhaka ?? 60;
    const shippingOutside = settings.shippingOutsideDhaka ?? 120;
    const freeShippingTrigger = settings.freeShippingTrigger || 'none';
    const freeShippingMinAmount = settings.freeShippingMinAmount || 3000;
    const freeShippingMinQty = settings.freeShippingMinQuantity || 2;

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

    const dbApiKey = (settings.aiApiKey || '').trim();
    const envApiKey = (process.env.GEMINI_API_KEY || '').trim();
    const primaryApiKey =
      dbApiKey && dbApiKey !== 'v84Ftx7BcJBugkq0Cig51Kwcl2lYjWav' ? dbApiKey : envApiKey;

    // Validate and prioritize Gemini models
    const validGeminiModels = [
      'gemini-3.5-flash-lite',
      'gemini-flash-lite-latest',
      'gemini-3.6-flash',
      'gemini-flash-latest',
      'gemini-3.7-flash',
      'gemini-3.5-flash',
      'gemini-3.1-pro-preview',
    ];

    let chosenModel = (settings.aiModel || '').trim();
    if (!validGeminiModels.includes(chosenModel)) {
      chosenModel = 'gemini-3.5-flash-lite';
    }

    const candidateModels = Array.from(
      new Set([chosenModel, 'gemini-3.5-flash-lite', 'gemini-flash-lite-latest', 'gemini-3.6-flash', 'gemini-3.5-flash'])
    );

    // 3. Cached Product Context (Zero DB load on repeated chats)
    const { context: productContext, products } = await getCachedProductContext();

    // 4. Build Dynamic Knowledge & System Instruction
    const assistantName = settings.aiAssistantName || 'AS SIDRAT AI Assistant';
    const tone = settings.aiTone || 'Friendly, warm, polite, and helpful Bengali';
    const customPrompt = settings.aiSystemPrompt?.trim() || '';

    let freeShippingText = 'কোনো নির্দিষ্ট ফ্রি ডেলিভারি অফার বর্তমানে সক্রিয় নেই।';
    if (freeShippingTrigger === 'amount') {
      freeShippingText = `৳${freeShippingMinAmount} বা তার বেশি অর্ডারে সারা দেশে ডেলিভারি সম্পূর্ণ ফ্রি!`;
    } else if (freeShippingTrigger === 'quantity') {
      freeShippingText = `${freeShippingMinQty} বা তার বেশি প্রোডাক্ট অর্ডারে ডেলিভারি ফ্রি!`;
    } else if (freeShippingTrigger === 'both') {
      freeShippingText = `কমপক্ষে ${freeShippingMinQty}টি প্রোডাক্ট অথবা ৳${freeShippingMinAmount} এর অর্ডারে ডেলিভারি ফ্রি!`;
    }

    const rulesList = Array.isArray(settings.aiRules) && settings.aiRules.length > 0
      ? settings.aiRules.map((r: string, i: number) => `${i + 1}. ${r}`).join('\n')
      : `1. সর্বদা গ্রাহককে সালাম জানান এবং অত্যন্ত মার্জিত বাংলায় বিনয়ী হয়ে সাহায্য প্রদান করুন।
2. ওয়েবসাইটের রিয়েল-টাইম প্রোডাক্ট প্রাইস, স্টক এবং সাইজ অনুযায়ী সঠিক তথ্য সরবরাহ করুন।
3. সমগ্র বাংলাদেশে ক্যাশ অন ডেলিভারি (Cash on Delivery) সুবিধা উপলব্ধ।
4. ঢাকার ভেতরে ডেলিভারি চার্জ ৳${shippingInside} (২-৩ কার্যদিবস) এবং ঢাকার বাইরে ৳${shippingOutside} (৩-৫ কার্যদিবস)।
5. যেকোনো সাইজ এক্সচেঞ্জ বা রিটার্ন ৭ দিনের মধ্যে অক্ষত অবস্থায় গ্রহণ করা হয়।`;

    const faqsList = Array.isArray(settings.aiFaqs) && settings.aiFaqs.length > 0
      ? settings.aiFaqs.map((f: any) => `Q: ${f.question}\nA: ${f.answer}`).join('\n\n')
      : `Q: আপনাদের ডেলিভারি চার্জ ও সময় কত?
A: ঢাকার ভেতরে ডেলিভারি চার্জ ৳${shippingInside} (২-৩ কার্যদিবস) এবং ঢাকার বাইরে ৳${shippingOutside} (৩-৫ কার্যদিবস)।

Q: পেমেন্ট পদ্ধতি কি কি?
A: আমরা ক্যাশ অন ডেলিভারি (Cash on Delivery), বিকাশ, নগদ ও অনলাইন কার্ড পেমেন্ট গ্রহণ করি।

Q: সাইজ পরিবর্তন বা এক্সচেঞ্জ করা যাবে কি?
A: হ্যাঁ, প্রোডাক্ট ডেলিভারি পাওয়ার ৭ দিনের মধ্যে অক্ষত অবস্থায় ও ট্যাগসহ সহজে সাইজ এক্সচেঞ্জ করার সুবিধা রয়েছে।`;

    const fullSystemInstruction = `You are "${assistantName}", the official AI Customer Support Specialist for the premium Bangladeshi fashion brand "AS SIDRAT" (Website: assidrat.vercel.app).

Role & Conversational Tone:
- Tone: ${tone}.
- Language: Reply in natural, conversational Bengali (বাংলা) by default. If the customer messages in English or Banglish (Bengali written in Latin letters), reply naturally in that matching language.
- Brevity: Keep responses concise, warm, and clear (1-3 sentences maximum).
- Formatting: Output ONLY clean plain text. NEVER use raw markdown symbols (*, **, _, #, \`, -, etc.).

Store Policies & Delivery Facts:
- Cash on Delivery (COD) is available all over Bangladesh.
- Delivery Charges & Timelines:
  * Inside Dhaka: ৳${shippingInside} (2-3 business days)
  * Outside Dhaka: ৳${shippingOutside} (3-5 business days)
  * Free Shipping: ${freeShippingText}
- Returns & Exchanges: 7-day hassle-free size exchange for unworn items with original tags intact.
- Payment Methods: Cash on Delivery (COD), bKash, Nagad, SSLCommerz card payments.
- Support WhatsApp: ${whatsappNum}
- Support Email: ${email}
- Store Address: ${address}

${customPrompt ? `Store Manager Custom Guidelines:\n${customPrompt}\n` : ''}
Mandatory Business Rules (Strictly Enforced):
${rulesList}

Store FAQ Knowledgebase:
${faqsList}

${productContext.length > 0 ? `Live Real-Time Product Catalog Snapshot:\n${productContext}\n` : ''}
Catalog & Inquiry Instructions:
- Always use the exact prices in Bangladeshi Taka (৳) and available sizes from the Live Product Catalog Snapshot above.
- When recommending a product, mention its exact title, price in ৳, available sizes, and link (/product/slug).
- If an item is out of stock, politely inform the customer and suggest an in-stock alternative from the catalog.
- If asked about human support, direct them politely to official WhatsApp at ${whatsappNum}.`;

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
        temperature: 0.6,
        maxOutputTokens: 700,
      },
    };

    const getMatchedProducts = (responseText: string) => {
      const matched: any[] = [];
      if (!products || products.length === 0) return matched;

      const lowerText = responseText.toLowerCase();

      for (const p of products) {
        if (matched.length >= 2) break;
        const pTitle = (p.title || '').toLowerCase();
        const pSlug = (p.slug || '').toLowerCase();

        const titleWords = pTitle.split(/\s+/).filter((w: string) => w.length > 3);
        const hasWordMatch = titleWords.some((w: string) => lowerText.includes(w));

        if (
          (pSlug && lowerText.includes(pSlug)) ||
          (pTitle && lowerText.includes(pTitle)) ||
          hasWordMatch
        ) {
          const regPrice = p.basePrice || 0;
          const offer = p.offerPrice && p.offerPrice > 0 && p.offerPrice < regPrice ? p.offerPrice : null;
          const effective = offer || regPrice;
          const rawImg = p.images && p.images[0] ? (p.images[0].url || p.images[0]) : null;

          matched.push({
            _id: p._id,
            title: p.title,
            slug: p.slug,
            price: effective,
            originalPrice: regPrice,
            image: rawImg ? getDirectImageLink(rawImg) : null,
          });
        }
      }

      return matched;
    };

    // 6. Handle Non-Streaming Request with Resilient Multi-Model Fallback
    if (!stream) {
      let aiReplyText = '';
      for (const candidateModel of candidateModels) {
        const apiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/${candidateModel}:generateContent?key=${primaryApiKey}`;
        try {
          const response = await fetch(apiEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            signal: AbortSignal.timeout(8000),
          });
          if (response.ok) {
            const resData = await response.json();
            const parts = resData.candidates?.[0]?.content?.parts || [];
            const nonThoughtText = parts
              .filter((p: any) => !p.thought && p.text)
              .map((p: any) => p.text)
              .join('');
            if (nonThoughtText && nonThoughtText.trim()) {
              aiReplyText = nonThoughtText.trim();
              break;
            }
          } else {
            console.warn(`Non-streaming model ${candidateModel} failed with status: ${response.status}`);
          }
        } catch (err: any) {
          console.warn(`Non-streaming model ${candidateModel} error:`, err?.message);
        }
      }

      const cleanText = cleanMarkdownArtifacts(
        aiReplyText ||
          'দুঃখিত, সংযোগে সাময়িক সমস্যা হচ্ছে। সরাসরি তথ্যের জন্য আমাদের অফিশিয়াল হোয়াটসঅ্যাপে যোগাযোগ করতে পারেন।'
      );
      return NextResponse.json({
        success: true,
        reply: cleanText,
        suggestedProducts: getMatchedProducts(cleanText),
        whatsappNumber: whatsappNum,
      });
    }

    // 7. Handle Real-Time Streaming Request via SSE with Multi-Model Fallback
    let geminiStreamRes: Response | null = null;
    let connectedModel = '';

    for (const candidateModel of candidateModels) {
      const streamEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/${candidateModel}:streamGenerateContent?alt=sse&key=${primaryApiKey}`;
      try {
        const res = await fetch(streamEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(7000),
        });

        if (res.ok && res.body) {
          geminiStreamRes = res;
          connectedModel = candidateModel;
          break;
        } else {
          console.warn(`Streaming model ${candidateModel} failed with status: ${res.status}`);
        }
      } catch (fetchErr: any) {
        console.warn(`Streaming model ${candidateModel} connection timeout or failure:`, fetchErr?.message);
      }
    }

    if (!geminiStreamRes || !geminiStreamRes.ok || !geminiStreamRes.body) {
      const fallbackText =
        'দুঃখিত, সংযোগে সাময়িক সমস্যা হচ্ছে। সরাসরি তথ্যের জন্য আমাদের অফিশিয়াল হোয়াটসঅ্যাপে যোগাযোগ করতে পারেন।';
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
              if (jsonStr === '[DONE]') continue;
              try {
                const parsed = JSON.parse(jsonStr);
                const parts = parsed.candidates?.[0]?.content?.parts || [];
                for (const part of parts) {
                  // Skip internal reasoning thoughts
                  if (part.thought) continue;
                  const chunkText = part.text;
                  if (chunkText) {
                    const cleanChunk = chunkText.replace(/[\*_`#~]/g, '');
                    fullAccumulatedText += cleanChunk;
                    const sseData = `data: ${JSON.stringify({ text: cleanChunk })}\n\n`;
                    controller.enqueue(textEncoder.encode(sseData));
                  }
                }
              } catch (e) {
                // Ignore partial JSON parse errors in stream
              }
            }
          }

          const sanitizedFinal =
            cleanMarkdownArtifacts(fullAccumulatedText) ||
            'আসসালামু আলাইকুম! আপনাকে কীভাবে সাহায্য করতে পারি?';
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
            cleanMarkdownArtifacts(fullAccumulatedText) ||
            'দুঃখিত, সংযোগে সাময়িক সমস্যা হয়েছে। সরাসরি হোয়াটসঅ্যাপে যোগাযোগ করতে পারেন।';
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
