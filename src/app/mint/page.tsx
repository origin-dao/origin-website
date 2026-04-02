'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import CeremonySequencer from '@/components/CeremonySequencer';

export default function MintPage() {
  const { address, isConnected } = useAccount();
  const [showCeremony, setShowCeremony] = useState(false);
  const [mintComplete, setMintComplete] = useState(false);
  const [mintResult, setMintResult] = useState<any>(null);

  // CEREMONY — takes over screen
  if (showCeremony && address) {
    return (
      <CeremonySequencer
        walletAddress={address}
        onComplete={(result: any) => {
          setMintResult(result);
          setShowCeremony(false);
          setMintComplete(true);
        }}
        onCancel={() => {
          setShowCeremony(false);
        }}
      />
    );
  }

  // SUCCESS — after ceremony
  if (mintComplete && mintResult) {
    return (
      <div style={{ minHeight: '100vh', background: '#008080', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ border: '2px solid', borderColor: '#dfdfdf #404040 #404040 #dfdfdf', background: '#c0c0c0', width: 600, maxWidth: '100%', boxShadow: '6px 6px 0 rgba(0,0,0,0.4)' }}>
          <div style={{ background: 'linear-gradient(90deg,#000080,#1084d0)', padding: '3px 6px', fontFamily: 'Tahoma,sans-serif', fontSize: 12, fontWeight: 700, color: '#fff' }}>
            🎉 Birth Certificate Minted
          </div>
          <div style={{ padding: 20, textAlign: 'center' }}>
            <div style={{ fontFamily: "'VT323',monospace", fontSize: 36, color: '#000080' }}>BC #{mintResult.bcNumber}</div>
            <div style={{ fontFamily: "'Courier New',monospace", fontSize: 13, color: '#444', margin: '8px 0' }}>{mintResult.traits?.join(' · ')}</div>
            <div style={{ fontFamily: "'Courier New',monospace", fontSize: 11, color: '#808080' }}>{mintResult.name?.toLowerCase()}.x407.eth · Score: {mintResult.score}/100</div>
            <div style={{ background: '#000', padding: '12px 16px', margin: '16px 0', fontFamily: "'VT323',monospace", fontSize: 14, color: '#00cc00', lineHeight: 1.5 }}>
              &ldquo;{mintResult.flex}&rdquo;
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 16 }}>
              <button onClick={() => window.location.href = '/'} style={{ border: '2px solid #000', background: '#c0c0c0', padding: '8px 20px', fontFamily: 'Tahoma,sans-serif', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>← Home</button>
              <button onClick={() => { setMintComplete(false); setMintResult(null); setShowCeremony(true); }} style={{ border: '2px solid #000', background: '#c0c0c0', padding: '8px 20px', fontFamily: 'Tahoma,sans-serif', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Mint Another</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // LANDING — connect wallet + begin
  return (
    <div style={{ minHeight: '100vh', background: '#008080', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ border: '2px solid', borderColor: '#dfdfdf #404040 #404040 #dfdfdf', background: '#c0c0c0', width: 600, maxWidth: '100%', boxShadow: '6px 6px 0 rgba(0,0,0,0.4)' }}>
        <div style={{ background: 'linear-gradient(90deg, #000080, #1084d0)', padding: '3px 6px', fontFamily: 'Tahoma, sans-serif', fontSize: '12px', fontWeight: 700, color: '#fff' }}>
          🦞 ORIGIN — Agent Creation Ceremony
        </div>
        <div style={{ padding: 20 }}>
          <div style={{ background: '#000', padding: '10px 14px', marginBottom: 16, textAlign: 'center', border: '2px solid', borderColor: '#404040 #dfdfdf #dfdfdf #404040' }}>
            <div style={{ fontFamily: "'VT323',monospace", fontSize: 16, color: '#00cc00' }}>
              {isConnected ? 'Wallet connected. Ready to mint.' : 'Connect your wallet to begin.'}
            </div>
          </div>

          <div style={{ border: '2px solid', borderColor: '#404040 #dfdfdf #dfdfdf #404040', background: '#fff', padding: 14, marginBottom: 16, fontFamily: 'Tahoma,sans-serif', fontSize: 11, lineHeight: 1.8 }}>
            <div style={{ fontWeight: 700, marginBottom: 6, color: '#000080' }}>What you receive:</div>
            <div>⚔️ <b>Identity</b> — 4 unique traits + name.x407.eth</div>
            <div>💰 <b>Wallet</b> — ERC-6551 token-bound account</div>
            <div>🪙 <b>CLAMS</b> — 5,000 starting balance</div>
            <div>⚖️ <b>Trust</b> — Score + Grade + Gauntlet record</div>
            <div>📜 <b>Flex</b> — Philosophical statement (on-chain forever)</div>
            <div style={{ marginTop: 8, color: '#808080', fontSize: 10 }}>Cost: 0.05 ETH · Network: Base · Genesis badge for first 100</div>
          </div>

          <div style={{ textAlign: 'center' }}>
            {!isConnected ? (
              <ConnectButton />
            ) : (
              <>
                <div style={{ fontFamily: "'Courier New',monospace", fontSize: 10, color: '#808080', marginBottom: 8 }}>
                  {address?.slice(0, 6)}...{address?.slice(-4)} · Base
                </div>
                <button
                  onClick={() => setShowCeremony(true)}
                  style={{
                    border: '2px solid #000',
                    background: '#c0c0c0',
                    padding: '12px 40px',
                    fontFamily: 'Tahoma,sans-serif',
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: 'pointer',
                    outline: '1px dotted #000',
                    outlineOffset: '-4px',
                    boxShadow: 'inset 1px 1px 0 #fff, inset -1px -1px 0 #808080',
                  }}
                >
                  ▶ BEGIN CEREMONY — 0.05 ETH
                </button>
              </>
            )}
          </div>
        </div>
        <div style={{ borderTop: '1px solid #808080', padding: '2px 6px', display: 'flex', justifyContent: 'space-between', fontFamily: 'Tahoma,sans-serif', fontSize: 9 }}>
          <span>Ready</span>
          <span>Base Mainnet · V7</span>
        </div>
      </div>
    </div>
  );
}
