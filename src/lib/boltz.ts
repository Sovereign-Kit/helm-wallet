import { NetworkName } from './network'
import { boltzOnionUrl } from './tor'

const liquidUrl = 'https://api.boltz.exchange'
const testnetUrl = 'https://testnet.boltz.exchange/api'

export const getBoltzApiUrl = (network: NetworkName, tor = false) => {
  if (tor && network === NetworkName.Liquid) return boltzOnionUrl
  return network === NetworkName.Testnet ? testnetUrl : liquidUrl
}

export const getBoltzWsUrl = (network: NetworkName) =>
  `${getBoltzApiUrl(network, false).replace('https://', 'wss://')}/v2/ws`

export const getBoltzOnionUrl = () => boltzOnionUrl
