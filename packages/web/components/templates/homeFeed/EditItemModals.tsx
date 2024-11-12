import dayjs, { Dayjs } from 'dayjs'
import { useCallback, useState } from 'react'
import {
  ArticleAttributes,
  useUpdateItem,
} from '../../../lib/networking/library_items/useLibraryItems'
import { LibraryItem } from '../../../lib/networking/library_items/useLibraryItems'
import { showErrorToast, showSuccessToast } from '../../../lib/toastHelpers'
import { CloseButton } from '../../elements/CloseButton'
import { FormInput } from '../../elements/FormElements'
import { Box, HStack, SpanBox, VStack } from '../../elements/LayoutPrimitives'
import {
  ModalButtonBar,
  ModalContent,
  ModalOverlay,
  ModalRoot,
} from '../../elements/ModalPrimitives'
import { StyledText } from '../../elements/StyledText'
import { StyledTextArea } from '../../elements/StyledTextArea'
type EditLibraryItemModalProps = {
  onOpenChange: (open: boolean) => void
  item: LibraryItem
  updateItem: (item: LibraryItem) => Promise<void>
}

export function EditLibraryItemModal(
  props: EditLibraryItemModalProps
): JSX.Element {
  const updateItem = useUpdateItem()
  const onSave = useCallback(
    (
      title: string,
      author: string | undefined,
      description: string | undefined,
      savedAt: Dayjs,
      publishedAt: Dayjs | undefined
    ) => {
      ;(async () => {
        if (title !== '') {
          const res = await updateItem.mutateAsync({
            itemId: props.item.node.id,
            slug: props.item.node.slug,
            input: {
              pageId: props.item.node.id,
              title,
              description,
              byline: author,
              savedAt: savedAt.toISOString(),
              publishedAt: publishedAt ? publishedAt.toISOString() : undefined,
            },
          })

          if (res) {
            await props.updateItem({
              cursor: props.item.cursor,
              node: {
                ...props.item.node,
                title: title,
                author: author,
                description: description,
              },
            })
            showSuccessToast('Link updated succesfully', {
              position: 'bottom-right',
            })
            props.onOpenChange(false)
          } else {
            showErrorToast('There was an error updating your link', {
              position: 'bottom-right',
            })
          }
        } else {
          showErrorToast('Title must be a non-empty value', {
            position: 'bottom-right',
          })
        }
      })()
    },
    [props]
  )

  return (
    <EditItemModal
      title={props.item.node.title}
      author={props.item.node.author}
      description={props.item.node.description}
      savedAt={dayjs(props.item.node.savedAt)}
      publishedAt={
        props.item.node.publishedAt
          ? dayjs(props.item.node.publishedAt)
          : undefined
      }
      onOpenChange={props.onOpenChange}
      onSave={onSave}
    />
  )
}

type EditArticleModalProps = {
  onOpenChange: (open: boolean) => void
  article: ArticleAttributes
  updateArticle: (
    title: string,
    author: string | undefined,
    description: string | undefined,
    savedAt: string,
    publishedAt: string | undefined
  ) => void
}

export function EditArticleModal(props: EditArticleModalProps): JSX.Element {
  const updateItem = useUpdateItem()
  const onSave = useCallback(
    (
      title: string,
      author: string | undefined,
      description: string | undefined,
      savedAt: Dayjs,
      publishedAt: Dayjs | undefined
    ) => {
      ;(async () => {
        if (title !== '') {
          const res = await updateItem.mutateAsync({
            itemId: props.article.id,
            slug: props.article.slug,
            input: {
              pageId: props.article.id,
              title,
              description,
              byline: author,
              savedAt: savedAt.toISOString(),
              publishedAt: publishedAt ? publishedAt.toISOString() : undefined,
            },
          })
          if (res) {
            props.updateArticle(
              title,
              author,
              description,
              savedAt.toISOString(),
              publishedAt ? publishedAt.toISOString() : undefined
            )
            showSuccessToast('Link updated succesfully', {
              position: 'bottom-right',
            })
            props.onOpenChange(false)
          } else {
            showErrorToast('There was an error updating your link', {
              position: 'bottom-right',
            })
          }
        } else {
          showErrorToast('Title must be a non-empty value', {
            position: 'bottom-right',
          })
        }
      })()
    },
    [props]
  )

  return (
    <EditItemModal
      title={props.article.title}
      author={props.article.author}
      description={props.article.description || ''}
      savedAt={dayjs(props.article.savedAt)}
      publishedAt={
        props.article.publishedAt ? dayjs(props.article.publishedAt) : undefined
      }
      onOpenChange={props.onOpenChange}
      onSave={onSave}
    />
  )
}

type EditItemModalProps = {
  title: string
  author: string | undefined
  description: string | undefined

  savedAt: Dayjs
  publishedAt: Dayjs | undefined
  onOpenChange: (open: boolean) => void

  onSave: (
    title: string,
    author: string | undefined,
    description: string | undefined,
    savedAt: Dayjs,
    publishedAt: Dayjs | undefined
  ) => void
}

