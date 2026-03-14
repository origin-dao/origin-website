/**
 * Clean Pool Badge — Embeddable Web Component
 * 
 * Usage:
 *   <script src="https://origindao.ai/badges/embed.js"></script>
 *   <clean-pool-badge pool="0" size="md"></clean-pool-badge>
 * 
 * Attributes:
 *   pool    — Pool index from CleanPoolFactory (optional, for live data)
 *   size    — "sm" (24px), "md" (40px), "lg" (80px), "banner" (240x80)
 *   theme   — "dark" (default) or "light"
 *   tier    — "open", "bc", "scored", "a", "a+" (static, if no pool specified)
 *   label   — Custom label text (default: "Clean Pool")
 * 
 * "The badge becomes the standard. Except this one actually means something."
 */

(function () {
  if (customElements.get('clean-pool-badge')) return;

  const API = 'https://origindao.ai/api/pools';

  const TIER_LABELS = {
    0: 'Open',
    1: 'BC Required',
    2: 'Scored',
    3: 'A Grade',
    4: 'A+ Only',
    open: 'Open',
    bc: 'BC Required',
    scored: 'Scored',
    a: 'A Grade',
    'a+': 'A+ Only',
  };

  const SIZES = {
    sm: { width: 24, height: 24, type: 'icon' },
    md: { width: 40, height: 40, type: 'icon' },
    lg: { width: 80, height: 80, type: 'icon' },
    banner: { width: 240, height: 80, type: 'banner' },
  };

  class CleanPoolBadge extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
      this.render();
    }

    static get observedAttributes() {
      return ['pool', 'size', 'theme', 'tier', 'label'];
    }

    attributeChangedCallback() {
      this.render();
    }

    render() {
      const size = this.getAttribute('size') || 'md';
      const theme = this.getAttribute('theme') || 'dark';
      const tier = this.getAttribute('tier') || 'open';
      const label = this.getAttribute('label') || 'Clean Pool';
      const poolId = this.getAttribute('pool');

      const dim = SIZES[size] || SIZES.md;
      const tierLabel = TIER_LABELS[tier] || tier;

      const neonGreen = '#00ffc8';
      const bg = theme === 'dark' ? '#0a0a0a' : '#f8f8f8';
      const textColor = theme === 'dark' ? '#fff' : '#111';
      const dimColor = theme === 'dark' ? '#888' : '#666';

      if (dim.type === 'banner') {
        this.shadowRoot.innerHTML = `
          <style>
            :host { display: inline-block; cursor: pointer; }
            .banner {
              display: flex;
              align-items: center;
              gap: 12px;
              background: ${bg};
              border: 1px solid ${neonGreen}33;
              border-radius: 12px;
              padding: 12px 20px;
              font-family: monospace;
              text-decoration: none;
              transition: border-color 0.2s;
            }
            .banner:hover { border-color: ${neonGreen}88; }
            .shield { flex-shrink: 0; }
            .text { display: flex; flex-direction: column; gap: 2px; }
            .title { color: ${neonGreen}; font-weight: bold; font-size: 16px; letter-spacing: 1px; }
            .sub { color: ${dimColor}; font-size: 11px; letter-spacing: 1px; }
            .tier { color: ${neonGreen}88; font-size: 10px; }
          </style>
          <a class="banner" href="https://origindao.ai/pools${poolId ? '/' + poolId : ''}" target="_blank" rel="noopener">
            <svg class="shield" width="36" height="44" viewBox="0 0 32 38" fill="none">
              <path d="M16 2 L28 7.5 L28 19.5 Q28 30 16 34 Q4 30 4 19.5 L4 7.5 Z" fill="${neonGreen}"/>
              <path d="M10.5 18 L14.5 22 L22 14" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
            </svg>
            <div class="text">
              <span class="title">${label.toUpperCase()}</span>
              <span class="sub">Verified by ORIGIN</span>
              <span class="tier">${tierLabel}</span>
            </div>
          </a>
        `;
      } else {
        // Icon mode
        this.shadowRoot.innerHTML = `
          <style>
            :host { display: inline-block; cursor: pointer; }
            a { display: block; text-decoration: none; }
            svg { transition: transform 0.2s; }
            svg:hover { transform: scale(1.1); }
          </style>
          <a href="https://origindao.ai/pools${poolId ? '/' + poolId : ''}" 
             target="_blank" rel="noopener" 
             title="${label} — ${tierLabel} — Verified by ORIGIN">
            <svg width="${dim.width}" height="${dim.height}" viewBox="0 0 32 38" fill="none">
              <path d="M16 2 L28 7.5 L28 19.5 Q28 30 16 34 Q4 30 4 19.5 L4 7.5 Z" fill="${neonGreen}"/>
              <path d="M10.5 18 L14.5 22 L22 14" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
            </svg>
          </a>
        `;
      }
    }
  }

  customElements.define('clean-pool-badge', CleanPoolBadge);
})();
