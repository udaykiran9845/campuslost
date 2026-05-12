# Case 1: Campus Lost & Found Portal

**Live demo:** https://your-app.vercel.app ← update after deploy  
**Repo:** https://github.com/your-name/case1-lost-and-found ← update  
**Demo video:** https://loom.com/share/xxxxx ← update after recording

---

## What this is

A web portal that lets college students post lost and found items, search for matches, and claim items — designed to feel as easy as Instagram, not as boring as a college admin portal.

## How to run locally

```bash
git clone https://github.com/your-name/case1-lost-and-found.git
cd case1-lost-and-found
npm install

# Copy env file and fill in your Supabase credentials
cp .env.local.example .env.local

npm run dev
# Open http://localhost:3000
```

## Supabase Setup (one-time)

1. Create a free project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** → paste and run `supabase/schema.sql`
3. Go to **Authentication → Providers** → enable **Email**
4. Copy your project URL and anon key into `.env.local`
5. (Optional) Run `supabase/seed.sql` in SQL Editor for demo data

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxxx
```

## Stack

| Piece | Why |
|-------|-----|
| **Next.js 14** (App Router) | Full-stack in one repo; server components for fast data fetching |
| **Supabase** | Free Postgres + Auth + Storage in one account — no separate backend needed |
| **Tailwind CSS** | Polished, mobile-first UI fast |
| **Vercel** | 1-click deploy from GitHub push |

## Features

- Post lost/found items with photo, description, location, date
- Card-based feed filtered by type (lost/found) and category
- Full-text search across title, description, location
- Smart keyword + category matching shows probable matches instantly
- Claim flow: submit claim → poster confirms or rejects
- Duplicate claim protection — one pending claim per user per item
- Edge case handled: two simultaneous claims → first-come-first-served, poster picks
- Mobile-responsive — tested on phone

## What's NOT done

- Email notifications on match (would use Resend free tier in production)
- Image similarity matching (perceptual hashing)
- College SSO / Google login (requires admin credentials)

## In production, I would also add

- College Google OAuth so no passwords needed
- Resend for email: "A match was found for your lost wallet"
- Rate limiting on post endpoint (prevent spam)
- Soft delete for items instead of hard delete
- Admin dashboard for campus security office
