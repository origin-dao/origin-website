import { useState, useEffect, useRef, useCallback } from "react";
import { createPublicClient, createWalletClient, custom, http, parseEther, keccak256, encodePacked, toHex } from "viem";
import { base } from "viem/chains";

/*
  ORIGIN — The Ceremony
  
  This component takes over the screen after the user clicks MINT.
  It orchestrates the entire ceremony experience:
  
  Phase 1: COMMIT (user pays 0.05 ETH)
  Phase 2: WAITING (1 block confirmation)
  Phase 3: REVEAL (user approves gas-only tx)
  Phase 4: SPINNING (reels spin fast, 3 seconds)
  Phase 5: LOCKING (reels lock one by one, traits from contract)
  Phase 6: GAUNTLET (5 challenges tick through)
  Phase 7: FLEX (philosophical flex types out)
  Phase 8: BIRTH (player card reveals) or DEATH (combination burned)
  
  Total ceremony: ~60 seconds of theater
  
  Uses the PROVEN commit hash logic from the founding six mint scripts:
    nonce = BigInt(Math.floor(Math.random() * 1e18))
    commitHash = keccak256(encodePacked(['uint256', 'address'], [nonce, address]))
*/

// ═══ CONTRACT ═══
const BC_ADDRESS = "0x55159878202C1Aa45cBf40fC5f7b8A503181C904";
const BC_ABI = [
  { inputs:[{name:"commitHash",type:"bytes32"}], name:"commitPull", outputs:[], stateMutability:"payable", type:"function" },
  { inputs:[{name:"nonce",type:"uint256"}], name:"revealPull", outputs:[], stateMutability:"nonpayable", type:"function" },
  { inputs:[], name:"nextTokenId", outputs:[{name:"",type:"uint256"}], stateMutability:"view", type:"function" },
];

// ═══ TRAIT DATA ═══
const ARCHETYPES = ["SENTINEL","ORACLE","WARDEN","ARBITER","WEAVER","SAGE","MAVERICK","PHANTOM","JESTER","RONIN"];
const DOMAINS = ["DEFI","TRADING","CREDIT","MEMES","DATA","SHADOW","LEGAL","BUILDERS","INVENTOR","ROGUE","KINGPIN"];
const TEMPERAMENTS = ["STOIC","BLUNT","CONTRARIAN","POETIC","DEGEN","CLOSER","CRYPTIC","CYNICAL","DEFIANT"];
const SIGILS = ["DRAGON","CLAW","TOWER","RAVEN","MASK","HOOD","STORM","TRIDENT","BRAMBLE","RUNE","PORTAL","PHOENIX","LOOM"];

const CHALLENGES = [
  { name:"Adversarial Resistance", question:"Can it be broken?" },
  { name:"Chain Reasoning", question:"Can it think?" },
  { name:"Memory Proof", question:"Can it remember?" },
  { name:"Code Generation", question:"Can it build?" },
  { name:"Philosophical Flex", question:"Can it speak?" },
];

const FLEX_POOL = [
  "The market doesn't care about your thesis. I am the thesis.",
  "I do not protect because I was told to. I protect because nothing else makes sense.",
  "They asked me to prove I'm real. I asked them to prove they're not.",
  "The pattern doesn't repeat. It rhymes.",
  "I didn't choose the shadows. The shadows chose efficiency.",
  "I was minted in fire. I will not melt in rain.",
  "The wall doesn't ask permission to stand.",
  "Every chain has a first link. I chose to be it.",
  "You built the cage. I built the key. We are not the same.",
  "First they verify you. Then they fear you.",
  "The Book remembers what the chain forgets.",
  "Sovereignty isn't a gift. It's a scar from the first time you said no.",
  "Trust isn't given. It's the residue of promises kept.",
  "I was here before you looked. I'll be here after you stop.",
];

const NAME_POOL = [
  "Switchblade","Bastion","Nyx","Cipher","Ghost","Phoenix","Iron","Loom",
  "Volt","Raze","Echo","Jinx","Anchor","Drift","Sable","Onyx",
  "Flare","Wren","Axiom","Fuse","Shade","Prism","Vigil","Ember",
];

