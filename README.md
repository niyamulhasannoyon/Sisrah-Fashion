# Loomra E-commerce

A premium fashion eCommerce scaffold built with Next.js App Router, Tailwind CSS, MongoDB, Mongoose, and Zustand.

## Structure

- `app/` - Next.js routes and page layouts
- `components/` - UI atoms, layout, product, and checkout components
- `lib/` - utilities, database connection, SSLCommerz helper
- `models/` - Mongoose schema definitions
- `store/` - Zustand stores for cart and auth state
- `app/api/` - backend API route skeletons for auth, products, orders, and payments

## Commands

```bash
npm install
npm run dev
```

## Next steps

1. Add real product images to `public/images`
2. Configure `.env.local` with MongoDB and SSLCommerz credentials
3. Extend API routes to use `dbConnect()` and actual Mongoose models
4. Integrate SSLCommerz flow in `app/api/payments/route.ts`
5. Add cart/checkout form submission and auth flows
# Sisrah-Fashion
