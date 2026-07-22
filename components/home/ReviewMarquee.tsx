'use client';

const reviews = [
  '“AS SIDRAT-এর লিনেন শার্টগুলো যেমন আরামদায়ক, তেমনই দারুণ এডিটিং!”',
  '“ঢাকার গরম ও ভ্যাপসা আবহাওয়ায় কাপড়গুলো সত্যিই খুব আরামদায়ক লাগে।”',
  '“মিনিমালিস্ট ডিজাইন আর চমৎকার ফিনিশিং। অনেক পছন্দ হয়েছে!”',
  '“ক্যাশ অন ডেলিভারিতে দ্রুত ডেলিভারি পেয়েছি। কোয়ালিটি নিয়ে ১০০% স্যাটিসফাইড।”',
  '“অর্ডিনারি ব্র্যান্ডগুলোর চেয়ে এদের সুইং ও কাটিং অনেক বেশি প্রিমিয়াম।”',
  '“ফেব্রিকস অনেক লাইটওয়েট আর বাতাস চলাচলের উপযোগী।”',
  '“ম্যান্ডারিন কলার ও স্টাইলিশ কাটিংয়ের জন্য ক্যাজুয়াল লুকে দুর্দান্ত মানায়।”',
  '“দেশি ব্র্যান্ড হিসেবে এতো হাই-এন্ড কোয়ালিটি ও ফিনিশিং সত্যি প্রশংসনীয়।”'
];

export function ReviewMarquee() {
  return (
    <section className="bg-slate-900 text-white py-12 overflow-hidden border-t border-white/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden">
          <div className="marquee flex gap-8 text-xs sm:text-sm font-semibold font-bengali text-gray-200">
            {reviews.concat(reviews).map((review, index) => (
              <div key={`${review}-${index}`} className="flex items-center gap-6 shrink-0">
                <span className="whitespace-nowrap">{review}</span>
                <span className="text-[#A31F24] text-xs font-sans font-bold">★ ★ ★ ★ ★</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
