import { SettingsLayout } from '../../components/templates/SettingsLayout'
import { Toaster } from 'react-hot-toast'
import { Table } from '../../components/elements/Table'
import { applyStoredTheme } from '../../lib/themeUpdater'
import {
  useGetWebhooksQuery,
  WebhookEvent,
} from '../../lib/networking/queries/useGetWebhooksQuery'
import { useMemo, useState } from 'react'
import { showErrorToast, showSuccessToast } from '../../lib/toastHelpers'
import { ConfirmationModal } from '../../components/patterns/ConfirmationModal'
import { deleteWebhookMutation } from '../../lib/networking/mutations/deleteWebhookMutation'
import { FormModal } from '../../components/patterns/FormModal'
import { setWebhookMutation } from '../../lib/networking/mutations/setWebhookMutation'
import { FormInputProps } from '../../components/elements/FormElements'
import { Box, VStack } from '../../components/elements/LayoutPrimitives'
import Link from 'next/link'
import { StyledText } from '../../components/elements/StyledText'

export default function Webhooks(): JSX.Element {
  return (
    <SettingsLayout>
      <Toaster
        containerStyle={{
          top: '5rem',
        }}
      />
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
