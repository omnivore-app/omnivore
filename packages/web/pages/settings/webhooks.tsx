import { SettingsLayout } from '../../components/templates/SettingsLayout'
import { VStack } from '../../components/elements/LayoutPrimitives'
import Link from 'next/link'
import { StyledText } from '../../components/elements/StyledText'

export default function Webhooks(): JSX.Element {
  return (
    <SettingsLayout>
      <VStack
        css={{ width: '100%', height: '100%' }}
        distribution="start"
        alignment="center"
      >
        <VStack
          css={{
            padding: '24px',
            width: '100%',
            height: '100%',
            gap: '25px',
            minWidth: '300px',
            maxWidth: '865px',
          }}
        >
          <StyledText>
            Webhooks have been moved to{' '}
            <Link href="/settings/rules">Rules</Link>. To trigger a webhook,
            create a rule and give it the Webhook action.
          </StyledText>
        </VStack>
      </VStack>
    </SettingsLayout>
  )
}
