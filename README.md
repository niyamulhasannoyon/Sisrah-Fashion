# AS SIDRAT — Premium Fashion E-Commerce

**AS SIDRAT** is a modern, high-performance e-commerce platform built for South Asian fashion shoppers in Bangladesh. Designed with a mobile-first philosophy, it features minimalist climate-conscious clothing, real-time inventory management, cash-on-delivery checkout, and integrated order tracking.

---

## 🌟 Key Features

- **Mobile-First Experience**: App-like navigation with a sticky top header and fixed bottom navigation tab bar (Home, Search, Wishlist, Cart, Profile).
- **Refined Typography**: Dual English (Montserrat) and Bengali (Hind Siliguri) font architecture tailored for local e-commerce storytelling.
- **Account & Order Management**: User authentication, profile drawer, order history, and live order tracking system.
- **Cart & Wishlist**: Zustand-powered persistent state management for seamless shopping sessions.
- **BD Payment Integrations**: Cash on Delivery (COD), bKash, Nagad, and SSLCommerz payment support.
- **Admin Dashboard**: Content management, product catalog control, and settings configuration.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, Server Components)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/), Framer Motion, Lucide Icons
- **Database**: [MongoDB](https://www.mongodb.com/) & [Mongoose](https://mongoosejs.com/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Payment Gateway**: SSLCommerz, Local COD

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v18.x or higher
- **MongoDB**: Local instance or MongoDB Atlas connection string

### Setup Instructions

1. **Clone the repository**:
   ```bash
   git clone https://github.com/niyamulhasannoyon/Sisrah-Fashion.git
   cd Sisrah-Fashion
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env.local` file in the root directory:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   SSLCOMMERZ_STORE_ID=your_store_id
   SSLCOMMERZ_STORE_PASSWORD=your_store_password
   SSLCOMMERZ_IS_LIVE=false
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Run the Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Folder Structure

```
├── app/                  # Next.js App Router routes & API endpoints
│   ├── (admin)/         # Admin dashboard pages
│   ├── (shop)/          # Customer-facing store routes
│   └── api/             # RESTful API routes (auth, products, orders)
├── components/          # Reusable UI components
│   ├── home/            # Hero, CategoryGrid, Trust Badges, Sliders
│   ├── layout/          # Navbar, BottomNav, Footer, StoreInitializer
│   └── ui/              # Buttons, Badges, Modals, Inputs
├── lib/                 # Database connectors, SSLCommerz, utility functions
├── models/              # Mongoose schemas (User, Product, Order, Settings)
├── store/               # Zustand state stores (Cart, Auth, Wishlist)
└── public/              # Static assets and product images
```

---

## 📄 License

This project is proprietary software for **AS SIDRAT**. All rights reserved.
