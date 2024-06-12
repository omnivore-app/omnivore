import {
  ModalRoot,
  ModalContent,
  ModalOverlay,
} from '../../elements/ModalPrimitives'
import {
  Box,
  HStack,
  StyledLink,
  VStack,
} from '../../elements/LayoutPrimitives'
import { Button } from '../../elements/Button'
import { StyledText } from '../../elements/StyledText'
import { theme } from '../../tokens/stitches.config'
import { useCopyLink } from '../../../lib/hooks/useCopyLink'
import { CloseIcon } from '../../elements/images/CloseIcon'
import { OmnivoreLogoIcon } from '../../elements/images/OmnivoreNameLogo'
import { useState } from 'react'
import { TwitterLogo, FacebookLogo } from '@phosphor-icons/react'

type ShareType = 'link' | 'highlight'

type ShareModalLayoutProps = {
  url: string
  type: ShareType
  modalTitle: string
  title: string
  description?: string
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

export function ShareModalLayout(props: ShareModalLayoutProps): JSX.Element {
  const { copyLink, isLinkCopied } = useCopyLink(props.url, props.type)
  const [switchOn, setSwitchOn] = useState(false)
  const toggleSwitch = () => {
    setSwitchOn(!switchOn)
  }
  const iconColor = theme.colors.grayText.toString()

  return (
    <ModalRoot defaultOpen onOpenChange={props.onOpenChange}>
      <ModalOverlay />
      <ModalContent
        onPointerDownOutside={(event) => {
          event.preventDefault()
        }}
        css={{
          overflow: 'auto',
          p: '0px',
          border: '1px solid $grayBorder',
          boxShadow: 'none',
        }}
      >
        <VStack distribution="start" css={{ p: '0' }}>
          <HStack
            distribution="between"
            alignment="center"
            css={{
              width: '100%',
              pt: '24px',
              pl: '24px',
              pr: '24px',
              boxSizing: 'border-box',
              pb: '16px',
            }}
          >
            <StyledText style="modalTitle" css={{ p: '0' }}>
              {props.modalTitle}
            </StyledText>
            <Button
              css={{ p: '0' }}
              style="ghost"
              onClick={() => {
                props.onOpenChange(false)
              }}
            >
              <CloseIcon size={24} strokeColor={iconColor} />
            </Button>
          </HStack>
          {props.children}
          <HStack
            alignment="start"
            distribution="start"
            css={{
              alignItems: 'center',
              pt: '16px',
              pb: '16px',
              pl: '24px',
              pr: '24px',
              height: '64px',
              width: '100%',
              boxSizing: 'border-box',
              gap: '8px',
              mb: '0px',
              bg: '$grayBg',
              borderTop: '1px solid $grayBorder',
              borderRadius: '0px 0px 6px 6px',
            }}
          >
            <StyledText style="boldText" css={{ m: '0' }}>
              Secret URL
            </StyledText>
            <button
              onClick={toggleSwitch}
              className="track"
              style={{
                display: 'flex',
                padding: '2px',
                flexDirection: `${switchOn ? 'row-reverse' : 'row'}`,
                alignItems: 'center',
                width: '40px',
                height: '24px',
                background: `${
                  switchOn ? 'rgba(255, 210, 52, 1)' : 'rgba(10, 8, 6, 0.15)'
                }`,
                borderRadius: '12px',
                borderColor: theme.colors.grayBorder.toString(),
                borderWidth: 1,
                borderStyle: 'solid',
              }}
            >
              <div
                className="thumb"
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '20px',
                  background: 'rgba(255, 255, 255, 1)',
                  border: '2px solid rgba(0, 0, 0, 0.06)',
                }}
              ></div>
            </button>
            {switchOn && (
              <Button style="ctaModal" onClick={copyLink}>
                Copy Link
              </Button>
            )}

            <Box
              css={{
                display: 'flex',
                flexDirection: 'row',
                marginLeft: 'auto',
                gap: '24px',
                alignItems: 'center',
              }}
            >
              <StyledLink
                target="_blank"
                css={{ height: '24px' }}
                referrerPolicy="no-referrer"
                href={``}
              >
                <OmnivoreLogoIcon
                  size={26}
                  strokeColor={theme.colors.thTextContrast.toString()}
                />
              </StyledLink>
              <StyledLink
                target="_blank"
                css={{ height: '24px' }}
                referrerPolicy="no-referrer"
                href={`https://www.facebook.com/sharer/sharer.php?u=${props.url}&t=${props.title}&display=page`}
              >
                <FacebookLogo width={26} height={26} color={iconColor} />
              </StyledLink>
              <StyledLink
                target="_blank"
                css={{ height: '24px' }}
                referrerPolicy="no-referrer"
                href={`https://twitter.com/intent/tweet?text=${props.title}&url=${props.url}`}
              >
                <TwitterLogo width={26} height={26} color={iconColor} />
              </StyledLink>
            </Box>
          </HStack>
        </VStack>
      </ModalContent>
    </ModalRoot>
  )
}
