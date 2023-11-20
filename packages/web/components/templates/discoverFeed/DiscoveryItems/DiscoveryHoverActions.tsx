import { UserBasicData } from '../../../../lib/networking/queries/useGetViewerQuery'
import { Box } from '../../../elements/LayoutPrimitives'
import { Button } from '../../../elements/Button'
import { theme } from '../../../tokens/stitches.config'
import {
  BookmarkSimple,
  Browsers,
  MinusCircle,
  PlusCircle,
} from 'phosphor-react'
import { timeZone, locale } from '../../../../lib/dateFormatting'
import React from 'react'
import { DiscoveryItem } from '../../../../lib/networking/queries/useGetDiscoveryItems'
import { SaveDiscoveryArticleOutput } from "../../../../lib/networking/mutations/saveDiscoverArticle"

type DiscoveryHoverActionsProps = {
  viewer?: UserBasicData
  isHovered: boolean
  handleLinkSubmission: (
    link: string,
    timezone: string,
    locale: string
  ) => Promise<SaveDiscoveryArticleOutput | undefined>
  item: DiscoveryItem
  setSavedId: (slug: string) => void
  savedId?: string

  setSavedUrl: (url: string) => void
  savedUrl?: string
}

export const DiscoveryHoverActions = (props: DiscoveryHoverActionsProps) => {
  return (
    <Box
      css={{
        overflow: 'clip',

        height: '33px',
        width: '75px',
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
          (props.savedId && 'Remove From Library (A)') ||
          'Add to Library (A)'
        }
        style="hoverActionIcon"
        onClick={(event) => {
          console.log(props);
          if (!props.savedUrl) {
            props.handleLinkSubmission(props.item.id, timeZone, locale)
              .then((item) => {
                if (item) {
                  props.setSavedId(item.saveDiscoveryArticle.saveId)
                  props.setSavedUrl(item.saveDiscoveryArticle.url)
                }
              })
          } else {
            console.log("TODO: Remove")
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
        title="Go to Original Article (O)"
        style="hoverActionIcon"
        onClick={(event) => {
          // OK So we go to the original article.
          window.open(props.item.url, '_blank', 'noreferrer')
          event.preventDefault()
          event.stopPropagation()
        }}
      >
        <Browsers size={21} color={theme.colors.thNotebookSubtle.toString()} />
      </Button>
    </Box>
  )
}
