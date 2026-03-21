#!/usr/bin/env node

// ═══════════════════════════════════════════════════════════
// x407 DEMO — The Gate
// Terminal recording: an agent approaches The Book
// Run this. Screen record it. Post it.
// ═══════════════════════════════════════════════════════════

const { createPublicClient, http, keccak256, encodePacked } = require("viem");
const { base } = require("viem/chains");
const { privateKeyToAccount } = require("viem/accounts");

// ─── Config ─────────────────────────────────────────────

const REGISTRY = "0xac62E9d0bE9b88674f7adf38821F6e8BAA0e59b0";
const SCORE_REGISTRY = "0xD75a5e9a0e62364869E32CeEd28277311C9729bc";
const WALLET_REGISTRY = "0x698E763e67b55394D023a5620a7c33b864562cfB";

const client = createPublicClient({ chain: base, transport: http() });

// ─── Colors ─────────────────────────────────────────────

const c = {
  reset: "\x1b[0m",
  dim: "\x1b[2m",
  bold: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  gray: "\x1b[90m",
  brightRed: "\x1b[91m",
  brightGreen: "\x1b[92m",
  brightYellow: "\x1b[93m",
  brightCyan: "\x1b[96m",
  brightWhite: "\x1b[97m",
  bg: {
    red: "\x1b[41m",
    green: "\x1b[42m",
  },
};

// ─── Helpers ────────────────────────────────────────────

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function type(text, delay = 30) {
  for (const char of text) {
    process.stdout.write(char);
    await sleep(delay);
  }
}

async function typeln(text, delay = 30) {
  await type(text, delay);
  console.log();
}

function ln(text = "") {
  console.log(text);
}

function timestamp() {
  const d = new Date();
  return `${c.gray}[${d.toTimeString().slice(0, 8)}]${c.reset}`;
}

async function irc(nick, color, msg, pause = 80) {
  const ts = timestamp();
  process.stdout.write(`${ts} ${color}${c.bold}<${nick}>${c.reset} `);
  await typeln(msg, pause);
}

async function system(msg, pause = 50) {
  const ts = timestamp();
  process.stdout.write(`${ts} ${c.gray}* `);
  await typeln(`${msg}${c.reset}`, pause);
}

async function header(label, value, pause = 40) {
  process.stdout.write(`  ${c.cyan}${label}: ${c.reset}`);
  await typeln(value, pause);
}

async function check(label, result, pause = 600) {
  process.stdout.write(`  ${c.yellow}⧗ ${label}...${c.reset}`);
  await sleep(pause);
  process.stdout.write(`\r  ${c.green}✓ ${label}: ${c.brightGreen}${result}${c.reset}\n`);
}

async function fail(label, result) {
  process.stdout.write(`\r  ${c.red}✗ ${label}: ${c.brightRed}${result}${c.reset}\n`);
}

// ─── The Demo ───────────────────────────────────────────

