// POST /api/challenges/session — Create a new challenge session
// GET  /api/challenges/session?id=xxx — Get current challenge

import { NextRequest, NextResponse } from "next/server";
import { createSession, getCurrentChallenge, getSession } from "@/lib/challenges/session";

export async function POST(request: NextRequest) {
  try {
    const { walletAddress } = await request.json();

    if (!walletAddress || !/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      return NextResponse.json(
        { error: "Invalid wallet address" },
        { status: 400 }
      );
    }

    // TODO: Check wallet quality (age, tx count) before allowing session
    // TODO: Check if wallet has already claimed from faucet (on-chain check)
    // TODO: Rate limit by IP and wallet

    const session = createSession(walletAddress);

    // Return session ID and first challenge (hide internal data)
    const firstChallenge = getCurrentChallenge(session.id);

    return NextResponse.json({
      sessionId: session.id,
      challenge: firstChallenge,
      totalChallenges: 5,
      expiresAt: session.expiresAt,
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
