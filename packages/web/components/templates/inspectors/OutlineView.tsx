import dayjs from 'dayjs'
import { ReadableItem } from '../../../lib/networking/queries/useGetLibraryItemsQuery'
import { FormInput } from '../../elements/FormElements'
import { Box, HStack, SpanBox, VStack } from '../../elements/LayoutPrimitives'
import { StyledText } from '../../elements/StyledText'
import { useEffect, useMemo, useState } from 'react'
import { TreeDownIcon } from '../../elements/icons/TreeDownIcon'
import { styled, theme } from '../../tokens/stitches.config'
import { Button } from '../../elements/Button'
import { TreeRightIcon } from '../../elements/icons/TreeRightIcon'
import { Circle } from 'phosphor-react'

type OutlineViewProps = {
  item: ReadableItem
  outline: OutlineItem | undefined
}

export type OutlineItem = {
  level: number
  text: string
  anchor: string
  children: OutlineItem[]
}

export const OutlineView = (props: OutlineViewProps): JSX.Element => {
  return (
    <VStack
      tabIndex={-1}
      distribution="start"
      css={{
        width: '100%',
      }}
    >
      <Button
        style="link"
        css={{
          p: '20px',
          textAlign: 'left',
          color: '$thTextContrast2',
          fontFamily: '$inter',
          fontSize: '18px',
          fontStyle: 'normal',
          fontWeight: '600',
          lineHeight: '150%',
          '&:hover': {
            textDecoration: 'underline',
          },
        }}
        onClick={(event) => {
          event.preventDefault()
          const scrollEvent = new CustomEvent('scrollToOutlineAnchorIdx', {
            detail: -1, // props.item.anchor,
          })
          document.dispatchEvent(scrollEvent)
        }}
      >
        {props.item.title}
      </Button>

      {props.outline?.children.length ?? 0 > 0 ? (
        props.outline?.children.map((child) => {
          return <RecursiveList key={child.anchor} item={child} />
        })
      ) : (
        <VStack
          alignment="center"
          distribution="center"
          css={{ width: '100%', px: '20px' }}
        >
          <StyledText style="emptyListMessage">
            There is no outline for this page.
          </StyledText>
        </VStack>
      )}
      <Box css={{ height: '320px' }}></Box>
    </VStack>
  )
}

type RecursiveListProps = {
  item: OutlineItem
}

const StyledUL = styled('ul', {
  listStyleType: 'none',
  paddingTop: '5px',
  paddingInlineStart: '20px',
  margin: '0px',
})

const RecursiveList = (props: RecursiveListProps) => {
  const [showNested, setShowNested] = useState(true)

  return (
    <StyledUL>
      <li key={props.item.text}>
        <HStack distribution="start" alignment="start">
          {props.item.children.length > 0 ? (
            <Button
              style="articleActionIcon"
              css={{
                display: 'flex',
                width: '30px',
                textAlign: 'left',
                '&:hover': {
                  textDecoration: 'underline',
                },
              }}
              onClick={(event) => {
                event.preventDefault()
                setShowNested(!showNested)
              }}
            >
              {showNested ? (
                <TreeDownIcon
                  color={theme.colors.thNotebookSubtle.toString()}
                />
              ) : (
                <TreeRightIcon
                  color={theme.colors.thNotebookSubtle.toString()}
                />
              )}
            </Button>
          ) : (
            <SpanBox
              css={{
                pl: '6px',
                width: '25px',
                height: '100%',
                display: 'flex',
              }}
            >
              <Button
                css={{
                  '&:hover': {
                    '>svg': {
                      scale: 1.5,
                    },
                  },
                }}
                style="plainIcon"
                onClick={(event) => {
                  event.preventDefault()
                  const scrollEvent = new CustomEvent(
                    'scrollToOutlineAnchorIdx',
                    {
                      detail: props.item.anchor,
                    }
                  )
                  document.dispatchEvent(scrollEvent)
                }}
              >
                <Circle
                  size={8}
                  weight="fill"
                  color={theme.colors.thNotebookSubtle.toString()}
                />
              </Button>
            </SpanBox>
          )}
          <Button
            style="link"
            css={{
              textAlign: 'left',
              color: '$thTextContrast2',
              fontFamily: '$inter',
              fontSize: '15px',
              fontStyle: 'normal',
              fontWeight: '500',
              lineHeight: '160%',
              '&:hover': {
                textDecoration: 'underline',
              },
            }}
            onClick={(event) => {
              event.preventDefault()
              const scrollEvent = new CustomEvent('scrollToOutlineAnchorIdx', {
                detail: props.item.anchor,
              })
              document.dispatchEvent(scrollEvent)
            }}
          >
            {props.item.text}
          </Button>
        </HStack>

        {showNested &&
          props.item.children.map((child) => {
            return <RecursiveList key={child.anchor} item={child} />
          })}
      </li>
    </StyledUL>
  )
}
