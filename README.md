# SnapTools — OmniHub Tools Network

A free-tools traffic engine built with Next.js 15, Tailwind CSS, and Framer Motion, feeding the Ethical Hacker Prep (EHP) ecosystem.

## Features

- **Next.js 15 App Router**: High performance, Edge Middleware for routing.
- **Multilingual (i18n)**: Fully internationalized with `next-intl` (English and French).
- **Subdomain Routing**: `weather.snaptools.co` internally routes to `/tools/weather`.
- **Dynamic SEO**: Auto-generated schema.org JSON-LD, sitemap, and localized meta tags.
- **Design System**: Dark-first, glassmorphism UI built with Tailwind CSS v4 and Framer Motion.
- **Contextual CTAs**: Tiered Call-To-Action system pushing traffic to Ethical Hacker Prep based on tool relevance.

## Tech Stack

- Framework: Next.js 15 (React 19)
- Styling: Tailwind CSS v4
- Animations: Framer Motion
- Internationalization: `next-intl`
- Code Quality: TypeScript (strict)

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment Variables:**
   Copy `.env.example` to `.env.local` and set your variables:
   ```env
   NEXT_PUBLIC_ROOT_DOMAIN=snaptools.co
   ROUTING_MODE=subdomain # or subfolder
   NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
   ```

3. **Run Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) (if in subfolder mode) or use a local proxy for subdomain testing.

4. **Production Build:**
   ```bash
   npm run build
   npm start
   ```

## Architecture

- **`src/config/`**: Central registry for tools, clusters, and site metadata.
- **`src/tools/`**: Individual tool widgets (React Client Components).
- **`src/app/[locale]/tools/[slug]/`**: Dynamic route orchestrating the tool page layout, SEO content, and injecting the correct tool widget.
- **`src/middleware.ts`**: Handles i18n routing and subdomain rewriting.

## How to Add a New Tool (Tool #23 Guide)

Adding a new tool is designed to be fully modular. You only need to touch two places.

1. **Register the tool in `src/config/tools.ts`:**
   Add a new entry to the `toolsRegistry` object.
   ```typescript
   my_new_tool: {
     slug: 'my_new_tool',
     subdomain: 'my-new-tool',
     cluster: 'daily',
     icon: '🚀',
     locales: {
       en: {
         h1: 'My New Tool',
         metaTitle: '...',
         metaDescription: '...',
         seoBody: '...',
         faq: [...],
         primaryKeyword: '...'
       },
       fr: { ... }
     }
   }
   ```

2. **Create the Tool Widget:**
   Create a new folder and component at `src/tools/my_new_tool/MyNewToolWidget.tsx`.
   - Must start with `"use client";`
   - Must export default the component.
   - Accepts `{ locale: string }` as props.
   - Map this component in `src/components/tools/ToolPageContent.tsx` under the `getToolComponent` function.

3. **Add Translations (Optional but recommended):**
   Add any UI strings to `src/messages/en.json` and `src/messages/fr.json` under the `"tools"` object.

## DNS Setup for Production

To support wildcards (e.g., `*.snaptools.co`):
1. Add an `A` record or `CNAME` for `@` pointing to your Vercel/hosting deployment.
2. Add a wildcard `CNAME` record for `*` pointing to the same deployment.
3. Ensure your hosting provider (e.g., Vercel) is configured to handle the custom wildcard domain.

## Deployment

Designed for edge deployment on Vercel. Ensure the Edge Middleware is enabled. No specialized database required—everything operates serverless/edge and client-side.
