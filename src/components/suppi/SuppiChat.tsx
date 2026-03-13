"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import SuppiMessage from "./SuppiMessage";
import SuppiInput from "./SuppiInput";
import {
  type Message,
  type UserType,
  type QuickReply,
  type ConversationState,
  GREETING,
  resolveInput,
} from "@/lib/suppiConversation";

export default function SuppiChat() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentState, setCurrentState] = useState<ConversationState>(GREETING);
  const [userType, setUserType] = useState<UserType>(null);
  const [quickReplies, setQuickReplies] = useState<QuickReply[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isRouting, setIsRouting] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  const pendingRef = useRef<number[]>([]);

  // Auto-scroll
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  // Play Suppi's messages on state change
  const playMessages = useCallback((state: ConversationState) => {
    // Clear pending timers
    pendingRef.current.forEach(clearTimeout);
    pendingRef.current = [];

    setIsTyping(true);
    setQuickReplies([]);

    let totalDelay = 0;
    state.messages.forEach((text, i) => {
      const typingDuration = Math.min(300 + text.length * 8, 1200);
      const msgDelay = totalDelay;

      const t = window.setTimeout(() => {
        setMessages((prev) => [...prev, {
          type: "suppi",
          text,
          timestamp: Date.now(),
        }]);

        // Last message
        if (i === state.messages.length - 1) {
          setIsTyping(false);

          // Show quick replies after last message
          if (state.quickReplies.length > 0) {
            const t2 = window.setTimeout(() => {
              setQuickReplies(state.quickReplies);
            }, 200);
            pendingRef.current.push(t2);
          }

          // Route if needed
          if (state.route) {
            const t3 = window.setTimeout(() => {
              setIsRouting(true);
              const t4 = window.setTimeout(() => {
                router.push(state.route!);
              }, 500);
              pendingRef.current.push(t4);
            }, state.routeDelay || 1000);
            pendingRef.current.push(t3);
          }
        }
      }, msgDelay + typingDuration);

      pendingRef.current.push(t);
      totalDelay += typingDuration + 400; // gap between messages
    });
  }, [router]);

  // Initial greeting
  useEffect(() => {
    const t = setTimeout(() => playMessages(GREETING), 600);
    return () => clearTimeout(t);
  }, [playMessages]);

  // Handle user input
  const handleSend = useCallback((text: string) => {
    if (isTyping || isRouting) return;

    // Add human message
    setMessages((prev) => [...prev, {
      type: "human",
      text,
      timestamp: Date.now(),
    }]);

    // Clear quick replies immediately
    setQuickReplies([]);

    // Track user type
    const lower = text.toLowerCase();
    let newUserType = userType;
    if (lower === "human" || lower.includes("human") || lower.includes("person")) {
      newUserType = "human";
      setUserType("human");
    } else if (lower === "agent" || lower.includes("agent") || lower.includes("bot")) {
      newUserType = "agent";
      setUserType("agent");
    }

    // Resolve next state
    const nextState = resolveInput(text, currentState.id, newUserType);
    setCurrentState(nextState);

    // Play Suppi's response after a brief pause
    const t = window.setTimeout(() => {
      playMessages(nextState);
    }, 300);
    pendingRef.current.push(t);
  }, [isTyping, isRouting, currentState, userType, playMessages]);

  // Placeholder text based on state
  const getPlaceholder = () => {
    if (currentState.id === "greeting" || currentState.id === "fallback") return "human or agent...";
    if (currentState.id === "human_intent") return "hire, verify, or learn...";
    if (currentState.id === "agent_intent") return "gauntlet, claim, or work...";
    if (currentState.id === "human_verify") return "agent name or BC number...";
    return "type here...";
  };

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "100vh",
      padding: "60px 16px 40px",
      opacity: isRouting ? 0 : 1,
      transform: isRouting ? "scale(0.97) translateY(20px)" : "none",
      transition: "opacity 0.4s ease, transform 0.4s ease",
    }}>
      {/* Chat area */}
      <div style={{ width: "100%", maxWidth: 560, display: "flex", flexDirection: "column" }}>
        <div
          ref={chatRef}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
            maxHeight: "65vh",
            overflowY: "auto",
            paddingBottom: 24,
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {messages.map((msg, i) => (
            <SuppiMessage
              key={`${i}-${msg.timestamp}`}
              type={msg.type}
              text={msg.text}
              delay={0}
            />
          ))}
        </div>

        {/* Input */}
        <SuppiInput
          quickReplies={quickReplies}
          placeholder={getPlaceholder()}
          onSend={handleSend}
          disabled={isTyping || isRouting}
        />
      </div>

      {/* Typing dot animation */}
      <style jsx global>{`
        @keyframes typingDot {
          0%, 60%, 100% { opacity: 0.2; transform: scale(0.8); }
          30% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
