import { useContext } from 'react'
import Button from '../../components/Button'
import ButtonsOnBottom from '../../components/ButtonsOnBottom'
import Title from '../../components/Title'
import { ConfigContext } from '../../providers/config'
import { getExplorerNames } from '../../lib/explorers'
import Select from '../../components/Select'
import Container from '../../components/Container'
import Content from '../../components/Content'
import { WalletContext } from '../../providers/wallet'

export default function Explorer() {
  const { toggleShowConfig } = useContext(ConfigContext)
  const { wallet, updateWallet } = useContext(WalletContext)

  const handleChange = (e: any) => {
    updateWallet({ ...wallet, explorer: e.target.value })
  }

  return (
    <Container>
      <Content>
        <Title text='Explorer' subtext='Choose your explorer' />
        <Select onChange={handleChange} value={wallet.explorer}>
          {getExplorerNames(wallet.network).map((e) => (
            <option key={e}>{e}</option>
          ))}
        </Select>
        <p className='mt-10'>Thor uses this to query the blockchain</p>
      </Content>
      <ButtonsOnBottom>
        <Button onClick={toggleShowConfig} label='Back to wallet' secondary />
      </ButtonsOnBottom>
    </Container>
  )
}
