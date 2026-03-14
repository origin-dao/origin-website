#!/usr/bin/env node
/**
 * Clean Pool Badge Generator V2 — From Brad's Design System
 *
 * Uses hand-crafted SVG paths from the design system HTML.
 * viewBox 0 0 120 144 for shields, custom viewBoxes for banners/pills/micro.
 *
 * Output: public/badges/v2/ (individual SVGs + manifest.json)
 */

const fs = require('fs');
const path = require('path');

const OUT_DIR = path.join(__dirname, '..', 'public', 'badges', 'v2');

// ─── Design Tokens ──────────────────────────────────────────────────
const T = {
  dark: {
    fill: '#071A0F',
    accent: '#00E676',
    textSub: 'rgba(255,255,255,0.3)',
    textDim: 'rgba(255,255,255,0.12)',
    bannerFill: '#071A0F',
    pillFill: '#071A0F',
    dividerOpacity: '0.2',
  },
  light: {
    fill: '#F2FAF5',
    accent: '#00804A',
    textSub: 'rgba(0,0,0,0.25)',
    textDim: 'rgba(0,0,0,0.1)',
    bannerFill: '#F2FAF5',
    pillFill: '#F2FAF5',
    dividerOpacity: '0.15',
  },
};

// Tier pill configs — progressive visual weight
const TIERS = {
  open:   { label: 'OPEN',  short: 'OPEN', pill: false },
  bc:     { label: 'BC',    short: 'BC',   pill: true,  pillFill: 'none',           pillStrokeOp: '0.4',  pillFillOp: '0',    textOp: '0.7',  fontSize: 8 },
  scored: { label: 'B+',    short: 'B+',   pill: true,  pillFill: '#00E676',        pillStrokeOp: '0.45', pillFillOp: '0.06', textOp: '0.8',  fontSize: 8 },
  a:      { label: 'A',     short: 'A',    pill: true,  pillFill: '#00E676',        pillStrokeOp: '0.55', pillFillOp: '0.1',  textOp: '1',    fontSize: 9, double: true },
  a_plus: { label: 'A+',    short: 'A+',   pill: true,  pillFill: '#00E676',        pillStrokeOp: '1',    pillFillOp: '0.12', textOp: '1',    fontSize: 10, double: true, bigger: true },
};

