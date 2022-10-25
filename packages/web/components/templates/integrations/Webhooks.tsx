import { styled } from '@stitches/react'
import Image from 'next/image'

import { Box, HStack, SpanBox, VStack } from '../../elements/LayoutPrimitives'
import { Button } from '../../elements/Button'

import { Plus } from 'phosphor-react'

// Styles
const Header = styled(Box, {
  color: '$utilityTextDefault',
  fontSize: 'x-large',
  margin: '20px',
})

export function Webhooks(): JSX.Element {
  return (
    <VStack
      distribution={'start'}
      css={{
        width: '90%',
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
        <Header>WebHooks</Header>
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
              mr: '16px',
            }}
          >
            <Plus size={16} weight="bold" />
            <SpanBox css={{ pl: '10px', fontWeight: '600', fontSize: '16px' }}>
              Add New Webhook
            </SpanBox>
          </Button>
        </HStack>
      </HStack>
    </VStack>
  )
}
