import { styled } from '@stitches/react'
import Image from 'next/image'

import { Box, HStack, SpanBox, VStack } from '../../elements/LayoutPrimitives'
import { Button } from '../../elements/Button'

import { Plus } from 'phosphor-react'
import { useGetWebhooksQuery } from '../../../lib/networking/queries/useGetWebhooksQuery'
import { useMemo } from 'react'

// Styles
const Header = styled(Box, {
  color: '$utilityTextDefault',
  fontSize: 'x-large',
  margin: '20px',
})

interface Webhook {
    id?: string
    url: string
    eventTypes: string
    contentType?: string
    method?: string
    enabled?: string
    createdAt?: Date
    updatedAt?: Date
  }

export function Webhooks(): JSX.Element {

  const { webhooks } = useGetWebhooksQuery()

  const webhooksList = useMemo(() => {
    const webhooksList = new Map<string, Webhook>()
    webhooks.forEach((webhook) =>
    webhooksList.set(webhook.id, {
        url: webhook.url,
        eventTypes: webhook.eventTypes.join(', '),
        method: webhook.method,
        contentType: webhook.contentType,
        createdAt: webhook.createdAt,
      })
    )
    return webhooksList
  }, [webhooks])

  console.log('webhooksList', webhooksList)
  return (
    <VStack
      distribution={'start'}
      css={{
        width: '80%',
        margin: '0 auto',
        height: '500px',
      }}
    >
      <HStack
        alignment={'start'}
        distribution={'start'}
        css={{
          width: '100%',
          pb: '$2',
          borderBottom: '1px solid $utilityTextDefault',
          pr: '$1',
        }}
      >
        <Image
          src="/static/icons/webhooks.svg"
          alt="integration Image"
          width={75}
          height={75}
        />
        <Header>Webhooks</Header>

        <HStack
          alignment={'center'}
          distribution={'end'}
          css={{
            width: '80%',
            height: '100%',
          }}
        >
          <Button
            style="ctaDarkYellow"
            css={{
              py: '10px',
              px: '14px',
            }}
          >
            <Plus size={16} weight="bold" />
            <SpanBox css={{ pl: '10px', fontWeight: '600', fontSize: '16px' }}>
              Add New Webhook
            </SpanBox>
          </Button>
        </HStack>
      </HStack>

      <HStack
        css={{
          fontSize: '16px',
          color: '$utilityTextDefault',
          m: '20px 0',
        }}
      >
        Use Webhooks to Ut enim ad minim veniam, quis nostrud exercitation.
        Tityre, tu patulae recubans sub tegmine fagi dolor. Etiam habebis sem
        dicantur magna mollis euismod.
      </HStack>

      <HStack
        css={{
            border: '1px solid white',
            height: '100%',
            width: '100%',
          }}>


      </HStack>
    </VStack>
  )
}
