import {
  ModalRoot,
  ModalContent,
  ModalOverlay,
} from '../../elements/ModalPrimitives'
import { Box, HStack, StyledLink, VStack } from '../../elements/LayoutPrimitives'
import { Button } from '../../elements/Button'
import { StyledText } from '../../elements/StyledText'
import { CrossIcon } from '../../elements/images/CrossIcon'
import { FacebookIcon } from '../../elements/images/social/FacebookIcon'
import { TwitterIcon } from '../../elements/images/social/TwitterIcon'
import { theme } from '../../tokens/stitches.config'
import { CopyLinkIcon } from '../../elements/images/CopyLinkIcon'
import { useCopyLink } from '../../../lib/hooks/useCopyLink'

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

export function ShareModalLayout(
  props: ShareModalLayoutProps
): JSX.Element {
  const { copyLink, isLinkCopied } = useCopyLink(props.url, props.type)

  return (
    <ModalRoot defaultOpen onOpenChange={props.onOpenChange}>
      <ModalOverlay />
      <ModalContent
        onPointerDownOutside={(event) => {
          event.preventDefault()
        }}
        css={{ overflow: 'auto', p: '0' }}
      >
        <VStack distribution="start" css={{ p: '0' }}>
          <HStack
            distribution="between"
            alignment="center"
            css={{ width: '100%' }}
          >
            <StyledText style="modalHeadline" css={{ p: '16px' }}>{props.modalTitle}</StyledText>
            <Button
              css={{ pt: '16px', pr: '16px' }}
              style="ghost"
              onClick={() => {
                props.onOpenChange(false)
              }}
            >
              <CrossIcon
                size={20}
                strokeColor={theme.colors.grayText.toString()}
              />
            </Button>
          </HStack>
          {props.children}
          <StyledText style='logoTitle' css={{ pl: '16px', color: '$grayText', fontSize: '11px' }}>SHARE</StyledText>
          <HStack
            alignment='start'
            distribution='start'
            css={{ p: '16px', width: '100%', gap: '16px', mb: '0px' }}
          >
            <StyledLink
              target='_blank'
              css={{ height: '100%' }}
              referrerPolicy='no-referrer'
              href={`https://www.facebook.com/sharer/sharer.php?u=${props.url}&t=${props.title}&display=page`}
            >
              <FacebookIcon color={theme.colors.grayText.toString()} />
            </StyledLink>
            <StyledLink
              target='_blank'
              css={{ height: '100%', pl: '8px', pt: '4px' }}
              referrerPolicy='no-referrer'
              href={`https://twitter.com/intent/tweet?text=${props.title}&url=${props.url}`}
            >
              <TwitterIcon color={theme.colors.grayText.toString()} />
            </StyledLink>
            <Box css={{ marginLeft: 'auto' }}>
              <Button onClick={copyLink} style='plainIcon' css={{ pl: '16px', color: '$grayText', fontSize: '11px', height: '100%', display: 'flex', alignItems: 'center' }}>
                <span style={{ paddingTop: '4px', paddingRight: '8px' }}>Copy URL</span>
                <CopyLinkIcon strokeColor={theme.colors.grayText.toString()} isCompleted={isLinkCopied} />
              </Button>
            </Box>
          </HStack>
        </VStack>
      </ModalContent>
    </ModalRoot>
  )
}
