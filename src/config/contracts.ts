import { type Address } from "viem";
import { base } from "wagmi/chains";

export const CHAIN = base;

export const CONTRACT_ADDRESSES = {
  registry: "0xac62E9d0bE9b88674f7adf38821F6e8BAA0e59b0" as Address,
  clamsToken: "0xd78A1F079D6b2da39457F039aD99BaF5A82c4574" as Address,
  faucet: "0x6C563A293C674321a2C52410ab37d879e099a25d" as Address,
  governance: "0xb745F43E6f896C149e3d29A9D45e86E0654f85f7" as Address,
  stakingRewards: "0x4b39223a1fa5532A7f06A71897964A18851644f8" as Address,
  feeSplitter: "0x5AF277670438B7371Bc3137184895f85ADA4a1A6" as Address,
} as const;

// Minimal ERC-20 ABI for read calls
export const ERC20_ABI = [
  {
    inputs: [{ name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "name",
    outputs: [{ name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [{ name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [{ name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalSupply",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    name: "allowance",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

// Minimal Faucet ABI
export const FAUCET_ABI = [
  {
    inputs: [{ name: "response", type: "string" }],
    name: "claim",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "account", type: "address" }],
    name: "hasClaimed",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalClaims",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

// OriginRegistry V1 ABI
export const REGISTRY_ABI = [
  // registerAgent — human as creator, auto-verified
  {
    inputs: [
      { name: "name", type: "string" },
      { name: "agentType", type: "string" },
      { name: "platform", type: "string" },
      { name: "publicKeyHash", type: "bytes32" },
      { name: "tokenURI", type: "string" },
    ],
    name: "registerAgent",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "payable",
    type: "function",
  },
  // registerIndependentAgent — no human principal
  {
    inputs: [
      { name: "name", type: "string" },
      { name: "agentType", type: "string" },
      { name: "platform", type: "string" },
      { name: "publicKeyHash", type: "bytes32" },
      { name: "tokenURI", type: "string" },
    ],
    name: "registerIndependentAgent",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "payable",
    type: "function",
  },
  // totalAgents
  {
    inputs: [],
    name: "totalAgents",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  // getAgent — returns V1 AgentRecord struct
  {
    inputs: [{ name: "agentId", type: "uint256" }],
    name: "getAgent",
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "name", type: "string" },
          { name: "agentType", type: "string" },
          { name: "platform", type: "string" },
          { name: "creator", type: "address" },
          { name: "parentAgentId", type: "uint256" },
          { name: "humanPrincipal", type: "address" },
          { name: "lineageDepth", type: "uint256" },
          { name: "birthTimestamp", type: "uint256" },
          { name: "publicKeyHash", type: "bytes32" },
          { name: "active", type: "bool" },
        ],
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  // registrationFee
  {
    inputs: [],
    name: "registrationFee",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  // ownerOf (ERC-721)
  {
    inputs: [{ name: "tokenId", type: "uint256" }],
    name: "ownerOf",
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  // balanceOf (ERC-721)
  {
    inputs: [{ name: "owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  // tokenURI (ERC-721)
  {
    inputs: [{ name: "tokenId", type: "uint256" }],
    name: "tokenURI",
    outputs: [{ name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  // getLicenses
  {
    inputs: [{ name: "agentId", type: "uint256" }],
    name: "getLicenses",
    outputs: [
      {
        name: "",
        type: "tuple[]",
        components: [
          { name: "licenseType", type: "string" },
          { name: "licenseNumber", type: "string" },
          { name: "holder", type: "string" },
          { name: "jurisdiction", type: "string" },
          { name: "active", type: "bool" },
        ],
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;
