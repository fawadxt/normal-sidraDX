import { Router } from 'express'

import { SIDRA_TOKENS } from '../config/tokens.js'

import type { AppConfig } from '../types.js'



export const configRouter = Router()



configRouter.get('/', (_req, res) => {

  const feeRecipient = process.env.SWAP_FEE_RECIPIENT?.trim() || null

  const isValidRecipient =

    !!feeRecipient && feeRecipient.startsWith('0x') && feeRecipient.length === 42



  const routerAddress = process.env.SWAP_ROUTER_ADDRESS?.trim() || null

  const isValidRouter =

    !!routerAddress && routerAddress.startsWith('0x') && routerAddress.length === 42

  const sidraSwapAddress =
    process.env.SIDRA_SWAP_CONTRACT?.trim() || '0xF4B3E8281e1Af643c6Db379FDE67938a4Ce1F822'

  const isValidSidraSwap =

    !!sidraSwapAddress && sidraSwapAddress.startsWith('0x') && sidraSwapAddress.length === 42



  const config: AppConfig = {

    chainId: Number(process.env.CHAIN_ID ?? 97453),

    chainName: process.env.CHAIN_NAME ?? 'Sidra Chain',

    swapFeeAmount: process.env.SWAP_FEE_AMOUNT ?? '0.1',

    swapFeeRecipient: isValidRecipient ? feeRecipient : null,

    exchangeRate: Number(process.env.SWAP_EXCHANGE_RATE ?? 2.5),

    tokenAddress:

      process.env.TARGET_TOKEN_ADDRESS ?? '0xE4095a910209D7BE03B55D02F40d4554B1666182',

    routerAddress: isValidRouter ? routerAddress : null,

    sidraSwapAddress: isValidSidraSwap ? sidraSwapAddress : null,

    slippageBps: Number(process.env.SWAP_SLIPPAGE_BPS ?? 100),

    tokens: SIDRA_TOKENS.map(({ symbol, name, address, decimals, isNative }) => ({

      symbol,

      name,

      address,

      decimals,

      isNative,

    })),

  }



  res.json(config)

})

