import Link from 'next/link';

const categories = [
  {
    title: 'Men',
    subtitle: 'Tailored essentials',
    href: '/category/men'
  },
  {
    title: 'Women',
    subtitle: 'Minimal silhouettes',
    href: '/category/women'
  },
  {
    title: 'Fusion',
    subtitle: 'Modern heritage',
    href: '/category/fusion'
  }
];

export function CategoryGrid() {
  return (
    <section className="bg-loomra-white py-24">
      <div className="mx-auto max-w-6xl px-6 sm:px-8">
        <div className="mb-10 flex flex-col gap-4 text-center">
          <p className="text-small uppercase tracking-[0.32em] text-loomra-red">Collections</p>
          <h2 className="text-3xl font-bold text-loomra-black">Shop by category</h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {categories.map(category => (
            <Link
              key={category.href}
              href={category.href}
              className="group overflow-hidden rounded-none bg-loomra-surface p-6 transition hover:bg-white"
            >
              <div className="flex h-full flex-col justify-between gap-4">
                <div>
                  <p className="text-small uppercase tracking-[0.32em] text-loomra-red">{category.title}</p>
                  <h3 className="mt-4 text-2xl font-semibold text-loomra-black">{category.subtitle}</h3>
                </div>
                <span className="text-small uppercase tracking-widest text-loomra-black">Shop {category.title}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
