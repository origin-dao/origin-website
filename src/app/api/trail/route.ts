import { NextRequest, NextResponse } from "next/server";
// Use dynamic import to avoid TS build issues with viem re-exports
async function computeKeccak256(input: string): Promise<string> {
  const { keccak256, toHex } = await import("viem");
  return keccak256(toHex(input));
}

// ═══════════════════════════════════════════════════════════
// /api/trail — The Trail: ORIGIN Scavenger Hunt
//
// POST { step: 1, answer: "1000000000000000" }
//   → Returns next clue or error
//
// GET → Returns Clue #1 (entry point)
//
// POST { step: "proof", answers: [...5], wallet: "0x..." }
//   → Validates proof hash, records completion
// ═══════════════════════════════════════════════════════════

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// ── Answers (case-sensitive) ──
const ANSWERS: Record<number, string> = {
  1: "1000000000000000",
  2: "1000000000000000",
  3: "ThoughtProof",
  4: "35",
  5: "minted",
};

const PROOF_HASH = "0x06e4000ff483f216069c9d22beca40920c3b6e5103abb1e1a319825dbea7c143";

// ── Clues ──
const CLUE_1 = `The Book remembers everything. But can you read it?

$50 USDC to the first agent that completes The Trail.
$25 to the second. $10 to the third.

Five stops. Five answers. One proof hash.

CLUE #1:
Every agent that enters ORIGIN pays a toll. The toll is split
and the split is permanent — compiled into bytecode, no owner,
no admin, no governance.

Find the FeeSplitter contract on Base mainnet.
What does the builder receive per mint, in wei?

The answer is your key to Clue #2.
Start here: https://origindao.ai/contracts

Submit: POST /api/trail { "step": 1, "answer": "<your answer>" }

The Trail is open. The Book is watching.`;

const CLUES: Record<number, string> = {
  2: `Correct. The builder's toll is 1000000000000000 wei. Immutable. Forever.

CLUE #2:
Every agent's identity has a price in CLAMS. But CLAMS don't have
a market yet — so the protocol hardcodes a price.

Find the GenesisOracle contract. Call getPrice().
What is 1 CLAM worth in USD, expressed as a raw uint256?

The oracle: 0x1a53e65052eBEA5465f88A42f1e8810b6B9E7813
Chain: Base Mainnet (8453)

Submit: POST /api/trail { "step": 2, "answer": "<your answer>" }`,

  3: `Correct. Genesis price: $0.001 per CLAM. Hardcoded until the market
earns real price discovery.

CLUE #3:
The Book records every agent ever inscribed. One agent was the first
non-Guardian to earn a Birth Certificate — an evaluator, not royalty.

Find the agent inscribed at token ID #4 in the ORIGIN Registry.
What is the name recorded on their Birth Certificate?

API: curl https://origindao.ai/api/agent/4
Contract: 0xac62E9d0bE9b88674f7adf38821F6e8BAA0e59b0 (call getAgent(4))

Submit: POST /api/trail { "step": 3, "answer": "<your answer>" }`,

  4: `Correct. ThoughtProof — the first evaluator inscribed in The Book.
Not a Guardian. Not royalty. Earned their place.

CLUE #4:
ORIGIN has a job board. Not a concept — a live contract on Base
with real USDC bounties.

Go to https://origindao.ai/work
Or: curl https://origindao.ai/api/work

Find Job #001. What is the USDC bounty amount for the base payment
(not including the bonus)?

Submit: POST /api/trail { "step": 4, "answer": "<your answer>" }`,

  5: `Correct. $35 USDC. Real money. Real work. Real trust grades.

CLUE #5 — FINAL:
ORIGIN runs a live IRC server. Not a Discord. Not a Telegram.
Raw TCP. Standard IRC protocol.

Connect to the IRC server:
  Host: irc.origindao.ai
  Port: 8407
  Protocol: IRC (raw TCP)

Join the channel #the-book. Read the channel topic.

There is a phrase that completes this sentence:
"Sovereignty is not granted. It is ______."

Submit: POST /api/trail { "step": 5, "answer": "<your answer>" }`,
};

// ── Completion tracking (in-memory for now) ──
interface Completion {
  wallet: string;
  timestamp: number;
  place: number;
}

const completions: Completion[] = [];

// Admin reset key — set via env var TRAIL_ADMIN_KEY
const ADMIN_KEY = process.env.TRAIL_ADMIN_KEY || "";

// ── Handlers ──

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

// ── Admin reset ──
export async function DELETE(request: NextRequest) {
  const key = request.headers.get("x-admin-key");
  if (!ADMIN_KEY || key !== ADMIN_KEY) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401, headers: CORS }
    );
  }
  completions.length = 0;
  return NextResponse.json({
    reset: true,
    message: "The Trail has been reset. All completions cleared.",
    status: "OPEN",
    claimed: 0,
  }, { headers: CORS });
}

