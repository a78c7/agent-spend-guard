# Submission Notes

## Suggested title

AgentSpend Guard: bounded Solana allowances for AI-agent operating budgets

## Public repository description

AgentSpend Guard demonstrates how Solana native subscriptions and allowances
can give AI agents limited, expiring token budgets without handing them full
wallet custody. The demo uses the official `@solana/subscriptions` SDK to derive
SubscriptionAuthority and FixedDelegation PDAs, then runs a local policy engine
that approves or rejects agent spend requests before mapping approved spends to
`transferFixed`.

## Bounty requirement mapping

- Public GitHub repository: publish this directory as the repo.
- README: included.
- Code sample: `src/demo.ts`, `src/policy.ts`, `src/solana.ts`,
  `src/sdk-call-plan.ts`.
- Useful execution: `npm run check` produces deterministic dry-run output and
  verifies the policy rules with tests.
- AI-agent relevance: the demo models an AI agent buying API credits or service
  capacity from a fixed user-approved allowance.
- Originality: the use case focuses on agent operating budgets rather than a
  standard consumer subscription.
- Optional demo video: record `npm run check`, explain the PDA derivation, then
  walk through the three spend requests.

## Recommended demo video script

1. Introduce the problem: AI agents need budgets, but unrestricted wallets are
   unsafe.
2. Show the README architecture diagram.
3. Run `npm install` and `npm run check`.
4. Point out the SubscriptionAuthority PDA and FixedDelegation PDA in the JSON
   output.
5. Explain the three spend requests:
   - first is approved;
   - second exceeds the remaining allowance;
   - third is after expiry.
6. Show `src/sdk-call-plan.ts` and explain how the dry-run maps to the official
   SDK methods.
7. Close with the live devnet extension path.

## Suggested social post

I built AgentSpend Guard for the Solana Native Subscriptions & Allowances bounty.
It shows how an AI agent can receive a bounded, expiring token allowance instead
of unrestricted wallet custody. The demo derives SubscriptionAuthority and
FixedDelegation PDAs with the official SDK, then runs policy checks before each
agent spend.

## Remaining human steps

1. Create a public GitHub repository and push this directory.
2. Optionally add a short screen recording.
3. Submit the GitHub link and optional video link on Superteam Earn.
4. Use your own wallet/session for submission; do not share private keys with
   automation or AI tooling.
