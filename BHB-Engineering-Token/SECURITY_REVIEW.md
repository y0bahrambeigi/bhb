# BHB Automated Security Review

Review date: 2026-08-21 (UTC)  
Scope: BHB Engineering Token v1.1.0 working tree prepared for PR #14  
Contract SHA-256: `cd383585bce3319fbf9f66b34e16cf1b4f324d0bd6cca18ad3575295bb141b0e`

## Decision

The reviewed code is suitable for a **Sepolia-only pilot after multisig ownership and explorer verification**. It is not approved for a public sale or Mainnet deployment. No Critical or High code vulnerability was identified by the checks below, but this review is internal and automated and is not an independent third-party audit.

## Evidence

| Control | Result |
|---|---|
| Solidity 0.8.28 forced compile | Passed; no compiler warning |
| TypeScript typecheck | Passed |
| Mocha tests | 13/13 passed |
| Contract line coverage | 100% |
| Contract statement coverage | 100% |
| Lifetime mint/supply invariant sequence | Passed |
| Zero owner/recipient cases | Passed |
| Paused revert atomicity | Passed |
| Dangerous-pattern search | No `delegatecall`, `selfdestruct`, `tx.origin`, assembly, unchecked block or low-level call found |
| npm audit | 0 Critical, 0 High, 0 Moderate, 11 Low |
| Dedicated Solidity static analyzer | Not available in this environment |
| Independent manual audit | Not yet completed |

## Positive controls

- OpenZeppelin 5.6.1 implementations are pinned in the lockfile;
- maximum supply is immutable in deployed bytecode;
- additional mint allowance is cumulative and is not restored by burns;
- pause applies to transfer, mint and burn through `_update`;
- only the owner controls mint/pause/unpause;
- ownership transfer requires nomination and acceptance;
- the contract is non-upgradeable and has no transfer tax, blacklist or arbitrary external call;
- deployment can set a Safe as initial owner.

## Findings and readiness gates

### GOV-01 — Centralised privileged control until Safe activation

Severity: High governance risk; not a code exploit.  
Impact: a single owner can pause all transfers and mint the remaining allowance.  
Required action: deploy with a verified 3-of-5 Sepolia Safe as `initialOwner`, or complete the two-step transfer before distributing pilot tokens. Publish the Safe address, owners and threshold.

### GOV-02 — No on-chain delay or rate limit below the lifetime cap

Severity: Medium governance risk.  
Impact: the owner can mint the full remaining 20 million BHB in one transaction. The contract enforces the lifetime cap but not the policy notice period or 90-day limit.  
Required action: enforce the published policy operationally for Sepolia. Before Mainnet, independently review whether a timelock or dedicated mint controller should enforce it on-chain.

### OPS-01 — Ownership renunciation can permanently remove emergency powers

Severity: Low operational risk.  
Impact: `renounceOwnership()` is blocked while paused but remains possible while active; after renunciation, mint, pause and unpause are permanently unavailable.  
Required action: multisig policy prohibits renunciation. Any proposal containing the renunciation selector must be rejected and treated as a security incident.

### DEP-01 — Low-severity development dependency advisory

Severity: Low supply-chain risk.  
Evidence: npm reports 11 Low findings in a transitive `elliptic` path used by Hardhat verification tooling; no High/Moderate/Critical finding and no upstream fix for the affected path at review time.  
Required action: keep signing keys in Hardhat keystore, run deployment only on a trusted machine, pin lockfile hashes, monitor upstream releases, and rerun `npm audit` before deployment.

### AUD-01 — Independent third-party audit outstanding

Severity: Release gate.  
Impact: an internal review cannot establish independence or eliminate reviewer blind spots.  
Required action: commission the scope in `docs/INDEPENDENT_AUDIT_RFP_FA.md`, publish the report and retest fixes before Mainnet or public sale.

## Limitations

This review did not create or sign blockchain transactions, test a live Safe, verify source on Etherscan, perform economic market analysis, or issue a legal opinion. The unavailable Codex deep-scan server and dedicated Solidity static analyzer are recorded limitations. Absence of an identified finding is not proof of absence of vulnerabilities.
