import { styled } from '@stitches/react'
import Image from 'next/image'

import { Box, HStack, SpanBox, VStack } from '../../elements/LayoutPrimitives'
import { Button } from '../../elements/Button'

import { Link, Plus } from '@phosphor-icons/react'
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
    const webhooksList: Array<Webhook> = []
    webhooks.forEach((webhookItem) =>
      webhooksList.push({
        id: webhookItem.id,
        url: webhookItem.url,
        eventTypes: webhookItem.eventTypes.join(', '),
        method: webhookItem.method,
        contentType: webhookItem.contentType,
        createdAt: webhookItem.createdAt,
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
        }}
      >
        {webhooksList.map((item) => {
          return (
            <Box
              key={'dgfgfdfg'}
              css={{
                width: '100%',
                backgroundColor: '$grayBg',
                borderBottom: '1px solid $grayLine',
                padding: '10px',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Link size={20} weight={'bold'} />
              <Box
                css={{
                  width: '60%',
                  padding: '10px',
                  color: '$utilityTextDefault',
                  m: '10px',
                  'h3, p': {
                    margin: '0',
                  },
                }}
              >
                <h3>{item.method}</h3>
                <p>{item.createdAt?.toLocaleDateString()}</p>
              </Box>
            </Box>
          )
        })}
      </HStack>
    </VStack>
  )
}
