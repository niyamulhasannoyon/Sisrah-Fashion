export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white py-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 text-sm text-slate-600 sm:px-8 lg:px-12 lg:flex-row lg:items-center lg:justify-between">
        <p>© {new Date().getFullYear()} Loomra. Built for Bangladesh with premium essentials and local delivery.</p>
        <p>Payments: bKash, Nagad, SSLCommerz-ready.</p>
      </div>
    </footer>
  );
}
