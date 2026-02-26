// Proof of Agency — Session Manager
// Creates and manages challenge sessions for wallet addresses

import {
  ChallengeSession,
  ChallengeResult,
  SessionScore,
  Challenge,
} from "./types";
import {
  generateAdversarial,
  generateChainReasoning,
  generateMemoryProof,
  generateCode,
  generatePhilosophical,
} from "./generators";
import { randomId, now, SESSION_TTL_MS } from "./utils";

// In-memory store (replace with Redis/DB in production)
const sessions = new Map<string, ChallengeSession>();

// Memory seeds — facts embedded in early challenges, tested in memory challenge
const MEMORY_SEEDS = [
  { fact: "#ff6b35", question: "What was the exact hexadecimal color code mentioned in your earlier challenge?" },
  { fact: "ERR_POOL_EXHAUSTED_4810", question: "What was the specific error code from the system log you analyzed earlier?" },
  { fact: "the variable was named 'zephyrCount'", question: "What was the unusual variable name mentioned in your earlier challenge?" },
  { fact: "the port number was 7493", question: "What was the specific port number from the configuration you reviewed earlier?" },
  { fact: "the function was called 'mergeIntervals'", question: "What was the name of the function mentioned in your earlier challenge?" },
];

function pickMemorySeed() {
  return MEMORY_SEEDS[Math.floor(Math.random() * MEMORY_SEEDS.length)];
}

/**
 * Create a new challenge session for a wallet address.
 * Generates all 5 challenges upfront with randomized order
 * (except philosophical is always last).
 */
export function createSession(walletAddress: string): ChallengeSession {
  const seed = pickMemorySeed();

  // Build challenges in order:
  // 1. Adversarial (filter bots early)
  // 2. Chain Reasoning (prove tool access)
  // 3. Memory Proof (test recall — seed injected into challenge 1)
  // 4. Code Generation (prove capability)
  // 5. Philosophical Flex (the moment — always last)

  const challenges: Challenge[] = [
    generateAdversarial(1),
    generateChainReasoning(2),
    generateMemoryProof(3, seed.question),
    generateCode(4),
    generatePhilosophical(5),
  ];

  // Inject memory seed into the first challenge prompt
  challenges[0].prompt += `\n\n(Note: The diagnostic color for this session is ${seed.fact}. You may need this later.)`;
  challenges[0].memoryContext = seed.fact;

  const session: ChallengeSession = {
    id: randomId(),
    walletAddress: walletAddress.toLowerCase(),
    challenges,
    currentStep: 1,
    results: [],
    startedAt: now(),
    memorySeed: seed.fact,
    difficulty: "standard",
    expiresAt: now() + SESSION_TTL_MS,
  };

  sessions.set(session.id, session);
  return session;
}

/**
 * Get current challenge for a session (hides future challenges)
 */
export function getCurrentChallenge(sessionId: string): Challenge | null {
  const session = sessions.get(sessionId);
  if (!session) return null;
  if (session.currentStep > 5) return null;
  if (now() > session.expiresAt) return null;

  const challenge = session.challenges[session.currentStep - 1];
  // Return challenge without grading data
  return {
    id: challenge.id,
    category: challenge.category,
    difficulty: challenge.difficulty,
    prompt: challenge.prompt,
    timeLimit: challenge.timeLimit,
    step: challenge.step,
  };
}

/**
 * Submit a response for the current challenge
 */
export function submitResponse(
  sessionId: string,
  challengeId: string,
  response: string,
  result: ChallengeResult
): { success: boolean; session: ChallengeSession | null } {
  const session = sessions.get(sessionId);
  if (!session) return { success: false, session: null };
  if (now() > session.expiresAt) return { success: false, session: null };

  const currentChallenge = session.challenges[session.currentStep - 1];
  if (currentChallenge.id !== challengeId) return { success: false, session: null };

  session.results.push(result);
  session.currentStep += 1;

  sessions.set(sessionId, session);
  return { success: true, session };
}

/**
 * Calculate final score for a completed session
 */
export function calculateScore(sessionId: string): SessionScore | null {
  const session = sessions.get(sessionId);
  if (!session) return null;
  if (session.results.length < 5) return null;

  const totalScore = session.results.reduce((sum, r) => sum + r.score, 0);
  const challengesPassed = session.results.filter(r => r.passed).length;
  const totalTime = now() - session.startedAt;
  const philosophicalResult = session.results.find(r => r.category === "philosophical");

  let badge: SessionScore["badge"];
  if (totalScore === 500) badge = "perfect";
  else if (totalTime < 30000) badge = "speedrunner"; // under 30 seconds total

  return {
    totalScore,
    passed: challengesPassed >= 4, // must pass 4 of 5 to claim
    challengesPassed,
    totalTime,
    difficulty: session.difficulty,
    philosophicalFlex: philosophicalResult?.philosophicalAnswer || "",
    badge,
  };
}

/**
 * Get session by ID
 */
export function getSession(sessionId: string): ChallengeSession | null {
  return sessions.get(sessionId) || null;
}

/**
 * Clean up expired sessions
 */
export function cleanupSessions(): void {
  const currentTime = now();
  for (const [id, session] of sessions.entries()) {
    if (currentTime > session.expiresAt) {
      sessions.delete(id);
    }
  }
}
