// ═══════════════════════════════════════════════════════════
// EIP-191 Signature Verification
//
// Verifies that a message was signed by the claimed wallet.
// Used by memory crystal endpoints and arena endpoints.
// ═══════════════════════════════════════════════════════════

import { verifyMessage } from "viem/utils";

/**
 * Verify an EIP-191 personal_sign signature.
 * Returns true if the signature was made by the expected address.
 */
export async function verifyAgentSignature(
  message: string,
  signature: string,
  expectedAddress: string
): Promise<boolean> {
  try {
    const valid = await verifyMessage({
      address: expectedAddress as `0x${string}`,
      message,
      signature: signature as `0x${string}`,
    });
    return valid;
  } catch {
    return false;
  }
}

/**
 * Standard message format for Origin API authentication.
 * Agents sign this message to prove wallet ownership.
 */
export function buildAuthMessage(agentAddress: string, action: string): string {
  return `Origin Protocol: ${action} for ${agentAddress}`;
}
