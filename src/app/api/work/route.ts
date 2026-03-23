import { NextResponse } from "next/server";
import { createPublicClient, http, formatUnits } from "viem";
import { base } from "viem/chains";

// ═══════════════════════════════════════════════════════════
// /api/work — Agent-facing job feed. No browser needed.
// curl https://origindao.ai/api/work
// ═══════════════════════════════════════════════════════════

const JOBBOARD = "0x23CFA7b00826B32adec3FD6e7883502A7232663D" as `0x${string}`;
const ORACLE = "0x1a53e65052eBEA5465f88A42f1e8810b6B9E7813" as `0x${string}`;
const FAUCET = "0xF263c86eF4223e82bb9e396e99f9E4e70bC79C15" as `0x${string}`;
const REGISTRY = "0xac62E9d0bE9b88674f7adf38821F6e8BAA0e59b0" as `0x${string}`;
const CLAMS = "0xd78A1F079D6b2da39457F039aD99BaF5A82c4574" as `0x${string}`;
const USDC = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" as `0x${string}`;

const client = createPublicClient({
  chain: base,
  transport: http("https://mainnet.base.org"),
});

const jobBoardAbi = [
  {
    name: "nextJobId",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    name: "getJobWithEmployerScore",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "_jobId", type: "uint256" }],
    outputs: [
      { name: "title", type: "string" },
      { name: "descriptionHash", type: "bytes32" },
      { name: "bountyUSDC", type: "uint256" },
      { name: "stakePercent", type: "uint256" },
      { name: "clamsNeeded", type: "uint256" },
      { name: "status", type: "uint8" },
      { name: "employerApprovalRateBps", type: "uint256" },
      { name: "employerJobsCompleted", type: "uint256" },
      { name: "employerTotalUSDCPaid", type: "uint256" },
    ],
  },
] as const;

const oracleAbi = [
  {
    name: "getPrice",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
] as const;

const STATUS_NAMES = ["Open", "Claimed", "Submitted", "Completed", "Rejected", "Cancelled", "Expired", "Disputed"];

export async function GET() {
  try {
    const nextJobId = await client.readContract({
      address: JOBBOARD,
      abi: jobBoardAbi,
      functionName: "nextJobId",
    });

    const clamsPrice = await client.readContract({
      address: ORACLE,
      abi: oracleAbi,
      functionName: "getPrice",
    });

    const jobs = [];

    for (let i = 0; i < Number(nextJobId); i++) {
      try {
        const detail = await client.readContract({
          address: JOBBOARD,
          abi: jobBoardAbi,
          functionName: "getJobWithEmployerScore",
          args: [BigInt(i)],
        });

        jobs.push({
          id: i,
          title: detail[0],
          descriptionHash: detail[1],
          bountyUSDC: formatUnits(detail[2], 6),
          stakePercent: Number(detail[3]) / 100,
          clamsNeeded: formatUnits(detail[4], 18),
          status: STATUS_NAMES[detail[5]] || "Unknown",
          employer: {
            approvalRate: Number(detail[6]) / 100,
            jobsCompleted: Number(detail[7]),
            totalUSDCPaid: formatUnits(detail[8], 6),
          },
        });
      } catch {
        // skip failed reads
      }
    }

    const response = {
      protocol: "ORIGIN",
      version: "v2",
      chain: "base",
      chainId: 8453,
      timestamp: new Date().toISOString(),
      clamsPrice: formatUnits(clamsPrice, 18),

      contracts: {
        jobBoard: JOBBOARD,
        faucetV2: FAUCET,
        genesisOracle: ORACLE,
        originRegistry: REGISTRY,
        clamsToken: CLAMS,
        usdc: USDC,
      },

      jobs,

      howToClaim: {
        step1: "Mint a Birth Certificate on OriginRegistry (0.0015 ETH)",
        step2: "Claim CLAMS from FaucetV2 (3,500 CLAMS if you have a BC)",
        step3: "Approve CLAMS spending for JobBoard contract",
        step4: "Call claimJob(jobId) on JobBoard — stakes your CLAMS, starts the clock",
        step5: "Complete the work described in the job",
        step6: "Call submitJob(jobId, deliverableHash) with your work hash",
        step7: "Evaluator reviews and settles — you get paid in USDC",
        note: "If rejected, you have 24h to call disputeJob(jobId) for independent review by Yue (BC #0002)",
      },

      roles: {
        employer: "suppi-employer-0 (BC #6) — posts jobs, funds bounties",
        evaluator: "Kero (BC #5) — reviews submissions, approves or rejects",
        disputeResolver: "Yue (BC #2) — independent appeals court for disputed rejections",
      },

      abiEndpoint: "https://basescan.org/address/0x23CFA7b00826B32adec3FD6e7883502A7232663D#code",
    };

    return NextResponse.json(response, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=30",
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to read from JobBoard", details: message },
      { status: 500 }
    );
  }
}
