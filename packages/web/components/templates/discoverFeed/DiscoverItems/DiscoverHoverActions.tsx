import { UserBasicData } from '../../../../lib/networking/queries/useGetViewerQuery'
import { Box } from '../../../elements/LayoutPrimitives'
import { Button } from '../../../elements/Button'
import { theme } from '../../../tokens/stitches.config'
import {
  BookmarkSimple,
  Book, Eye, EyeSlash,
  MinusCircle,
  PlusCircle
} from "@phosphor-icons/react"
import { timeZone, locale } from '../../../../lib/dateFormatting'
import React from 'react'
import { SaveDiscoverArticleOutput } from '../../../../lib/networking/mutations/saveDiscoverArticle'
import { DiscoverFeedItem } from '../../../../lib/networking/queries/useGetDiscoverFeedItems'
import { BrowserIcon } from '../../../elements/icons/BrowserIcon'
import { isTouchScreenDevice } from '../../../../lib/deviceType'

type DiscoverHoverActionsProps = {
  viewer?: UserBasicData
  isHovered: boolean
  handleLinkSubmission: (
    link: string,
    timezone: string,
    locale: string
  ) => Promise<SaveDiscoverArticleOutput | undefined>
  item: DiscoverFeedItem
  setSavedId: (slug: string) => void
  savedId?: string

  setSavedUrl: (url: string) => void
  savedUrl?: string

  hidden?: boolean

  deleteDiscoverItem: (item: DiscoverFeedItem) => Promise<void>
  hideDiscoverItem: (item: DiscoverFeedItem, setHidden: boolean) => Promise<void>
}

export const DiscoverHoverActions = (props: DiscoverHoverActionsProps) => {
  return (
    <Box
      css={{
        overflow: 'clip',

        height: '33px',
        width: props.savedId ? '150px' : '112.5px',
        bg: '$thBackground',
        display: 'flex',

        pt: '0px',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px solid $thBackground5',
        borderRadius: '5px',
        visibility: props.isHovered ? 'visible' : 'hidden',

        gap: '5px',
        px: '5px',
        '&:hover': {
          boxShadow:
            '0 1px 3px 0 rgba(0, 0, 0, 0.1),0 1px 2px 0 rgba(0, 0, 0, 0.06);',
        },
      }}
    >
      <Button
        title={
          (props.savedId && 'Remove From Library (A)') || 'Add to Library (A)'
        }
        style="hoverActionIcon"
        onClick={(event) => {
          if (!props.savedUrl) {
            props
              .handleLinkSubmission(props.item.id, timeZone, locale)
              .then((item) => {
                if (item) {
                  props.setSavedId(item.saveDiscoverArticle.saveId)
                  props.setSavedUrl(item.saveDiscoverArticle.url)
                }
              })
          } else {
            props.deleteDiscoverItem(props.item)
          }
          event.preventDefault()
          event.stopPropagation()
        }}
      >
        <BookmarkSimple
          size={21}
          color={theme.colors.thNotebookSubtle.toString()}
        />
        <div style={{ position: 'absolute', top: '2px', left: '20px' }}>
          {props.savedId == undefined && (
            <>
              {' '}
              <PlusCircle size={12} color="#70c44f" weight="fill" />{' '}
              <PlusCircle
                size={12}
                color="white"
                style={{ position: 'absolute', top: '3.5px', left: '0px' }}
              />{' '}
            </>
          )}
          {props.savedId != undefined && (
            <>
              {' '}
              <MinusCircle size={12} color="#de5454" weight="fill" />{' '}
              <MinusCircle
                size={12}
                color="white"
                style={{ position: 'absolute', top: '3.5px', left: '0px' }}
              />{' '}
            </>
          )}
        </div>
      </Button>


      <Button
        title="Go to Original Article"
        style="hoverActionIcon"
        onClick={(event) => {
          // OK So we go to the original article.
          window.open(props.item.url, '_blank', 'noreferrer')
          event.preventDefault()
          event.stopPropagation()
        }}
      >
        <BrowserIcon
          size={21}
          color={theme.colors.thNotebookSubtle.toString()}
        />
      </Button>

      {props.savedId != undefined && (
        <Button
          title="Go to Reader View"
          style="hoverActionIcon"
          onClick={(event) => {
            // OK So we go to the original article.
            window.location.href = props.savedUrl!
            event.preventDefault()
            event.stopPropagation()
          }}
        >
          <Book
            size={21}
            color={theme.colors.thNotebookSubtle.toString()}
          />
        </Button>)
      }

      <Button
        title={ props.hidden ? 'Article Item (H)' : 'Hide Article (H)' }
        style="hoverActionIcon"
        onClick={(event) => {
          props.hideDiscoverItem(props.item, !props.hidden)
          event.preventDefault()
          event.stopPropagation()
        }}
      >
        {
          !props.item.hidden ?
            <EyeSlash
              size={21}
              color={theme.colors.thNotebookSubtle.toString()}
            /> :
            <Eye size={21} color={theme.colors.thNotebookSubtle.toString()} />
        }
      </Button>
    </Box>
  )
}
