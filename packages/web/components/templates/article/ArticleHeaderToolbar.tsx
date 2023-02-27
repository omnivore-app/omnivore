import { useCallback } from 'react'
import { CommentIcon } from '../../elements/images/CommentIcon'
import { CopyLinkIcon } from '../../elements/images/CopyLinkIcon'
import { PostIcon } from '../../elements/images/PostIcon'
import { ShareIcon } from '../../elements/images/ShareIcon'
import { HStack } from './../../elements/LayoutPrimitives'
import { useCopyLink } from '../../../lib/hooks/useCopyLink'
import { Button } from '../../elements/Button'
import { theme } from './../../tokens/stitches.config'
import { StyledText } from './../../elements/StyledText'
import { useCanShareNative } from '../../../lib/hooks/useCanShareNative'

type ArticleHeaderToolbarProps = {
  articleTitle: string
  articleShareURL: string
  hasHighlights: boolean
  setShowHighlightsModal: React.Dispatch<React.SetStateAction<boolean>>
}

export function ArticleHeaderToolbar(
  props: ArticleHeaderToolbarProps
): JSX.Element {
  return (
    <HStack distribution="between" alignment="center" css={{ gap: '$2' }}>
      {props.hasHighlights && (
        <Button
          style="plainIcon"
          onClick={() => {
            if (props.setShowHighlightsModal) {
              props.setShowHighlightsModal(true)
            }
          }}
          title="Notebook"
        >
          <CommentIcon
            size={24}
            strokeColor={theme.colors.grayTextContrast.toString()}
          />
        </Button>
      )}
      {/* <Button style="plainIcon" onClick={copyLink} title="Copy Link">
        <CopyLinkIcon
          isCompleted={isLinkCopied}
          strokeColor={theme.colors.grayTextContrast.toString()}
        />
      </Button>
      {enablePostAction ? (
        <Button style="plainIcon" onClick={() => console.log('post action')} title="Post to Profile">
          <PostIcon
            isCompleted={false}
            size={24}
            strokeColor={theme.colors.grayTextContrast.toString()}
          />
        </Button>
      ) : null}
      <Button style="plainIcon" onClick={() => shareAction()} title="Share">
        <ShareIcon
          isCompleted={false}
          size={24}
          strokeColor={theme.colors.grayTextContrast.toString()}
        />
      </Button>
      {isLinkCopied ? (
        <StyledText style="caption" css={{ m: 0, p: 0 }}>
          Link Copied
        </StyledText>
      ) : null} */}
    </HStack>
  )
}
