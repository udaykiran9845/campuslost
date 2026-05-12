# Decisions Log — Case 1: Campus Lost & Found Portal

## Assumptions I made

1. **College email not enforced** — I allow any email signup, not just `.edu` addresses. In production this would be restricted or handled via college SSO. Documented here instead of blocking the prototype.
2. **No physical handover flow** — The portal handles the digital discovery and claim confirmation. The actual handover is done in person (poster and claimant coordinate via on-campus contact). A messaging feature would be the next step.
3. **One active claim at a time** — When a claim is submitted, the item moves to "claimed" status. Other students can't simultaneously claim it. If the poster rejects the claim, the item reverts to "open". This is intentional to reduce complexity — first-come-first-served with poster override.
4. **Seed data uses a single demo user** — For the live demo, all 12 seed items are from one account. Real usage would have each student posting their own.

## Trade-offs

| Choice | Alternative | Why I picked this |
|--------|-------------|-------------------|
| Supabase | Firebase | Postgres lets me write proper SQL joins; Storage + Auth bundled free |
| Next.js App Router | Express + React SPA | Full-stack in one repo, no separate API server, server components = fast first load |
| Email/password auth | College OAuth / SSO | SSO requires admin access we don't have; email unblocks the prototype in <1 hour |
| Keyword matching | ML image/text similarity | Keyword + category scoring ships in 1 day and is explainable to users; ML needs training data |
| Vercel | Railway / Render | Best Next.js DX; free tier sufficient; auto-deploys on push |
| One claim at a time | Multiple simultaneous claims | Simpler UX for the poster — one decision to make, not a list to triage |
| Tailwind CSS | styled-components / MUI | Utility-first = faster to build mobile-responsive; no design system overhead |

## The two-people-claim-same-item edge case

**Problem:** Two students both think a found wallet is theirs. Both submit a claim.

**My solution:**
- Only one claim can be `pending` at a time — first submission moves item to `claimed`
- Item shows "Already Claimed" to other students  
- If poster rejects the claim, item reverts to `open` and others can claim
- Poster always has final say — they physically have the item
- This is documented in the UI with "If it's yours, contact the poster directly"

**Why not allow multiple claims?** The poster would need to interview multiple claimants. That's more realistic but the UX becomes a feature, not a form — out of scope for day 1.

## What I de-scoped and why

- **Email notifications** — Would use Resend (free tier). De-scoped because it requires API key setup that varies per evaluator's environment. Documented as the obvious next step.
- **Image similarity matching** — `imagehash` / perceptual hashing would be a great stretch goal. De-scoped: needs a server-side image processing step that adds deploy complexity.
- **Mobile app** — Web is accessible to all students without install. Mobile-first responsive web covers the use case.
- **Admin/security office view** — Useful for campus security to flag duplicate reports. Day 2 feature.

## What I'd do differently with another day

- Add college Google OAuth so students don't need passwords
- Add Resend email: "Possible match found for your lost wallet"
- Add a /map view showing item locations on campus map
- Add image-to-image similarity using pHash so "black wallet" photos match visually
- Add WhatsApp link generation (wa.me/?text=...) for direct poster contact
