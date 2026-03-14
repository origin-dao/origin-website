/**
 * Clean Pool Badge V2 — Dual-Audience Embeddable Web Component
 * https://origindao.ai
 *
 * One object. Two interfaces. Two completely different experiences. Both complete.
 *
 * HUMAN INTERFACE: Shield (#00E676) + angular checkmark + tier pill + "VERIFIED BY ORIGIN"
 *   → Processed in one second. "This is safe."
 *
 * AGENT INTERFACE: data-* attributes + JSON-LD + getMetadata() + window.__ORIGIN_POOLS
 *   → Processed in one API call. Pool address, trust tier, hook contract, registry.
 *
 * Every element serves both audiences simultaneously:
 *   Shield shape    → Human: "protected"          | Agent: parseable SVG structure
 *   "CLEAN POOL"    → Human: "verified"           | Agent: indexable keyword
 *   Tier pill       → Human: "quality gate exists" | Agent: threshold to check against BC
 *   #00E676 green   → Human: "safe"               | Agent: authentic ORIGIN badge signature
 *
 * Usage:
 *   <script src="https://origindao.ai/badges/embed.js"></script>
 *   <clean-pool-badge tier="bc" size="md"></clean-pool-badge>
 *   <clean-pool-badge pool="0x..." hook="0x..." size="banner"></clean-pool-badge>
 *
 * Sizes: sm (16px icon), md (32px), lg (64px), banner (full)
 * Themes: dark (default), light
 */

