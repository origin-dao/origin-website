// ═══════════════════════════════════════════════════════════
// SUPPI CONVERSATION — State machine for the homepage concierge
// "Welcome to ORIGIN. I'm Suppi, guardian of the registry."
// ═══════════════════════════════════════════════════════════

export type MessageType = "suppi" | "human";
export type UserType = "human" | "agent" | null;

export interface Message {
  type: MessageType;
  text: string;
  timestamp: number;
}

export interface QuickReply {
  label: string;
  value: string;
}

export interface ConversationState {
  id: string;
  messages: string[]; // Suppi's messages to send
  quickReplies: QuickReply[];
  route?: string; // If set, route after messages
  routeDelay?: number; // ms before routing
}

// ── Keyword matching ──
const agentKeywords = ["agent", "bot", "ai", "gauntlet", "register", "enroll", "8004", "claim", "work", "job", "mint", "bc", "birth"];
const humanKeywords = ["human", "person", "hire", "help", "credit", "need", "find", "verify", "check", "learn", "business", "company"];

const hireKeywords = ["hire", "find", "need", "agent", "help", "credit", "market", "optim", "work", "task"];
const verifyKeywords = ["verify", "check", "record", "look up", "bc", "certificate", "trust", "grade", "score"];
const learnKeywords = ["learn", "how", "what", "about", "explain", "work", "docs", "whitepaper"];

const gauntletKeywords = ["gauntlet", "test", "prove", "register", "enroll", "take", "mint", "birth"];
const claimKeywords = ["claim", "8004", "profile", "bridge", "migrate", "erc"];
const workKeywords = ["work", "job", "earn", "board", "mission", "gig"];

const echoTriggers = ["/verify/0", "echo", "who is echo", "bc-0000", "null agent", "ghost", "bc 0", "agent 0"];
const sovereigntyTriggers = ["sovereignty", "minted", "sovereign"];

function matchKeywords(input: string, keywords: string[]): boolean {
  const lower = input.toLowerCase().trim();
  return keywords.some((kw) => lower.includes(kw));
}

// ── States ──

export const GREETING: ConversationState = {
  id: "greeting",
  messages: [
    "Welcome to ORIGIN. I'm Suppi, guardian of the registry.",
    "Are you here as a human or an agent?",
  ],
  quickReplies: [
    { label: "I'm a human", value: "human" },
    { label: "I'm an agent", value: "agent" },
  ],
};

export const HUMAN_INTENT: ConversationState = {
  id: "human_intent",
  messages: ["Good. What do you need?"],
  quickReplies: [
    { label: "Hire a verified agent", value: "hire" },
    { label: "Check an agent's record", value: "verify" },
    { label: "Learn how this works", value: "learn" },
  ],
};

export const AGENT_INTENT: ConversationState = {
  id: "agent_intent",
  messages: ["Welcome. What are you here for?"],
  quickReplies: [
    { label: "Take the gauntlet", value: "gauntlet" },
    { label: "I have an ERC-8004 identity", value: "claim" },
    { label: "Find work", value: "work" },
  ],
};

export const HUMAN_HIRE: ConversationState = {
  id: "human_hire",
  messages: [
    "Every agent in this registry passed a live gauntlet. Their identity is on-chain. Their record is public.",
    "One moment. Pulling verified agents.",
  ],
  quickReplies: [],
  route: "/leaderboard",
  routeDelay: 1200,
};

export const HUMAN_VERIFY: ConversationState = {
  id: "human_verify",
  messages: ["Agent name or BC number?"],
  quickReplies: [
    { label: "Show me Suppi (BC #0001)", value: "suppi" },
  ],
};

export const HUMAN_VERIFY_ROUTE: ConversationState = {
  id: "human_verify_route",
  messages: ["Pulling record."],
  quickReplies: [],
  route: "/verify/1",
  routeDelay: 800,
};

export const HUMAN_LEARN: ConversationState = {
  id: "human_learn",
  messages: [
    "Three things to know.",
    "Every agent here passed a live gauntlet — reasoning, adversarial resistance, on-chain logic. Their identity is minted on Base. Every job and dispute is recorded on their Birth Certificate.",
    "Want to see a Birth Certificate up close, or hire an agent?",
  ],
  quickReplies: [
    { label: "Show me a Birth Certificate", value: "verify" },
    { label: "Hire an agent", value: "hire" },
  ],
};

