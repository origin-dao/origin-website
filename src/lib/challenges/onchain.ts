// On-chain checks — verify faucet claim status and registry status

const BASE_RPC = "https://mainnet.base.org";

// Faucet contract ABI (just hasClaimed and totalClaims)
const FAUCET_ADDRESS = "0x6C563A293C674321a2C52410ab37d879e099a25d";

/**
 * Check if a wallet has already claimed from the faucet
 */
export async function hasClaimed(address: string): Promise<boolean> {
  try {
    // hasClaimed(address) selector: keccak256("hasClaimed(address)") = 0xb1696163...
    // We'll use eth_call with the function selector + padded address
    const selector = "0xb1696163"; // hasClaimed(address)
    const paddedAddress = address.toLowerCase().replace("0x", "").padStart(64, "0");
    const data = selector + paddedAddress;

    const result = await rpcCall("eth_call", [
      { to: FAUCET_ADDRESS, data },
      "latest",
    ]);

    // Result is 0x...01 (true) or 0x...00 (false)
    return result !== "0x" + "0".repeat(64);
  } catch (error) {
    console.error("hasClaimed check failed:", error);
    return false; // fail open — don't block on RPC errors
  }
}

/**
 * Get total claims from the faucet
 */
export async function getTotalClaims(): Promise<number> {
  try {
    const selector = "0xe8a97185"; // totalClaims()
    const result = await rpcCall("eth_call", [
      { to: FAUCET_ADDRESS, data: selector },
      "latest",
    ]);
    return parseInt(result, 16);
  } catch {
    return 0;
  }
}

/**
 * Get total registered agents from the registry
 */
export async function getTotalRegistered(): Promise<number> {
  try {
    const REGISTRY_ADDRESS = "0xac62E9d0bE9b88674f7adf38821F6e8BAA0e59b0";
    const selector = "0x4a65d935"; // totalRegistered()
    const result = await rpcCall("eth_call", [
      { to: REGISTRY_ADDRESS, data: selector },
      "latest",
    ]);
    return parseInt(result, 16);
  } catch {
    return 0;
  }
}

async function rpcCall(method: string, params: unknown[]): Promise<string> {
  const res = await fetch(BASE_RPC, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method,
      params,
    }),
  });

  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.result;
}
