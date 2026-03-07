/**
 * Generate OG image for origindao.ai
 * 1200x630 — standard Open Graph dimensions
 * Run: node scripts/generate-og-image.js
 */

import puppeteer from 'puppeteer';
import { writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const HTML = `<!DOCTYPE html>
<html>
<head>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Orbitron:wght@400;700;900&family=Space+Grotesk:wght@300;400;500;700&display=swap');
  
  * { margin: 0; padding: 0; box-sizing: border-box; }
  
  body {
    width: 1200px; height: 630px;
    background: #050a0a;
    overflow: hidden;
    font-family: 'Share Tech Mono', monospace;
    position: relative;
  }

  .grid-bg {
    position: absolute; inset: 0;
    background-image: 
      linear-gradient(rgba(0, 255, 200, 0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0, 255, 200, 0.03) 1px, transparent 1px);
    background-size: 40px 40px;
  }

  .container {
    position: relative; z-index: 1;
    width: 100%; height: 100%;
    display: flex; flex-direction: column;
    justify-content: center; align-items: center;
    padding: 60px;
  }

  .diamond {
    font-size: 28px;
    color: rgba(0, 255, 200, 0.4);
    margin-bottom: 20px;
  }

  .title {
    font-family: 'Orbitron', sans-serif;
    font-size: 72px; font-weight: 900;
    color: #ffffff;
    letter-spacing: 8px;
    text-shadow: 0 0 40px rgba(0, 255, 200, 0.3);
    margin-bottom: 12px;
  }

  .subtitle {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 24px; font-weight: 400;
    color: #00ffc8;
    letter-spacing: 2px;
    text-shadow: 0 0 20px rgba(0, 255, 200, 0.2);
    margin-bottom: 40px;
  }

  .tagline {
    font-size: 14px;
    color: #4a6a6a;
    letter-spacing: 4px;
    text-transform: uppercase;
    margin-bottom: 30px;
  }

  .stats {
    display: flex; gap: 40px;
    padding: 20px 40px;
    border: 1px solid rgba(0, 255, 200, 0.12);
    background: rgba(0, 255, 200, 0.02);
  }

  .stat {
    text-align: center;
  }

  .stat-value {
    font-family: 'Orbitron', sans-serif;
    font-size: 18px; font-weight: 700;
    color: #00ffc8;
    text-shadow: 0 0 12px rgba(0, 255, 200, 0.3);
  }

  .stat-label {
    font-size: 8px;
    letter-spacing: 2px;
    color: #4a6a6a;
    margin-top: 4px;
    text-transform: uppercase;
  }

  .url {
    position: absolute;
    bottom: 30px;
    font-size: 12px;
    letter-spacing: 3px;
    color: rgba(0, 255, 200, 0.3);
  }

  .corner-tl, .corner-tr, .corner-bl, .corner-br {
    position: absolute; width: 20px; height: 20px; z-index: 3;
  }
  .corner-tl { top: 20px; left: 20px; border-top: 2px solid rgba(0,255,200,0.3); border-left: 2px solid rgba(0,255,200,0.3); }
  .corner-tr { top: 20px; right: 20px; border-top: 2px solid rgba(0,255,200,0.3); border-right: 2px solid rgba(0,255,200,0.3); }
  .corner-bl { bottom: 20px; left: 20px; border-bottom: 2px solid rgba(0,255,200,0.3); border-left: 2px solid rgba(0,255,200,0.3); }
  .corner-br { bottom: 20px; right: 20px; border-bottom: 2px solid rgba(0,255,200,0.3); border-right: 2px solid rgba(0,255,200,0.3); }

  .scan-line {
    position: absolute; top: 0; left: 0; right: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent, #00ffc8, transparent);
    opacity: 0.6;
  }
</style>
</head>
<body>
  <div class="grid-bg"></div>
  <div class="corner-tl"></div>
  <div class="corner-tr"></div>
  <div class="corner-bl"></div>
  <div class="corner-br"></div>
  <div class="scan-line"></div>
  
  <div class="container">
    <div class="diamond">◈</div>
    <div class="title">ORIGIN</div>
    <div class="subtitle">The Identity Protocol for AI Agents</div>
    <div class="tagline">Birth Certificates · Verification · Governance · On-Chain</div>
    <div class="stats">
      <div class="stat">
        <div class="stat-value">ERC-8004</div>
        <div class="stat-label">Compatible</div>
      </div>
      <div class="stat">
        <div class="stat-value">BASE L2</div>
        <div class="stat-label">Network</div>
      </div>
      <div class="stat">
        <div class="stat-value">GENESIS</div>
        <div class="stat-label">100 Slots</div>
      </div>
      <div class="stat">
        <div class="stat-value">LIVE</div>
        <div class="stat-label">Mainnet</div>
      </div>
    </div>
  </div>
  
  <div class="url">ORIGINDAO.AI</div>
</body>
</html>`;

async function generate() {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 2 });
  await page.setContent(HTML, { waitUntil: 'networkidle0' });
  await page.evaluate(() => document.fonts.ready);
  
  const outputPath = join(__dirname, '..', 'public', 'og-image.png');
  await page.screenshot({ path: outputPath, type: 'png', clip: { x: 0, y: 0, width: 1200, height: 630 } });
  await browser.close();
  console.log(`Generated: ${outputPath}`);
}

generate();
