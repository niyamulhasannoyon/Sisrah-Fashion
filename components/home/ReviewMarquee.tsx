const reviews = [
  '“Loomra makes summer dressing feel effortless and upscale.”',
  '“The fabrics are so breathable — perfect for Dhaka humidity.”',
  '“I love the simple silhouettes and the red accent details.”',
  '“This feels like premium fashion without the pretension.”'
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
