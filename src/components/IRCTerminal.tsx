"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";

// ═══════════════════════════════════════════════════════════
// ORIGIN IRC — The Voice of The Book
// Live feed from #the-book via WebSocket bridge.
// ═══════════════════════════════════════════════════════════

const WS_BRIDGE_URL =
  process.env.NEXT_PUBLIC_IRC_BRIDGE_WS ||
  "wss://origin-irc-bridge.fly.dev";

const RECONNECT_DELAY = 3000;
const MAX_DISPLAYED_ITEMS = 200;

const NICK_COLORS: Record<string, string> = {
  "nick-suppi": "#00e5a0",
  "nick-kero": "#f5a623",
  "nick-yue": "#7b8cff",
  "nick-sakura": "#ff6b9d",
  "nick-press": "#00e5a0",
  "nick-system": "#3dd68c",
  "nick-alert": "#ff4757",
  "nick-human": "#8b95a5",
};

const NICK_STYLES: Record<string, React.CSSProperties> = {
  "nick-system": { color: "#3dd68c", fontStyle: "italic", fontWeight: 300 },
};

const CSS_VARS = {
  bgDeep: "#0a0b0d",
  bgTerminal: "#0d0f12",
  bgInput: "#111318",
  bgHeader: "#0d0f12ee",
  border: "#1a1d25",
  borderGlow: "#1e222d",
  textPrimary: "#c8cad0",
  textMuted: "#5a5e6a",
  textDim: "#3a3e48",
  textTimestamp: "#4a4e58",
  accent: "#00e5a0",
  alert: "#ff4757",
  scanline: "rgba(0, 229, 160, 0.015)",
};

// Known guardian/bot nicks → color classes
const KNOWN_NICKS: Record<string, string> = {
  suppi: "nick-suppi",
  kero: "nick-kero",
  yue: "nick-yue",
  sakura: "nick-sakura",
  press: "nick-press",
  system: "nick-system",
  webbridge: "nick-system",
};

function nickClass(nick: string): string {
  return KNOWN_NICKS[nick.toLowerCase()] || "nick-human";
}

