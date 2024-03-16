import { Config } from '../providers/config'
import { Wallet } from '../providers/wallet'
import { generateAddress } from './address'
import { unblindOutput } from './blinder'
import { fetchAddress, fetchUtxos } from './explorers'
import { Utxo } from './types'
import * as liquid from 'liquidjs-lib'

export const getUtxos = async (config: Config, wallet: Wallet, defaultGap = 5): Promise<Utxo[]> => {
  const utxos: Utxo[] = []
  for (let chain = 1; chain < 2; chain++) {
    // TODO: cycle makes sense?
    let index = 0
    let gap = defaultGap
    while (gap > 0) {
      const { address, blindingKeys } = await generateAddress(wallet, index, chain)
      if (!address) throw new Error('Could not generate new address')
      const data = await fetchAddress(address, config)
      if (data?.chain_stats?.tx_count > 0) {
        gap = defaultGap // resets gap
        for (const utxo of await fetchUtxos(address, config)) {
          const unblinded = await unblindOutput(utxo.txid, utxo.vout, blindingKeys, config)
          utxos.push({ ...utxo, ...unblinded, address, value: Number(unblinded.value) })
        }
      }
      index += 1
      gap -= 1
    }
  }
  const lbtc = liquid.networks[config.network].assetHash
  return utxos.filter((utxo) => utxo.asset.reverse().toString('hex') === lbtc)
}