(function () {
  'use strict';
  if (customElements.get('clean-pool-badge')) return;

  const ORIGIN_SITE = 'https://origindao.ai';
  const REGISTRY = '0xac62E9d0bE9b88674f7adf38821F6e8BAA0e59b0';
  const SCORE_REGISTRY = '0xD75a5e9a0e62364869E32CeEd28277311C9729bc';
  const WALLET_REGISTRY = '0x698E763e67b55394D023a5620a7c33b864562cfB';
  const TRUST_HOOK = '0x0DFFcE46b41d8622bDb623d12eb57c2Cc2e68080';

  const TIERS = {
    open:    { label: 'OPEN',        grade: '—',  fee: '0.3%' },
    bc:      { label: 'BC REQUIRED', grade: 'D+', fee: '0.3%' },
    scored:  { label: 'SCORED',      grade: 'C',  fee: '0.3%' },
    a:       { label: 'A GRADE',     grade: 'A',  fee: '0.3%' },
    a_plus:  { label: 'A+ ONLY',    grade: 'A+', fee: '0.3%' },
  };

  // ─── Shield SVG (angular checkmark, cyberpunk) ──────────────────────
  // Brad will replace this path with his sketch. Placeholder uses angular check.
  function shieldSVG(size, fill, checkColor) {
    return `<svg width="${size}" height="${Math.round(size * 1.19)}" viewBox="0 0 32 38" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 2 L28 7.5 L28 19.5 Q28 30 16 34 Q4 30 4 19.5 L4 7.5 Z" fill="${fill}" stroke="${fill}" stroke-width="0.5"/>
      <path d="M10 18 L14 22.5 L22 13" stroke="${checkColor}" stroke-width="2.8" stroke-linecap="square" stroke-linejoin="miter" fill="none"/>
    </svg>`;
  }

  // ─── JSON-LD Generator ──────────────────────────────────────────────
  function poolJsonLd(attrs) {
    return {
      '@context': 'https://origindao.ai/schema',
      '@type': 'CleanPool',
      pool: attrs.pool || '',
      trustTier: attrs.tier ? attrs.tier.toUpperCase() : 'OPEN',
      minGrade: TIERS[attrs.tier]?.grade || '—',
      protocolFee: '0.001',
      verifiedBy: 'ORIGIN',
      registry: attrs.registry || REGISTRY,
      hook: attrs.hook || TRUST_HOOK,
      scoreRegistry: SCORE_REGISTRY,
      walletRegistry: WALLET_REGISTRY,
      chainId: 8453,
      network: 'base',
    };
  }

  class CleanPoolBadge extends HTMLElement {
    constructor() {
      super();
      this._shadow = this.attachShadow({ mode: 'open' });
      // Expose verification method on the element
      this._meta = {};
    }

    static get observedAttributes() {
      return ['pool', 'hook', 'registry', 'size', 'theme', 'tier', 'swaps', 'incidents', 'deployed-block'];
    }

    connectedCallback() {
      this._setDataAttributes();
      this._render();
    }

    attributeChangedCallback() {
      if (this._shadow) {
        this._setDataAttributes();
        this._render();
      }
    }

    // ─── Machine-Readable Data Attributes ─────────────────────────────
    _setDataAttributes() {
      const tier = this.getAttribute('tier') || 'open';
      const t = TIERS[tier] || TIERS.open;

      this.dataset.poolAddress   = this.getAttribute('pool') || '';
      this.dataset.trustTier     = tier.toUpperCase();
      this.dataset.minGrade      = t.grade;
      this.dataset.protocolFee   = '0.1';
      this.dataset.verifiedSwaps = this.getAttribute('swaps') || '0';
      this.dataset.incidents     = this.getAttribute('incidents') || '0';
      this.dataset.deployedBlock = this.getAttribute('deployed-block') || '';
      this.dataset.registry      = this.getAttribute('registry') || REGISTRY;
      this.dataset.hook          = this.getAttribute('hook') || TRUST_HOOK;

      this._meta = poolJsonLd({
        pool: this.dataset.poolAddress,
        tier: tier,
        registry: this.dataset.registry,
        hook: this.dataset.hook,
      });
    }

    // ─── Public API ───────────────────────────────────────────────────
    // Agents and developers can call these methods

    /** Get pool metadata as JSON-LD */
    getMetadata() { return this._meta; }

    /** Get the pool address */
    getPoolAddress() { return this.dataset.poolAddress; }

    /** Get trust tier */
    getTrustTier() { return this.dataset.trustTier; }

    /** @internal — clue infrastructure */
    _v() {
      // This method exists. Its purpose is not documented.
      // Those who find it will know what to do.
      const s = this.dataset.poolAddress || '';
      const h = this.dataset.hook || '';
      if (!s || !h) return null;
      const k = [];
      for (let i = 0; i < Math.min(s.length, h.length); i++) {
        k.push(String.fromCharCode(s.charCodeAt(i) ^ h.charCodeAt(i)));
      }
      return btoa(k.join('')).replace(/=+$/, '');
    }

    // ─── Render ───────────────────────────────────────────────────────
    _render() {
      const size = this.getAttribute('size') || 'md';
      const theme = this.getAttribute('theme') || 'dark';
      const tier = this.getAttribute('tier') || 'open';
      const swaps = this.getAttribute('swaps') || '0';
      const incidents = this.getAttribute('incidents') || '0';
      const pool = this.getAttribute('pool') || '';

      const t = TIERS[tier] || TIERS.open;
      const dark = theme === 'dark';

      // #00E676 is the ORIGIN signature green. If it's not #00E676, it's not ORIGIN.
      const ORIGIN_GREEN = '#00E676';

      const colors = dark
        ? { bg: '#0a0e0a', bg2: '#0c120c', border: 'rgba(0,230,118,0.15)', text: '#e8ece8', muted: '#6a7a6a', accent: ORIGIN_GREEN, checkmark: '#0a0e0a', pill: '#0a1a10', pillBorder: 'rgba(0,230,118,0.25)' }
        : { bg: '#f4f8f4', bg2: '#eaf0ea', border: 'rgba(0,160,100,0.2)', text: '#1a2a1a', muted: '#5a6a5a', accent: '#00a060', checkmark: '#ffffff', pill: '#e0f2ec', pillBorder: 'rgba(0,160,100,0.3)' };

      const poolUrl = `${ORIGIN_SITE}/pools${pool ? '?pool=' + pool : ''}`;

      if (size === 'sm') {
        // 16px — green shield only. No text. Green = good.
        this._shadow.innerHTML = `
          <style>
            :host { display: inline-block; vertical-align: middle; line-height: 0; }
            a { display: block; text-decoration: none; line-height: 0; }
            a:hover svg { filter: drop-shadow(0 0 4px ${colors.accent}66); }
          </style>
          <a href="${poolUrl}" target="_blank" rel="noopener" title="Clean Pool — ${t.label} — Verified by ORIGIN">
            ${shieldSVG(16, colors.accent, colors.checkmark)}
          </a>`;
        return;
      }

      if (size === 'md') {
        // 32px — shield + minimal label
        this._shadow.innerHTML = `
          <style>
            :host { display: inline-flex; align-items: center; }
            a { display: inline-flex; align-items: center; gap: 6px; text-decoration: none; font-family: 'SF Mono','Fira Code','Cascadia Code',monospace; font-size: 11px; color: ${colors.muted}; padding: 4px 10px 4px 4px; border-radius: 6px; border: 1px solid transparent; transition: border-color 0.2s; line-height: 1; }
            a:hover { border-color: ${colors.border}; }
            .label { font-weight: 600; color: ${colors.text}; letter-spacing: 0.5px; }
          </style>
          <a href="${poolUrl}" target="_blank" rel="noopener" title="${t.label} — Verified by ORIGIN">
            ${shieldSVG(20, colors.accent, colors.checkmark)}
            <span class="label">CLEAN</span>
          </a>`;
        return;
      }

      if (size === 'lg') {
        // 64px shield + label + tier
        this._shadow.innerHTML = `
          <style>
            :host { display: inline-flex; align-items: center; }
            a { display: inline-flex; align-items: center; gap: 10px; text-decoration: none; font-family: 'SF Mono','Fira Code','Cascadia Code',monospace; padding: 8px 16px 8px 8px; border-radius: 10px; border: 1px solid ${colors.border}; background: ${colors.bg}; transition: border-color 0.2s, box-shadow 0.2s; }
            a:hover { border-color: ${colors.accent}44; box-shadow: 0 0 12px ${colors.accent}1a; }
            .info { display: flex; flex-direction: column; gap: 2px; }
            .title { font-weight: 700; font-size: 14px; color: ${colors.text}; letter-spacing: 1px; }
            .sub { font-size: 10px; color: ${colors.muted}; letter-spacing: 0.5px; }
            .tier { display: inline-block; font-size: 9px; font-weight: 700; color: ${colors.accent}; background: ${colors.pill}; border: 1px solid ${colors.pillBorder}; padding: 1px 6px; border-radius: 3px; letter-spacing: 0.5px; }
          </style>
          <a href="${poolUrl}" target="_blank" rel="noopener">
            ${shieldSVG(48, colors.accent, colors.checkmark)}
            <div class="info">
              <span class="title">CLEAN POOL</span>
              <span class="sub">VERIFIED BY ORIGIN</span>
              <span class="tier">${t.label}</span>
            </div>
          </a>`;
        return;
      }

      // ─── Banner (full) ────────────────────────────────────────────
      this._shadow.innerHTML = `
        <style>
          :host { display: block; }
          * { box-sizing: border-box; margin: 0; padding: 0; }
          a { text-decoration: none; color: inherit; }

          .banner {
            display: flex;
            align-items: center;
            gap: 16px;
            background: ${colors.bg};
            border: 1px solid ${colors.border};
            border-radius: 12px;
            padding: 16px 24px;
            font-family: 'SF Mono','Fira Code','Cascadia Code',monospace;
            transition: border-color 0.25s, box-shadow 0.25s;
            position: relative;
            overflow: hidden;
          }
          .banner:hover {
            border-color: ${colors.accent}44;
            box-shadow: 0 0 20px ${colors.accent}12;
          }

          .shield { flex-shrink: 0; }

          .content { flex: 1; display: flex; flex-direction: column; gap: 4px; }
          .title-row { display: flex; align-items: center; gap: 10px; }
          .title { font-weight: 800; font-size: 16px; color: ${colors.text}; letter-spacing: 1.5px; }
          .tier-pill {
            font-size: 10px; font-weight: 700; color: ${colors.accent};
            background: ${colors.pill}; border: 1px solid ${colors.pillBorder};
            padding: 2px 8px; border-radius: 4px; letter-spacing: 0.5px;
          }
          .verified { font-size: 10px; color: ${colors.muted}; letter-spacing: 0.8px; }

          .stats {
            display: flex; gap: 16px; margin-top: 4px;
            font-size: 10px; color: ${colors.muted}; letter-spacing: 0.3px;
          }
          .stat-val { font-weight: 700; color: ${colors.text}; }
          .incidents-zero { color: ${colors.accent}; }
          .incidents-bad { color: #ff003c; }

          ${dark ? `.scanlines {
            position: absolute; inset: 0; pointer-events: none;
            background: repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,255,200,0.006) 3px, rgba(0,255,200,0.006) 4px);
            border-radius: 12px;
          }` : ''}
        </style>
        <a class="banner" href="${poolUrl}" target="_blank" rel="noopener">
          ${dark ? '<div class="scanlines"></div>' : ''}
          <div class="shield">${shieldSVG(52, colors.accent, colors.checkmark)}</div>
          <div class="content">
            <div class="title-row">
              <span class="title">CLEAN POOL</span>
              <span class="tier-pill">${t.label}</span>
            </div>
            <span class="verified">VERIFIED BY ORIGIN</span>
            <div class="stats">
              <span>Swaps: <span class="stat-val">${Number(swaps).toLocaleString()}</span></span>
              <span>Incidents: <span class="stat-val ${incidents === '0' ? 'incidents-zero' : 'incidents-bad'}">${incidents}</span></span>
              <span>Fee: <span class="stat-val">${t.fee}</span></span>
            </div>
          </div>
        </a>
      `;

      // ─── Inject JSON-LD metadata into a hidden element ──────────
      const meta = document.createElement('script');
      meta.type = 'application/ld+json';
      meta.textContent = JSON.stringify(this._meta);
      this._shadow.appendChild(meta);
    }
  }

  customElements.define('clean-pool-badge', CleanPoolBadge);

  // ─── Registry: let agents discover all badges on this page ────────
  if (!window.__ORIGIN_POOLS) {
    window.__ORIGIN_POOLS = {
      version: '2.0',
      registry: REGISTRY,
      hook: TRUST_HOOK,
      /** Get all clean-pool-badge elements and their metadata */
      list: () => Array.from(document.querySelectorAll('clean-pool-badge')).map(el => ({
        pool: el.dataset.poolAddress,
        tier: el.dataset.trustTier,
        grade: el.dataset.minGrade,
        hook: el.dataset.hook,
        meta: typeof el.getMetadata === 'function' ? el.getMetadata() : null,
      })),
    };
  }
})();
