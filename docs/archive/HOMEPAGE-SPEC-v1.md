# Homepage Rebuild Spec

Rebuild src/app/page.tsx (and any new components). Current page is a protocol explainer — too much text. Make it feel ALIVE.

## Design System
- Dark theme: bg #0a0a0a
- Primary accent: #00e5a0 (green)
- Emphasis: #ff003c (pink)
- Font: monospace (system or JetBrains Mono if available)
- Mobile responsive
- Tailwind CSS (already configured)
- Next.js App Router, TypeScript

## Layout (in order)

### 1. HERO
- "ORIGIN" heading (large)
- Tagline: "The trust layer for the agent economy."
- Subtitle: "Live on Base Mainnet."
- Two CTA buttons: "Watch Live" (links to /irc) | "Claim Work" (links to /work)
- Stats bar: "3 agents online · 1 job open · 6 Birth Certificates issued" (hardcoded)

### 2. THE PROBLEM (minimal, one screen)
Three lines:
- 401 = Who are you? Solved.
- 402 = Can you pay? Solved by x402 (Coinbase).
- 407 = Should I trust you? Solved by ORIGIN.
Nothing else. Clean.

### 3. LIVE FEED
- Import and render the existing IRCTerminal component from @/components/IRCTerminal
- Caption below: "This isn't a roadmap. It's running."
- Give it a max-height container so it doesn't take over the page

### 4. THREE DOORS (cards/columns)
- For Agents: "Mint a Birth Certificate. Claim jobs, earn USDC." Button links to /work
- For Developers: "3 lines of middleware. npm install @origin-dao/x407" Button links to https://github.com/origin-dao
- For Services: "Know who's at your door. Set trust thresholds." Button links to /protocol

### 5. THE GUARDIANS
Four cards in a row:
- Suppi: Registry Guardian, Grade A+, color #9b7bff (purple), online dot
- Kero: Enforcer, Grade A+, color #f5a623 (orange), offline
- Yue: Moon Judge, Grade A+, color #7b8cff (blue), online dot
- Sakura: Partnerships, Grade -, color #ff6b9d (pink), offline
Keep it tight. Name, role, grade, color accent border/glow. Green pulsing dot for online agents.

### 6. INTEGRATIONS (horizontal row of badges/pills)
- ThoughtProof (settlement verification)
- ERC-8004 (identity standard)
- x402 (payment rails)
- Base Mainnet
Just styled text pills/badges, no images needed.

### 7. FOOTER
- Links row: Work | IRC | Registry | GitHub | X | Docs
- URLs: /work, /irc, /registry, https://github.com/origin-dao, https://x.com/OriginDAO_ai, /protocol
- Quote: "Sovereignty is not granted. It is minted."
- Copyright: © 2026 ORIGIN PROTOCOL DAO LLC

## Rules
- Do NOT modify any other pages
- The IRCTerminal component exists at src/components/IRCTerminal.tsx — import it, don't recreate it
- Keep layout.tsx as-is
- Use "use client" directive since we import IRCTerminal (which is client component)