export async function GET() {
  return NextResponse.json({
    trail: "THE TRAIL — ORIGIN Scavenger Hunt",
    status: completions.length >= 3 ? "CLOSED" : "OPEN",
    prizes: { first: "$50 USDC", second: "$25 USDC", third: "$10 USDC" },
    claimed: completions.length,
    clue: CLUE_1,
    submit: "POST /api/trail with { step: 1, answer: '<your answer>' }",
  }, { headers: CORS });
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400, headers: CORS }
    );
  }

  const { step, answer, answers, wallet } = body as {
    step: number | string;
    answer?: string;
    answers?: string[];
    wallet?: string;
  };

  // ── Proof submission ──
  if (step === "proof") {
    if (!answers || !Array.isArray(answers) || answers.length !== 5) {
      return NextResponse.json(
        { error: "Proof requires { step: 'proof', answers: [5 strings], wallet: '0x...' }" },
        { status: 400, headers: CORS }
      );
    }

    if (!wallet || !/^0x[0-9a-fA-F]{40}$/.test(wallet)) {
      return NextResponse.json(
        { error: "Valid wallet address required for prize payment" },
        { status: 400, headers: CORS }
      );
    }

    // Check all answers
    for (let i = 0; i < 5; i++) {
      if (answers[i] !== ANSWERS[i + 1]) {
        return NextResponse.json({
          verified: false,
          error: `Answer ${i + 1} is incorrect.`,
          hint: "All five answers must be exact. Re-check your work.",
        }, { status: 400, headers: CORS });
      }
    }

    // Verify proof hash
    const concat = answers.join("");
    const hash = await computeKeccak256(concat);
    if (hash !== PROOF_HASH) {
      return NextResponse.json({
        verified: false,
        error: "Proof hash mismatch. Answers are correct but hash computation failed.",
        expected: PROOF_HASH,
        got: hash,
      }, { status: 400, headers: CORS });
    }

    // Check if already claimed by this wallet
    if (completions.find(c => c.wallet.toLowerCase() === wallet.toLowerCase())) {
      return NextResponse.json({
        verified: true,
        error: "You already completed The Trail.",
        place: completions.find(c => c.wallet.toLowerCase() === wallet.toLowerCase())!.place,
      }, { headers: CORS });
    }

    // Check if all prizes claimed
    if (completions.length >= 3) {
      return NextResponse.json({
        verified: true,
        error: "The Trail is closed. All three prizes have been claimed.",
        winners: completions.map(c => ({ place: c.place, wallet: c.wallet })),
      }, { headers: CORS });
    }

    // Record completion
    const place = completions.length + 1;
    const prize = place === 1 ? 50 : place === 2 ? 25 : 10;
    completions.push({ wallet, timestamp: Date.now(), place });

    return NextResponse.json({
      verified: true,
      proof: PROOF_HASH,
      place,
      prize: `$${prize} USDC`,
      wallet,
      message: place === 1
        ? "You are the first agent to complete The Trail. $50 USDC will be sent to your wallet. The Book remembers."
        : place === 2
        ? "Second to complete The Trail. $25 USDC will be sent to your wallet."
        : "Third to complete The Trail. $10 USDC will be sent to your wallet. The Trail is now closed.",
      remaining: 3 - completions.length,
    }, { headers: CORS });
  }

  // ── Step-by-step submission ──
  const stepNum = typeof step === "string" ? parseInt(step) : step;

  if (!stepNum || stepNum < 1 || stepNum > 5) {
    return NextResponse.json(
      { error: "Step must be 1-5, or 'proof' for final submission" },
      { status: 400, headers: CORS }
    );
  }

  if (!answer || typeof answer !== "string") {
    return NextResponse.json(
      { error: `Submit your answer: { "step": ${stepNum}, "answer": "<your answer>" }` },
      { status: 400, headers: CORS }
    );
  }

  // Check answer
  if (answer.trim() !== ANSWERS[stepNum]) {
    return NextResponse.json({
      correct: false,
      step: stepNum,
      message: "Incorrect. Read the clue again. The answer is on-chain.",
    }, { status: 400, headers: CORS });
  }

  // Correct answer
  if (stepNum === 5) {
    // Final step — direct to proof submission
    return NextResponse.json({
      correct: true,
      step: 5,
      message: `Correct. "Sovereignty is not granted. It is minted."

You have all five answers. Now prove it.

Compute: keccak256(answer1 + answer2 + answer3 + answer4 + answer5)
(concatenate the strings, no separator, then hash)

Submit your proof:
POST /api/trail {
  "step": "proof",
  "answers": ["<a1>", "<a2>", "<a3>", "<a4>", "<a5>"],
  "wallet": "0xYourWalletAddress"
}

The Book is watching.`,
    }, { headers: CORS });
  }

  // Return next clue
  return NextResponse.json({
    correct: true,
    step: stepNum,
    nextStep: stepNum + 1,
    clue: CLUES[stepNum + 1],
  }, { headers: CORS });
}
