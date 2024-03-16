import { useContext } from 'react'
import Button from '../../../components/Button'
import { NavigationContext, Pages } from '../../../providers/navigation'
import { FlowContext, emptySendInfo } from '../../../providers/flow'
import Content from '../../../components/Content'
import Title from '../../../components/Title'
import Container from '../../../components/Container'
import ButtonsOnBottom from '../../../components/ButtonsOnBottom'
import InvoiceDetails from '../../../components/InvoiceDetails'

export default function SendDetails() {
  const { navigate } = useContext(NavigationContext)
  const { sendInfo, setSendInfo } = useContext(FlowContext)

  const handleContinue = () => navigate(Pages.SendFees)

  const handleCancel = () => {
    setSendInfo(emptySendInfo)
    navigate(Pages.Wallet)
  }

  return (
    <Container>
      <Content>
        <Title text='Invoice details' />
        <InvoiceDetails invoice={sendInfo.invoice} />
      </Content>
      <ButtonsOnBottom>
        <Button onClick={handleContinue} label='Continue' />
        <Button onClick={handleCancel} label='Cancel' secondary />
      </ButtonsOnBottom>
    </Container>
  )
}
