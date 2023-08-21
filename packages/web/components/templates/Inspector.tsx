import { useCallback } from 'react'
import { usePersistedState } from '../../lib/hooks/usePersistedState'
import {
  LibraryItemNode,
  ReadableItem,
} from '../../lib/networking/queries/useGetLibraryItemsQuery'
import { UserBasicData } from '../../lib/networking/queries/useGetViewerQuery'
import { Button } from '../elements/Button'
import { HStack, VStack } from '../elements/LayoutPrimitives'
import { EditInfoIcon } from '../elements/icons/EditInfoIcon'
import { LeftPanelToggleIcon } from '../elements/icons/LeftPanelToggleIcon'
import { NotebookIcon } from '../elements/icons/NotebookIcon'
import { theme } from '../tokens/stitches.config'
import { OutlineIcon } from '../elements/icons/OutlineIcon'
import { LabelIcon } from '../elements/icons/LabelIcon'
import { NotebookView } from './inspectors/NotebookView'
import { ExportIcon } from '../elements/icons/ExportIcon'
import { highlightsAsMarkdown } from './homeFeed/HighlightItem'
import { showErrorToast, showSuccessToast } from '../../lib/toastHelpers'
import { EditItemInfoView } from './inspectors/EditItemInfoView'
import { OutlineView, OutlineItem } from './inspectors/OutlineView'
import { LabelsView } from './inspectors/LabelsView'

export type InspectorView = 'notebook' | 'outline' | 'info' | 'labels'

type InspectorProps = {
  viewer: UserBasicData
  item: ReadableItem
  outline: OutlineItem | undefined

  currentView: InspectorView
  setCurrentView: (view: InspectorView) => void
  closeInspector: () => void

  // For notebook view
  viewInReader: (highlightId: string) => void
}

type HeaderProps = InspectorProps

const Header = (props: HeaderProps): JSX.Element => {
  const toggleColor = useCallback(
    (view: InspectorView) => {
      return (
        props.currentView == view
          ? theme.colors.thTextContrast2
          : theme.colors.thNotebookSubtle
      ).toString()
    },
    [props]
  )

  const exportHighlights = useCallback(() => {
    if (props.item.highlights) {
      const markdown = highlightsAsMarkdown(props.item.highlights)
      if (markdown.length > 1) {
        ;(async () => {
          await navigator.clipboard.writeText(markdown)
          showSuccessToast('Highlights and notes copied')
        })()
      } else {
        showSuccessToast('Nothing to export')
      }
    } else {
      showErrorToast('Could not copy highlights')
    }
  }, [props])

  return (
    <HStack
      distribution="center"
      alignment="center"
      css={{
        px: '15px',
        width: '100%',
        position: 'sticky',
        top: '0px',
        height: '60px',
        overflow: 'clip',
        bg: '$thNotebookBackground',
        zIndex: 3,
      }}
    >
      <HStack
        css={{
          cursor: 'pointer',
          gap: '5px',
        }}
        distribution="center"
        alignment="center"
      >
        <Button
          title="Notebook"
          style="articleActionIcon"
          onClick={(event) => {
            props.setCurrentView('notebook')
            event.preventDefault()
          }}
        >
          <NotebookIcon size={25} color={toggleColor('notebook')} />
        </Button>
        <Button
          title="Labels"
          style="articleActionIcon"
          onClick={(event) => {
            props.setCurrentView('labels')
            event.preventDefault()
          }}
        >
          <LabelIcon size={25} color={toggleColor('labels')} />
        </Button>
        <Button
          title="Info"
          style="articleActionIcon"
          onClick={(event) => {
            props.setCurrentView('info')
            event.preventDefault()
          }}
        >
          <EditInfoIcon size={25} color={toggleColor('info')} />
        </Button>
        <Button
          title="Outline"
          style="articleActionIcon"
          onClick={(event) => {
            props.setCurrentView('outline')
            event.preventDefault()
          }}
        >
          <OutlineIcon size={25} color={toggleColor('outline')} />
        </Button>
      </HStack>
      <HStack
        css={{
          ml: 'auto',
          gap: '5px',
          cursor: 'pointer',
        }}
        distribution="center"
        alignment="center"
      >
        {props.currentView == 'notebook' && (
          <Button
            style="plainIcon"
            onClick={(event) => {
              exportHighlights()
              event.preventDefault()
            }}
            css={{ pb: '2px' }}
          >
            <ExportIcon
              size={25}
              color={theme.colors.thNotebookSubtle.toString()}
            />
          </Button>
        )}
        <Button
          title="Close Inspector"
          style="articleActionIcon"
          onClick={(event) => {
            event.preventDefault()
            props.closeInspector()
          }}
        >
          <LeftPanelToggleIcon
            size={25}
            color={theme.colors.thNotebookSubtle.toString()}
          />
        </Button>
      </HStack>
    </HStack>
  )
}

export const Inspector = (props: InspectorProps): JSX.Element => {
  return (
    <VStack
      tabIndex={-1}
      distribution="start"
      css={{
        height: '100%',
        width: '100%',
        overflowY: 'auto',
        bg: '$thNotebookBackground',
      }}
    >
      <Header {...props} />
      {props.currentView == 'notebook' && <NotebookView {...props} />}
      {props.currentView == 'labels' && <LabelsView {...props} />}
      {props.currentView == 'info' && <EditItemInfoView {...props} />}
      {props.currentView == 'outline' && <OutlineView {...props} />}
    </VStack>
  )
}