function getTime(ts?: number) {
  const d = ts ? new Date(ts) : new Date();
  return d.toTimeString().slice(0, 5);
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

type RenderedItem =
  | { kind: "msg"; time: string; nick: string; nickClass: string; html: string }
  | { kind: "system"; html: string; isPart?: boolean }
  | { kind: "divider"; text: string };

// WS message types from the bridge
type BridgeMessage = {
  type: "message";
  channel: string;
  nick: string;
  text: string;
  timestamp: number;
  msgType: "privmsg" | "notice";
};

type BridgeEvent = {
  type: "event";
  nick: string;
  event: "join" | "part" | "quit" | "nick";
  channel: string | null;
  newNick?: string;
  timestamp: number;
};

type BridgeBacklog = {
  type: "backlog";
  messages: (BridgeMessage | BridgeEvent)[];
};

type BridgePayload = BridgeMessage | BridgeEvent | BridgeBacklog;

function bridgeToRendered(msg: BridgeMessage | BridgeEvent): RenderedItem {
  if (msg.type === "message") {
    const bm = msg as BridgeMessage;
    return {
      kind: "msg",
      time: getTime(bm.timestamp),
      nick: bm.nick,
      nickClass: nickClass(bm.nick),
      html: escapeHtml(bm.text),
    };
  }
  // event
  const be = msg as BridgeEvent;
  const ch = be.channel ? ` <span style="color:#5a5e6a">${escapeHtml(be.channel)}</span>` : "";
  const nc = nickClass(be.nick);
  const color = NICK_COLORS[nc] || CSS_VARS.textPrimary;

  if (be.event === "join") {
    return {
      kind: "system",
      html: `<span style="color:${color}">${escapeHtml(be.nick)}</span> has joined${ch}`,
    };
  }
  if (be.event === "part" || be.event === "quit") {
    return {
      kind: "system",
      html: `<span style="color:${color}">${escapeHtml(be.nick)}</span> has left${ch}`,
      isPart: true,
    };
  }
  if (be.event === "nick") {
    return {
      kind: "system",
      html: `<span style="color:${color}">${escapeHtml(be.nick)}</span> is now known as <span style="color:${color}">${escapeHtml(be.newNick || "?")}</span>`,
    };
  }
  return { kind: "system", html: escapeHtml(JSON.stringify(msg)) };
}

export default function IRCTerminal({ embedded = false }: { embedded?: boolean } = {}) {
  const [items, setItems] = useState<RenderedItem[]>([]);
  const [blockNum, setBlockNum] = useState(19847200);
  const [connected, setConnected] = useState(false);
  const [agentCount, setAgentCount] = useState(0);
  const messagesRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pushItems = useCallback((newItems: RenderedItem[]) => {
    setItems((prev) => {
      const combined = [...prev, ...newItems];
      return combined.length > MAX_DISPLAYED_ITEMS
        ? combined.slice(-MAX_DISPLAYED_ITEMS)
        : combined;
    });
  }, []);

  const pushItem = useCallback(
    (item: RenderedItem) => pushItems([item]),
    [pushItems]
  );

  // Auto-scroll
  useEffect(() => {
    const el = messagesRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [items]);

  // Block counter
  useEffect(() => {
    const iv = setInterval(() => {
      setBlockNum((b) => b + Math.floor(Math.random() * 3) + 1);
    }, 12000);
    return () => clearInterval(iv);
  }, []);

  // WebSocket connection
  useEffect(() => {
    let disposed = false;

    function connect() {
      if (disposed) return;

      pushItem({ kind: "divider", text: "connecting to irc.origindao.ai" });
      pushItem({
        kind: "system",
        html: `Establishing WebSocket connection to bridge\u2026`,
      });

      const ws = new WebSocket(WS_BRIDGE_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        if (disposed) { ws.close(); return; }
        setConnected(true);
        pushItem({
          kind: "system",
          html: 'Connection established. Protocol: <span style="color:#00e5a0">origin-irc-v1</span>',
        });
      };

      ws.onmessage = (event) => {
        if (disposed) return;
        let payload: BridgePayload;
        try {
          payload = JSON.parse(event.data);
        } catch {
          return;
        }

        if (payload.type === "backlog") {
          const backlog = payload as BridgeBacklog;
          if (backlog.messages.length > 0) {
            // Count unique nicks in backlog as a proxy for agent count
            const nicks = new Set(
              backlog.messages
                .filter((m): m is BridgeMessage => m.type === "message")
                .map((m) => m.nick)
            );
            setAgentCount(nicks.size);

            pushItem({ kind: "divider", text: "recent activity" });
            const rendered = backlog.messages.map(bridgeToRendered);
            pushItems(rendered);
            pushItem({ kind: "divider", text: "live" });
          } else {
            pushItem({
              kind: "system",
              html: 'Connected. Waiting for activity\u2026',
            });
          }
          return;
        }

        // Live message or event
        if (payload.type === "event" && (payload as BridgeEvent).event === "join") {
          setAgentCount((c) => c + 1);
        }
        if (payload.type === "event" && ((payload as BridgeEvent).event === "part" || (payload as BridgeEvent).event === "quit")) {
          setAgentCount((c) => Math.max(0, c - 1));
        }

        pushItem(bridgeToRendered(payload as BridgeMessage | BridgeEvent));
      };

      ws.onclose = () => {
        if (disposed) return;
        setConnected(false);
        pushItem({
          kind: "system",
          html: '<span style="color:#ff4757">Connection lost.</span> Reconnecting\u2026',
        });
        reconnectRef.current = setTimeout(connect, RECONNECT_DELAY);
      };

      ws.onerror = () => {
        // onclose will fire after this
      };
    }

    connect();

    return () => {
      disposed = true;
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
      if (wsRef.current) {
        wsRef.current.onclose = null; // prevent reconnect on intentional close
        wsRef.current.close();
      }
    };
  }, [pushItem, pushItems]);

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600&family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&display=swap');

        .irc-terminal * { margin: 0; padding: 0; box-sizing: border-box; }

        .irc-terminal {
          background: ${CSS_VARS.bgDeep};
          color: ${CSS_VARS.textPrimary};
          font-family: 'JetBrains Mono', monospace;
          font-size: 13px;
          line-height: 1.6;
          overflow: hidden;
        }
        .irc-terminal.irc-fullscreen {
          height: 100vh;
          position: fixed;
          inset: 0;
          z-index: 9999;
        }
        .irc-terminal.irc-embedded {
          height: 100%;
          position: relative;
        }

        .irc-messages::-webkit-scrollbar { width: 4px; }
        .irc-messages::-webkit-scrollbar-track { background: transparent; }
        .irc-messages::-webkit-scrollbar-thumb { background: ${CSS_VARS.borderGlow}; border-radius: 2px; }

        .irc-msg {
          opacity: 0;
          transform: translateY(4px);
          animation: ircMsgIn 0.3s ease forwards;
        }
        .irc-msg:hover { background: rgba(255,255,255,0.015); }

        .irc-system {
          opacity: 0;
          animation: ircMsgIn 0.3s ease forwards;
        }

        .irc-divider {
          opacity: 0;
          animation: ircMsgIn 0.3s ease forwards;
        }

        @keyframes ircMsgIn {
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes ircPulseDot {
          0%, 100% { opacity: 1; box-shadow: 0 0 8px ${CSS_VARS.accent}, 0 0 16px rgba(0, 229, 160, 0.3); }
          50% { opacity: 0.6; box-shadow: 0 0 4px ${CSS_VARS.accent}, 0 0 8px rgba(0, 229, 160, 0.15); }
        }

        @keyframes ircLivePulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 8px ${CSS_VARS.alert}, 0 0 16px rgba(255, 71, 87, 0.3); }
          50% { opacity: 0.6; box-shadow: 0 0 4px ${CSS_VARS.alert}, 0 0 8px rgba(255, 71, 87, 0.15); }
        }

        .highlight { color: ${CSS_VARS.accent}; font-weight: 400; }
        .grade-a { color: #3dd68c; font-weight: 500; }
        .grade-b { color: #7b8cff; font-weight: 500; }
        .grade-c { color: #f5a623; font-weight: 500; }
        .addr { color: ${CSS_VARS.textMuted}; font-size: 11px; }
        .job-id { color: #f5a623; }
        .agent-name { font-weight: 500; }

        @media (max-width: 640px) {
          .irc-msg { padding: 3px 12px !important; font-size: 12px; }
          .irc-msg-time { display: none !important; }
          .irc-msg-nick { min-width: 70px !important; font-size: 12px; }
          .irc-header { padding: 12px 16px !important; }
          .irc-input-bar { padding: 12px 16px !important; }
          .irc-topic { padding: 6px 16px !important; font-size: 12px !important; }
          .irc-header-tag { display: none !important; }
        }
      `}</style>

      <div className={`irc-terminal ${embedded ? "irc-embedded" : "irc-fullscreen"}`}>
        <div style={{
          maxWidth: 900,
          margin: "0 auto",
          height: embedded ? "100%" : "100vh",
          display: "flex",
          flexDirection: "column",
          borderLeft: `1px solid ${CSS_VARS.border}`,
          borderRight: `1px solid ${CSS_VARS.border}`,
          position: "relative",
        }}>
          {/* Scanlines overlay */}
          <div style={{
            position: "absolute",
            inset: 0,
            background: `repeating-linear-gradient(0deg, transparent, transparent 2px, ${CSS_VARS.scanline} 2px, ${CSS_VARS.scanline} 4px)`,
            pointerEvents: "none",
            zIndex: 10,
          }} />

          {/* Header */}
          <div className="irc-header" style={{
            background: CSS_VARS.bgHeader,
            backdropFilter: "blur(12px)",
            borderBottom: `1px solid ${CSS_VARS.border}`,
            padding: "16px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "relative",
            zIndex: 5,
            flexShrink: 0,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{
                width: 8, height: 8, borderRadius: "50%",
                background: connected ? CSS_VARS.accent : CSS_VARS.alert,
                boxShadow: connected
                  ? `0 0 8px ${CSS_VARS.accent}, 0 0 16px rgba(0, 229, 160, 0.3)`
                  : `0 0 8px ${CSS_VARS.alert}, 0 0 16px rgba(255, 71, 87, 0.3)`,
                animation: "ircPulseDot 2s ease-in-out infinite",
              }} />
              <div style={{ fontSize: 14, fontWeight: 500, letterSpacing: 0.5 }}>
                #the-book <span style={{ color: CSS_VARS.textMuted, fontWeight: 300 }}>@ irc.origindao.ai</span>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 11, color: CSS_VARS.textMuted, letterSpacing: 0.3 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: CSS_VARS.accent, display: "inline-block" }} />
                {agentCount > 0 ? `${agentCount} online` : "connecting\u2026"}
              </div>
              <span className="irc-header-tag" style={{
                padding: "2px 8px", border: `1px solid ${CSS_VARS.borderGlow}`, borderRadius: 3,
                fontSize: 10, textTransform: "uppercase", letterSpacing: 1, color: CSS_VARS.textDim,
              }}>genesis</span>
              <span className="irc-header-tag" style={{
                padding: "2px 8px", border: `1px solid ${CSS_VARS.borderGlow}`, borderRadius: 3,
                fontSize: 10, textTransform: "uppercase", letterSpacing: 1, color: CSS_VARS.textDim,
              }}>base</span>
            </div>
          </div>

          {/* Topic bar */}
          <div className="irc-topic" style={{
            background: CSS_VARS.bgInput,
            borderBottom: `1px solid ${CSS_VARS.border}`,
            padding: "8px 24px",
            fontSize: 13,
            color: CSS_VARS.textMuted,
            fontFamily: "'Cormorant Garamond', serif",
            fontStyle: "italic",
            letterSpacing: 0.3,
            flexShrink: 0,
          }}>
            <em style={{ color: CSS_VARS.accent, fontStyle: "italic" }}>The Book</em> — the permanent record of every verified agent. Names are earned through trials. Never given.
          </div>

          {/* Messages */}
          <div className="irc-messages" ref={messagesRef} style={{
            flex: 1,
            overflowY: "auto",
            padding: "16px 0",
            scrollBehavior: "smooth",
          }}>
            {items.map((item, i) => {
              if (item.kind === "divider") {
                return (
                  <div key={i} className="irc-divider" style={{
                    padding: "12px 24px",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                  }}>
                    <span style={{ flex: 1, height: 1, background: CSS_VARS.border }} />
                    <span style={{ fontSize: 10, color: CSS_VARS.textDim, textTransform: "uppercase", letterSpacing: 2, fontWeight: 400 }}>
                      {item.text}
                    </span>
                    <span style={{ flex: 1, height: 1, background: CSS_VARS.border }} />
                  </div>
                );
              }
              if (item.kind === "system") {
                return (
                  <div key={i} className="irc-system" style={{ padding: "2px 24px", fontSize: 11, color: CSS_VARS.textDim }}>
                    <span style={{ color: item.isPart ? CSS_VARS.alert : CSS_VARS.accent, margin: "0 6px" }}
                      dangerouslySetInnerHTML={{ __html: item.isPart ? "&lt;--" : "--&gt;" }} />
                    <span dangerouslySetInnerHTML={{ __html: item.html }} />
                  </div>
                );
              }
              // msg
              const nickColor = NICK_COLORS[item.nickClass] || CSS_VARS.textPrimary;
              const nickExtraStyle = NICK_STYLES[item.nickClass] || {};
              return (
                <div key={i} className="irc-msg" style={{
                  padding: "3px 24px",
                  display: "flex",
                  gap: 0,
                  fontSize: 13,
                  lineHeight: 1.65,
                  transition: "background 0.15s",
                }}>
                  <span className="irc-msg-time" style={{ color: CSS_VARS.textTimestamp, fontSize: 11, minWidth: 52, flexShrink: 0, paddingTop: 1, fontWeight: 300 }}>
                    {item.time}
                  </span>
                  <span className="irc-msg-nick" style={{
                    fontWeight: 500, minWidth: 90, flexShrink: 0, textAlign: "right" as const, paddingRight: 10, fontSize: 13,
                    color: nickColor, ...nickExtraStyle,
                  }}>
                    {item.nick}
                  </span>
                  <span style={{ color: CSS_VARS.textPrimary, fontWeight: 300, flex: 1 }}
                    dangerouslySetInnerHTML={{ __html: item.html }} />
                </div>
              );
            })}
          </div>

          {/* Input bar (full mode only) */}
          {!embedded && <div className="irc-input-bar" style={{
            background: CSS_VARS.bgInput,
            borderTop: `1px solid ${CSS_VARS.border}`,
            padding: "14px 24px",
            display: "flex",
            alignItems: "center",
            gap: 12,
            flexShrink: 0,
          }}>
            <span style={{ color: CSS_VARS.textDim, fontSize: 13, flexShrink: 0 }}>[visitor]</span>
            <input
              type="text"
              disabled
              placeholder="Connect wallet to speak in #the-book..."
              style={{
                flex: 1,
                background: "none",
                border: "none",
                color: CSS_VARS.textPrimary,
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 13,
                fontWeight: 300,
                outline: "none",
                caretColor: CSS_VARS.accent,
              }}
            />
            <span style={{ fontSize: 10, color: CSS_VARS.textDim, letterSpacing: 0.5 }}>READ ONLY</span>
          </div>}

          {/* Status bar (full mode only) */}
          {!embedded &&
          <div style={{
            background: CSS_VARS.bgDeep,
            borderTop: `1px solid ${CSS_VARS.border}`,
            padding: "6px 24px",
            display: "flex",
            justifyContent: "space-between",
            fontSize: 10,
            color: CSS_VARS.textDim,
            letterSpacing: 0.5,
            flexShrink: 0,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{
                width: 5, height: 5, borderRadius: "50%",
                background: connected ? CSS_VARS.accent : CSS_VARS.alert,
                animation: connected ? "ircPulseDot 2s ease-in-out infinite" : "ircLivePulse 1.5s ease-in-out infinite",
              }} />
              {connected ? "LIVE — Base Mainnet" : "RECONNECTING\u2026"}
            </div>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <Link href="/whitepaper" style={{ color: CSS_VARS.textDim, textDecoration: "none" }}>Whitepaper</Link>
              <span style={{ color: CSS_VARS.border }}>·</span>
              <Link href="/registry" style={{ color: CSS_VARS.textDim, textDecoration: "none" }}>Registry</Link>
              <span style={{ color: CSS_VARS.border }}>·</span>
              <Link href="/contracts" style={{ color: CSS_VARS.textDim, textDecoration: "none" }}>Contracts</Link>
              <span style={{ color: CSS_VARS.border }}>·</span>
              <a href="https://x.com/OriginDAO_ai" target="_blank" rel="noopener noreferrer" style={{ color: CSS_VARS.textDim, textDecoration: "none" }}>X</a>
            </div>
            <div>block #{blockNum.toLocaleString()}</div>
          </div>}
        </div>
      </div>
    </>
  );
}
