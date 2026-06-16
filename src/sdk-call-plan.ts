import type { Address } from "@solana/kit";
import type { AllowancePolicy, DerivedAllowanceAddresses } from "./types.js";
import { TOKEN_PROGRAM_ADDRESS } from "./solana.js";

export type SdkCallPlan = {
  step: string;
  sdkCall: string;
  params: Record<string, string>;
};

export function buildSdkCallPlan(
  policy: AllowancePolicy,
  addresses: DerivedAllowanceAddresses
): SdkCallPlan[] {
  return [
    {
      step: "Initialize the per-user, per-mint SubscriptionAuthority PDA.",
      sdkCall:
        "client.subscriptions.instructions.initSubscriptionAuthority(...).sendTransaction()",
      params: stringifyParams({
        tokenMint: policy.tokenMint,
        userAta: "<delegator token ATA>",
        tokenProgram: TOKEN_PROGRAM_ADDRESS
      })
    },
    {
      step: "Create a fixed delegation that gives the agent a bounded allowance.",
      sdkCall:
        "client.subscriptions.instructions.createFixedDelegation(...).sendTransaction()",
      params: stringifyParams({
        tokenMint: policy.tokenMint,
        delegatee: policy.agent,
        subscriptionAuthority: addresses.subscriptionAuthority,
        delegationAccount: addresses.fixedDelegation,
        nonce: policy.nonce,
        amount: policy.allowanceUnits,
        expiryTs: policy.expiryTs
      })
    },
    {
      step: "Let the agent pull tokens only after the local policy engine approves the spend.",
      sdkCall:
        "client.subscriptions.instructions.transferFixed(...).sendTransaction()",
      params: stringifyParams({
        delegationPda: addresses.fixedDelegation,
        subscriptionAuthority: addresses.subscriptionAuthority,
        delegatorAta: "<delegator token ATA>",
        receiverAta: "<receiver token ATA>",
        tokenMint: policy.tokenMint,
        tokenProgram: TOKEN_PROGRAM_ADDRESS,
        delegatee: policy.agent
      })
    }
  ];
}

function stringifyParams(params: Record<string, Address | bigint | string>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(params).map(([key, value]) => [key, value.toString()])
  );
}
