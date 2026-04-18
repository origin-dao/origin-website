"use client";

/**
 * BondingRing — circular progress toward bonding graduation.
 *
 * The partial arc that can't quite become a circle until a meme bonds.
 * Color-graded by progress, with a glow kick when the change_24h is big.
 *
 * All motion is done through SVG strokeDashoffset + CSS transitions so the
 * ring smoothly animates between server polls.
 */

type Props = {
  /** 0..1, 1.0 = bonded and graduated to MemePool */
  progress: number;
  /** 24h % change, drives the color flash (positive = green, negative = red) */
  change24h?: number;
  /** Radius in pixels */
  size?: number;
  /** Center label (symbol) */
  label?: string;
  /** Subtitle under label */
  sublabel?: string;
};

export function BondingRing({ progress, change24h = 0, size = 88, label, sublabel }: Props) {
  const clamped = Math.max(0, Math.min(1, progress));
  const bonded = clamped >= 1.0;
  const stroke = 6;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dashOffset = c * (1 - clamped);

  // Meme palette
  const MEME_UP = "#ff9ec7";
  const MEME_DOWN = "#8cb4ff";
  const MEME_BOND = "#c8a8e8";

  // Color band — pink progression, blue when dumping, purple when bonded
  let ringColor = "#4a5a6a";              // dim cool
  if (clamped >= 0.8) ringColor = MEME_UP;       // near-bond pink
  else if (clamped >= 0.3) ringColor = "#d4a5cc"; // rising soft pink

  const isDumping = change24h <= -25;
  const isPumping = change24h >= 50;
  if (isDumping && !bonded) ringColor = MEME_DOWN;
  if (bonded) ringColor = MEME_BOND;

  const trackColor = "rgba(70, 60, 90, 0.5)";
  const glowColor = bonded ? MEME_BOND : isPumping ? MEME_UP : isDumping ? MEME_DOWN : "transparent";

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{
          transform: "rotate(-90deg)",
          filter: glowColor !== "transparent" ? `drop-shadow(0 0 8px ${glowColor})` : undefined,
          transition: "filter 0.6s ease-out",
        }}
      >
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={trackColor}
          strokeWidth={stroke}
        />
        {/* Progress arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={ringColor}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={dashOffset}
          style={{
            transition: "stroke-dashoffset 0.8s ease-out, stroke 0.4s ease-out",
          }}
        />
        {/* Bonded overlay — pulsing solid ring when graduated */}
        {bonded && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={MEME_BOND}
            strokeWidth={stroke}
            opacity={0.4}
            style={{
              animation: "pulse-dot 1.4s ease-in-out infinite",
            }}
          />
        )}
      </svg>
      {/* Center label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        {label && (
          <span
            className="text-[11px] font-bold tracking-tight"
            style={{ color: bonded ? MEME_BOND : "#e0f0e0" }}
          >
            {label}
          </span>
        )}
        {sublabel && (
          <span className="text-[9px] text-o-text-dim">{sublabel}</span>
        )}
      </div>
    </div>
  );
}
