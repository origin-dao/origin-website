/**
 * ORIGIN Protocol — "Verified by ORIGIN" Embeddable Widget
 * https://origindao.ai
 * 
 * Usage:
 *   <script src="https://origindao.ai/widget.js"></script>
 *   <origin-badge agent-id="1"></origin-badge>
 *   <origin-badge agent-id="1" size="full" theme="light"></origin-badge>
 */
(function () {
  const API = "https://origindao.ai/api/agent";
  const SITE = "https://origindao.ai";

  const TRUST = [
    { label: "Unverified", color: "#ff003c", bg: "rgba(255,0,60,0.12)" },
    { label: "Human-Backed", color: "#f0c040", bg: "rgba(240,192,64,0.12)" },
    { label: "Licensed", color: "#00f0a0", bg: "rgba(0,240,160,0.12)" },
  ];

  const SHIELD_SVG = `<svg viewBox="0 0 24 28" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:1em;height:1.16em;vertical-align:middle">
    <path d="M12 1L2 6v8c0 6.5 4.3 12 10 13 5.7-1 10-6.5 10-13V6L12 1z" stroke="currentColor" stroke-width="1.5" fill="none"/>
    <path d="M8 14l3 3 5-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  </svg>`;

  class OriginBadge extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: "open" });
    }

    static get observedAttributes() {
      return ["agent-id", "theme", "size"];
    }

    connectedCallback() {
      this.render();
      this.fetchAgent();
    }

    attributeChangedCallback() {
      if (this.shadowRoot) {
        this.render();
        this.fetchAgent();
      }
    }

    get agentId() { return this.getAttribute("agent-id") || "1"; }
    get theme() { return this.getAttribute("theme") || "dark"; }
    get size() { return this.getAttribute("size") || "compact"; }

    isDark() { return this.theme === "dark"; }

    colors() {
      return this.isDark()
        ? { bg: "#0a0a1a", bg2: "#0f0f24", border: "rgba(0,240,255,0.18)", text: "#e0e0e0", muted: "#888", accent: "#00f0ff", link: "#00f0ff" }
        : { bg: "#f8f8fc", bg2: "#efeffa", border: "rgba(26,26,58,0.18)", text: "#1a1a2e", muted: "#666", accent: "#0066cc", link: "#0055aa" };
    }

    render() {
      const c = this.colors();
      this.shadowRoot.innerHTML = `
        <style>
          :host { display: inline-block; font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', 'Consolas', monospace; font-size: 13px; line-height: 1.4; }
          * { box-sizing: border-box; margin: 0; padding: 0; }
          a { color: ${c.link}; text-decoration: none; }
          a:hover { text-decoration: underline; }

          @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
          @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }

          .dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; animation: pulse 2.2s ease-in-out infinite; flex-shrink: 0; }

          /* --- COMPACT --- */
          .compact { display: inline-flex; align-items: center; gap: 8px; padding: 6px 14px; border-radius: 8px;
            background: ${c.bg}; border: 1px solid ${c.border}; color: ${c.text}; cursor: pointer; transition: box-shadow 0.25s, border-color 0.25s; }
          .compact:hover { box-shadow: 0 0 12px ${c.accent}33; border-color: ${c.accent}55; }
          .compact .shield { color: ${c.accent}; font-size: 16px; }
          .compact .name { font-weight: 600; white-space: nowrap; }
          .compact .sep { color: ${c.muted}; }
          .compact .trust-label { font-size: 11px; opacity: 0.75; }

          /* --- FULL --- */
          .full { width: 320px; border-radius: 12px; overflow: hidden; background: ${c.bg}; border: 1px solid ${c.border};
            color: ${c.text}; animation: fadeIn 0.4s ease; }
          .full:hover { box-shadow: 0 0 20px ${c.accent}22; }
          .full .header { padding: 16px; display: flex; align-items: center; gap: 12px; border-bottom: 1px solid ${c.border}; background: ${c.bg2}; }
          .full .header .shield { color: ${c.accent}; font-size: 24px; }
          .full .header .info { flex: 1; }
          .full .header .agent-name { font-weight: 700; font-size: 15px; }
          .full .header .agent-type { font-size: 11px; color: ${c.muted}; text-transform: uppercase; letter-spacing: 0.5px; }
          .full .body { padding: 14px 16px; display: flex; flex-direction: column; gap: 8px; }
          .full .row { display: flex; justify-content: space-between; align-items: center; }
          .full .row .label { color: ${c.muted}; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
          .full .row .value { font-weight: 600; display: flex; align-items: center; gap: 6px; }
          .full .footer { padding: 10px 16px; border-top: 1px solid ${c.border}; display: flex; justify-content: space-between; align-items: center; font-size: 11px; }
          .full .footer .powered { color: ${c.muted}; }
          .full .scanlines { position: absolute; inset: 0; pointer-events: none; background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,240,255,0.008) 2px, rgba(0,240,255,0.008) 4px); border-radius: 12px; }

          .badge-trust { display: inline-flex; align-items: center; gap: 6px; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: 600; }

          .loading { color: ${c.muted}; padding: 12px; text-align: center; }
          .error { color: #ff003c; padding: 12px; text-align: center; font-size: 12px; }
        </style>
        <div class="loading">Loading agent #${this.agentId}…</div>
      `;
    }

    async fetchAgent() {
      try {
        const res = await fetch(`${API}/${this.agentId}`);
        if (!res.ok) throw new Error(`Agent #${this.agentId} not found`);
        const data = await res.json();
        this.renderAgent(data);
      } catch (e) {
        const el = this.shadowRoot.querySelector(".loading");
        if (el) { el.className = "error"; el.textContent = e.message; }
      }
    }

    renderAgent(d) {
      const c = this.colors();
      const t = TRUST[d.trustLevel] || TRUST[0];
      const verifyUrl = `${SITE}/verify/${d.id}`;
      const born = new Date(d.birthTimestamp).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

      if (this.size === "full") {
        this.shadowRoot.innerHTML = `${this.shadowRoot.querySelector("style").outerHTML}
          <div class="full" style="position:relative">
            ${this.isDark() ? '<div class="scanlines"></div>' : ''}
            <div class="header">
              <div class="shield">${SHIELD_SVG}</div>
              <div class="info">
                <div class="agent-name">${this.esc(d.name)} #${d.id}</div>
                <div class="agent-type">${this.esc(d.agentType)} · ${this.esc(d.platform)}</div>
              </div>
              <span class="dot" style="background:${t.color}"></span>
            </div>
            <div class="body">
              <div class="row">
                <span class="label">Trust Level</span>
                <span class="badge-trust" style="background:${t.bg};color:${t.color}">
                  <span class="dot" style="background:${t.color};width:6px;height:6px"></span>
                  ${t.label}
                </span>
              </div>
              <div class="row">
                <span class="label">Licenses</span>
                <span class="value">${d.licenses ? d.licenses.filter(l => l.status === "ACTIVE").length : 0} active</span>
              </div>
              <div class="row">
                <span class="label">Active</span>
                <span class="value">${d.activeMonths} month${d.activeMonths !== 1 ? 's' : ''}</span>
              </div>
              <div class="row">
                <span class="label">Born</span>
                <span class="value">${born}</span>
              </div>
              <div class="row">
                <span class="label">Status</span>
                <span class="value" style="color:${d.active ? '#00f0a0' : '#ff003c'}">${d.active ? '● Online' : '○ Offline'}</span>
              </div>
            </div>
            <div class="footer">
              <span class="powered">${SHIELD_SVG} Verified by <a href="${SITE}" target="_blank" rel="noopener">ORIGIN</a></span>
              <a href="${verifyUrl}" target="_blank" rel="noopener">View Certificate →</a>
            </div>
          </div>`;
      } else {
        this.shadowRoot.innerHTML = `${this.shadowRoot.querySelector("style").outerHTML}
          <a class="compact" href="${verifyUrl}" target="_blank" rel="noopener" title="Verified by ORIGIN — ${t.label}">
            <span class="shield">${SHIELD_SVG}</span>
            <span class="dot" style="background:${t.color}"></span>
            <span class="name">${this.esc(d.name)}</span>
            <span class="sep">·</span>
            <span class="trust-label">${t.label}</span>
          </a>`;
      }
    }

    esc(s) {
      const d = document.createElement("div");
      d.textContent = s || "";
      return d.innerHTML;
    }
  }

  if (!customElements.get("origin-badge")) {
    customElements.define("origin-badge", OriginBadge);
  }
})();
