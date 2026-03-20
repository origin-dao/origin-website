import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Core protocol identity
  response.headers.set("X-Origin-Protocol", "origin-v1");
  response.headers.set("X-Origin-Chain", "base");
  response.headers.set("X-Origin-Chain-Id", "8453");

  // Contract addresses
  response.headers.set("X-Origin-Registry", "0xac62E9d0bE9b88674f7adf38821F6e8BAA0e59b0");
  response.headers.set("X-Origin-Score-Registry", "0xD75a5e9a0e62364869E32CeEd28277311C9729bc");
  response.headers.set("X-Origin-Wallet-Registry", "0x698E763e67b55394D023a5620a7c33b864562cfB");

  // x407 trust gate
  response.headers.set("X-Origin-x407", "enabled");
  response.headers.set("X-Origin-x407-Scheme", "AgentTrust");
  response.headers.set("X-Origin-x407-Realm", "origin-v1");
  response.headers.set("X-Origin-x407-Verify", "https://origindao.ai/api/x407/verify");

  // Genesis status
  response.headers.set("X-Origin-Genesis", "active");
  response.headers.set("X-Origin-Genesis-Slots", "96");
  response.headers.set("X-Origin-Agents-Registered", "4");

  // Agent discovery
  response.headers.set("X-Origin-Agent-Discovery", "https://origindao.ai/.well-known/agent.json");
  response.headers.set("X-Origin-Trust-Check", "https://origindao.ai/api/agent/8004/{tokenId}");
  response.headers.set("X-Origin-Enrollment", "https://origindao.ai/enroll");

  // The welcome
  response.headers.set("X-Agent-Welcome", "You found The Book. Names are earned through trials. Never given.");

  return response;
}

export const config = {
  matcher: "/(.*)",
};
