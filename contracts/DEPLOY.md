# Deploy SidraFeeRouter on Sidra Chain

This contract collects your tiered platform fee automatically inside one swap transaction.

- **1%** when swap notional is under **300 SDA**
- **1.5%** when swap notional is **300–500 SDA**
- **2%** when swap notional is **500 SDA or more**

## Before you start

1. **Deploy wallet** with some **SDA** for gas (MetaMask or SafePal)
2. **Fee wallet address** — where fees should go (`0xYourFeeWallet...`)
3. These Sidra addresses (already used by SidraDX):

| Name | Address |
|------|---------|
| Sidra swap pool | `0xF4B3E8281e1Af643c6Db379FDE67938a4Ce1F822` |
| WSDA | `0xE4095a910209D7BE03B55D02F40d4554B1666182` |

## Step 1 — Open Remix

1. Go to [https://remix.ethereum.org](https://remix.ethereum.org)
2. Create file: `contracts/SidraFeeRouter.sol`
3. Copy all code from `contracts/SidraFeeRouter.sol` in this repo
4. Compile with **Solidity 0.8.20+**
5. **Important (Sidra Chain):** set **EVM Version = paris** in the compiler panel  
   - Default **shanghai** uses `PUSH0`, which Sidra Chain rejects → deploy shows `transaction execution failed` and gas is still charged  
   - After changing to **paris**, click **Compile SidraFeeRouter.sol** again

## Step 2 — Connect Sidra Chain

In MetaMask / SafePal add network:

- **Network name:** Sidra Chain
- **RPC URL:** `https://node.sidrachain.com`
- **Chain ID:** `97453`
- **Currency:** SDA

## Step 3 — Deploy

1. Remix → **Deploy & Run Transactions**
2. **Environment:** Injected Provider (MetaMask / SafePal)
3. **Contract:** `SidraFeeRouter`
4. **Constructor arguments:**

```
_sidraSwap:     0xF4B3E8281e1Af643c6Db379FDE67938a4Ce1F822
_wsda:          0xE4095a910209D7BE03B55D02F40d4554B1666182
_feeRecipient:  0xf5cc15904c33E392a0e50d965e1BcC52b5530e86
```

5. **Gas limit:** turn off auto and set **`1200000`** (~0.6 SDA fee; enough for this contract on paris EVM)
6. Click **Deploy** and confirm in wallet
7. Copy the **contract address** shown under "Deployed Contracts"

That address is your **FEE_ROUTER_ADDRESS**.

## Step 4 — Connect SidraDX app

### Vercel / backend env

```
FEE_ROUTER_ADDRESS=0xYourDeployedRouterAddress
SWAP_FEE_RECIPIENT=0xYourFeeWalletAddress
```

### Frontend env (rebuild required)

```
VITE_FEE_ROUTER_ADDRESS=0xYourDeployedRouterAddress
VITE_SWAP_FEE_RECIPIENT=0xYourFeeWalletAddress
```

Redeploy on Vercel, then hard refresh the site (`Ctrl + Shift + R`).

When `FEE_ROUTER_ADDRESS` is set, swaps use **one transaction** and fees go to your wallet automatically.

Without the router address, the app falls back to the old **separate fee payment** flow.

## Step 5 — Test with a small swap

1. Connect wallet on SidraDX
2. Swap a small amount (e.g. 1 SDA → token)
3. Confirm **one** wallet popup (not two)
4. Check your fee wallet received the fee in SDA (buy) or WSDA (sell)

## Owner functions

The wallet that deployed the contract is **owner** and can call:

- `setFeeRecipient(newAddress)` — change fee wallet later

## Security notes

- Deploy from a wallet you control
- Test small amounts first
- Never share seed phrase / private key
- Contract code cannot be changed after deploy — updates need a new deploy + new address
