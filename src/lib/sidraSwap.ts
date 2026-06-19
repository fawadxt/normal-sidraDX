import { encodeFunctionData, type Address, type Hex } from 'viem'

export const SIDRA_SWAP_ADDRESS =
  '0xF4B3E8281e1Af643c6Db379FDE67938a4Ce1F822' as const

export const SIDRA_SWAP_BUY_SELECTOR = '0xdde6379f' as Hex
export const SIDRA_SWAP_SELL_SELECTOR = '0x968e7276' as Hex

export function encodeSidraBuyCall(
  token: Address,
  slippageParam: bigint,
  minOut: bigint,
  deadline: bigint,
): Hex {
  const encoded = encodeFunctionData({
    abi: [
      {
        name: 'sidraBuy',
        type: 'function',
        inputs: [
          { type: 'address' },
          { type: 'uint256' },
          { type: 'uint256' },
          { type: 'uint256' },
        ],
        outputs: [],
      },
    ],
    functionName: 'sidraBuy',
    args: [token, slippageParam, minOut, deadline],
  })

  return `${SIDRA_SWAP_BUY_SELECTOR}${encoded.slice(10)}` as Hex
}

export function encodeSidraSellCall(
  token: Address,
  amountIn: bigint,
  slippageParam: bigint,
  minOut: bigint,
  deadline: bigint,
): Hex {
  const encoded = encodeFunctionData({
    abi: [
      {
        name: 'sidraSell',
        type: 'function',
        inputs: [
          { type: 'address' },
          { type: 'uint256' },
          { type: 'uint256' },
          { type: 'uint256' },
          { type: 'uint256' },
        ],
        outputs: [],
      },
    ],
    functionName: 'sidraSell',
    args: [token, amountIn, slippageParam, minOut, deadline],
  })

  return `${SIDRA_SWAP_SELL_SELECTOR}${encoded.slice(10)}` as Hex
}