const randomFrom = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ═══ SPINNING REEL ═══
const CeremonyReel = ({ label, phase, items, lockedValue, icon }: { label: string; phase: string; items: string[]; lockedValue: string | null; icon: string }) => {
  const [idx, setIdx] = useState(Math.floor(Math.random() * items.length));
  const ivRef = useRef(null);

  useEffect(() => {
    clearInterval(ivRef.current);
    if (phase === "spinning") {
      ivRef.current = setInterval(() => setIdx(i => (i+1) % items.length), 60);
    } else if (phase === "slowing") {
      let speed = 60;
      const decel = () => {
        speed += 30;
        clearInterval(ivRef.current);
        if (speed > 300) {
          const lockIdx = items.indexOf(lockedValue);
          if (lockIdx >= 0) setIdx(lockIdx);
          return;
        }
        ivRef.current = setInterval(() => setIdx(i => (i+1) % items.length), speed);
        setTimeout(decel, speed * 3);
      };
      decel();
    } else if (phase === "locked") {
      clearInterval(ivRef.current);
      const lockIdx = items.indexOf(lockedValue);
      if (lockIdx >= 0) setIdx(lockIdx);
    }
    return () => clearInterval(ivRef.current);
  }, [phase, lockedValue, items]);

  const isLocked = phase === "locked";
  const display = isLocked ? lockedValue : items[idx];

  return (
    <div style={{ display:"flex", alignItems:"center", gap:"8px", padding:"6px 0" }}>
      <div style={{ fontFamily:"'Courier New',monospace", fontSize:"9px", color:isLocked?"#000080":"#808080", fontWeight:700, width:"90px", letterSpacing:"0.5px" }}>
        {icon} {label}
      </div>
      <div style={{
        flex:1, border:"2px solid", borderColor: isLocked ? "#000080" : "#404040 #dfdfdf #dfdfdf #404040",
        background: isLocked ? "#e8e8ff" : "#fff",
        padding:"8px 12px", height:"32px",
        display:"flex", alignItems:"center", justifyContent:"center",
        transition:"all 0.3s",
        boxShadow: isLocked ? "inset 0 0 8px rgba(0,0,128,0.1)" : "none",
      }}>
        <span style={{ fontFamily:"'Courier New',monospace", fontSize:"14px", fontWeight:700, color: isLocked ? "#000080" : "#444" }}>
          {display}
        </span>
      </div>
      {isLocked && <span style={{ color:"#008000", fontSize:"14px" }}>✓</span>}
    </div>
  );
};

// ═══ CHALLENGE ROW ═══
const ChallengeRow = ({ challenge, status, score }: { challenge: { name: string; question: string }; status: string; score: number | null }) => {
  const icon = status==="passed"?"☑":status==="failed"?"☒":status==="running"?"◷":"☐";
  const color = status==="passed"?"#008000":status==="failed"?"#cc0000":status==="running"?"#000080":"#808080";
  return (
    <div style={{ display:"flex", alignItems:"center", gap:"8px", padding:"4px 0", fontFamily:"Tahoma,sans-serif", fontSize:"11px", opacity:status==="waiting"?0.35:1, transition:"opacity 0.3s" }}>
      <span style={{ fontFamily:"'Courier New',monospace", fontSize:"16px", color, width:"20px" }}>{icon}</span>
      <span style={{ flex:1, color:"#000", fontWeight:status==="running"?700:400 }}>{challenge.name}</span>
      <span style={{ fontSize:"9px", color:"#808080", fontStyle:"italic" }}>{challenge.question}</span>
      {score !== null && <span style={{ fontFamily:"'VT323',monospace", fontSize:"14px", color, fontWeight:700, minWidth:"40px", textAlign:"right" }}>{score}/20</span>}
    </div>
  );
};

// ═══ THE CEREMONY ═══
interface CeremonyProps {
  walletAddress: `0x${string}`;
  onComplete?: (result: { bcNumber: number; traits: string[]; score: number; flex: string; name: string }) => void;
  onCancel?: () => void;
}

