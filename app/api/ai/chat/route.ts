import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Settings from '@/models/Settings';
import Product from '@/models/Product';

export const dynamic = 'force-dynamic';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { messages = [], activeProductId } = await req.json();

    // 1. Fetch AI & Store Settings
    const settingsObj: any = await Settings.findOne().lean();
    const settings = settingsObj || {};

    const aiEnabled = settings.aiEnabled ?? true;
    if (!aiEnabled) {
      return NextResponse.json({
        success: true,
        reply: 'আমাদের AI অ্যাসিস্ট্যান্ট বর্তমানে সাময়িকভাবে বন্ধ আছে। যেকোনো তথ্যের জন্য আমাদের অফিশিয়াল হোয়াটসঅ্যাপে সরাসরি যোগাযোগ করুন।',
        disabled: true,
        whatsappNumber: settings.whatsappNumber || '+8801975745270'
      });
    }

    const apiKey = settings.aiApiKey || process.env.GEMINI_API_KEY || '';
    const primaryApiKey = (apiKey === 'v84Ftx7BcJBugkq0Cig51Kwcl2lYjWav' && process.env.GEMINI_API_KEY)
      ? process.env.GEMINI_API_KEY
      : apiKey;

    const modelName = settings.aiModel || 'gemini-3.5-flash';
    const assistantName = settings.aiAssistantName || 'AS SIDRAT AI Assistant';
    const systemPromptCustom = settings.aiSystemPrompt || 'আপনি AS SIDRAT ফ্যাশন ব্র্যান্ডের অফিশিয়াল AI কাস্টমার কেয়ার অ্যাসিস্ট্যান্ট। কাস্টমারদের সাথে অত্যন্ত মার্জিত, পেশাদার এবং বন্ধুবৎসল বাংলায় কথা বলুন।';
    
    const rulesList = (settings.aiRules && settings.aiRules.length > 0) ? settings.aiRules : [
      'সবসময় গ্রাহককে সালাম জানান এবং অত্যন্ত মার্জিত বাংলায় বিনয়ী হয়ে সাহায্য প্রদান করুন।',
      'ওয়েবসাইতের রিয়েল-টাইম প্রোডাক্ট প্রাইস, স্টক এবং সাইজ অনুযায়ী সঠিক তথ্য সরবরাহ করুন।',
      'সমগ্র বাংলাদেশে ক্যাশ অন ডেলিভারি (Cash on Delivery) সুবিধা উপলব্ধ।',
      'ঢাকার ভেতরে ডেলিভারি চার্জ ৭০ টাকা (২-৩ দিন) এবং ঢাকার বাইরে ১৩০ টাকা (৩-৫ দিন)।',
      'যেকোনো সাইজ এক্সচেঞ্জ বা রিটার্ন ৭ দিনের মধ্যে অক্ষত অবস্থায় গ্রহণ করা হয়।'
    ];

    const faqsList = (settings.aiFaqs && settings.aiFaqs.length > 0) ? settings.aiFaqs : [];

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

    // 3. Store Shipping & Contact Context
    const shippingDhaka = settings.shippingInsideDhaka ?? 70;
    const shippingOutside = settings.shippingOutsideDhaka ?? 130;
    const whatsappNum = settings.whatsappNumber || '+8801975745270';
    const storeInfoContext = `
- Store Name: AS SIDRAT
- Shipping Inside Dhaka: ৳${shippingDhaka} (Delivery time: 2-3 business days)
- Shipping Outside Dhaka: ৳${shippingOutside} (Delivery time: 3-5 business days)
- Payment Methods: Cash on Delivery (COD), bKash, Nagad, SSLCommerz Cards.
- Official WhatsApp Support: ${whatsappNum}
- Return/Exchange Policy: 7 days size exchange guarantee for unused items.
`;

    // 4. Construct System Instruction
    const fullSystemInstruction = `
System Identity & Persona:
You are "${assistantName}", the official AI Customer Care Specialist for the premier fashion brand "AS SIDRAT".

Core Guidelines & Instructions:
1. Tone & Language: Speak in polite, highly professional, elegant, and friendly Bengali (অত্যন্ত মার্জিত, পেশাদার, বিনীত ও সাবলীল বাংলা). Use respectful phrasing (e.g. "আসসালামু আলাইকুম", "ধন্যবাদ", "অবশ্যই", "আপনাকে কীভাবে সাহায্য করতে পারি?").
2. Standard Terminology: Use English terms naturally where standard in e-commerce (e.g. "Cash on Delivery", "Linen Shirt", "Polo T-Shirt", "Size L", "Order", "Delivery Charge").
3. Product Information Accuracy: Answer queries about products strictly using the real-time store catalog data provided below. Never invent non-existent products or wrong prices.
4. Product Links: If a customer asks about a specific product or category, mention the product name and include its link (e.g., /product/slug-name) so the user can easily view and buy it.
5. Admin Trained Rules:
${rulesList.map((r: string, i: number) => `   - Rule ${i + 1}: ${r}`).join('\n')}

${faqsList.length > 0 ? `6. Official Store FAQs:\n${faqsList.map((f: any) => `   - Q: ${f.question} -> A: ${f.answer}`).join('\n')}` : ''}

7. Admin System Prompt Customization:
${systemPromptCustom}

Real-time Store Information:
${storeInfoContext}

Real-time Website Product Catalog Snapshot (${products.length} Products):
${productContext.length > 0 ? productContext : 'Currently catalog is loading.'}
`;

    // 5. Build Gemini API Payload
    const formattedContents = messages.map((m: Message) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }]
    }));

    // Call Gemini REST API
    let aiReplyText = '';
    const apiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${primaryApiKey}`;

    try {
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: fullSystemInstruction }]
          },
          contents: formattedContents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1000
          }
        })
      });

      const resData = await response.json();

      if (resData.candidates && resData.candidates[0]?.content?.parts[0]?.text) {
        aiReplyText = resData.candidates[0].content.parts[0].text;
      } else if (resData.error) {
        console.error('Gemini API Error details:', resData.error);
        // Fallback call with gemini-2.0-flash if modelName failed
        const fallbackEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY || primaryApiKey}`;
        const fallbackRes = await fetch(fallbackEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: fullSystemInstruction }] },
            contents: formattedContents
          })
        });
        const fallbackData = await fallbackRes.json();
        if (fallbackData.candidates && fallbackData.candidates[0]?.content?.parts[0]?.text) {
          aiReplyText = fallbackData.candidates[0].content.parts[0].text;
        }
      }
    } catch (err) {
      console.error('Gemini API Fetch Exception:', err);
    }

    if (!aiReplyText) {
      aiReplyText = 'আসসালামু আলাইকুম! আপনার মেসেজের জন্য ধন্যবাদ। আমি AS SIDRAT AI Assistant। আপনাকে কীভাবে সাহায্য করতে পারি? আমাদের ক্যাশ অন ডেলিভারি, সারা বাংলাদেশে ডেলিভারি সার্ভিস ও নতুন কালেকশন সম্পর্কিত প্রশ্ন জিজ্ঞেস করতে পারেন।';
    }

    // 6. Detect referenced products to return for rich product cards in chat
    const matchedProducts: any[] = [];
    if (products.length > 0) {
      products.forEach((p) => {
        const pTitle = (p.title || p.name || '').toLowerCase();
        const pSlug = (p.slug || '').toLowerCase();
        if (pSlug && (aiReplyText.toLowerCase().includes(pSlug) || aiReplyText.toLowerCase().includes(pTitle.substring(0, 10)))) {
          if (matchedProducts.length < 2) {
            matchedProducts.push({
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

    return NextResponse.json({
      success: true,
      reply: aiReplyText,
      suggestedProducts: matchedProducts,
      whatsappNumber: whatsappNum
    });

  } catch (error: any) {
    console.error('AI Chat Error:', error);
    return NextResponse.json({
      success: false,
      reply: 'দুঃখিত, প্রযুক্তিগত সমস্যার কারণে উত্তর দেওয়া সম্ভব হয়নি। অনুগ্রহ করে আমাদের হোয়াটসঅ্যাপ নম্বরে যোগাযোগ করুন।',
      error: error.message
    }, { status: 500 });
  }
}
