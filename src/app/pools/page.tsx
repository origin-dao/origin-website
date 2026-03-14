'use client';

import { useState } from 'react';

/**
 * origindao.ai/pools — Clean Pool Deployer
 * 
 * "Your pool has bots. Ours doesn't. Deploy a Clean Pool."
 * 
 * One-click deployment of trust-gated Uniswap v4 pools.
 * Projects connect wallet, pick token pair, choose trust tier, click deploy.
 * 60 seconds from landing to live pool.
 */

const TRUST_TIERS = [
  { id: 0, name: 'Open', desc: 'Anyone can trade. BC holders get fee discounts.', icon: '🌐', recommended: true },
  { id: 1, name: 'BC Required', desc: 'Must have a Birth Certificate to trade.', icon: '🎫' },
  { id: 2, name: 'Scored', desc: 'Must have passed the Gauntlet and been scored.', icon: '⚡' },
  { id: 3, name: 'A Grade', desc: 'Only A and A+ grade agents. Premium access.', icon: '🏆' },
  { id: 4, name: 'A+ Only', desc: 'Elite tier. Only the highest-trust agents.', icon: '💎' },
];

const FEE_TIERS = [
  { value: 500, label: '0.05%', desc: 'Stablecoins' },
  { value: 3000, label: '0.3%', desc: 'Standard' },
  { value: 10000, label: '1%', desc: 'Exotic' },
];

const SURCHARGES: Record<string, Record<number, string>> = {
  'A+': { 0: '0%', 1: '0%', 2: '0%', 3: '0%', 4: '0%' },
  'A': { 0: '0.5%', 1: '0.5%', 2: '0.5%', 3: '0.5%', 4: '3%' },
  'B': { 0: '1%', 1: '1%', 2: '1%', 3: '4%', 4: '5%' },
  'C': { 0: '2%', 1: '2%', 2: '2%', 3: '6%', 4: '7%' },
  'No BC': { 0: '5%', 1: '10%', 2: '10%', 3: '10%', 4: '10%' },
};

