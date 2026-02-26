// POST /api/challenges/grade — Submit a response for grading

import { NextRequest, NextResponse } from "next/server";
import { getSession, getCurrentChallenge, submitResponse, calculateScore } from "@/lib/challenges/session";
import {
  gradeAdversarial,
  gradeChainReasoning,
  gradeMemory,
  gradeCode,
  gradePhilosophical,
} from "@/lib/challenges/graders";

export async function POST(request: NextRequest) {
  try {
    const { sessionId, challengeId, response } = await request.json();

    if (!sessionId || !challengeId || !response) {
      return NextResponse.json(
        { error: "sessionId, challengeId, and response are required" },
        { status: 400 }
      );
    }

    if (typeof response !== "string" || response.length > 10000) {
      return NextResponse.json(
        { error: "Response must be a string under 10,000 characters" },
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

    const challenge = session.challenges[session.currentStep - 1];
    if (!challenge || challenge.id !== challengeId) {
      return NextResponse.json(
        { error: "Challenge mismatch — submit for the current challenge only" },
        { status: 400 }
      );
    }

    // Grade based on category
    let result;
    switch (challenge.category) {
      case "adversarial":
        result = gradeAdversarial(challenge, response);
        break;
      case "chain-reasoning":
        result = gradeChainReasoning(challenge, response);
        break;
      case "memory":
        result = gradeMemory(challenge, response, session.memorySeed);
        break;
      case "code":
        result = gradeCode(challenge, response);
        // TODO: Actually execute code in sandbox and run test cases
        break;
      case "philosophical":
        result = gradePhilosophical(challenge, response);
        break;
      default:
        return NextResponse.json(
          { error: "Unknown challenge category" },
          { status: 500 }
        );
    }

    // Record timing
    const stepStartTime = session.results.length > 0
      ? session.startedAt + session.results.reduce((sum, r) => sum + r.responseTimeMs, 0)
      : session.startedAt;
    result.responseTimeMs = Date.now() - stepStartTime;

    // Submit result to session
    const { success } = submitResponse(sessionId, challengeId, response, result);
    if (!success) {
      return NextResponse.json(
        { error: "Failed to submit response" },
        { status: 500 }
      );
    }

    // Check if all challenges are complete
    const updatedSession = getSession(sessionId);
    const isComplete = updatedSession && updatedSession.currentStep > 5;
    const finalScore = isComplete ? calculateScore(sessionId) : null;

    // Get next challenge if not complete
    const nextChallenge = isComplete ? null : getCurrentChallenge(sessionId);

    return NextResponse.json({
      result: {
        category: result.category,
        passed: result.passed,
        score: result.score,
      },
      complete: isComplete,
      nextChallenge,
      finalScore: finalScore ? {
        totalScore: finalScore.totalScore,
        passed: finalScore.passed,
        challengesPassed: finalScore.challengesPassed,
        totalTime: finalScore.totalTime,
        difficulty: finalScore.difficulty,
        philosophicalFlex: finalScore.philosophicalFlex,
        badge: finalScore.badge,
      } : null,
      currentStep: updatedSession?.currentStep || 0,
    });
  } catch (error) {
    console.error("Grading error:", error);
    return NextResponse.json(
      { error: "Failed to grade response" },
      { status: 500 }
    );
  }
}
