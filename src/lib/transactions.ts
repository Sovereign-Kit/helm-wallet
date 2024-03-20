import { Utxo } from './types'
import { getBalance, getMnemonicKeys } from './wallet'
import { Wallet } from '../providers/wallet'
import { selectCoins } from './coinSelection'
import {
  AssetHash,
  Creator,
  Extractor,
  Finalizer,
  Pset,
  Signer,
  Transaction,
  Updater,
  address,
  networks,
  script,
} from 'liquidjs-lib'
import { generateAddress } from './address'
import zkpInit from '@vulpemventures/secp256k1-zkp'
import { satoshiToConfidentialValue } from 'liquidjs-lib/src/confidential'
import { blindPset } from './blinder'

const feePerInput = 273

export const feesToSendSats = (sats: number, wallet: Wallet): number => {
  if (sats === 0) return 0
  const coins = selectCoins(sats, wallet.utxos[wallet.network])
  return feePerInput * coins.length // TODO
}

export const sendSats = async (sats: number, destinationAddress: string, wallet: Wallet): Promise<string> => {
  // check if enough balance
  const utxos = wallet.utxos[wallet.network]
  const balance = getBalance(wallet)
  if (!balance || balance - sats - utxos.length * feePerInput < 0) return ''

  // find best coins combo to pay this
  const iterator = (amount: number): { change: number; coins: Utxo[]; txfee: number } => {
    const coins = selectCoins(amount, utxos)
    const value = coins.reduce((prev, curr) => prev + curr.value, 0)
    const txfee = coins.length * feePerInput
    const change = value - amount - txfee
    console.log('amount, value, txfee, change', amount, value, txfee, change)
    if (change < 0) return iterator(amount + txfee)
    return { change, coins, txfee }
  }

  const { change, coins, txfee } = iterator(sats)
  coins.map((coin) => console.log('coin', { ...coin, value: satoshiToConfidentialValue(coin.value) }))
  const network = networks[wallet.network]

  const pset = Creator.newPset()
  const updater = new Updater(pset)

  updater
    .addInputs(
      coins.map((coin) => ({
        txid: coin.txid,
        txIndex: coin.vout,
        witnessUtxo: { ...coin, value: satoshiToConfidentialValue(coin.value) },
        sighashType: Transaction.SIGHASH_ALL,
      })),
    )
    .addOutputs([
      // send to boltz
      {
        amount: sats,
        asset: network.assetHash,
        script: address.toOutputScript(destinationAddress, network),
      },
      // network fees
      {
        amount: txfee,
        asset: network.assetHash,
      },
    ])

  if (change) {
    updater.addOutputs([
      {
        amount: change,
        asset: network.assetHash,
        script: (await generateAddress(wallet)).script,
      },
    ])
  }

  console.log('pset input', pset.inputs[0])

  const blindedPset = await blindPset(pset, {
    index: 0,
    value: coins[0].value.toString(),
    valueBlindingFactor: Buffer.from(coins[0].valueBlindingFactor, 'hex'),
    asset: AssetHash.fromHex(coins[0].asset).bytesWithoutPrefix,
    assetBlindingFactor: Buffer.from(coins[0].assetBlindingFactor, 'hex'),
  })

  const signer = new Signer(blindedPset)
  const ecc = (await zkpInit()).ecc
  const keys = await getMnemonicKeys(wallet)

  for (const [index] of signer.pset.inputs.entries()) {
    const sighash = Transaction.SIGHASH_ALL
    const signature = keys.sign(pset.getInputPreimage(index, sighash))
    console.log('pset.getInputPreimage(index, sighash)', pset.getInputPreimage(index, sighash))
    console.log('signature', signature)
    signer.addSignature(
      index,
      {
        partialSig: {
          pubkey: coins[index].pubkey,
          signature: script.signature.encode(signature, sighash),
        },
      },
      Pset.ECDSASigValidator(ecc),
    )
  }

  const finalizer = new Finalizer(signer.pset)
  finalizer.finalize()
  const txHex = Extractor.extract(finalizer.pset).toHex()

  console.log('sendSats', sats, destinationAddress, coins, change, txfee)
  console.log('txHex', txHex)
  return 'b29d036678113b2671a308496f06b1665d23ab16b5af8cd126cc8a2273353774' // TODO
}