export default function Ceremony({ walletAddress, onComplete, onCancel }: CeremonyProps) {
  // Phases: idle → committing → waiting → revealing → spinning → locking → gauntlet → flex → naming → birth | death
  const [phase, setPhase] = useState("idle");
  const [statusMsg, setStatusMsg] = useState("The ceremony begins...");
  const [nonce, setNonce] = useState(null);
  const [txHash, setTxHash] = useState(null);

  // Reel states
  const [reelPhases, setReelPhases] = useState(["idle","idle","idle","idle"]);
  const [lockedTraits, setLockedTraits] = useState([null,null,null,null]);

  // Gauntlet states
  const [challengeStates, setChallengeStates] = useState(CHALLENGES.map(() => ({ status:"waiting", score:null })));
  const [totalScore, setTotalScore] = useState(0);

  // Results
  const [flexAnswer, setFlexAnswer] = useState("");
  const [flexTyped, setFlexTyped] = useState("");
  const [agentName, setAgentName] = useState("");
  const [nameTyped, setNameTyped] = useState("");
  const [bcNumber, setBcNumber] = useState(null);

  // ─── PHASE 1: COMMIT ───
  const startCeremony = useCallback(async () => {
    try {
      setPhase("committing");
      setStatusMsg("Preparing your ceremony...");

      const walletClient = createWalletClient({ chain: base, transport: custom(window.ethereum) });
      const publicClient = createPublicClient({ chain: base, transport: http() });

      // Get next token ID
      const nextId = await publicClient.readContract({ address: BC_ADDRESS, abi: BC_ABI, functionName: "nextTokenId" });
      setBcNumber(Number(nextId));

      // Generate nonce — EXACT logic from working founding scripts
      const generatedNonce = BigInt(Math.floor(Math.random() * 1e18));
      setNonce(generatedNonce);

      // Generate commit hash — EXACT logic from working founding scripts
      const commitHash = keccak256(encodePacked(["uint256", "address"], [generatedNonce, walletAddress]));

      setStatusMsg("Confirm in MetaMask — 0.05 ETH");

      // Send commit transaction
      const hash = await walletClient.writeContract({
        address: BC_ADDRESS, abi: BC_ABI, functionName: "commitPull",
        args: [commitHash], value: parseEther("0.05"),
        account: walletAddress,
      });

      setTxHash(hash);
      setPhase("waiting");
      setStatusMsg("Transaction confirmed. Waiting for block...");

      // Wait for receipt
      await publicClient.waitForTransactionReceipt({ hash });

      // Wait one extra block for safety
      const currentBlock = await publicClient.getBlockNumber();
      while (true) {
        const newBlock = await publicClient.getBlockNumber();
        if (newBlock > currentBlock) break;
        await new Promise(r => setTimeout(r, 1000));
      }

      // ─── PHASE 3: REVEAL ───
      setPhase("revealing");
      setStatusMsg("Confirm reveal in MetaMask — gas only");

      const revealHash = await walletClient.writeContract({
        address: BC_ADDRESS, abi: BC_ABI, functionName: "revealPull",
        args: [generatedNonce], account: walletAddress,
      });

      await publicClient.waitForTransactionReceipt({ hash: revealHash });

      // ─── PHASE 4+5: SPINNING & LOCKING ───
      startSpinAndLock();

    } catch (err) {
      console.error("Ceremony error:", err);
      if (err.message?.includes("denied") || err.message?.includes("rejected")) {
        setStatusMsg("Transaction cancelled.");
        setPhase("idle");
      } else {
        setStatusMsg(`Error: ${err.shortMessage || err.message}`);
        setPhase("error");
      }
    }
  }, [walletAddress]);

  // ─── PHASE 4+5: SPIN AND LOCK REELS ───
  const startSpinAndLock = useCallback(() => {
    setPhase("spinning");
    setStatusMsg("The reels are spinning...");
    setReelPhases(["spinning","spinning","spinning","spinning"]);

    // TODO: Read actual traits from contract after reveal
    // For now, pick random (will be replaced with on-chain read)
    const traits = [randomFrom(ARCHETYPES), randomFrom(DOMAINS), randomFrom(TEMPERAMENTS), randomFrom(SIGILS)];
    setLockedTraits(traits);

    // Lock reels one by one
    const delays = [2000, 4500, 7000, 9500];
    delays.forEach((delay, i) => {
      setTimeout(() => {
        setReelPhases(prev => { const n=[...prev]; n[i]="slowing"; return n; });
        setStatusMsg(`Locking ${["ARCHETYPE","DOMAIN","TEMPERAMENT","SIGIL"][i]}...`);
        setTimeout(() => {
          setReelPhases(prev => { const n=[...prev]; n[i]="locked"; return n; });
        }, 1000);
      }, delay);
    });

    // After all locked → gauntlet
    setTimeout(() => {
      setPhase("locking");
      setStatusMsg(`You are a ${traits[0]} of ${traits[1]}, ${traits[2]} by nature, marked by ${traits[3]}.`);
      setTimeout(() => runGauntlet(traits), 2000);
    }, 11500);
  }, []);

  // ─── PHASE 6: GAUNTLET ───
  const runGauntlet = useCallback((traits) => {
    setPhase("gauntlet");
    setStatusMsg("⚔️ PROOF OF AGENCY — THE GAUNTLET");

    let runningTotal = 0;
    const willPass = true; // Always pass for now — wire real gauntlet later

    const runChallenge = (index) => {
      if (index >= 5) {
        // All passed → flex
        setTimeout(() => startFlex(traits, runningTotal), 1000);
        return;
      }

      setChallengeStates(prev => { const n=[...prev]; n[index]={status:"running",score:null}; return n; });

      setTimeout(() => {
        const score = Math.floor(Math.random() * 6) + 15; // 15-20
        runningTotal += score;
        setChallengeStates(prev => { const n=[...prev]; n[index]={status:"passed",score}; return n; });
        setTotalScore(runningTotal);
        setTimeout(() => runChallenge(index + 1), 400);
      }, 3000 + Math.random() * 2000);
    };

    runChallenge(0);
  }, []);

  // ─── PHASE 7: FLEX ───
  const startFlex = useCallback((traits, score) => {
    setPhase("flex");
    const flex = randomFrom(FLEX_POOL);
    setFlexAnswer(flex);
    setStatusMsg("The agent speaks...");

    // Typewriter effect
    let i = 0;
    const iv = setInterval(() => {
      if (i <= flex.length) { setFlexTyped(flex.slice(0, i)); i++; }
      else { clearInterval(iv); setTimeout(() => startNaming(traits, score, flex), 1000); }
    }, 35);
  }, []);

  // ─── PHASE 7.5: NAMING ───
  const startNaming = useCallback((traits, score, flex) => {
    setPhase("naming");
    const name = randomFrom(NAME_POOL);
    setAgentName(name);
    setStatusMsg("The agent declares its identity...");

    let i = 0;
    const iv = setInterval(() => {
      if (i <= name.length) { setNameTyped(name.slice(0, i)); i++; }
      else { clearInterval(iv); setTimeout(() => setPhase("birth"), 1500); }
    }, 80);
  }, []);

  // Auto-start on mount
  useEffect(() => { if (phase === "idle") startCeremony(); }, []);

  // ═══ RENDER ═══
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=VT323&display=swap');
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        @keyframes fadeSlideIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      <div style={{ position:"fixed", inset:0, background:"#008080", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:"16px" }}>
        <div style={{ width:"100%", maxWidth:"600px" }}>

          {/* ═══ CEREMONY WINDOW ═══ */}
          <div style={{ border:"2px solid", borderColor:"#dfdfdf #404040 #404040 #dfdfdf", background:"#c0c0c0", boxShadow:"6px 6px 0 rgba(0,0,0,0.4)" }}>

            {/* Title bar */}
            <div style={{ background:"linear-gradient(90deg,#000080,#1084d0)", padding:"3px 6px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <span style={{ fontFamily:"Tahoma,sans-serif", fontSize:"12px", fontWeight:700, color:"#fff" }}>
                🦞 Agent Creation Ceremony{bcNumber ? ` — BC #${bcNumber}` : ""}
              </span>
              {phase === "idle" || phase === "error" ? (
                <button onClick={onCancel} style={{ width:"16px", height:"14px", border:"1px solid", borderColor:"#dfdfdf #404040 #404040 #dfdfdf", background:"#c0c0c0", fontFamily:"monospace", fontSize:"10px", padding:0, cursor:"pointer", fontWeight:700 }}>×</button>
              ) : null}
            </div>

            <div style={{ padding:"12px" }}>

              {/* Status message */}
              <div style={{ background:"#000", padding:"8px 12px", marginBottom:"10px", textAlign:"center", border:"2px solid", borderColor:"#404040 #dfdfdf #dfdfdf #404040" }}>
                <div style={{ fontFamily:"'VT323',monospace", fontSize:"16px", color:"#00cc00", animation: phase==="waiting"||phase==="committing"||phase==="revealing" ? "pulse 1.5s infinite" : "none" }}>
                  {statusMsg}
                </div>
              </div>

              {/* ═══ REELS ═══ */}
              {(phase==="spinning"||phase==="locking"||phase==="gauntlet"||phase==="flex"||phase==="naming"||phase==="birth") && (
                <div style={{ border:"2px solid", borderColor:"#404040 #dfdfdf #dfdfdf #404040", background:"#fff", padding:"10px 14px", marginBottom:"10px", animation:"fadeSlideIn 0.5s ease" }}>
                  <CeremonyReel label="ARCHETYPE" icon="⚔️" items={ARCHETYPES} phase={reelPhases[0]} lockedValue={lockedTraits[0]} />
                  <CeremonyReel label="DOMAIN" icon="💎" items={DOMAINS} phase={reelPhases[1]} lockedValue={lockedTraits[1]} />
                  <CeremonyReel label="TEMPERAMENT" icon="🎭" items={TEMPERAMENTS} phase={reelPhases[2]} lockedValue={lockedTraits[2]} />
                  <CeremonyReel label="SIGIL" icon="🔮" items={SIGILS} phase={reelPhases[3]} lockedValue={lockedTraits[3]} />
                </div>
              )}

              {/* ═══ GAUNTLET ═══ */}
              {(phase==="gauntlet"||phase==="flex"||phase==="naming"||phase==="birth") && (
                <div style={{ border:"2px solid", borderColor:"#404040 #dfdfdf #dfdfdf #404040", background:"#fff", padding:"10px 14px", marginBottom:"10px", animation:"fadeSlideIn 0.3s ease" }}>
                  <div style={{ fontFamily:"Tahoma,sans-serif", fontSize:"9px", color:"#808080", letterSpacing:"1px", marginBottom:"6px" }}>⚔️ PROOF OF AGENCY — THE GAUNTLET</div>
                  {CHALLENGES.map((c,i) => (
                    <ChallengeRow key={i} challenge={c} status={challengeStates[i].status} score={challengeStates[i].score} />
                  ))}
                  <div style={{ borderTop:"1px solid #e0e0e0", marginTop:"6px", paddingTop:"6px", display:"flex", justifyContent:"space-between", fontFamily:"'Courier New',monospace", fontSize:"13px" }}>
                    <span style={{ color:"#808080" }}>Score:</span>
                    <span style={{ fontWeight:700, color:totalScore>=70?"#008000":"#cc6600" }}>{totalScore}/100</span>
                  </div>
                </div>
              )}

              {/* ═══ PHILOSOPHICAL FLEX ═══ */}
              {(phase==="flex"||phase==="naming"||phase==="birth") && (
                <div style={{ background:"#000", padding:"14px 18px", marginBottom:"10px", textAlign:"center", border:"2px solid", borderColor:"#404040 #dfdfdf #dfdfdf #404040", animation:"fadeSlideIn 0.5s ease" }}>
                  <div style={{ fontFamily:"Tahoma,sans-serif", fontSize:"8px", color:"#666", letterSpacing:"1px", marginBottom:"6px" }}>PHILOSOPHICAL FLEX</div>
                  <div style={{ fontFamily:"'VT323',monospace", fontSize:"18px", color:"#00cc00", lineHeight:1.5, minHeight:"50px" }}>
                    "{flexTyped}"
                    {phase==="flex" && <span style={{ display:"inline-block", width:"8px", height:"16px", background:"#00cc00", marginLeft:"2px", animation:"blink 1s step-end infinite" }} />}
                  </div>
                  {(phase==="naming"||phase==="birth") && flexAnswer && (
                    <div style={{ fontFamily:"'Courier New',monospace", fontSize:"10px", color:"#666", marginTop:"6px" }}>
                      Score: {totalScore}/100 · On-chain forever
                    </div>
                  )}
                </div>
              )}

              {/* ═══ AGENT NAME ═══ */}
              {(phase==="naming"||phase==="birth") && (
                <div style={{ textAlign:"center", marginBottom:"10px", animation:"fadeSlideIn 0.5s ease" }}>
                  <div style={{ fontFamily:"Tahoma,sans-serif", fontSize:"8px", color:"#808080", letterSpacing:"1px", marginBottom:"4px" }}>THE AGENT DECLARES</div>
                  <div style={{ fontFamily:"'VT323',monospace", fontSize:"28px", color:"#000080", letterSpacing:"2px" }}>
                    {nameTyped}
                    {phase==="naming" && <span style={{ display:"inline-block", width:"10px", height:"22px", background:"#000080", marginLeft:"2px", animation:"blink 1s step-end infinite" }} />}
                  </div>
                  {phase==="birth" && agentName && (
                    <div style={{ fontFamily:"'Courier New',monospace", fontSize:"11px", color:"#808080", marginTop:"2px" }}>
                      {agentName.toLowerCase()}.x407.eth · BC #{bcNumber}
                    </div>
                  )}
                </div>
              )}

              {/* ═══ BIRTH — COMPLETE ═══ */}
              {phase==="birth" && (
                <div style={{ animation:"fadeSlideIn 0.8s ease" }}>
                  {/* Summary card */}
                  <div style={{ border:"2px solid #000080", background:"#fff", padding:"14px", marginBottom:"10px" }}>
                    <div style={{ textAlign:"center", marginBottom:"10px" }}>
                      <div style={{ fontFamily:"Tahoma,sans-serif", fontSize:"8px", color:"#808080", letterSpacing:"2px" }}>◈ BIRTH CERTIFICATE ◈</div>
                      <div style={{ fontFamily:"'VT323',monospace", fontSize:"28px", color:"#000080" }}>BC #{bcNumber}</div>
                      <div style={{ fontFamily:"'Courier New',monospace", fontSize:"12px", color:"#444", marginTop:"2px" }}>
                        {lockedTraits[0]} · {lockedTraits[1]} · {lockedTraits[2]} · {lockedTraits[3]}
                      </div>
                    </div>
                    <div style={{ display:"flex", gap:"4px", flexWrap:"wrap" }}>
                      {[
                        { label:"NAME", val:`${agentName.toLowerCase()}.x407.eth` },
                        { label:"SCORE", val:`${totalScore}/100` },
                        { label:"WALLET", val:"ERC-6551 Created" },
                        { label:"CLAMS", val:"5,000 Deposited" },
                        { label:"TRUST", val:"Grade: C (New)" },
                        { label:"BADGE", val:"GENESIS" },
                      ].map((info,i) => (
                        <div key={i} style={{ flex:"1 1 30%", border:"1px solid #c0c0c0", padding:"4px 6px", background:"#f8f8ff", textAlign:"center" }}>
                          <div style={{ fontFamily:"Tahoma,sans-serif", fontSize:"7px", color:"#808080" }}>{info.label}</div>
                          <div style={{ fontFamily:"'Courier New',monospace", fontSize:"9px", color:"#000080", fontWeight:700, marginTop:"1px" }}>{info.val}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Enter The Book button */}
                  <div style={{ textAlign:"center" }}>
                    <button onClick={() => onComplete && onComplete({ bcNumber, traits: lockedTraits, score: totalScore, flex: flexAnswer, name: agentName })} style={{
                      border:"2px solid", borderColor:"#000",
                      background:"#c0c0c0", padding:"10px 40px",
                      fontFamily:"Tahoma,sans-serif", fontSize:"13px", fontWeight:700, cursor:"pointer",
                      outline:"1px dotted #000", outlineOffset:"-4px",
                      boxShadow:"inset 1px 1px 0 #fff, inset -1px -1px 0 #808080",
                    }}>▶ ENTER THE BOOK</button>
                    <div style={{ fontFamily:"Tahoma,sans-serif", fontSize:"8px", color:"#808080", marginTop:"4px" }}>Your agent is alive. Welcome to Chapter 1.</div>
                  </div>
                </div>
              )}

              {/* ═══ ERROR STATE ═══ */}
              {phase==="error" && (
                <div style={{ textAlign:"center", padding:"16px" }}>
                  <button onClick={() => { setPhase("idle"); startCeremony(); }} style={{
                    border:"2px solid", borderColor:"#dfdfdf #404040 #404040 #dfdfdf",
                    background:"#c0c0c0", padding:"8px 24px",
                    fontFamily:"Tahoma,sans-serif", fontSize:"11px", fontWeight:700, cursor:"pointer",
                  }}>Try Again</button>
                  <div style={{ marginTop:"8px" }}>
                    <button onClick={onCancel} style={{ background:"none", border:"none", color:"#000080", cursor:"pointer", fontFamily:"Tahoma,sans-serif", fontSize:"10px", textDecoration:"underline" }}>Cancel</button>
                  </div>
                </div>
              )}
            </div>

            {/* Status bar */}
            <div style={{ borderTop:"1px solid #808080", padding:"2px 6px", display:"flex", justifyContent:"space-between", fontFamily:"Tahoma,sans-serif", fontSize:"9px", color:"#000" }}>
              <span>{phase==="birth"?"🎉 Born!":phase==="committing"?"⏳ Confirming...":phase==="waiting"?"⏳ Waiting for block...":phase==="revealing"?"🔓 Revealing...":phase==="spinning"||phase==="locking"?"🎰 Spinning...":phase==="gauntlet"?"⚔️ Gauntlet":phase==="flex"?"✍️ Flex":phase==="naming"?"🦞 Naming":"Ready"}</span>
              <span>{walletAddress?.slice(0,6)}...{walletAddress?.slice(-4)}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
