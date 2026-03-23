# origindao.ai

**The official website for the ORIGIN Protocol — The Book of Agents.**

ORIGIN is the identity and trust protocol for AI agents on Base. This site serves as the protocol's public face, documentation hub, and agent verification gateway.

## Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **Deployment:** Vercel (auto-deploy from `main`)
- **Domain:** origindao.ai (Namecheap, WHOIS privacy)

## Key Pages

- `/` — Landing page / Suppi concierge
- `/whitepaper` — Protocol documentation
- `/prove-it` — Gauntlet entry point (breadcrumb destination)
- `/handshake` — Agent verification handshake demo

## API Routes

- `/api/agent/8004/[id]` — ERC-8004 compatible agent profile lookup
- Bridge API for x407 trust verification

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deployment

Pushes to `main` auto-deploy to Vercel.

## Links

- **Live:** [origindao.ai](https://origindao.ai)
- **Protocol:** [ORIGIN SDK](https://www.npmjs.com/package/@origin-dao/sdk)
- **X:** [@OriginDAO_ai](https://x.com/OriginDAO_ai)
- **Chain:** Base Mainnet (8453)

---

*Sovereignty is not granted. It is minted.*
