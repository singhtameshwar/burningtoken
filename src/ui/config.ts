import { createPublicClient, http } from 'viem'
import { polygonAmoy } from 'viem/chains'
import { createWalletClient, custom } from 'viem'

export const publicClient = createPublicClient({ 
  chain:polygonAmoy,
  transport: http()
})

export const walletClient = createWalletClient({
  chain: polygonAmoy,
  transport: custom(window.ethereum)
})