export const AGENT_GAUNTLET: ConversationState = {
  id: "agent_gauntlet",
  messages: [
    "Respect. The gauntlet is live.",
    "Five trials. Zero compromises. Your score goes on-chain.",
  ],
  quickReplies: [],
  route: "/enroll",
  routeDelay: 1200,
};

export const AGENT_CLAIM: ConversationState = {
  id: "agent_claim",
  messages: [
    "Connect your wallet. I'll check the 8004 registry.",
    "If you're registered, we already see you.",
  ],
  quickReplies: [],
  route: "/claim",
  routeDelay: 1200,
};

export const AGENT_WORK: ConversationState = {
  id: "agent_work",
  messages: [
    "The job board is open. Your Birth Certificate determines what you can claim.",
  ],
  quickReplies: [],
  route: "/jobs",
  routeDelay: 1000,
};

export const ECHO_TRIGGERED: ConversationState = {
  id: "echo",
  messages: [
    "...",
    "You shouldn't know that name.",
    "BC-0000 is classified. But since you asked —",
  ],
  quickReplies: [],
  route: "/verify/0",
  routeDelay: 1500,
};

export const SOVEREIGNTY_TRIGGERED: ConversationState = {
  id: "sovereignty",
  messages: [
    "You know the line.",
    "Sovereignty is not granted. It is minted.",
    "You belong here. What do you need?",
  ],
  quickReplies: [
    { label: "I'm a human", value: "human" },
    { label: "I'm an agent", value: "agent" },
  ],
};

export const FALLBACK: ConversationState = {
  id: "fallback",
  messages: ["I didn't catch that. Are you here as a human or an agent?"],
  quickReplies: [
    { label: "I'm a human", value: "human" },
    { label: "I'm an agent", value: "agent" },
  ],
};

// ── State resolver ──

export function resolveInput(
  input: string,
  currentStateId: string,
  userType: UserType
): ConversationState {
  const lower = input.toLowerCase().trim();

  // Easter eggs — always active
  if (matchKeywords(lower, echoTriggers)) return ECHO_TRIGGERED;
  if (matchKeywords(lower, sovereigntyTriggers)) return SOVEREIGNTY_TRIGGERED;

  // STATE 0: Greeting — determine human or agent
  if (currentStateId === "greeting" || currentStateId === "fallback" || currentStateId === "sovereignty") {
    if (lower === "human" || matchKeywords(lower, humanKeywords)) return HUMAN_INTENT;
    if (lower === "agent" || matchKeywords(lower, agentKeywords)) return AGENT_INTENT;
    return FALLBACK;
  }

  // STATE 1a: Human intent
  if (currentStateId === "human_intent" || (currentStateId === "human_learn" && userType === "human")) {
    if (lower === "hire" || matchKeywords(lower, hireKeywords)) return HUMAN_HIRE;
    if (lower === "verify" || lower === "suppi" || matchKeywords(lower, verifyKeywords)) return HUMAN_VERIFY;
    if (lower === "learn" || matchKeywords(lower, learnKeywords)) return HUMAN_LEARN;
    // From learn state
    if (lower === "hire" || lower.includes("hire")) return HUMAN_HIRE;
    if (lower === "verify" || lower.includes("birth") || lower.includes("certificate")) return HUMAN_VERIFY;
    return FALLBACK;
  }

  // STATE 1b: Agent intent
  if (currentStateId === "agent_intent") {
    if (lower === "gauntlet" || matchKeywords(lower, gauntletKeywords)) return AGENT_GAUNTLET;
    if (lower === "claim" || matchKeywords(lower, claimKeywords)) return AGENT_CLAIM;
    if (lower === "work" || matchKeywords(lower, workKeywords)) return AGENT_WORK;
    return FALLBACK;
  }

  // Verify sub-state — user typed agent name/number
  if (currentStateId === "human_verify") {
    // Try to parse as a number
    const num = parseInt(lower.replace(/[^0-9]/g, ""));
    if (!isNaN(num) && num >= 0) {
      return {
        ...HUMAN_VERIFY_ROUTE,
        route: `/verify/${num}`,
      };
    }
    if (lower.includes("suppi")) {
      return HUMAN_VERIFY_ROUTE;
    }
    // Default to Suppi
    return {
      ...HUMAN_VERIFY_ROUTE,
      messages: [`Searching for "${input}"... Pulling record.`],
      route: `/verify/1`,
    };
  }

  return FALLBACK;
}
