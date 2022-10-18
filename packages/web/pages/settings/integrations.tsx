import { styled } from '@stitches/react'
import { Toaster } from 'react-hot-toast'
import { Box, HStack, VStack } from '../../components/elements/LayoutPrimitives'
import { PrimaryLayout } from '../../components/templates/PrimaryLayout'
import { applyStoredTheme } from '../../lib/themeUpdater'

// Styles
const Header = styled(Box, {
  width: '100%',
  color: '$utilityTextDefault',
  fontSize: 'x-large',
  margin: '10px',
})

const Para = styled(Box, {
  width: '100%',
  padding: '20px',
  color: '$utilityTextDefault',
  borderBottom: '0.5px solid $utilityTextDefault',
})

const IntegrationsCard = styled(Box, {
  width: '100%',
  borderRadius: '5px',
  height: '100px',
  backgroundColor: '$grayBg',
})

const IntegrationBrand = styled(Box, {
  height: '100%',
  border: '1px solid green',
  width: '10%',
})

//interface
interface Integrations {
  id: string
}

type integrationsCard = {
  icon: string
  title: string
  subText?: string
  button?: string
}
export default function Integrations(): JSX.Element {
  applyStoredTheme(false)

  return (
    <PrimaryLayout pageTestId={'integrations'}>
      <Toaster
        containerStyle={{
          top: '5rem',
        }}
      />
      <HStack css={{ width: '90%', margin: '0 auto' }}>
        <Header css={{ textAlign: 'center' }}>Integrations</Header>
      </HStack>

      <HStack css={{ width: '90%', margin: '0 auto' }}>
        <Para>
          Connect with other applications can help enhance and streamline your
          experience with Omnivore, below are some useful apps to connect your
          Omnivore account to.
        </Para>
      </HStack>
      <VStack
      distribution= {'start'}
        css={{
          width: '90%',
          margin: '0 auto',
          border: '1px solid white',
          height: '500px',
        }}
      >
        <Header>Applications</Header>
        {/* create an integration array with integration props and loop over it */}
        <IntegrationsCard>
        <IntegrationBrand></IntegrationBrand>
        </IntegrationsCard>
      </VStack>
    </PrimaryLayout>
  )
}
