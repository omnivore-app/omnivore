import {
  ModalRoot,
  ModalContent,
  ModalOverlay,
} from '../../elements/ModalPrimitives'
import { VStack, HStack, Box } from '../../elements/LayoutPrimitives'
import { Button } from '../../elements/Button'
import { StyledText } from '../../elements/StyledText'

import { FormInput } from '../../elements/FormElements'
import { useCallback, useState } from 'react'
import { LibraryItem } from '../../../lib/networking/queries/useGetLibraryItemsQuery'
import { StyledTextArea } from '../../elements/StyledTextArea'
import { updatePageMutation } from '../../../lib/networking/mutations/updatePageMutation'
import { showErrorToast, showSuccessToast } from '../../../lib/toastHelpers'
import dayjs, { Dayjs } from 'dayjs'
import { X } from 'phosphor-react'
import { ArticleAttributes } from '../../../lib/networking/queries/useGetArticleQuery'

type EditLibraryItemModalProps = {
  onOpenChange: (open: boolean) => void
  item: LibraryItem
  updateItem: (item: LibraryItem) => Promise<void>
}

export function EditLibraryItemModal(
  props: EditLibraryItemModalProps
): JSX.Element {
  const onSave = useCallback(
    (
      title: string,
      author: string | undefined,
      description: string,
      savedAt: Dayjs,
      publishedAt: Dayjs | undefined
    ) => {
      ;(async () => {
        if (title !== '') {
          const res = await updatePageMutation({
            pageId: props.item.node.id,
            title,
            description,
            byline: author,
            // savedAt: savedAt.toISOString(),
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
    []
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
    description: string,
    savedAt: string,
    publishedAt: string | undefined
  ) => void
}

export function EditArticleModal(props: EditArticleModalProps): JSX.Element {
  const onSave = useCallback(
    (
      title: string,
      author: string | undefined,
      description: string,
      savedAt: Dayjs,
      publishedAt: Dayjs | undefined
    ) => {
      ;(async () => {
        if (title !== '') {
          const res = await updatePageMutation({
            pageId: props.article.id,
            title,
            description,
            byline: author,
            // savedAt: savedAt.toISOString(),
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
    []
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
  description: string

  savedAt: Dayjs
  publishedAt: Dayjs | undefined
  onOpenChange: (open: boolean) => void

  onSave: (
    title: string,
    author: string | undefined,
    description: string,
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
    fontFamily: 'SF Pro Display',
    fontWeight: '600',
    fontSize: '9px',
    color: '#898989',
  }

  return (
    <ModalRoot defaultOpen onOpenChange={props.onOpenChange} css={{}}>
      <ModalOverlay />
      <ModalContent
        css={{ bg: '$grayBg', p: '20px', maxWidth: '400px' }}
        onInteractOutside={() => {
          // remove focus from modal
          ;(document.activeElement as HTMLElement).blur()
        }}
      >
        <VStack distribution="start" css={{ p: '0px' }}>
          <Header onOpenChange={props.onOpenChange} />
          <Box css={{ width: '100%' }}>
            <form
              onSubmit={(event) => {
                event.preventDefault()
              }}
            >
              <HStack distribution="start" css={{ width: '100%' }}>
                <VStack css={{ width: '45%' }}>
                  <StyledText css={titleStyle}>SAVED AT:</StyledText>
                  <FormInput
                    type="datetime-local"
                    value={props.savedAt.format('YYYY-MM-DDThh:mm')}
                    autoFocus
                    placeholder="Edit Date"
                    onChange={(event) => {
                      const dateStr = event.target.value
                      setSavedAt(dayjs(dateStr))
                    }}
                    css={{
                      mt: '1px',
                      borderRadius: '5px',
                      border: '1px solid #D9D9D9',
                      fontFamily: 'Inter',
                      fontWeight: '500',
                      fontSize: '12px',
                      height: '30px',
                      p: '5px',
                      color: '#3D3D3D',
                      '&:focus': {
                        outline: 'none !important',
                        border: '1px solid $omnivoreCtaYellow',
                      },
                    }}
                  />
                </VStack>
                <VStack css={{ width: '45%', marginLeft: 'auto' }}>
                  <StyledText css={titleStyle}>PUBLISHED AT</StyledText>
                  <FormInput
                    type="datetime-local"
                    value={
                      props.publishedAt
                        ? props.publishedAt.format('YYYY-MM-DDThh:mm')
                        : undefined
                    }
                    autoFocus
                    placeholder="Edit Published Date"
                    onChange={(event) => {
                      const dateStr = event.target.value
                      setPublishedAt(dayjs(dateStr))
                    }}
                    css={{
                      mt: '1px',
                      borderRadius: '5px',
                      border: '1px solid #D9D9D9',
                      fontFamily: 'Inter',
                      fontWeight: '500',
                      fontSize: '12px',
                      height: '30px',
                      p: '5px',
                      color: '#3D3D3D',
                      '&:focus': {
                        outline: 'none !important',
                        border: '1px solid $omnivoreCtaYellow',
                      },
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
                css={{
                  borderRadius: '5px',
                  border: '1px solid #D9D9D9',
                  width: '100%',
                  fontFamily: 'Inter',
                  fontWeight: '500',
                  fontSize: '12px',
                  height: '30px',
                  p: '5px',
                  color: '#3D3D3D',
                  '&:focus': {
                    outline: 'none !important',
                    border: '1px solid $omnivoreCtaYellow',
                  },
                }}
              />
              <StyledText css={titleStyle}>AUTHOR</StyledText>
              <FormInput
                type="author"
                value={author}
                autoFocus
                placeholder="Edit Author"
                onChange={(event) => setAuthor(event.target.value)}
                css={{
                  borderRadius: '5px',
                  border: '1px solid #D9D9D9',
                  width: '100%',
                  fontFamily: 'Inter',
                  fontWeight: '500',
                  fontSize: '12px',
                  height: '30px',
                  p: '5px',
                  color: '#3D3D3D',
                  '&:focus': {
                    outline: 'none !important',
                    border: '1px solid $omnivoreCtaYellow',
                  },
                }}
              />
              <StyledText css={titleStyle}>DESCRIPTION</StyledText>

              <StyledTextArea
                css={{
                  borderRadius: '5px',
                  border: '1px solid #D9D9D9',
                  width: '100%',
                  fontFamily: 'Inter',
                  fontWeight: '500',
                  fontSize: '12px',
                  height: '120px',
                  p: '5px',
                  color: '#3D3D3D',
                  mt: '2px',
                  '&:focus': {
                    outline: 'none !important',
                    border: '1px solid $omnivoreCtaYellow',
                  },
                }}
                placeholder="Edit Description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                maxLength={4000}
              />
              <HStack distribution="end" css={{ mt: '12px', width: '100%' }}>
                <Button
                  onClick={() => props.onOpenChange(false)}
                  style="cancelGeneric"
                  css={{ mr: '5px' }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    props.onSave(
                      title,
                      author,
                      description,
                      savedAt,
                      publishedAt
                    )
                  }}
                  style="ctaDarkYellow"
                  css={{ mb: '0px' }}
                >
                  Save Changes
                </Button>
              </HStack>
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
      <StyledText css={{}} style="modalHeadline">
        Edit Title & Description
      </StyledText>
      <Box
        css={{
          display: 'flex',
          marginLeft: 'auto',
          height: '20px',
          width: '20px',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '1000px',
          '&:hover': {
            bg: '#EBEBEB',
          },
        }}
      >
        <Button
          css={{
            cursor: 'pointer',
            marginLeft: 'auto',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          style="ghost"
          onClick={() => {
            props.onOpenChange(false)
          }}
        >
          <X width={10} height={10} weight="bold" color="#898989" />
        </Button>
      </Box>
    </HStack>
  )
}