// ─── Shield Generator (viewBox 0 0 120 144) ─────────────────────────
function shieldSVG(w, h, theme, tierKey) {
  const t = T[theme];
  const tier = TIERS[tierKey];
  const accent = t.accent;

  // Scale stroke widths based on display size
  const scale = 120 / w;
  const sw = Math.max(1.2, scale * 1.2).toFixed(1);
  const cw = Math.max(3, scale * 3).toFixed(1);

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 120 144" fill="none">\n`;

  // Metadata on large
  if (w >= 120) {
    svg += `  <metadata>{"@type":"CleanPool","verifiedBy":"ORIGIN","protocol":"origindao.ai"}</metadata>\n`;
  }

  // Double shield trace for A/A+
  if (tier.double) {
    const innerPath = tier.bigger
      ? 'M60 11L13 29V70C13 99 33 124 60 135C87 124 107 99 107 70V29L60 11Z'
      : 'M60 13L15 31V70C15 98 34 122 60 133C86 122 105 98 105 70V31L60 13Z';
    const innerSw = tier.bigger ? '0.8' : '0.5';
    const innerOp = tier.bigger ? '0.25' : '0.12';
    svg += `  <path d="${innerPath}" fill="none" stroke="${accent}" stroke-width="${innerSw}" stroke-opacity="${innerOp}"/>\n`;
  }

  // Main shield
  const mainSw = tier.bigger ? '2.5' : sw;
  svg += `  <path d="M60 3L6 24V70C6 103 29 131 60 142C91 131 114 103 114 70V24L60 3Z" fill="${t.fill}" stroke="${accent}" stroke-width="${mainSw}"/>\n`;

  // Inner trace on large non-tier shields
  if (w >= 120 && !tier.double && tierKey === 'open') {
    svg += `  <path d="M60 13L15 31V70C15 98 34 122 60 133C86 122 105 98 105 70V31L60 13Z" fill="none" stroke="${accent}" stroke-width="0.4" stroke-opacity="0.15"/>\n`;
  }

  // Tier pill (inside shield, above checkmark)
  if (tier.pill && w >= 48) {
    const pillW = tier.bigger ? 54 : 48;
    const pillH = tier.bigger ? 20 : 18;
    const pillX = tier.bigger ? 33 : 36;
    const pillY = tier.bigger ? 20 : 22;
    const fillVal = tier.pillFillOp !== '0' ? `fill="${accent}" fill-opacity="${tier.pillFillOp}"` : 'fill="none"';
    const tierAccent = theme === 'light' ? t.accent : accent;
    svg += `  <rect x="${pillX}" y="${pillY}" width="${pillW}" height="${pillH}" rx="2" ${fillVal} stroke="${tierAccent}" stroke-width="${tier.bigger ? '1.2' : '0.8'}" stroke-opacity="${tier.pillStrokeOp}"/>\n`;
    svg += `  <text x="60" y="${pillY + (tier.bigger ? 14 : 12.5)}" text-anchor="middle" font-family="'JetBrains Mono',monospace" font-size="${tier.fontSize}" font-weight="${tier.fontSize >= 9 ? '700' : '600'}" letter-spacing="2" fill="${tierAccent}" fill-opacity="${tier.textOp}">${tier.label}</text>\n`;
  }

  // Angular checkmark
  svg += `  <path d="M40 69L53 82L80 55" stroke="${accent}" stroke-width="${cw}" stroke-linecap="square" stroke-linejoin="miter" fill="none"/>\n`;

  // Text labels (medium and up)
  if (w >= 80) {
    svg += `  <text x="60" y="101" text-anchor="middle" font-family="'JetBrains Mono',monospace" font-size="10.5" font-weight="700" letter-spacing="4" fill="${accent}">CLEAN</text>\n`;
    svg += `  <text x="60" y="115" text-anchor="middle" font-family="'JetBrains Mono',monospace" font-size="7.5" font-weight="400" letter-spacing="3" fill="${t.textSub}">POOL</text>\n`;
  }
  if (w >= 120) {
    svg += `  <text x="60" y="128" text-anchor="middle" font-family="'JetBrains Mono',monospace" font-size="5" font-weight="400" letter-spacing="2" fill="${t.textDim}">ORIGIN.DAO</text>\n`;
    // Suppi watermark
    svg += `  <path d="M0 0" fill="none" stroke="none" opacity="0" data-guardian="suppi" data-sig="0x" data-origin="true" data-clue=""/>\n`;
  }

  svg += `</svg>`;
  return svg;
}

