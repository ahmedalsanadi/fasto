# Fasto Restaurant Store 🍔

A premium, localized, and high-performance e-commerce storefront for restaurants built with **Next.js 16**, **TypeScript**, and **Tailwind CSS**.

---

## 🚀 Tech Stack

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Internationalization**: [next-intl](https://next-intl-docs.vercel.app/) (Arabic & English supported)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Data Fetching**: [TanStack Query v5](https://tanstack.com/query/latest)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Components**: Custom premium UI with [Tailwind Merge](https://github.com/dcastil/tailwind-merge) and [Clsx](https://github.com/lukeed/clsx)
- **Notifications**: [Sonner](https://sonner.emilkowal.ski/)
- **Slider**: [Swiper](https://swiperjs.com/)

---

## 🎨 Design Philosophy

Fasto is designed with a **Premium & Modern** aesthetic:

- **Responsive-First**: Seamless experience across mobile, tablet, and desktop.
- **Glassmorphism**: Subtle blurs and translucent layers for a sleek look.
- **Micro-Animations**: Smooth transitions using `tailwindcss-animate`.
- **Directional Support**: Full **RTL (Arabic)** and **LTR (English)** support with automatic layout switching.

---

## 📁 Project Structure

```bash
src/
├── app/                  # Next.js App Router (File-based routing)
│   ├── [locale]/         # Localized routes (Home, Products, Cart, etc.)
│   ├── proxy/            # Client-side API proxy (CORS & Security)
│   └── api/              # Backend API handlers (if any)
├── components/           # React Components
│   ├── ui/               # Base UI components (Button, Input, etc.)
│   ├── layouts/          # Layout-specific components (Navbar, Footer)
│   └── pages/            # Page-specific modular components
├── config/               # Centralized configuration (Env, Navigation, Site)
├── data/                 # Static and Mock data
├── hooks/                # Custom React hooks
├── i18n/                 # Internationalization setup (Routing, Messages)
├── lib/                  # Shared utilities and core libraries
├── services/             # API layer and Business logic
├── store/                # Zustand State Stores (Cart, UI)
└── styles/               # Global styles
```

---

## 🛠️ Getting Started

### 1. Prerequisites

- Node.js 18.x or higher
- npm / pnpm / yarn

### 2. Installation

```bash
npm install
# or
pnpm install
```

### 3. Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_API_URL=https://your-api-url.com
LIBERO_API_KEY=your_key_here
```

### 4. Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the result.

---

## 🔑 Key Features

- **Dynamic Cart**: Real-time updates with persistence using Zustand.
- **API Proxy**: Secure client-side requests handled through a local API route to avoid CORS and hide sensitive tokens.
- **Localized Routing**: Automatic locale detection and persistence.
- **SEO Optimized**: Dynamic metadata and JSON-LD generation.
- **Smart Components**: Context-aware components that handle their own loading and error states.

---

## 📝 License

This project is private and intended for internal use.
