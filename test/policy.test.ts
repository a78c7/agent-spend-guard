import { address } from "@solana/kit";
import { describe, expect, it } from "vitest";
import {
  applySpendDecision,
  createInitialState,
  evaluateSpendRequest,
  formatBaseUnits
} from "../src/policy.js";
import type { AllowancePolicy } from "../src/types.js";

const policy: AllowancePolicy = {
  delegator: address("So11111111111111111111111111111111111111112"),
  agent: address("De1egAFMkMWZSN5rYXRj9CAdheBamobVNubTsi9avR44"),
  receiver: address("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
  tokenMint: address("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"),
  tokenDecimals: 6,
  nonce: 1n,
  allowanceUnits: 10_000_000n,
  expiryTs: 2_000n
};

describe("fixed allowance policy", () => {
  it("approves a spend inside the budget and expiry", () => {
    const state = createInitialState();
    const decision = evaluateSpendRequest(policy, state, {
      id: "ok",
      amountUnits: 2_000_000n,
      purpose: "approved spend",
      requestedAtTs: 1_500n
    });

    expect(decision.ok).toBe(true);
    const nextState = applySpendDecision(state, decision);
    expect(nextState.spentUnits).toBe(2_000_000n);
  });

  it("rejects a spend over the remaining allowance", () => {
    const state = { spentUnits: 9_000_000n };
    const decision = evaluateSpendRequest(policy, state, {
      id: "too-large",
      amountUnits: 2_000_000n,
      purpose: "overspend",
      requestedAtTs: 1_500n
    });

    expect(decision.ok).toBe(false);
    expect(decision.reason).toContain("exceeds");
  });

  it("rejects a spend after expiry", () => {
    const decision = evaluateSpendRequest(policy, createInitialState(), {
      id: "late",
      amountUnits: 1_000_000n,
      purpose: "late spend",
      requestedAtTs: 2_001n
    });

    expect(decision.ok).toBe(false);
    expect(decision.reason).toContain("expired");
  });

  it("formats token base units", () => {
    expect(formatBaseUnits(10_500_000n, 6)).toBe("10.5");
    expect(formatBaseUnits(1_000_000n, 6)).toBe("1");
  });
});
