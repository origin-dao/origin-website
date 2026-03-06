"use client";

export const GLOBAL_STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Orbitron:wght@400;500;600;700;800;900&family=Fira+Code:wght@300;400;500;600;700&display=swap');

:root {
  --bg: #030808;
  --surface: rgba(5,15,10,0.9);
  --neon-green: #00FFC8;
  --neon-green-dim: rgba(0,255,200,0.25);
  --neon-yellow: #FFE600;
  --neon-red: #FF0040;
  --neon-magenta: #FF00AA;
  --neon-cyan: #00f0ff;
  --text: #C8D6D0;
  --text-secondary: #7A8A82;
  --dim: #3A4A42;
  --mono: 'Fira Code', 'Space Mono', monospace;
  --display: 'Orbitron', monospace;
}

* { margin: 0; padding: 0; box-sizing: border-box; }
body { background: var(--bg); color: var(--text); font-family: var(--mono); }

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.2; }
}

@keyframes pulseGreen {
  0%, 100% { box-shadow: 0 0 15px rgba(0,255,200,0.3), 0 0 40px rgba(0,255,200,0.1); }
  50% { box-shadow: 0 0 25px rgba(0,255,200,0.5), 0 0 60px rgba(0,255,200,0.2); }
}

@keyframes pulseCyan {
  0%, 100% { box-shadow: 0 0 15px rgba(0,240,255,0.3), 0 0 40px rgba(0,240,255,0.1); }
  50% { box-shadow: 0 0 25px rgba(0,240,255,0.5), 0 0 60px rgba(0,240,255,0.2); }
}

@keyframes lockGlow {
  0%, 100% { text-shadow: 0 0 6px rgba(255,230,0,0.4); }
  50% { text-shadow: 0 0 14px rgba(255,230,0,0.8), 0 0 30px rgba(255,230,0,0.2); }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 14px; height: 14px;
  background: var(--neon-green);
  border: none; cursor: pointer;
  box-shadow: 0 0 10px var(--neon-green);
}

::selection { background: rgba(0,255,200,0.3); color: var(--neon-green); }
::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: var(--bg); }
::-webkit-scrollbar-thumb { background: var(--neon-green-dim); }
`;

export function InjectStyles() {
  return <style dangerouslySetInnerHTML={{ __html: GLOBAL_STYLES }} />;
}
