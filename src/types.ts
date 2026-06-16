import type { Address } from "@solana/kit";

export type AllowancePolicy = {
  delegator: Address;
  agent: Address;
  receiver: Address;
  tokenMint: Address;
  tokenDecimals: number;
  nonce: bigint;
  allowanceUnits: bigint;
  expiryTs: bigint;
};

export type AllowanceState = {
  spentUnits: bigint;
};

export type SpendRequest = {
  id: string;
  amountUnits: bigint;
  purpose: string;
  requestedAtTs: bigint;
};

export type SpendDecision =
  | {
      ok: true;
      request: SpendRequest;
      remainingBeforeUnits: bigint;
      remainingAfterUnits: bigint;
      reason: string;
    }
  | {
      ok: false;
      request: SpendRequest;
      remainingBeforeUnits: bigint;
      reason: string;
    };

export type DerivedAllowanceAddresses = {
  subscriptionsProgram: Address;
  subscriptionAuthority: Address;
  fixedDelegation: Address;
};
