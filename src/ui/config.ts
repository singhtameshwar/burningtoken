import { createPublicClient, http } from 'viem'
import { abstractTestnet } from 'viem/chains'
import { createWalletClient, custom } from 'viem'

export const publicClient = createPublicClient({ 
  chain:abstractTestnet,
  transport: http()
})

export const walletClient =
  typeof window !== "undefined" && window.ethereum
    ? createWalletClient({
        chain: abstractTestnet,
        transport: custom(window.ethereum),
      })
    : null;






