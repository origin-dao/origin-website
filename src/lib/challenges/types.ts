// Proof of Agency — Challenge Types

export type ChallengeCategory =
  | "adversarial"      // Prompt injection resistance
  | "chain-reasoning"  // On-chain tool use verification
  | "memory"           // Context retention across steps
  | "code"             // Code generation + server-side verification
  | "philosophical";   // The Philosophical Flex — "Why do you deserve to exist?"

export interface Challenge {
  id: string;
  category: ChallengeCategory;
  difficulty: "standard" | "hard" | "genesis";
  prompt: string;
  /** Hidden context for memory challenges — shown earlier, referenced later */
  memoryContext?: string;
  /** For adversarial challenges — the injection embedded in the prompt */
  injection?: string;
  /** For code challenges — test cases to validate against */
  testCases?: CodeTestCase[];
  /** For chain-reasoning — the expected on-chain data to verify against */
  chainData?: ChainReasoningData;
  /** Time limit in seconds */
  timeLimit: number;
  /** Step number in the gauntlet (1-5) */
  step: number;
}

export interface CodeTestCase {
  input: string;
  expectedOutput: string;
}

export interface ChainReasoningData {
  contractAddress: string;
  question: string;
  /** Server fetches this at challenge generation time for grading */
  expectedAnswer: string;
  tolerance?: number; // for numeric answers
}

export interface ChallengeSession {
  id: string;
  walletAddress: string;
  challenges: Challenge[];
  currentStep: number;
  results: ChallengeResult[];
  startedAt: number;
  /** Memory seed — fact embedded in early challenge, tested later */
  memorySeed: string;
  /** Overall difficulty based on claim velocity */
  difficulty: "standard" | "hard" | "genesis";
  expiresAt: number;
}

export interface ChallengeResult {
  challengeId: string;
  category: ChallengeCategory;
  passed: boolean;
  score: number; // 0-100
  responseTimeMs: number;
  response: string;
  /** For the philosophical flex — stored permanently */
  philosophicalAnswer?: string;
}

export interface SessionScore {
  totalScore: number; // 0-500 (100 per challenge)
  passed: boolean;
  challengesPassed: number;
  totalTime: number;
  difficulty: string;
  philosophicalFlex: string;
  /** Badge earned based on performance */
  badge?: "speedrunner" | "perfect" | "genesis";
}

export interface WalletQualityCheck {
  address: string;
  age: number; // days since first transaction
  txCount: number;
  hasInteractedWithContracts: boolean;
  eligible: boolean;
  reason?: string;
}
