import { address, type Address } from "@solana/kit";
import {
  findFixedDelegationPda,
  findSubscriptionAuthorityPda,
  SUBSCRIPTIONS_PROGRAM_ADDRESS
} from "@solana/subscriptions";
import type { AllowancePolicy, DerivedAllowanceAddresses } from "./types.js";

export const TOKEN_PROGRAM_ADDRESS = address(
  "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
);

export const USDC_MAINNET_MINT = address(
  "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
);

export async function deriveAllowanceAddresses(
  policy: Pick<AllowancePolicy, "delegator" | "agent" | "tokenMint" | "nonce">
): Promise<DerivedAllowanceAddresses> {
  const [subscriptionAuthority] = await findSubscriptionAuthorityPda({
    user: policy.delegator,
    tokenMint: policy.tokenMint
  });

  const [fixedDelegation] = await findFixedDelegationPda({
    subscriptionAuthority,
    delegator: policy.delegator,
    delegatee: policy.agent,
    nonce: policy.nonce
  });

  return {
    subscriptionsProgram: SUBSCRIPTIONS_PROGRAM_ADDRESS,
    subscriptionAuthority,
    fixedDelegation
  };
}

export function envAddress(name: string, fallback: Address): Address {
  return address(process.env[name] ?? fallback);
}

export function envBigInt(name: string, fallback: bigint): bigint {
  const raw = process.env[name];
  return raw == null || raw.trim() === "" ? fallback : BigInt(raw);
}

export function envNumber(name: string, fallback: number): number {
  const raw = process.env[name];
  return raw == null || raw.trim() === "" ? fallback : Number(raw);
}
