import { address } from "@solana/kit";
import { applySpendDecision, bigintJsonReplacer, createInitialState, evaluateSpendRequest, formatBaseUnits } from "./policy.js";
import { deriveAllowanceAddresses, envAddress, envBigInt, envNumber, USDC_MAINNET_MINT } from "./solana.js";
import { buildSdkCallPlan } from "./sdk-call-plan.js";
import type { AllowancePolicy, SpendDecision } from "./types.js";

const DEFAULT_DELEGATOR = address("So11111111111111111111111111111111111111112");
const DEFAULT_AGENT = address("De1egAFMkMWZSN5rYXRj9CAdheBamobVNubTsi9avR44");
const DEFAULT_RECEIVER = address("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");

async function main(): Promise<void> {
  const nowTs = BigInt(Math.floor(Date.now() / 1000));

  const policy: AllowancePolicy = {
    delegator: envAddress("DELEGATOR_ADDRESS", DEFAULT_DELEGATOR),
    agent: envAddress("AGENT_ADDRESS", DEFAULT_AGENT),
    receiver: envAddress("RECEIVER_ADDRESS", DEFAULT_RECEIVER),
    tokenMint: envAddress("TOKEN_MINT", USDC_MAINNET_MINT),
    tokenDecimals: envNumber("TOKEN_DECIMALS", 6),
    nonce: envBigInt("NONCE", 42n),
    allowanceUnits: envBigInt("ALLOWANCE_UNITS", 10_000_000n),
    expiryTs: nowTs + envBigInt("TTL_SECONDS", 3600n)
  };

  const addresses = await deriveAllowanceAddresses(policy);
  const sdkCallPlan = buildSdkCallPlan(policy, addresses);

  let state = createInitialState();
  const decisions: SpendDecision[] = [];

  for (const request of [
    {
      id: "agent-indexer-credits",
      amountUnits: 2_500_000n,
      purpose: "Buy API credits for an agent-run customer support indexer.",
      requestedAtTs: nowTs + 60n
    },
    {
      id: "oversized-model-upgrade",
      amountUnits: 8_000_000n,
      purpose: "Upgrade to a larger model tier without a fresh human approval.",
      requestedAtTs: nowTs + 120n
    },
    {
      id: "late-retry",
      amountUnits: 1_000_000n,
      purpose: "Retry after the fixed delegation window has expired.",
      requestedAtTs: policy.expiryTs + 1n
    }
  ]) {
    const decision = evaluateSpendRequest(policy, state, request);
    decisions.push(decision);
    state = applySpendDecision(state, decision);
  }

  const summary = {
    concept: "A user grants an AI agent a fixed Solana token allowance with an expiry. The agent can pull funds only when the policy engine approves the spend and the on-chain delegation still permits it.",
    subscriptionsProgram: addresses.subscriptionsProgram,
    tokenMint: policy.tokenMint,
    allowance: `${formatBaseUnits(policy.allowanceUnits, policy.tokenDecimals)} tokens`,
    finalSpent: `${formatBaseUnits(state.spentUnits, policy.tokenDecimals)} tokens`,
    finalRemaining: `${formatBaseUnits(policy.allowanceUnits - state.spentUnits, policy.tokenDecimals)} tokens`,
    addresses,
    decisions,
    sdkCallPlan
  };

  console.log(JSON.stringify(summary, bigintJsonReplacer, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
