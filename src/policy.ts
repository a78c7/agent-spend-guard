import type {
  AllowancePolicy,
  AllowanceState,
  SpendDecision,
  SpendRequest
} from "./types.js";

export function createInitialState(): AllowanceState {
  return { spentUnits: 0n };
}

export function evaluateSpendRequest(
  policy: AllowancePolicy,
  state: AllowanceState,
  request: SpendRequest
): SpendDecision {
  const remainingBeforeUnits = policy.allowanceUnits - state.spentUnits;

  if (request.amountUnits <= 0n) {
    return {
      ok: false,
      request,
      remainingBeforeUnits,
      reason: "Rejected: amount must be positive."
    };
  }

  if (request.requestedAtTs > policy.expiryTs) {
    return {
      ok: false,
      request,
      remainingBeforeUnits,
      reason: "Rejected: fixed delegation is expired."
    };
  }

  if (request.amountUnits > remainingBeforeUnits) {
    return {
      ok: false,
      request,
      remainingBeforeUnits,
      reason: "Rejected: request exceeds remaining fixed allowance."
    };
  }

  return {
    ok: true,
    request,
    remainingBeforeUnits,
    remainingAfterUnits: remainingBeforeUnits - request.amountUnits,
    reason: "Approved: request is within amount limit and expiry window."
  };
}

export function applySpendDecision(
  state: AllowanceState,
  decision: SpendDecision
): AllowanceState {
  if (!decision.ok) return state;
  return {
    spentUnits: state.spentUnits + decision.request.amountUnits
  };
}

export function formatBaseUnits(units: bigint, decimals: number): string {
  const sign = units < 0n ? "-" : "";
  const abs = units < 0n ? -units : units;
  const scale = 10n ** BigInt(decimals);
  const whole = abs / scale;
  const fraction = (abs % scale).toString().padStart(decimals, "0");
  const trimmedFraction = fraction.replace(/0+$/, "");
  return `${sign}${whole.toString()}${trimmedFraction ? `.${trimmedFraction}` : ""}`;
}

export function bigintJsonReplacer(_key: string, value: unknown): unknown {
  return typeof value === "bigint" ? value.toString() : value;
}
