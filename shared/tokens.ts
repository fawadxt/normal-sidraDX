export type SwapToken = {
  symbol: string
  name: string
  address: string | null
  decimals: number
  isNative?: boolean
  wrappedAddress?: string
}

export const SIDRA_TOKENS: SwapToken[] = [
  {
    symbol: 'SDA',
    name: 'Sidra Coin',
    address: null,
    decimals: 18,
    isNative: true,
    wrappedAddress: '0xE4095a910209D7BE03B55D02F40d4554B1666182',
  },
  {
    symbol: 'WSDA',
    name: 'Wrapped SDA',
    address: '0xE4095a910209D7BE03B55D02F40d4554B1666182',
    decimals: 18,
  },
  {
    symbol: 'ECSDA',
    name: 'ECSDA',
    address: '0xb6f440a059d24ca305bce6f25115d09e9dbea653',
    decimals: 18,
  },
  {
    symbol: 'VPD',
    name: 'Dining Platform Halal',
    address: '0x345B20D4fca08376f19145C36c531A1821AF96c4',
    decimals: 18,
  },
  {
    symbol: 'MBF',
    name: 'MBF',
    address: '0xf74106911432657a24b0d85257d40f24f801cc01',
    decimals: 18,
  },
  {
    symbol: 'GACP',
    name: 'GLN Agriculture Chain',
    address: '0x99c03AF034e5b471ADb0536be65632B12492f991',
    decimals: 18,
  },
  {
    symbol: 'AIR',
    name: 'AirLand',
    address: '0x4cE5ef02F9aEbb80BB4e327F76DFb95eac1B69A6',
    decimals: 18,
  },
  {
    symbol: 'REGS',
    name: 'REGs Global',
    address: '0x2d74B8846Ffe9442B158A6767199a47c0e655038',
    decimals: 18,
  },
  {
    symbol: 'SDS',
    name: 'Sidra Digital School',
    address: '0x9bA4035871119991fC7B420873345f9be92aF146',
    decimals: 18,
  },
  {
    symbol: 'GLNs',
    name: 'Global Logistics Network',
    address: '0xE1a8FfD7280D5A278A9E8c6daFf6d391b59081B4',
    decimals: 18,
  },
  {
    symbol: 'GPC',
    name: 'GLN Property Chain',
    address: '0xd0981E59c8B51778A3b7754298614820CF08C17B',
    decimals: 18,
  },
  {
    symbol: 'SDIP',
    name: 'Sidra Insurance Platform',
    address: '0x00313151A7e74CE5108ad12c1B444ed7b458947c',
    decimals: 18,
  },
  {
    symbol: 'FEX',
    name: 'FasoCoin Exchange',
    address: '0xf7a974534D87DA63E205F087Fb9b817c0322abB3',
    decimals: 18,
  },
  {
    symbol: 'QSM',
    name: 'Qatar Sidra Mall',
    address: '0x430a8eeff93380FC1F1239d5f7f5D82c79f52858',
    decimals: 18,
  },
  {
    symbol: 'VLCP',
    name: 'VL Community Platform',
    address: '0xE7C1F17Cc6aC5CEB7f763DcE84310D2c26bDF927',
    decimals: 18,
  },
  {
    symbol: 'TAMBN',
    name: 'TRUE ISLAM',
    address: '0x62BB34f84330075F0747623390F2c69A1B99749c',
    decimals: 18,
  },
  {
    symbol: 'FARMT',
    name: 'Farm Technology Token',
    address: '0x4197589f68F83c8283901bF8d4980db8d6bAe2d8',
    decimals: 18,
  },
  {
    symbol: 'ALNS',
    name: 'African Logistics Network',
    address: '0xdc0EF76F3D82D275AaE268781a166C5Ea078C1b7',
    decimals: 18,
  },
  {
    symbol: 'IPT',
    name: 'InvestingPro Token',
    address: '0xFaDd71e410A550E62fFb72d21ead0EB6f00091EF',
    decimals: 18,
  },
  {
    symbol: 'BINV',
    name: 'BI Nouvelle Vision',
    address: '0xbE7360FE473E65a4AFee06c776440Ec2E807182f',
    decimals: 18,
  },
  {
    symbol: 'SSET',
    name: 'Sidra Secure',
    address: '0xB74E6f176E25EBd3f7e948be85c47F52CcAf472F',
    decimals: 18,
  },
  {
    symbol: 'XEN',
    name: 'Xentra DSC',
    address: '0x53167fF5810ff1886FC554E672994C232126383E',
    decimals: 18,
  },
  {
    symbol: 'SDO',
    name: 'Success of the Orphans',
    address: '0xc1e3D68f2C214617c102313C9D23864e3eA1618f',
    decimals: 18,
  },
  {
    symbol: 'SSMI',
    name: 'Sidra SkillChain Mission',
    address: '0x35CFA566301D239823e13A922116e55aEDb37D2D',
    decimals: 18,
  },
  {
    symbol: 'SGHC',
    name: 'Sidra Global Healthcare',
    address: '0xEEd87C64D1650A824F8589adcB76a13A692E2EA8',
    decimals: 18,
  },
  {
    symbol: 'HGM',
    name: 'Hardware Global Trade Platform',
    address: '0x9393e3Cff4c010091BbF4De48F64417F0812BDbd',
    decimals: 18,
  },
  {
    symbol: 'JSFT',
    name: 'Jakar Sharhi',
    address: '0xB4aC5dd62F700E271bffb52aeae1dba40135427f',
    decimals: 18,
  },
  {
    symbol: 'DMCS',
    name: 'Digital Marketing Channels',
    address: '0x8F2E99691855a5663beb39dEB9075f28b3dcc51b',
    decimals: 18,
  },
  {
    symbol: 'SAHBA',
    name: 'Shababulkhair Halal Investment',
    address: '0x482BE7b5c3C9Aa16B4e9967eD2c08bF1097Ae370',
    decimals: 18,
  },
]

export const WSDA_ADDRESS = '0xE4095a910209D7BE03B55D02F40d4554B1666182'

export function getTokenBySymbol(symbol: string): SwapToken | undefined {
  return SIDRA_TOKENS.find((t) => t.symbol === symbol)
}
