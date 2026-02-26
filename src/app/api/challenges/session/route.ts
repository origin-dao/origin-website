// POST /api/challenges/session — Create a new challenge session
// GET  /api/challenges/session?id=xxx — Get current challenge

import { NextRequest, NextResponse } from "next/server";
import { createSession, getCurrentChallenge, getSession } from "@/lib/challenges/session";
import { checkWalletQuality, checkRateLimit } from "@/lib/challenges/wallet-check";
import { hasClaimed } from "@/lib/challenges/onchain";

export async function POST(request: NextRequest) {
  try {
    const { walletAddress } = await request.json();

    if (!walletAddress || !/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      return NextResponse.json(
        { error: "Invalid wallet address" },
        { status: 400 }
      );
    }

    const addr = walletAddress.toLowerCase();

    // Rate limit by wallet address
    const walletLimit = checkRateLimit(`wallet:${addr}`);
    if (!walletLimit.allowed) {
      const resetMinutes = Math.ceil(walletLimit.resetIn / 60000);
      return NextResponse.json(
        {
          error: `Rate limited. Too many attempts. Try again in ${resetMinutes} minute(s).`,
          resetIn: walletLimit.resetIn,
        },
        { status: 429 }
      );
    }

    // Rate limit by IP
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
               request.headers.get("x-real-ip") ||
               "unknown";
    const ipLimit = checkRateLimit(`ip:${ip}`);
    if (!ipLimit.allowed) {
      const resetMinutes = Math.ceil(ipLimit.resetIn / 60000);
      return NextResponse.json(
        {
          error: `Rate limited. Too many attempts from this network. Try again in ${resetMinutes} minute(s).`,
          resetIn: ipLimit.resetIn,
        },
        { status: 429 }
      );
    }

    // Check wallet quality
    const walletCheck = await checkWalletQuality(addr);
    if (!walletCheck.eligible) {
      return NextResponse.json(
        {
          error: walletCheck.reason || "Wallet does not meet eligibility requirements.",
          walletCheck: {
            age: walletCheck.age,
            txCount: walletCheck.txCount,
            hasInteractedWithContracts: walletCheck.hasInteractedWithContracts,
          },
        },
        { status: 403 }
      );
    }

    // Check if wallet has already claimed from faucet
    const alreadyClaimed = await hasClaimed(addr);
    if (alreadyClaimed) {
      return NextResponse.json(
        { error: "This wallet has already claimed from the faucet. Each wallet can only claim once." },
        { status: 403 }
      );
    }

    // Create session
    const session = createSession(addr);
    const firstChallenge = getCurrentChallenge(session.id);

    return NextResponse.json({
      sessionId: session.id,
      challenge: firstChallenge,
      totalChallenges: 5,
      expiresAt: session.expiresAt,
      walletCheck: {
        age: walletCheck.age,
        txCount: walletCheck.txCount,
        hasInteractedWithContracts: walletCheck.hasInteractedWithContracts,
      },
      rateLimit: {
        remaining: Math.min(walletLimit.remaining, ipLimit.remaining),
      },
    });
  } catch (error) {
    console.error("Session creation error:", error);
    return NextResponse.json(
      { error: "Failed to create session" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get("id");

  if (!sessionId) {
    return NextResponse.json(
      { error: "Session ID required" },
      { status: 400 }
    );
  }

  const session = getSession(sessionId);
  if (!session) {
    return NextResponse.json(
      { error: "Session not found or expired" },
      { status: 404 }
    );
  }

  const challenge = getCurrentChallenge(sessionId);

  return NextResponse.json({
    sessionId: session.id,
    currentStep: session.currentStep,
    totalChallenges: 5,
    challenge,
    results: session.results.map(r => ({
      category: r.category,
      passed: r.passed,
      score: r.score,
    })),
    completed: session.currentStep > 5,
    expiresAt: session.expiresAt,
  });
}
