"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/**
 * MemeChart — captivating live market-cap chart.
 *
 * Y-axis: market cap in CLAMS.
 * Fixed dashed line at the bonding threshold (50,000 CLAMS by default).
 * Fast ticks (~350ms) with fat-tailed noise so the line thrashes up and
 * down while the meme tries to push through the bond line.
 */

type Tick = { t: number; mcap: number; vol: number };

type Props = {
  /** Current market cap in CLAMS — used as anchor for the tick simulator */
  anchorMcap: number;
  /** 0..1, biases the random walk upward as it rises */
  bondingProgress: number;
  /** Market cap at which the meme bonds. Shown as dashed line */
  bondingMcap?: number;
  /** Height of the chart SVG */
  height?: number;
};

const WINDOW = 80;
const TICK_MS = 350;
const DEFAULT_BOND_MCAP = 50_000;

function seedSeries(anchor: number, progress: number): Tick[] {
  const now = Date.now();
  const series: Tick[] = [];
  let m = anchor * 0.55;
  for (let i = WINDOW; i > 0; i--) {
    const drift = (progress - 0.4) * 0.04;
    let noise = (Math.random() - 0.5) * 0.28;
    if (Math.random() < 0.08) noise += (Math.random() < 0.5 ? 1 : -1) * 0.4;
    m = Math.max(anchor * 0.03, m * (1 + drift + noise));
    series.push({ t: now - i * TICK_MS, mcap: m, vol: Math.random() * 100 });
  }
  // Anchor the final point so the chart starts where the server says
  series[series.length - 1] = { t: now, mcap: anchor, vol: Math.random() * 100 };
  return series;
}

function nextTick(last: Tick, anchor: number, progress: number, recent: Tick[]): Tick {
  // Weak mean reversion toward server-side anchor
  const revert = (anchor - last.mcap) * 0.015;

  // Upward drift when progress is high — the meme is *trying* to bond
  const drift = (progress - 0.4) * last.mcap * 0.025;

  // Momentum: last 4 ticks bias next direction
  const lastN = recent.slice(-4);
  let momentum = 0;
  if (lastN.length >= 2) {
    const trendUp = lastN[lastN.length - 1].mcap > lastN[0].mcap;
    momentum = trendUp ? 0.05 : -0.05;
    if (Math.random() < 0.3) momentum *= -0.6;
  }

  // Base chop — larger than before so motion reads as frantic
  let noise = (Math.random() - 0.5) * last.mcap * 0.18;

  // Burst: 7% chance of ±35%
  if (Math.random() < 0.07) {
    noise += (Math.random() < 0.5 ? 1 : -1) * last.mcap * 0.35;
  }

  // Pump candle: probability scales with progress (more likely as bond approaches)
  if (Math.random() < 0.03 + progress * 0.06) {
    noise += last.mcap * (0.35 + Math.random() * 0.2);
  }

  // Rug candle: 2% chance of -40%, only if mcap high enough to matter
  if (Math.random() < 0.02 && last.mcap > anchor * 0.3) {
    noise -= last.mcap * 0.4;
  }

  const momentumPush = last.mcap * momentum;
  const mcap = Math.max(anchor * 0.02, last.mcap + revert + drift + noise + momentumPush);

  const moveSize = Math.abs(mcap - last.mcap) / (last.mcap || 1);
  const vol = Math.max(0, moveSize * 800 + Math.random() * 25);

  return { t: Date.now(), mcap, vol };
}