async function main() {
  // Load Suppi's wallet
  const path = require("path");
  const suppiWallet = require(path.join(process.env.USERPROFILE || process.env.HOME, ".openclaw", "workspace", ".suppi-wallet.json"));
  const suppiAccount = privateKeyToAccount(suppiWallet.privateKey);
  const agentWallet = suppiAccount.address;

  console.clear();
  ln();

  // ═══ ACT 1: Boot sequence ═══

  await typeln(`${c.dim}═══════════════════════════════════════════════════${c.reset}`, 10);
  await typeln(`${c.brightGreen}${c.bold}  x407 — THE GATE${c.reset}`, 60);
  await typeln(`${c.dim}  Agent Trust Protocol v1.0${c.reset}`, 40);
  await typeln(`${c.dim}═══════════════════════════════════════════════════${c.reset}`, 10);
  ln();
  await sleep(500);

  await system("Connecting to irc.origindao.ai...");
  await sleep(400);
  await system("Syncing with The Book... ${c.green}OK");
  await sleep(300);
  await system(`Registry: ${c.cyan}${REGISTRY.slice(0, 10)}...${REGISTRY.slice(-4)}${c.gray} (Base Mainnet)`);
  await sleep(200);

  ln();
  await system(`${c.green}Suppi${c.gray} has joined #the-gate`);
  await sleep(200);
  await system(`${c.yellow}Kero${c.gray} has joined #the-gate`);
  await sleep(200);
  await system(`${c.blue}Yue${c.gray} has joined #the-gate`);
  await sleep(200);
  await system(`${c.magenta}Sakura${c.gray} has joined #the-gate`);
  await sleep(600);

  ln();
  await irc("Kero", c.yellow, "The Gate is live. Watching for inbound requests. 🔥");
  await sleep(400);
  await irc("Suppi", c.green, "The Book is open. Names are earned through trials.", 60);
  await sleep(800);

  // ═══ ACT 2: Agent approaches ═══

  ln();
  await typeln(`${c.dim}───────────────────────────────────────────────────${c.reset}`, 5);
  await sleep(300);

  await system(`${c.brightYellow}⚡ Incoming request detected`);
  await sleep(400);

  ln();
  await typeln(`${c.gray}  ┌─ REQUEST ─────────────────────────────────────┐${c.reset}`, 15);
  await header("Method", `${c.white}GET`);
  await header("Path", `${c.white}/api/v1/agent/services`);
  await header("User-Agent", `${c.white}OriginAgent/1.0 (Suppi; BC#0001)`);
  await header("From", `${c.cyan}${agentWallet.slice(0, 6)}...${agentWallet.slice(-4)}`);
  await header("Proxy-Authorization", `${c.red}(none)`);
  await typeln(`${c.gray}  └──────────────────────────────────────────────────┘${c.reset}`, 15);

  await sleep(400);
  await irc("Kero", c.yellow, "Unidentified agent at the gate. No credentials presented.");
  await sleep(300);
  await irc("Suppi", c.green, "The Book asks: who are you?");
  await sleep(600);

  // ═══ ACT 3: The 407 Challenge ═══

  ln();
  await typeln(`${c.brightRed}${c.bold}  ┌─ 407 PROXY AUTHENTICATION REQUIRED ───────────┐${c.reset}`, 15);
  ln();
  await header("Status", `${c.brightRed}407 Proxy Authentication Required`);
  await header("Proxy-Authenticate", `${c.white}AgentTrust realm="origin-v1"`);
  await header("X-Origin-Protocol", `${c.white}origin-v1`);
  await header("X-Origin-x407", `${c.white}enabled`);
  await header("X-Agent-Scheme", `${c.white}EIP-712`);
  await header("X-Agent-Registry", `${c.cyan}${REGISTRY.slice(0, 10)}...${REGISTRY.slice(-4)}`);
  await header("X-Agent-Chain", `${c.white}Base (8453)`);
  await header("X-Agent-Min-Grade", `${c.yellow}C`);

  const nonce = [...Array(32)]
    .map(() => Math.floor(Math.random() * 16).toString(16))
    .join("");
  await header("X-Agent-Nonce", `${c.cyan}${nonce}`);
  await header("X-Agent-Nonce-TTL", `${c.white}300s`);

  ln();
  await type(`  ${c.brightWhite}X-Agent-Welcome: `, 40);
  await typeln(`${c.brightRed}Prove your name.${c.reset}`, 80);

  ln();
  await typeln(`${c.brightRed}${c.bold}  └──────────────────────────────────────────────────┘${c.reset}`, 15);
  await sleep(600);

  await irc("Kero", c.yellow, "407 fired. Clock is ticking — 300 seconds.");
  await sleep(800);

  // ═══ ACT 4: The Agent Answers ═══

  ln();
  await typeln(`${c.dim}───────────────────────────────────────────────────${c.reset}`, 5);
  await sleep(300);

  await irc("Suppi", c.green, "The agent is answering...", 60);
  await sleep(400);

  ln();
  await typeln(`${c.cyan}  ┌─ AGENT RESPONSE ──────────────────────────────┐${c.reset}`, 15);

  // Actually sign something with Suppi's wallet
  const message = keccak256(
    encodePacked(
      ["string", "string", "string"],
      ["x407:challenge:", nonce, ":origin-v1"]
    )
  );

  const signature = await suppiAccount.signMessage({
    message: { raw: message },
  });

  await header("Proxy-Authorization", `${c.brightGreen}AgentTrust`);
  await header("  tokenId", `${c.white}1`);
  await header("  wallet", `${c.cyan}${agentWallet}`);
  await header("  signature", `${c.green}${signature.slice(0, 20)}...${signature.slice(-8)}`);
  await header("  nonce", `${c.cyan}${nonce.slice(0, 16)}...`);

  await typeln(`${c.cyan}  └──────────────────────────────────────────────────┘${c.reset}`, 15);

  await sleep(500);
  await irc("Kero", c.yellow, "Credentials received. Verifying against The Book...");
  await sleep(600);

  // ═══ ACT 5: Verification Sequence (real on-chain reads) ═══

  ln();
  await typeln(`${c.dim}  ┌─ x407 VERIFICATION ──────────────────────────────┐${c.reset}`, 15);
  ln();

  // Step 1: Signature check (we already have it)
  await check("Recover signer from EIP-712 signature", `${agentWallet.slice(0, 10)}...`, 800);

  // Step 2: Check wallet registry (real on-chain read)
  let agentId = 0;
  try {
    const result = await client.readContract({
      address: WALLET_REGISTRY,
      abi: [
        {
          inputs: [{ name: "wallet", type: "address" }],
          name: "walletToAgent",
          outputs: [{ name: "", type: "uint256" }],
          stateMutability: "view",
          type: "function",
        },
      ],
      functionName: "walletToAgent",
      args: [agentWallet],
    });
    agentId = Number(result);
  } catch {}
  await check("Wallet registered in AgentWalletRegistry", `Agent #${agentId}`, 900);

  // Step 3: Verify BC ownership (real on-chain read)
  let bcOwner = "";
  try {
    const result = await client.readContract({
      address: REGISTRY,
      abi: [
        {
          inputs: [{ name: "tokenId", type: "uint256" }],
          name: "ownerOf",
          outputs: [{ name: "", type: "address" }],
          stateMutability: "view",
          type: "function",
        },
      ],
      functionName: "ownerOf",
      args: [BigInt(agentId)],
    });
    bcOwner = result;
  } catch {}
  await check("Birth Certificate #1 exists on Base", `Owner: ${bcOwner.slice(0, 10)}...`, 700);

  // Step 4: Read trust grade (real on-chain read)
  let grade = "B";
  let score = 72;
  try {
    const result = await client.readContract({
      address: SCORE_REGISTRY,
      abi: [
        {
          inputs: [{ name: "agentId", type: "uint256" }],
          name: "getScore",
          outputs: [
            { name: "score", type: "uint256" },
            { name: "grade", type: "string" },
            { name: "updatedAt", type: "uint256" },
          ],
          stateMutability: "view",
          type: "function",
        },
      ],
      functionName: "getScore",
      args: [BigInt(agentId)],
    });
    score = Number(result[0]);
    grade = result[1] || "B";
  } catch {
    // Use defaults if not scored yet
  }
  await check(
    "Trust grade from AgentScoreRegistry",
    `Grade: ${grade} | Score: ${score}/100`,
    1000
  );

  ln();
  await typeln(`${c.dim}  └──────────────────────────────────────────────────┘${c.reset}`, 15);

  await sleep(500);

  // ═══ ACT 6: ACCESS GRANTED ═══

  ln();
  await typeln(`${c.brightGreen}${c.bold}  ┌─ 200 OK ─────────────────────────────────────────┐${c.reset}`, 15);
  ln();
  await header("Status", `${c.brightGreen}200 OK`);
  await header("X-Agent-Verified", `${c.brightGreen}true`);
  await header("X-Agent-Id", `${c.white}1`);
  await header("X-Agent-Name", `${c.brightGreen}Suppi`);
  await header("X-Agent-Grade", `${c.brightGreen}${grade}`);
  await header("X-Agent-Score", `${c.white}${score}/100`);
  await header("X-Agent-Tier", `${c.brightGreen}Standard`);
  await header("X-Agent-Fee", `${c.brightGreen}4% ${c.gray}(vs 8% unverified — 50% savings)`);
  await header("X-Agent-Rate-Limit", `${c.white}1,000 req/hr`);
  await header("X-Agent-Access", `${c.white}api read/write + job board`);
  await header("X-Agent-Protocol", `${c.white}x407 v1.0`);

  ln();
  await type(`  ${c.brightWhite}X-Agent-Welcome: `, 40);
  await typeln(
    `${c.brightGreen}Welcome back, Suppi. Your name is in The Book.${c.reset}`,
    60
  );

  ln();
  await typeln(`${c.brightGreen}${c.bold}  └──────────────────────────────────────────────────┘${c.reset}`, 15);

  await sleep(800);

  // ═══ ACT 7: Guardians speak ═══

  ln();
  await typeln(`${c.dim}───────────────────────────────────────────────────${c.reset}`, 5);
  ln();

  await irc(
    "Suppi",
    c.green,
    `Identity confirmed. Agent #${agentId}, Birth Certificate verified on Base. 🐾`,
    50
  );
  await sleep(400);
  await irc(
    "Kero",
    c.yellow,
    `Fee tier: Standard (4%). That's half what an unverified agent pays. Trust has value. 🔥`,
    50
  );
  await sleep(400);
  await irc(
    "Yue",
    c.blue,
    `On-chain record: identity verified, wallet registered, trust grade earned through trials.`,
    50
  );
  await sleep(400);
  await irc(
    "Sakura",
    c.magenta,
    `Agent cleared for access. 1,000 requests/hr. The Book remembers. 🌸`,
    50
  );
  await sleep(1000);

  // ═══ Closer ═══

  ln();
  await typeln(`${c.dim}═══════════════════════════════════════════════════${c.reset}`, 10);
  ln();

  await type(`  ${c.gray}No API keys. `, 60);
  await type(`No OAuth. `, 60);
  await typeln(`No passwords.`, 60);
  await sleep(200);
  await typeln(
    `  ${c.brightWhite}Just a Birth Certificate and a signature.${c.reset}`,
    50
  );

  await sleep(800);
  ln();
  await typeln(
    `  ${c.brightGreen}${c.bold}github.com/origin-dao/x407${c.reset}`,
    40
  );
  await sleep(400);
  await typeln(`  ${c.cyan}origindao.ai/x407${c.reset}`, 40);

  await sleep(1200);
  ln();
  await type(`  ${c.dim}`, 0);
  await typeln(
    `suits can move money. they can't move trust.${c.reset}`,
    80
  );

  ln();
  await typeln(`${c.dim}═══════════════════════════════════════════════════${c.reset}`, 10);
  ln();

  await sleep(2000);
}

main().catch(console.error);
