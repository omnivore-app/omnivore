import { CommentIcon } from '../../elements/images/CommentIcon'
import { HStack } from './../../elements/LayoutPrimitives'
import { Button } from '../../elements/Button'
import { theme } from './../../tokens/stitches.config'

type ArticleHeaderToolbarProps = {
  articleTitle: string
  articleShareURL: string
  hasHighlights: boolean
  setShowNotesSidebar: (showNotesSidebar: boolean) => void
  setShowShareArticleModal: (showShareModal: boolean) => void
}

export function ArticleHeaderToolbar(
  props: ArticleHeaderToolbarProps
): JSX.Element {
  return (
    <HStack distribution="between" alignment="center" css={{ gap: '$2' }}>
      {props.hasHighlights && (
        <Button style="plainIcon" onClick={() => props.setShowNotesSidebar(true)} title="View all your highlights and notes">
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