function EditItemModal(props: EditItemModalProps): JSX.Element {
  const [title, setTitle] = useState(props.title)
  const [author, setAuthor] = useState(props.author)
  const [savedAt, setSavedAt] = useState(props.savedAt)
  const [publishedAt, setPublishedAt] = useState(props.publishedAt)
  const [description, setDescription] = useState(props.description)

  const titleStyle = {
    mt: '22px',
    mb: '2px',
    fontFamily: '$display',
    fontWeight: '600',
    fontSize: '11px',
    color: '#898989',
  }

  const inputStyle = {
    mt: '1px',
    borderRadius: '5px',
    border: '1px solid $thBorderColor',
    fontFamily: 'Inter',
    fontWeight: '500',
    fontSize: '16px',
    height: '38px',
    p: '5px',
    color: '$thTextContrast2',
    '&:focus': {
      outline: 'none !important',
      border: '1px solid $omnivoreCtaYellow',
    },
  }

  return (
    <ModalRoot
      defaultOpen
      modal={true}
      onOpenChange={() => {
        props.onOpenChange(false)
      }}
      css={{}}
    >
      <ModalOverlay />
      <ModalContent
        css={{ bg: '$grayBg', p: '20px', maxWidth: '480px' }}
        onInteractOutside={(event) => {
          event.preventDefault()
        }}
        onEscapeKeyDown={(event) => {
          props.onOpenChange(false)
          event.preventDefault()
          event.stopPropagation()
        }}
      >
        <VStack distribution="start" css={{ p: '0px' }}>
          <Header onOpenChange={props.onOpenChange} />
          <Box css={{ width: '100%' }}>
            <form
              onSubmit={(event) => {
                event.preventDefault()
                props.onSave(title, author, description, savedAt, publishedAt)
              }}
            >
              <HStack distribution="start" css={{ width: '100%' }}>
                <VStack css={{ width: '45%' }}>
                  <StyledText css={titleStyle}>SAVED AT</StyledText>
                  <FormInput
                    type="datetime-local"
                    value={savedAt.format('YYYY-MM-DDTHH:mm')}
                    placeholder="Edit Date"
                    onChange={(event) => {
                      const dateStr = event.target.value
                      setSavedAt(dayjs(dateStr))
                    }}
                    css={{
                      ...inputStyle,
                      fontSize: '14px',
                      textIndent: '0px',
                    }}
                  />
                </VStack>
                <VStack css={{ width: '45%', marginLeft: 'auto' }}>
                  <StyledText css={titleStyle}>PUBLISHED AT</StyledText>
                  <FormInput
                    type="datetime-local"
                    value={
                      publishedAt
                        ? publishedAt.format('YYYY-MM-DDTHH:mm')
                        : undefined
                    }
                    placeholder="Edit Published Date"
                    onChange={(event) => {
                      const dateStr = event.target.value
                      setPublishedAt(dayjs(dateStr))
                    }}
                    css={{
                      ...inputStyle,
                      fontSize: '14px',
                      textIndent: '0px',
                    }}
                  />
                </VStack>
              </HStack>
              <StyledText css={titleStyle}>TITLE</StyledText>
              <FormInput
                type="text"
                value={title}
                autoFocus
                placeholder="Edit Title"
                onChange={(event) => setTitle(event.target.value)}
                onFocus={(event) => {
                  event.target.select()
                }}
                css={inputStyle}
              />
              <StyledText css={titleStyle}>AUTHOR</StyledText>
              <FormInput
                type="author"
                value={author}
                placeholder="Edit Author"
                onChange={(event) => setAuthor(event.target.value)}
                onFocus={(event) => {
                  event.target.select()
                }}
                css={inputStyle}
              />
              <StyledText css={titleStyle}>DESCRIPTION</StyledText>
              <StyledTextArea
                css={{
                  ...inputStyle,
                  mt: '2px',
                  width: '100%',
                  height: '120px',
                }}
                placeholder="Edit Description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                onFocus={(event) => {
                  event.target.select()
                }}
                maxLength={4000}
              />
              <ModalButtonBar
                onOpenChange={props.onOpenChange}
                acceptButtonLabel="Save Changes"
              />
            </form>
          </Box>
        </VStack>
      </ModalContent>
    </ModalRoot>
  )
}

type HeaderProps = {
  onOpenChange: (open: boolean) => void
}

function Header(props: HeaderProps): JSX.Element {
  return (
    <HStack distribution="start" alignment="center" css={{ width: '100%' }}>
      <StyledText style="modalHeadline">Edit Title & Description</StyledText>
      <SpanBox css={{ marginLeft: 'auto' }}>
        <CloseButton close={() => props.onOpenChange(false)} />
      </SpanBox>
    </HStack>
  )
}
