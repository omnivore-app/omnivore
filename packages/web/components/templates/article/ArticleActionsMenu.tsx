import { Separator } from '@radix-ui/react-separator'
import { ArticleAttributes } from '../../../lib/networking/library_items/useLibraryItems'
import { Button } from '../../elements/Button'
import { Box, SpanBox } from '../../elements/LayoutPrimitives'
import { styled, theme } from '../../tokens/stitches.config'
import { ReaderSettings } from '../../../lib/hooks/useReaderSettings'
import { useRef } from 'react'
import { ArchiveIcon } from '../../elements/icons/ArchiveIcon'
import { NotebookIcon } from '../../elements/icons/NotebookIcon'
import { TrashIcon } from '../../elements/icons/TrashIcon'
import { LabelIcon } from '../../elements/icons/LabelIcon'
import { EditInfoIcon } from '../../elements/icons/EditInfoIcon'
import { UnarchiveIcon } from '../../elements/icons/UnarchiveIcon'
import { State } from '../../../lib/networking/fragments/articleFragment'
import { PaperPlaneTilt } from '@phosphor-icons/react'; // Added PaperPlaneTilt for Nostr
import { useSaveArticleToNostrMutation } from '../../../../lib/networking/mutations/saveArticleToNostrMutation'; // Added
import { showSuccessToast, showErrorToast } from '../../../../lib/toastHelpers'; // Ensure this is imported
import React, { useState, useCallback, useMemo } from 'react'; // Ensure React and hooks are imported
import { StyledText } from '../../elements/StyledText'; // For modal text

export type ArticleActionsMenuLayout = 'top' | 'side'

type ArticleActionsMenuProps = {
  article?: ArticleAttributes
  layout: ArticleActionsMenuLayout
  showReaderDisplaySettings?: boolean
  readerSettings: ReaderSettings
  articleActionHandler: (action: string, arg?: unknown) => void
}

type MenuSeparatorProps = {
  layout: ArticleActionsMenuLayout
}

const MenuSeparator = (props: MenuSeparatorProps): JSX.Element => {
  const LineSeparator = styled(Separator, {
    width: '100%',
    margin: 0,
    borderBottom: `1px solid ${theme.colors.thHighContrast.toString()}`,
    my: '8px',
  })
  return props.layout == 'side' ? <LineSeparator /> : <></>
}

