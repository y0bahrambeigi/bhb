# Security policy

This repository is an educational Sepolia prototype and has not received an
independent professional audit. Do not deploy it to Ethereum mainnet or use it
to hold financial value without an independent audit, legal review, and a
documented governance and key-management process.

## Key-management rules

- Never commit a private key, seed phrase, RPC secret, or API key.
- Store Hardhat configuration variables in its encrypted keystore.
- Use a dedicated Sepolia-only wallet while testing.
- For any production design, replace a single externally owned owner account
  with an audited multisignature wallet and a timelock where appropriate.

## Privileged operations

The owner can pause/unpause all token movement and mint up to 20,000,000
additional BHB over the contract lifetime. Ownership transfer is a two-step
process. These powers are transparent but centralized and must be disclosed to
all users. The contract rejects ownership renunciation while paused so the
token cannot be left permanently frozen by that action.

## Dependency audit

The locked development dependency tree has no known high or moderate findings
at the time of the v1.1.0 validation. Remaining low-severity notices originate
from an indirect legacy elliptic dependency used by the Hardhat verification
tooling, have no upstream fix, and are not shipped to or executed by the static
dashboard or the deployed smart contract.