// ─── Micro Shield (viewBox 0 0 16 16) ───────────────────────────────
function microSVG(theme) {
  const t = T[theme];
  return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
  <path d="M8 1L1 3.5V7.5C1 11.5 4 14 8 15.5C12 14 15 11.5 15 7.5V3.5L8 1Z" fill="${t.fill}" stroke="${t.accent}" stroke-width="0.8"/>
  <path d="M5 8L7 10L11 6" stroke="${t.accent}" stroke-width="1.4" stroke-linecap="square" stroke-linejoin="miter" fill="none"/>
</svg>`;
}

// ─── Banner (hand-crafted viewBoxes) ────────────────────────────────
function bannerSVG(w, h, theme, tierKey) {
  const t = T[theme];
  const accent = t.accent;
  const tier = TIERS[tierKey];

  if (w === 280) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="280" height="64" viewBox="0 0 280 64" fill="none">
  <rect x="0.5" y="0.5" width="279" height="63" rx="2" fill="${t.bannerFill}" stroke="${accent}" stroke-width="0.8"/>
  <path d="M32 12L20 18V30C20 39.5 25 46 32 50C39 46 44 39.5 44 30V18L32 12Z" fill="none" stroke="${accent}" stroke-width="0.8"/>
  <path d="M26 29L30 33L38 25" stroke="${accent}" stroke-width="1.6" stroke-linecap="square" stroke-linejoin="miter" fill="none"/>
  <line x1="56" y1="18" x2="56" y2="46" stroke="${accent}" stroke-width="0.3" stroke-opacity="${t.dividerOpacity}"/>
  <text x="68" y="29" font-family="'JetBrains Mono',monospace" font-size="13" font-weight="700" letter-spacing="3" fill="${accent}">CLEAN POOL</text>
  <text x="68" y="44" font-family="'JetBrains Mono',monospace" font-size="7.5" font-weight="400" letter-spacing="2" fill="${t.textSub}">VERIFIED BY ORIGIN</text>
  ${tier.pill ? `<rect x="220" y="21" width="44" height="22" rx="2" fill="${tier.pillFillOp !== '0' ? accent : 'none'}" fill-opacity="${tier.pillFillOp || '0'}" stroke="${accent}" stroke-width="0.6" stroke-opacity="0.35"/>
  <text x="242" y="36" text-anchor="middle" font-family="'JetBrains Mono',monospace" font-size="8" font-weight="600" letter-spacing="2" fill="${accent}">${tier.short}</text>` : ''}
</svg>`;
  }

  if (w === 180) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="180" height="44" viewBox="0 0 180 44" fill="none">
  <rect x="0.5" y="0.5" width="179" height="43" rx="2" fill="${t.bannerFill}" stroke="${accent}" stroke-width="0.8"/>
  <path d="M22 8L14 12V20C14 26 17.5 30 22 33C26.5 30 30 26 30 20V12L22 8Z" fill="none" stroke="${accent}" stroke-width="0.7"/>
  <path d="M18 19L21 22L27 16" stroke="${accent}" stroke-width="1.3" stroke-linecap="square" stroke-linejoin="miter" fill="none"/>
  <line x1="38" y1="11" x2="38" y2="33" stroke="${accent}" stroke-width="0.3" stroke-opacity="${t.dividerOpacity}"/>
  <text x="46" y="20" font-family="'JetBrains Mono',monospace" font-size="10" font-weight="700" letter-spacing="2.5" fill="${accent}">CLEAN POOL</text>
  <text x="46" y="32" font-family="'JetBrains Mono',monospace" font-size="6" font-weight="400" letter-spacing="1.5" fill="${t.textSub}">ORIGIN VERIFIED</text>
</svg>`;
  }

  // 140x32 mini
  return `<svg xmlns="http://www.w3.org/2000/svg" width="140" height="32" viewBox="0 0 140 32" fill="none">
  <rect x="0.5" y="0.5" width="139" height="31" rx="2" fill="${t.bannerFill}" stroke="${accent}" stroke-width="0.8"/>
  <path d="M16 6L10 9V15C10 19.5 12.5 22.5 16 25C19.5 22.5 22 19.5 22 15V9L16 6Z" fill="none" stroke="${accent}" stroke-width="0.6"/>
  <path d="M13 14L15 16L19.5 11.5" stroke="${accent}" stroke-width="1.1" stroke-linecap="square" stroke-linejoin="miter" fill="none"/>
  <text x="32" y="19.5" font-family="'JetBrains Mono',monospace" font-size="8" font-weight="600" letter-spacing="2" fill="${accent}">CLEAN POOL</text>
</svg>`;
}

// ─── Pill ────────────────────────────────────────────────────────────
function pillSVG(w, h, theme) {
  const t = T[theme];
  const accent = t.accent;

  if (w === 108) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="108" height="26" viewBox="0 0 108 26" fill="none">
  <rect x="0.5" y="0.5" width="107" height="25" rx="13" fill="${t.pillFill}" stroke="${accent}" stroke-width="0.6"/>
  <path d="M15 6L10 8.5V13.5C10 16.5 12 19 15 20.5C18 19 20 16.5 20 13.5V8.5L15 6Z" fill="none" stroke="${accent}" stroke-width="0.6"/>
  <path d="M12.5 13L14 14.5L17.5 11" stroke="${accent}" stroke-width="0.9" stroke-linecap="square" stroke-linejoin="miter" fill="none"/>
  <text x="30" y="17" font-family="'JetBrains Mono',monospace" font-size="8" font-weight="600" letter-spacing="2" fill="${accent}">CLEAN POOL</text>
</svg>`;
  }

  if (w === 76) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="76" height="22" viewBox="0 0 76 22" fill="none">
  <rect x="0.5" y="0.5" width="75" height="21" rx="11" fill="${t.pillFill}" stroke="${accent}" stroke-width="0.6"/>
  <path d="M13 5L9 7V11C9 13.5 10.5 15.5 13 17C15.5 15.5 17 13.5 17 11V7L13 5Z" fill="none" stroke="${accent}" stroke-width="0.5"/>
  <path d="M11 10.5L12.5 12L15.5 9" stroke="${accent}" stroke-width="0.8" stroke-linecap="square" stroke-linejoin="miter" fill="none"/>
  <text x="25" y="14.5" font-family="'JetBrains Mono',monospace" font-size="7" font-weight="600" letter-spacing="1.5" fill="${accent}">CLEAN</text>
