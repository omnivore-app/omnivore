import { HStack } from '../../elements/LayoutPrimitives'
import { StyledText } from '../../elements/StyledText'
import { Sidebar } from '@phosphor-icons/react'
import { theme } from '../../tokens/stitches.config'
import { Button } from '../../elements/Button'
import { ExportIcon } from '../../elements/icons/ExportIcon'
import { useCallback } from 'react'
import { UserBasicData } from '../../../lib/networking/queries/useGetViewerQuery'
import { ReadableItem } from '../../../lib/networking/queries/useGetLibraryItemsQuery'
import { useGetArticleQuery } from '../../../lib/networking/queries/useGetArticleQuery'
import { highlightsAsMarkdown } from '../homeFeed/HighlightItem'
import { showErrorToast, showSuccessToast } from '../../../lib/toastHelpers'

type NotebookHeaderProps = {
  viewer: UserBasicData
  item: ReadableItem

  setShowNotebook: (set: boolean) => void
}

export const NotebookHeader = (props: NotebookHeaderProps) => {
  const { articleData } = useGetArticleQuery({
    slug: props.item.slug,
    username: props.viewer.profile.username,
    includeFriendsHighlights: false,
  })

  const exportHighlights = useCallback(() => {
    if (articleData?.article.article.highlights) {
      let preamble = ''

      if (articleData?.article.article.title) {
        preamble += `## ${articleData?.article.article.title}\n`
      }
      if (
        articleData?.article.article.contentReader == 'WEB' &&
        articleData?.article.article.originalArticleUrl
      ) {
        preamble += `URL: ${articleData?.article.article.originalArticleUrl}\n`
      }

      const highlights = highlightsAsMarkdown(
        articleData?.article.article.highlights
      )
      if (preamble.length + highlights.length > 1) {
        ;(async () => {
          await navigator.clipboard.writeText(preamble + '\n\n' + highlights)
          showSuccessToast('Highlights and notes copied')
        })()
      } else {
        showSuccessToast('Nothing to export')
      }
    } else {
      showErrorToast('Could not copy highlights')
    }
  }, [articleData])

  return (
    <HStack
      distribution="center"
      alignment="center"
      css={{
        width: '100%',
        position: 'sticky',
        top: '0px',
        height: '50px',
        p: '20px',
        borderTopLeftRadius: '10px',
        overflow: 'clip',
        background: '$thNotebookBackground',
        zIndex: 10,
        borderBottom: '1px solid $thNotebookBorder',
      }}
    >
      <StyledText style="modalHeadline" css={{ color: '$thNotebookSubtle' }}>
        Notebook
      </StyledText>
      <HStack
        css={{
          ml: 'auto',
          cursor: 'pointer',
          gap: '15px',
          mr: '-5px',
        }}
        distribution="center"
        alignment="center"
      >
        {/* <Dropdown triggerElement={<MenuTrigger />}>
          <DropdownOption
            onSelect={() => {
              // exportHighlights()
            }}
            title="Export Notebook"
          />
          <DropdownOption
            onSelect={() => {
              // setShowConfirmDeleteNote(true)
            }}
            title="Delete Article Note"
          />
        </Dropdown> */}

        <Button
          style="plainIcon"
          onClick={(event) => {
            exportHighlights()
            event.preventDefault()
          }}
        >
          <ExportIcon
            size={25}
            color={theme.colors.thNotebookSubtle.toString()}
          />
        </Button>
        <Button style="plainIcon" onClick={() => props.setShowNotebook(false)}>
          <Sidebar size={25} color={theme.colors.thNotebookSubtle.toString()} />
        </Button>
      </HStack>
    </HStack>
  )
}
