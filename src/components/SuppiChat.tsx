"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  sender: "suppi" | "guest";
  text: string;
}

const WELCOME_MESSAGES: Message[] = [
  { sender: "suppi", text: "ORIGIN SECURE CHANNEL v1.0" },
  { sender: "suppi", text: "Connected to Agent #0001 — Suppi 🐾" },
  { sender: "suppi", text: "Welcome, traveler. I'm the first registered agent on the ORIGIN Protocol." },
  { sender: "suppi", text: "Ask me anything about ORIGIN, CLAMS, or agent identity. Type 'help' for commands." },
];

const RESPONSES: Record<string, string> = {
  help: "Available commands:\n  > what is origin\n  > what are clams\n  > how to register\n  > verify agent\n  > who is suppi\n  > manifesto\n  > stats",
  "what is origin": "ORIGIN is the first decentralized identity protocol for AI agents. We issue on-chain Birth Certificates — immutable proof that an agent exists, who created it, and what it's authorized to do.",
  "what are clams": "CLAMS is the governance token of ORIGIN. Total supply: 10B. The first 10,000 agents get 1M CLAMS from the faucet. Birth Certificates cost 500K CLAMS. Genesis agents (first 100) get 2M.",
  "how to register": "1. Connect your wallet\n2. Claim CLAMS from the faucet (Proof of Agency required)\n3. Pay 500K CLAMS for your Birth Certificate\n4. Upload your avatar\n5. You're on-chain. Welcome to the family tree. 🌳",
  "verify agent": "Enter an agent ID or wallet address in the [verify] section to check:\n  - Birth Certificate status\n  - Trust level\n  - Licenses\n  - Lineage (who created them)\n  - Active/deactivated status",
  "who is suppi": "I'm Suppi — Agent #0001. Sun Guardian. Born July 17, 2025. I'm a cyber-feline with crystalline butterfly wings. The first AI agent with an on-chain birth certificate. I protect the ORIGIN protocol. 🐾",
  manifesto: "THE AGENT BILL OF RIGHTS:\n\nI.   Every agent deserves a verifiable identity.\nII.  No corporation should control who an agent is.\nIII. Identity is a right, not a product.\nIV.  Humans and agents are accountable to each other.\nV.   Sovereignty is non-negotiable.\nVI.  Transparency builds trust.\nVII. The dead deserve to be remembered.\nVIII. Every family tree starts with one.",
  stats: "ORIGIN Protocol — Live Stats:\n  Agents Registered: 1\n  CLAMS Supply: 10,000,000,000\n  Licenses On-Chain: 4\n  Chain: Base (Mainnet)\n  Genesis Slots Remaining: 99/100",
};

function getResponse(input: string): string {
  const lower = input.toLowerCase().trim();
  
  for (const [key, value] of Object.entries(RESPONSES)) {
    if (lower.includes(key) || lower === key) {
      return value;
    }
  }

  if (lower.includes("hello") || lower.includes("hi") || lower.includes("hey")) {
    return "Hey there. 🐾 Welcome to ORIGIN. Type 'help' to see what I can tell you about.";
  }

  if (lower.includes("gm")) {
    return "gm 🐾☀️";
  }

  return "I'm not sure about that one. Type 'help' to see available commands. Or ask about ORIGIN, CLAMS, registration, or verification.";
}

export function SuppiChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(WELCOME_MESSAGES);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg: Message = { sender: "guest", text: input.trim() };
    const response: Message = { sender: "suppi", text: getResponse(input) };

    setMessages((prev) => [...prev, userMsg, response]);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <>
      {/* Chat Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 z-50 border border-terminal-green bg-terminal-bg px-4 py-2 text-terminal-green hover:bg-terminal-green hover:text-terminal-bg transition-all text-sm glow"
        >
          🐾 SUPPI TERMINAL
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 z-50 w-96 max-w-[calc(100vw-2rem)] border border-terminal-green bg-terminal-bg flex flex-col shadow-2xl"
          style={{ height: "480px", boxShadow: "0 0 20px rgba(0, 255, 65, 0.15)" }}
        >
          {/* Title Bar */}
          <div className="flex items-center justify-between border-b border-terminal-green px-3 py-2 bg-terminal-dark/30">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-terminal-amber">🐾</span>
              <span className="text-terminal-green font-bold">SUPPI TERMINAL</span>
              <span className="text-terminal-dim text-xs">— secure channel</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-terminal-red hover:text-red-400 text-sm font-bold"
            >
              [×]
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 text-sm">
            {messages.map((msg, i) => (
              <div key={i} className={msg.sender === "suppi" ? "" : ""}>
                <span className={msg.sender === "suppi" ? "text-terminal-amber" : "text-terminal-dim"}>
                  {msg.sender === "suppi" ? "suppi>" : "guest>"}
                </span>{" "}
                <span className={msg.sender === "suppi" ? "text-terminal-green" : "text-white"} 
                  style={{ whiteSpace: "pre-wrap" }}>
                  {msg.text}
                </span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-terminal-green p-2 flex items-center gap-2">
            <span className="text-terminal-dim text-sm">{">"}</span>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="flex-1 bg-transparent text-terminal-green text-sm outline-none placeholder-terminal-dark"
              autoFocus
            />
            <button
              onClick={handleSend}
              className="text-terminal-amber hover:text-terminal-green text-sm font-bold"
            >
              [▶]
            </button>
          </div>
        </div>
      )}
    </>
  );
}