export function ArticleActionsMenu(
  props: ArticleActionsMenuProps
): JSX.Element {
  const displaySettingsButtonRef = useRef<HTMLElement | null>(null)

  const [showNostrConfirm, setShowNostrConfirm] = useState(false);
  // articleForNostr is not strictly needed if props.article is always available when the modal is shown
  // but using it makes the modal's dependency on the article explicit.
  const [articleForNostr, setArticleForNostr] = useState<ArticleAttributes | undefined>(undefined);


  const saveArticleToNostr = useSaveArticleToNostrMutation({
    onSuccess: (data) => {
      if (data.saveArticleToNostr.__typename === 'SaveArticleToNostrSuccess') {
        showSuccessToast(data.saveArticleToNostr.message || 'Article published to Nostr successfully!');
        console.log('Nostr publish success:', data.saveArticleToNostr);
      } else if (data.saveArticleToNostr.__typename === 'SaveArticleToNostrError') {
        showErrorToast(data.saveArticleToNostr.message || 'Failed to publish article to Nostr.');
        console.error('Nostr publish error:', data.saveArticleToNostr.errorCodes);
      }
      setShowNostrConfirm(false);
      setArticleForNostr(undefined);
    },
    onError: (error: any) => {
      showErrorToast(error.message || 'An unexpected error occurred while publishing to Nostr.');
      console.error('Nostr publish mutation error:', error);
      setShowNostrConfirm(false);
      setArticleForNostr(undefined);
    },
  });

  const handleNostrSave = (publishAs: 'PUBLIC' | 'PRIVATE') => {
    if (articleForNostr) {
      saveArticleToNostr.mutate({
        articleId: articleForNostr.id,
        publishAs,
      });
    }
  };

  return (
    <>
      <Box
        css={{
          display: 'flex',
          alignItems: 'center',
          flexDirection: props.layout == 'side' ? 'column' : 'row',
          justifyContent: props.layout == 'side' ? 'center' : 'flex-end',
          gap: props.layout == 'side' ? '15px' : '25px',
          paddingTop: '6px',
        }}
      >
        <SpanBox
          css={{
            display: 'flex',
            alignItems: 'center',
            '@mdDown': {
              display: 'none',
            },
          }}
        >
          {props.article ? (
            <>
              <Button
                title="Edit labels (l)"
                style="articleActionIcon"
                onClick={() => props.readerSettings.setShowSetLabelsModal(true)}
              >
                <SpanBox ref={displaySettingsButtonRef}>
                  <LabelIcon
                    size={24}
                    color={theme.colors.thHighContrast.toString()}
                  />
                </SpanBox>
              </Button>
              <MenuSeparator layout={props.layout} />
            </>
          ) : (
            <Button
              title="Edit labels (l)"
              style="articleActionIcon"
              css={{
                '@smDown': {
                  display: 'flex',
                },
              }}
            >
              <LabelIcon
                size={24}
                color={theme.colors.thHighContrast.toString()}
              />
            </Button>
          )}
        </SpanBox>

        <Button
          title="Edit labels (l)"
          style="articleActionIcon"
          onClick={() => props.articleActionHandler('setLabels')}
          css={{
            display: 'none',
            '@mdDown': {
              display: 'flex',
              alignItems: 'center',
            },
          }}
        >
          <LabelIcon size={24} color={theme.colors.thHighContrast.toString()} />
        </Button>

        <Button
          title="View notebook (t)"
          style="articleActionIcon"
          onClick={() => props.articleActionHandler('showHighlights')}
          css={{
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <NotebookIcon
            size={24}
            color={theme.colors.thHighContrast.toString()}
          />
        </Button>

        <Button
          title="Edit info (i)"
          style="articleActionIcon"
          onClick={() => props.articleActionHandler('showEditModal')}
          css={{
            display: 'flex',
            alignItems: 'center',
            '@mdDown': {
              display: 'none',
            },
          }}
        >
          <EditInfoIcon
            size={24}
            color={theme.colors.thHighContrast.toString()}
          />
        </Button>

        <MenuSeparator layout={props.layout} />

        {/* Add "Save to Nostr" button */}
        {props.article && props.article.state !== State.ARCHIVED && ( // Only show if article exists and is not archived
          <Button
            title="Save to Nostr..."
            style="articleActionIcon"
            onClick={() => {
              setArticleForNostr(props.article);
              setShowNostrConfirm(true);
            }}
            css={{
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <PaperPlaneTilt size={24} color={theme.colors.thHighContrast.toString()} />
          </Button>
        )}

        <MenuSeparator layout={props.layout} />

        <Button
          title="Remove (#)"
          style="articleActionIcon"
          onClick={() => {
            props.articleActionHandler('delete')
          }}
          css={{
            display: 'flex',
            alignItems: 'center',
            '@mdDown': {
              display: 'none',
            },
          }}
        >
          <TrashIcon size={24} color={theme.colors.thHighContrast.toString()} />
        </Button>

        {props.article?.state !== State.ARCHIVED ? (
          <Button
            title="Archive (e)"
            style="articleActionIcon"
            onClick={() => props.articleActionHandler('archive')}
            css={{
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <ArchiveIcon
              size={24}
              color={theme.colors.thHighContrast.toString()}
            />
          </Button>
        ) : (
          <Button
            title="Unarchive (e)"
            style="articleActionIcon"
            onClick={() => props.articleActionHandler('unarchive')}
          >
            <UnarchiveIcon
              size={24}
              color={theme.colors.thHighContrast.toString()}
            />
          </Button>
        )}
      </Box>

      {/* Basic Nostr Confirmation Modal */}
      {showNostrConfirm && articleForNostr && (
        <div style={{ // Basic styling for a modal overlay
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 1000, color: 'black'
        }}>
          <div style={{ background: 'white', padding: '20px', borderRadius: '5px' }}>
            <StyledText css={{color: 'black', fontWeight: 'bold'}}>Save "{articleForNostr.title}" to Nostr</StyledText>
            <StyledText css={{color: 'black', mt: '10px', mb: '20px'}}>How would you like to save this article to Nostr?</StyledText>
            <Button style="ctaDarkYellow" onClick={() => handleNostrSave('PUBLIC')} disabled={saveArticleToNostr.isLoading} css={{mr: '10px'}}>
              {saveArticleToNostr.isLoading ? 'Saving...' : 'Save Publicly'}
            </Button>
            <Button style="ctaDarkYellow" onClick={() => handleNostrSave('PRIVATE')} disabled={saveArticleToNostr.isLoading} css={{mr: '10px'}}>
              {saveArticleToNostr.isLoading ? 'Saving...' : 'Save Privately'}
            </Button>
            <Button style="secondary" onClick={() => { setShowNostrConfirm(false); setArticleForNostr(undefined); }} disabled={saveArticleToNostr.isLoading}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </>
  )
}
