import {
  ModalContent,
  ModalOverlay,
  ModalRoot,
} from '../../elements/ModalPrimitives'
import { Box, HStack, SpanBox, VStack } from '../../elements/LayoutPrimitives'
import { Button } from '../../elements/Button'
import { StyledText } from '../../elements/StyledText'
import { X, Check } from 'phosphor-react'
import { useState } from 'react'
import { showErrorToast } from '../../../lib/toastHelpers'

type ShareArticleModalProps = {
  onOpenChange: (open: boolean) => void
  submit: (option: string, reminder: boolean, msg: string) => void
}

enum ButtonPosition {
  Top,
  Middle,
  Bottom,
  Standalone,
}

type SnoozeOptionButtonProps = {
  title: string
  position: ButtonPosition
  onClick: () => void
  selected?: boolean
  borderRadius?: string
}

function SnoozeOptionButton(props: SnoozeOptionButtonProps): JSX.Element {
  let borderRadius = '0px'
  let borderWidth = '1px'
  switch (props.position) {
    case ButtonPosition.Top:
      borderWidth = '1px'
      borderRadius = '8px 8px 0px 0px'
      break
    case ButtonPosition.Middle:
      borderWidth = '0px 1px 0px 1px'
      borderRadius = '0px'
      break
    case ButtonPosition.Bottom:
      borderWidth = '1px'
      borderRadius = '0px 0px 8px 8px'
      break
    case ButtonPosition.Standalone:
      borderWidth = '1px'
      borderRadius = '8px'
      break
  }

  return (
    <Button
      style="modalOption"
      onClick={props.onClick}
      css={{
        borderRadius,
        borderWidth,
        background: props.selected ? '#FDFAEC' : undefined,
      }}
    >
      <HStack
        css={{
          pl: '16px',
          justifyContent: 'space-between',
          width: '100%',
          alignItems: 'center',
        }}
      >
        <SpanBox>{props.title}</SpanBox>
        {props.selected && <Check width={24} height={24} color="#E2B513" />}
      </HStack>
    </Button>
  )
}

export function SnoozeLinkModal(props: ShareArticleModalProps): JSX.Element {
  const [sendReminder, setSendReminder] = useState(false)
  const [snoozeOption, setSnoozeOption] = useState<string | undefined>(
    undefined
  )

  const setOption = (option: string) => {
    setSnoozeOption(option)
    setSendReminder(true)
  }

  return (
    <ModalRoot defaultOpen onOpenChange={props.onOpenChange}>
      <ModalOverlay />
      <ModalContent
        onPointerDownOutside={(event) => {
          event.preventDefault()
        }}
        css={{
          m: '0px',
          p: '0px',
          width: '375px',
          height: '388px',
          overflow: 'auto',
          background: 'white',
        }}
      >
        <VStack css={{ px: '24px', pt: '22px', m: '0px' }}>
          <HStack
            alignment="start"
            distribution="end"
            css={{ pb: '16px', width: '100%' }}
          >
            <StyledText
              css={{ fontSize: '24px', m: '0px', mr: '0px', color: '#0A0806' }}
            >
              Snooze
            </StyledText>
            <Button
              style="ghost"
              onClick={() => {
                props.onOpenChange(false)
              }}
              tabIndex={-1}
              css={{ marginLeft: 'auto', p: '0px' }}
            >
              <X color="black" width={24} height={24} />
            </Button>
          </HStack>
          <VStack
            css={{ width: '100%', background: '#F8F8F8', borderRadius: '8px' }}
          >
            <SnoozeOptionButton
              title="Snooze until tonight"
              position={ButtonPosition.Top}
              selected={snoozeOption == 'tonight'}
              onClick={() => setOption('tonight')}
            />
            <SnoozeOptionButton
              title="Snooze until tomorrow"
              position={ButtonPosition.Middle}
              selected={snoozeOption == 'tomorrow'}
              onClick={() => setOption('tomorrow')}
            />
            <SnoozeOptionButton
              title="Snooze until the weekend"
              position={ButtonPosition.Bottom}
              selected={snoozeOption == 'weekend'}
              onClick={() => setOption('weekend')}
            />
          </VStack>

          <Box css={{ mt: '16px', width: '100%', background: '#F8F8F8' }}>
            <SnoozeOptionButton
              title="Send me a reminder"
              position={ButtonPosition.Standalone}
              selected={sendReminder}
              onClick={() => {
                setSendReminder(!sendReminder)
              }}
            />
          </Box>

          <HStack
            css={{ mt: '16px', justifyContent: 'space-between', width: '100%' }}
          >
            <Button
              title="Cancel"
              css={{
                fontSize: '16px',
                width: '158px',
                height: '52px',
                background: 'unset',
                border: 'unset',
                color: '#0A0806',
                fontWeight: '400',
              }}
              onClick={() => {
                props.onOpenChange(false)
              }}
            >
              Cancel
            </Button>
            <Button
              style="ctaDarkYellow"
              title="Save"
              css={{
                fontSize: '16px',
                width: '158px',
                height: '52px',
                marginLeft: 'auto',
                color: '#0A0806',
                fontWeight: '400',
              }}
              onClick={() => {
                if (snoozeOption) {
                  let msg = 'Link snoozed until '
                  switch (snoozeOption) {
                    case 'tonight':
                      msg += 'tonight.'
                      break
                    case 'tomorrow':
                      msg += 'tomorrow.'
                      break
                    case 'weekend':
                      msg += 'the weekend.'
                      break
                  }
                  props.submit(snoozeOption, sendReminder, msg)
                  props.onOpenChange(false)
                } else {
                  showErrorToast('No option selected', {
                    position: 'bottom-right',
                  })
                }
              }}
            >
              Save
            </Button>
          </HStack>
        </VStack>
      </ModalContent>
    </ModalRoot>
  )
}