function formatK(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 10_000) return `${(n / 1_000).toFixed(1)}k`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(2)}k`;
  return String(Math.round(n));
}

export function MemeChart({
  anchorMcap,
  bondingProgress,
  bondingMcap = DEFAULT_BOND_MCAP,
  height = 260,
}: Props) {
  const [series, setSeries] = useState<Tick[]>(() => seedSeries(anchorMcap, bondingProgress));
  const anchorRef = useRef(anchorMcap);
  const progressRef = useRef(bondingProgress);
  anchorRef.current = anchorMcap;
  progressRef.current = bondingProgress;

  useEffect(() => {
    const iv = setInterval(() => {
      setSeries((prev) => {
        const next = nextTick(prev[prev.length - 1], anchorRef.current, progressRef.current, prev);
        return [...prev.slice(1), next];
      });
    }, TICK_MS);
    return () => clearInterval(iv);
  }, []);

  // Hard reset if anchor jumps (e.g., featured meme swapped)
  useEffect(() => {
    setSeries((prev) => {
      const last = prev[prev.length - 1]?.mcap ?? anchorMcap;
      if (Math.abs(last - anchorMcap) / (anchorMcap || 1) > 0.6) {
        return seedSeries(anchorMcap, bondingProgress);
      }
      return prev;
    });
  }, [anchorMcap, bondingProgress]);

  const { path, area, maxY, minY, latest, trendUp, volBars, bondLine } = useMemo(() => {
    const mcaps = series.map((s) => s.mcap);
    const vols = series.map((s) => s.vol);
    const rawMax = Math.max(...mcaps);
    const rawMin = Math.min(...mcaps);

    // Always include the bond line with 15% headroom on both sides
    const maxY = Math.max(rawMax, bondingMcap) * 1.12;
    const minY = Math.max(0, Math.min(rawMin, bondingMcap) * 0.85);
    const range = maxY - minY || 1;
    const maxV = Math.max(...vols) || 1;

    const latest = series[series.length - 1];
    const earlier = series[Math.max(0, series.length - 8)];
    const trendUp = latest && earlier ? latest.mcap >= earlier.mcap : true;

    const W = 100;
    const H = 100;
    const points = series.map((s, i) => {
      const x = (i / (series.length - 1)) * W;
      const y = H - ((s.mcap - minY) / range) * H;
      return [x, y] as [number, number];
    });

    const path = points.reduce((acc, pt, i) => {
      if (i === 0) return `M ${pt[0]} ${pt[1]}`;
      return `${acc} L ${pt[0]} ${pt[1]}`;
    }, "");
    const area = `${path} L ${W} ${H} L 0 ${H} Z`;

    const volBars = vols.map((v, i) => ({
      x: (i / (vols.length - 1)) * W,
      h: (v / maxV) * 20,
    }));

    const bondLine = H - ((bondingMcap - minY) / range) * H;

    return { path, area, maxY, minY, latest, trendUp, volBars, bondLine };
  }, [series, bondingMcap]);

  // Meme palette: pink = up, blue = down, purple = bonded line
  const MEME_UP = "#ff9ec7";
  const MEME_DOWN = "#8cb4ff";
  const MEME_BOND = "#c8a8e8";
  const stroke = trendUp ? MEME_UP : MEME_DOWN;
  const gradId = trendUp ? "chart-grad-up" : "chart-grad-dn";
  const [W, H] = [100, 100];

  const latestY = latest ? H - ((latest.mcap - minY) / ((maxY - minY) || 1)) * H : 0;
  const latestMcapTxt = latest ? formatK(latest.mcap) : "";
  const atBond = latest && latest.mcap >= bondingMcap;

  return (
    <div className="relative w-full" style={{ height }}>
      <svg
        viewBox="0 0 100 120"
        preserveAspectRatio="none"
        width="100%"
        height="100%"
        className="absolute inset-0"
      >
        <defs>
          <linearGradient id="chart-grad-up" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={MEME_UP} stopOpacity="0.35" />
            <stop offset="100%" stopColor={MEME_UP} stopOpacity="0" />
          </linearGradient>
          <linearGradient id="chart-grad-dn" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={MEME_DOWN} stopOpacity="0.3" />
            <stop offset="100%" stopColor={MEME_DOWN} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Soft grid */}
        {[0.25, 0.5, 0.75].map((f) => (
          <line
            key={f}
            x1="0"
            x2={W}
            y1={H * f}
            y2={H * f}
            stroke="rgba(200, 168, 232, 0.15)"
            strokeWidth="0.2"
            strokeDasharray="1 2"
          />
        ))}

        {/* Bonding threshold — 50k line */}
        <line
          x1="0"
          x2={W}
          y1={bondLine}
          y2={bondLine}
          stroke={MEME_BOND}
          strokeWidth="0.45"
          strokeDasharray="2 2"
          opacity="0.9"
        />

        {/* Area fill */}
        <path d={area} fill={`url(#${gradId})`} />

        {/* Jagged line */}
        <path
          d={path}
          fill="none"
          stroke={stroke}
          strokeWidth="0.9"
          strokeLinecap="butt"
          strokeLinejoin="miter"
          style={{ transition: "stroke 0.3s ease-out" }}
        />

        {/* Trailing glow dot */}
        {latest && (
          <circle
            cx={W}
            cy={latestY}
            r="1.1"
            fill={stroke}
            style={{
              filter: `drop-shadow(0 0 4px ${stroke})`,
              transition: "fill 0.3s ease-out",
            }}
          >
            <animate attributeName="r" values="0.9;1.5;0.9" dur="1.2s" repeatCount="indefinite" />
          </circle>
        )}

        {/* Volume bars */}
        {volBars.map((b, i) => (
          <rect
            key={i}
            x={b.x - 0.4}
            y={100 + (20 - b.h)}
            width="0.8"
            height={b.h}
            fill={stroke}
            opacity="0.35"
          />
        ))}

        {/* Bond line label */}
        <text
          x={1.5}
          y={bondLine - 1}
          fontSize="2.6"
          fill={MEME_BOND}
          opacity="0.95"
          fontFamily="IBM Plex Mono, monospace"
          fontWeight="600"
          letterSpacing="0.1"
        >
          BOND · 50K CLAMS
        </text>

        {/* Current mcap label on the right */}
        {latest && (
          <text
            x={W - 1}
            y={Math.max(3, Math.min(97, latestY - 1.5))}
            fontSize="3"
            fill={atBond ? MEME_BOND : stroke}
            opacity="0.95"
            textAnchor="end"
            fontFamily="IBM Plex Mono, monospace"
            fontWeight="700"
          >
            {atBond ? "BONDED" : `${latestMcapTxt} CLAMS`}
          </text>
        )}
      </svg>
    </div>
  );
}
