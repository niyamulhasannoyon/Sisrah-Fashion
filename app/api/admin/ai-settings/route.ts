import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Settings from '@/models/Settings';
import { isAdmin, hasAccessTo } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

// GET AI Settings for Admin Studio
export async function GET() {
  try {
    await dbConnect();
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }

    const aiSettings = {
      aiEnabled: settings.aiEnabled ?? true,
      aiApiKey: settings.aiApiKey || 'v84Ftx7BcJBugkq0Cig51Kwcl2lYjWav',
      aiModel: (settings.aiModel === 'gemini-3.6-flash' || settings.aiModel === 'gemini-3.5-flash' || !settings.aiModel) ? 'gemini-2.0-flash' : settings.aiModel,
      aiAssistantName: settings.aiAssistantName || 'AS SIDRAT AI Assistant',
      aiTone: settings.aiTone || 'Friendly, warm, polite Bengali',
      aiSystemPrompt: settings.aiSystemPrompt || 'Role: You are the real-time customer support chat agent for the Bangladeshi clothing brand "AS SIDRAT" (assidrat.vercel.app).',
      aiRules: settings.aiRules && settings.aiRules.length > 0 ? settings.aiRules : [
        'সবসময় গ্রাহককে সালাম জানান এবং অত্যন্ত মার্জিত বাংলায় বিনয়ী হয়ে সাহায্য প্রদান করুন।',
        'ওয়েবসাইতের রিয়েল-টাইম প্রোডাক্ট প্রাইস, স্টক এবং সাইজ অনুযায়ী সঠিক তথ্য সরবরাহ করুন।',
        'সমগ্র বাংলাদেশে ক্যাশ অন ডেলিভারি (Cash on Delivery) সুবিধা উপলব্ধ।',
        'ঢাকার ভেতরে ডেলিভারি চার্জ ৮০ টাকা (২-৩ দিন) এবং ঢাকার বাইরে ১২০ টাকা (৩-৫ দিন)।',
        'যেকোনো সাইজ এক্সচেঞ্জ বা রিটার্ন ৭ দিনের মধ্যে অক্ষত অবস্থায় গ্রহণ করা হয়।'
      ],
      aiFaqs: settings.aiFaqs && settings.aiFaqs.length > 0 ? settings.aiFaqs : [
        { question: 'আপনাদের ডেলিভারি সময় কত দিন?', answer: 'ঢাকার ভেতরে সাধারণত ২-৩ কর্মদিবস এবং ঢাকার বাইরে ৩-৫ কর্মদিবসের মধ্যে ডেলিভারি সম্পন্ন হয়।' },
        { question: 'পেমেন্ট পদ্ধতি কি কি?', answer: 'আমরা ক্যাশ অন ডেলিভারি (COD), বিকাশ ও নগদ গ্রহণ করি।' },
        { question: 'সাইজ পরিবর্তন করা যাবে কি?', answer: 'হ্যাঁ, প্রোডাক্ট পাওয়ার ৭ দিনের মধ্যে অক্ষত অবস্থায় ফ্রি সাইজ এক্সচেঞ্জ করার সুবিধা রয়েছে।' }
      ],
      aiWelcomeMessage: settings.aiWelcomeMessage || 'আসসালামু আলাইকুম! আস সিদরাহ্-তে আপনাকে স্বাগতম। আজ আপনাকে কীভাবে সাহায্য করতে পারি?',
      aiQuickQueries: settings.aiQuickQueries && settings.aiQuickQueries.length > 0 ? settings.aiQuickQueries : [
        'আমি ক্যাশ অন ডেলিভারিতে অর্ডার করতে চাই।',
        'আপনাদের ডেলিভারি চার্জ ও সময় কত?',
        'নতুন প্রিমিয়াম শার্ট কালেকশন দেখতে চাই।'
      ],
      whatsappNumber: settings.whatsappNumber || '+8801975745270'
    };

    return NextResponse.json({ success: true, aiSettings });
  } catch (error: any) {
    console.error('Error fetching AI settings:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch AI settings' }, { status: 500 });
  }
}

// POST/PUT AI Settings
export async function POST(req: Request) {
  try {
    if (!await isAdmin() && !await hasAccessTo('settings') && !await hasAccessTo('ai-assistant')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    await dbConnect();
    const body = await req.json();

    const updatedSettings = await Settings.findOneAndUpdate(
      {},
      {
        aiEnabled: body.aiEnabled,
        aiApiKey: body.aiApiKey,
        aiModel: body.aiModel,
        aiAssistantName: body.aiAssistantName,
        aiTone: body.aiTone,
        aiSystemPrompt: body.aiSystemPrompt,
        aiRules: body.aiRules,
        aiFaqs: body.aiFaqs,
        aiWelcomeMessage: body.aiWelcomeMessage,
        aiQuickQueries: body.aiQuickQueries,
      },
      { new: true, upsert: true }
    );

    return NextResponse.json({ success: true, settings: updatedSettings });
  } catch (error: any) {
    console.error('Error updating AI settings:', error);
    return NextResponse.json({ success: false, error: 'Failed to update AI settings' }, { status: 500 });
  }
}
