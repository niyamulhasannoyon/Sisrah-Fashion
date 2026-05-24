import Link from 'next/link';

const categories = [
  {
    title: 'Men',
    subtitle: 'Tailored essentials',
    href: '/category/men',
    image: 'https://images.unsplash.com/photo-1488161628813-04466f872be2?q=80&w=600&auto=format&fit=crop'
  },
  {
    title: 'Women',
    subtitle: 'Minimal silhouettes',
    href: '/category/women',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=600&auto=format&fit=crop'
  },
  {
    title: 'Fusion',
    subtitle: 'Modern heritage',
    href: '/category/fusion',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=600&auto=format&fit=crop'
  }
];

export function CategoryGrid() {
  return (
    <section className="bg-loomra-white py-24">
      <div className="mx-auto max-w-6xl px-6 sm:px-8">
        <div className="mb-12 flex flex-col gap-4 text-center">
          <p className="text-sm uppercase tracking-[0.32em] text-loomra-red font-bold font-sans">Collections</p>
          <h2 className="text-4xl font-black uppercase tracking-tight text-loomra-black">Shop by category</h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {categories.map(category => (
            <Link
              key={category.href}
              href={category.href}
              className="group relative h-[450px] overflow-hidden rounded-lg bg-loomra-surface shadow-md block"
            >
              {/* Background Image with zoom on hover */}
              <img 
                src={category.image} 
                alt={category.title} 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                loading="lazy"
              />
              {/* Dark Overlay for contrast */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10 transition-opacity duration-300 group-hover:from-black/90" />
              
              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-between p-8 text-white z-10">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-loomra-red font-bold">{category.title}</p>
                  <h3 className="mt-2 text-2xl font-black uppercase tracking-wide leading-tight">{category.subtitle}</h3>
                </div>
                
                <div className="flex items-center gap-2 text-xs uppercase tracking-widest font-bold text-white border-b border-white/40 pb-1 self-start group-hover:border-loomra-red group-hover:text-loomra-red transition-all duration-300">
                  <span>Shop {category.title}</span>
                  <span className="transform translate-x-0 group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