</svg>`;
  }

  // 26x26 icon circle
  return `<svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 26 26" fill="none">
  <rect x="0.5" y="0.5" width="25" height="25" rx="12.5" fill="${t.pillFill}" stroke="${accent}" stroke-width="0.6"/>
  <path d="M13 5.5L7.5 8V14C7.5 17.5 9.5 20 13 22C16.5 20 18.5 17.5 18.5 14V8L13 5.5Z" fill="none" stroke="${accent}" stroke-width="0.6"/>
  <path d="M10.5 13L12 14.5L15.5 11" stroke="${accent}" stroke-width="1" stroke-linecap="square" stroke-linejoin="miter" fill="none"/>
</svg>`;
}

// ─── Generate ───────────────────────────────────────────────────────
function generate() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  let count = 0;
  const manifest = { generated: new Date().toISOString(), designVersion: '2.0', variants: [] };

  const themes = ['dark', 'light'];
  const tierKeys = Object.keys(TIERS);

  // Shields
  const shieldSizes = [[120, 144, 'xl'], [80, 96, 'lg'], [48, 58, 'md'], [32, 38, 'sm']];
  for (const theme of themes) {
    for (const tierKey of tierKeys) {
      for (const [w, h, label] of shieldSizes) {
        const name = `shield-${label}-${theme}-${tierKey}.svg`;
        fs.writeFileSync(path.join(OUT_DIR, name), shieldSVG(w, h, theme, tierKey));
        manifest.variants.push({ type: 'shield', size: label, theme, tier: tierKey, file: name, width: w, height: h });
        count++;
      }
      // Micro (different viewBox)
      const microName = `shield-micro-${theme}-${tierKey}.svg`;
      fs.writeFileSync(path.join(OUT_DIR, microName), microSVG(theme));
      manifest.variants.push({ type: 'shield', size: 'micro', theme, tier: tierKey, file: microName, width: 16, height: 16 });
      count++;
    }
  }

  // Banners (tier mainly affects the 280 banner)
  const bannerSizes = [[280, 64, 'full'], [180, 44, 'compact'], [140, 32, 'mini']];
  for (const theme of themes) {
    for (const tierKey of tierKeys) {
      for (const [w, h, label] of bannerSizes) {
        const name = `banner-${label}-${theme}-${tierKey}.svg`;
        fs.writeFileSync(path.join(OUT_DIR, name), bannerSVG(w, h, theme, tierKey));
        manifest.variants.push({ type: 'banner', size: label, theme, tier: tierKey, file: name, width: w, height: h });
        count++;
      }
    }
  }

  // Pills (tier-agnostic in the small formats)
  const pillSizes = [[108, 26, 'standard'], [76, 22, 'short'], [26, 26, 'icon']];
  for (const theme of themes) {
    for (const [w, h, label] of pillSizes) {
      const name = `pill-${label}-${theme}.svg`;
      fs.writeFileSync(path.join(OUT_DIR, name), pillSVG(w, h, theme));
      manifest.variants.push({ type: 'pill', size: label, theme, tier: 'all', file: name, width: w, height: h });
      count++;
    }
  }

  fs.writeFileSync(path.join(OUT_DIR, 'manifest.json'), JSON.stringify(manifest, null, 2));

  console.log(`✅ Generated ${count} badge variants`);
  console.log(`   Location: ${OUT_DIR}`);
}

generate();
