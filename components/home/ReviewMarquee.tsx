const reviews = [
  '“AS SIDRAT makes summer dressing feel effortless and upscale.”',
  '“The fabrics are incredibly breathable — perfect for Dhaka\'s intense humidity.”',
  '“Minimalist design with elegant red accent details. Absolutely in love.”',
  '“This feels like premium fashion crafted with genuine climate-conscious focus.”',
  '“Outstanding customer service and remarkably swift nationwide delivery.”',
  '“The linen-blend fabrics hold their structure beautifully even in hot weather.”',
  '“Finest long-staple cotton quality I have experienced in local brands.”',
  '“Classic silhouettes that blend tradition and modern minimalism seamlessly.”',
  '“A masterclass in minimal South Asian design. The stitching is absolutely flawless.”',
  '“The packaging is completely biodegradable, reflecting their genuine commitment to sustainability.”',
  '“Finally, a premium Bangladeshi brand that prioritizes both comfort and high-end aesthetics.”',
  '“Their linen co-ord sets have become my absolute uniform for summer travels.”'
];

export function ReviewMarquee() {
  return (
    <section className="bg-loomra-surface py-16">
      <div className="mx-auto max-w-6xl px-6 sm:px-8">
        <div className="overflow-hidden">
          <div className="marquee flex gap-12 text-loomra-black text-small uppercase tracking-[0.32em]">
            {reviews.concat(reviews).map((review, index) => (
              <span key={`${review}-${index}`} className="whitespace-nowrap">{review}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