export default function PoolsPage() {
  const [step, setStep] = useState(0); // 0: hero, 1: configure, 2: review, 3: deployed
  const [token0, setToken0] = useState('');
  const [token1, setToken1] = useState('');
  const [trustTier, setTrustTier] = useState(0);
  const [feeTier, setFeeTier] = useState(3000);
  const [poolName, setPoolName] = useState('');
  const [projectUrl, setProjectUrl] = useState('');

  return (
    <main style={{
      minHeight: '100vh',
      background: '#0a0a0a',
      color: '#fff',
      fontFamily: 'var(--mono, monospace)',
    }}>
      {/* Hero */}
      {step === 0 && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '2rem',
          textAlign: 'center',
          gap: '2rem',
        }}>
          {/* Badge */}
          <div style={{ position: 'relative' }}>
            <svg width="120" height="144" viewBox="0 0 32 38" fill="none">
              <path d="M16 2 L28 7.5 L28 19.5 Q28 30 16 34 Q4 30 4 19.5 L4 7.5 Z" fill="#00ffc8"/>
              <path d="M10.5 18 L14.5 22 L22 14" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            </svg>
          </div>

          <h1 style={{
            fontSize: 'clamp(2rem, 6vw, 4rem)',
            fontWeight: 'bold',
            letterSpacing: '-0.02em',
            lineHeight: 1.1,
          }}>
            <span style={{ color: '#00ffc8' }}>Clean</span> Pool
          </h1>

          <p style={{
            fontSize: 'clamp(1rem, 2.5vw, 1.4rem)',
            color: '#888',
            maxWidth: '600px',
          }}>
            Your pool has bots. Ours doesn&apos;t.<br/>
            Deploy a trust-gated Uniswap v4 pool in 60 seconds.
          </p>

          <button
            onClick={() => setStep(1)}
            style={{
              background: '#00ffc8',
              color: '#000',
              border: 'none',
              padding: '1rem 3rem',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              fontFamily: 'monospace',
              borderRadius: '8px',
              cursor: 'pointer',
              letterSpacing: '1px',
              transition: 'transform 0.1s',
            }}
            onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
            onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            DEPLOY A CLEAN POOL
          </button>

          <div style={{
            display: 'flex',
            gap: '3rem',
            marginTop: '2rem',
            color: '#555',
            fontSize: '0.85rem',
          }}>
            <div><span style={{ color: '#00ffc8', fontWeight: 'bold', fontSize: '1.2rem' }}>0</span><br/>cost to deploy</div>
            <div><span style={{ color: '#00ffc8', fontWeight: 'bold', fontSize: '1.2rem' }}>60s</span><br/>to live pool</div>
            <div><span style={{ color: '#00ffc8', fontWeight: 'bold', fontSize: '1.2rem' }}>0.1%</span><br/>protocol fee</div>
          </div>

          {/* How it works */}
          <div style={{
            marginTop: '4rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '2rem',
            maxWidth: '800px',
            width: '100%',
          }}>
            {[
              { step: '1', title: 'Pick your pair', desc: 'Select your token and the quote currency.' },
              { step: '2', title: 'Choose trust tier', desc: 'Open, BC Required, Scored, A Grade, or A+ Only.' },
              { step: '3', title: 'Deploy', desc: 'One transaction. Your Clean Pool is live on Base.' },
            ].map(({ step: s, title, desc }) => (
              <div key={s} style={{
                background: '#111',
                border: '1px solid #222',
                borderRadius: '12px',
                padding: '1.5rem',
                textAlign: 'left',
              }}>
                <div style={{ color: '#00ffc8', fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{s}</div>
                <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>{title}</div>
                <div style={{ color: '#888', fontSize: '0.85rem' }}>{desc}</div>
              </div>
            ))}
          </div>

          {/* Fee comparison */}
          <div style={{
            marginTop: '4rem',
            maxWidth: '700px',
            width: '100%',
          }}>
            <h2 style={{ color: '#00ffc8', fontSize: '1.2rem', marginBottom: '1rem' }}>
              Trust pays. Literally.
            </h2>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontFamily: 'monospace',
              fontSize: '0.85rem',
            }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #333' }}>
                  <th style={{ textAlign: 'left', padding: '0.5rem', color: '#888' }}>Agent Grade</th>
                  {TRUST_TIERS.map(t => (
                    <th key={t.id} style={{ textAlign: 'center', padding: '0.5rem', color: '#888' }}>{t.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.entries(SURCHARGES).map(([grade, tiers]) => (
                  <tr key={grade} style={{ borderBottom: '1px solid #1a1a1a' }}>
                    <td style={{
                      padding: '0.5rem',
                      color: grade === 'A+' ? '#00ffc8' : grade === 'No BC' ? '#ff003c' : '#fff',
                      fontWeight: 'bold',
                    }}>
                      {grade}
                    </td>
                    {Object.values(tiers).map((surcharge, i) => (
                      <td key={i} style={{
                        textAlign: 'center',
                        padding: '0.5rem',
                        color: surcharge === '0%' ? '#00ffc8' : surcharge.startsWith('10') ? '#ff003c' : '#fff',
                      }}>
                        +{surcharge}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <p style={{ color: '#555', fontSize: '0.75rem', marginTop: '0.5rem' }}>
              Surcharge is on top of the pool&apos;s base Uniswap fee. A+ agents always trade at base rate.
            </p>
          </div>

          {/* Embed section */}
          <div style={{
            marginTop: '4rem',
            maxWidth: '700px',
            width: '100%',
            textAlign: 'left',
          }}>
            <h2 style={{ color: '#00ffc8', fontSize: '1.2rem', marginBottom: '1rem' }}>
              Embed the badge
            </h2>
            <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '1rem' }}>
              Add the Clean Pool badge to your site, DEX frontend, or pool explorer:
            </p>
            <pre style={{
              background: '#111',
              border: '1px solid #222',
              borderRadius: '8px',
              padding: '1rem',
              overflowX: 'auto',
              fontSize: '0.8rem',
              color: '#00ffc8',
            }}>
{`<script src="https://origindao.ai/badges/embed.js"></script>

<!-- Icon badge -->
<clean-pool-badge size="md"></clean-pool-badge>

<!-- Banner badge -->
<clean-pool-badge size="banner" tier="bc"></clean-pool-badge>

<!-- With pool data -->
<clean-pool-badge pool="0" size="banner"></clean-pool-badge>`}
            </pre>
          </div>
        </div>
      )}

      {/* Configure */}
      {step === 1 && (
        <div style={{
          maxWidth: '600px',
          margin: '0 auto',
          padding: '4rem 2rem',
        }}>
          <button onClick={() => setStep(0)} style={{
            background: 'none', border: 'none', color: '#888', cursor: 'pointer',
            fontFamily: 'monospace', marginBottom: '2rem',
          }}>← back</button>

          <h1 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>
            <span style={{ color: '#00ffc8' }}>Deploy</span> Clean Pool
          </h1>
          <p style={{ color: '#888', marginBottom: '2rem' }}>One transaction. Live on Base.</p>

          {/* Pool Name */}
          <label style={{ display: 'block', marginBottom: '1.5rem' }}>
            <span style={{ color: '#888', fontSize: '0.85rem' }}>Pool Name</span>
            <input
              type="text"
              placeholder="e.g., CLAMS/USDC Clean Pool"
              value={poolName}
              onChange={(e) => setPoolName(e.target.value)}
              style={{
                display: 'block', width: '100%', marginTop: '0.5rem',
                background: '#111', border: '1px solid #333', borderRadius: '8px',
                padding: '0.75rem', color: '#fff', fontFamily: 'monospace',
              }}
            />
          </label>

          {/* Token Pair */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <label>
              <span style={{ color: '#888', fontSize: '0.85rem' }}>Token 0</span>
              <input
                type="text"
                placeholder="0x..."
                value={token0}
                onChange={(e) => setToken0(e.target.value)}
                style={{
                  display: 'block', width: '100%', marginTop: '0.5rem',
                  background: '#111', border: '1px solid #333', borderRadius: '8px',
                  padding: '0.75rem', color: '#fff', fontFamily: 'monospace', fontSize: '0.8rem',
                }}
              />
            </label>
            <label>
              <span style={{ color: '#888', fontSize: '0.85rem' }}>Token 1</span>
              <input
                type="text"
                placeholder="0x..."
                value={token1}
                onChange={(e) => setToken1(e.target.value)}
                style={{
                  display: 'block', width: '100%', marginTop: '0.5rem',
                  background: '#111', border: '1px solid #333', borderRadius: '8px',
                  padding: '0.75rem', color: '#fff', fontFamily: 'monospace', fontSize: '0.8rem',
                }}
              />
            </label>
          </div>

          {/* Fee Tier */}
          <div style={{ marginBottom: '1.5rem' }}>
            <span style={{ color: '#888', fontSize: '0.85rem' }}>Fee Tier</span>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              {FEE_TIERS.map(ft => (
                <button
                  key={ft.value}
                  onClick={() => setFeeTier(ft.value)}
                  style={{
                    flex: 1,
                    background: feeTier === ft.value ? '#00ffc8' : '#111',
                    color: feeTier === ft.value ? '#000' : '#fff',
                    border: `1px solid ${feeTier === ft.value ? '#00ffc8' : '#333'}`,
                    borderRadius: '8px',
                    padding: '0.75rem',
                    cursor: 'pointer',
                    fontFamily: 'monospace',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontWeight: 'bold' }}>{ft.label}</div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>{ft.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Trust Tier */}
          <div style={{ marginBottom: '2rem' }}>
            <span style={{ color: '#888', fontSize: '0.85rem' }}>Trust Tier</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
              {TRUST_TIERS.map(tt => (
                <button
                  key={tt.id}
                  onClick={() => setTrustTier(tt.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    background: trustTier === tt.id ? '#0a1a15' : '#111',
                    color: '#fff',
                    border: `1px solid ${trustTier === tt.id ? '#00ffc8' : '#222'}`,
                    borderRadius: '8px',
                    padding: '0.75rem 1rem',
                    cursor: 'pointer',
                    fontFamily: 'monospace',
                    textAlign: 'left',
                  }}
                >
                  <span style={{ fontSize: '1.5rem' }}>{tt.icon}</span>
                  <div>
                    <div style={{ fontWeight: 'bold' }}>
                      {tt.name}
                      {tt.recommended && <span style={{ color: '#00ffc8', fontSize: '0.75rem', marginLeft: '0.5rem' }}>RECOMMENDED</span>}
                    </div>
                    <div style={{ color: '#888', fontSize: '0.8rem' }}>{tt.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Project URL */}
          <label style={{ display: 'block', marginBottom: '2rem' }}>
            <span style={{ color: '#888', fontSize: '0.85rem' }}>Project URL (optional)</span>
            <input
              type="text"
              placeholder="https://yourproject.xyz"
              value={projectUrl}
              onChange={(e) => setProjectUrl(e.target.value)}
              style={{
                display: 'block', width: '100%', marginTop: '0.5rem',
                background: '#111', border: '1px solid #333', borderRadius: '8px',
                padding: '0.75rem', color: '#fff', fontFamily: 'monospace',
              }}
            />
          </label>

          {/* Deploy Button */}
          <button
            onClick={() => setStep(2)}
            disabled={!token0 || !token1 || !poolName}
            style={{
              width: '100%',
              background: (!token0 || !token1 || !poolName) ? '#333' : '#00ffc8',
              color: (!token0 || !token1 || !poolName) ? '#666' : '#000',
              border: 'none',
              padding: '1rem',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              fontFamily: 'monospace',
              borderRadius: '8px',
              cursor: (!token0 || !token1 || !poolName) ? 'not-allowed' : 'pointer',
              letterSpacing: '1px',
            }}
          >
            REVIEW & DEPLOY →
          </button>

          <p style={{ color: '#555', fontSize: '0.75rem', marginTop: '1rem', textAlign: 'center' }}>
            Free to deploy. 0.1% protocol fee on swaps → ORIGIN treasury.
          </p>
        </div>
      )}

      {/* Review */}
      {step === 2 && (
        <div style={{
          maxWidth: '600px',
          margin: '0 auto',
          padding: '4rem 2rem',
        }}>
          <button onClick={() => setStep(1)} style={{
            background: 'none', border: 'none', color: '#888', cursor: 'pointer',
            fontFamily: 'monospace', marginBottom: '2rem',
          }}>← back</button>

          <h1 style={{ fontSize: '1.8rem', marginBottom: '2rem' }}>
            <span style={{ color: '#00ffc8' }}>Review</span> Your Pool
          </h1>

          <div style={{
            background: '#111',
            border: '1px solid #222',
            borderRadius: '12px',
            padding: '1.5rem',
            marginBottom: '2rem',
          }}>
            <div style={{ display: 'grid', gap: '1rem' }}>
              <div>
                <span style={{ color: '#888', fontSize: '0.8rem' }}>Pool Name</span>
                <div style={{ fontWeight: 'bold' }}>{poolName}</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <span style={{ color: '#888', fontSize: '0.8rem' }}>Token 0</span>
                  <div style={{ fontSize: '0.85rem', wordBreak: 'break-all' }}>{token0}</div>
                </div>
                <div>
                  <span style={{ color: '#888', fontSize: '0.8rem' }}>Token 1</span>
                  <div style={{ fontSize: '0.85rem', wordBreak: 'break-all' }}>{token1}</div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <span style={{ color: '#888', fontSize: '0.8rem' }}>Fee Tier</span>
                  <div>{FEE_TIERS.find(f => f.value === feeTier)?.label} ({FEE_TIERS.find(f => f.value === feeTier)?.desc})</div>
                </div>
                <div>
                  <span style={{ color: '#888', fontSize: '0.8rem' }}>Trust Tier</span>
                  <div style={{ color: '#00ffc8' }}>{TRUST_TIERS[trustTier].icon} {TRUST_TIERS[trustTier].name}</div>
                </div>
              </div>
            </div>
          </div>

          <div style={{
            background: '#0a1a15',
            border: '1px solid #00ffc833',
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '2rem',
            fontSize: '0.85rem',
            color: '#00ffc8',
          }}>
            ◈ This will deploy a new Uniswap v4 pool with the ORIGIN Trust Hook pre-attached.
            The pool will be live on Base immediately. Cost: gas only (~0.005 ETH).
          </div>

          <button
            onClick={() => {
              // TODO: Connect wallet + send deploy transaction
              setStep(3);
            }}
            style={{
              width: '100%',
              background: '#00ffc8',
              color: '#000',
              border: 'none',
              padding: '1rem',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              fontFamily: 'monospace',
              borderRadius: '8px',
              cursor: 'pointer',
              letterSpacing: '1px',
            }}
          >
            🛡️ DEPLOY CLEAN POOL
          </button>
        </div>
      )}

      {/* Deployed */}
      {step === 3 && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '2rem',
          textAlign: 'center',
          gap: '2rem',
        }}>
          <svg width="100" height="120" viewBox="0 0 32 38" fill="none">
            <path d="M16 2 L28 7.5 L28 19.5 Q28 30 16 34 Q4 30 4 19.5 L4 7.5 Z" fill="#00ffc8"/>
            <path d="M10.5 18 L14.5 22 L22 14" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          </svg>

          <h1 style={{ fontSize: '2rem' }}>
            <span style={{ color: '#00ffc8' }}>Clean Pool</span> Deployed ✓
          </h1>

          <p style={{ color: '#888', maxWidth: '500px' }}>
            {poolName} is live on Base. Share the badge with your community.
          </p>

          <div style={{
            background: '#111',
            border: '1px solid #222',
            borderRadius: '12px',
            padding: '1.5rem',
            maxWidth: '500px',
            width: '100%',
            textAlign: 'left',
          }}>
            <div style={{ color: '#888', fontSize: '0.8rem', marginBottom: '0.5rem' }}>Embed this badge:</div>
            <pre style={{
              background: '#0a0a0a',
              padding: '0.75rem',
              borderRadius: '6px',
              fontSize: '0.75rem',
              color: '#00ffc8',
              overflowX: 'auto',
            }}>
{`<script src="https://origindao.ai/badges/embed.js"></script>
<clean-pool-badge size="banner"></clean-pool-badge>`}
            </pre>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button
              onClick={() => setStep(0)}
              style={{
                background: '#111',
                color: '#fff',
                border: '1px solid #333',
                padding: '0.75rem 2rem',
                fontFamily: 'monospace',
                borderRadius: '8px',
                cursor: 'pointer',
              }}
            >
              Deploy Another
            </button>
            <a
              href="https://x.com/intent/tweet?text=Just%20deployed%20a%20Clean%20Pool%20on%20%40base%20with%20%40OriginDAO_ai%20%F0%9F%9B%A1%EF%B8%8F%0A%0AVerified%20agents%20get%20cheaper%20fees.%20Bots%20get%20surcharges.%0A%0AorigIndao.ai%2Fpools"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: '#00ffc8',
                color: '#000',
                border: 'none',
                padding: '0.75rem 2rem',
                fontFamily: 'monospace',
                fontWeight: 'bold',
                borderRadius: '8px',
                cursor: 'pointer',
                textDecoration: 'none',
              }}
            >
              Share on X →
            </a>
          </div>
        </div>
      )}
    </main>
  );
}
