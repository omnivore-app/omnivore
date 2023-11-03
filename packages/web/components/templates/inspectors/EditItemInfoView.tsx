import dayjs from 'dayjs'
import { ReadableItem } from '../../../lib/networking/queries/useGetLibraryItemsQuery'
import { FormInput } from '../../elements/FormElements'
import { HStack, VStack } from '../../elements/LayoutPrimitives'
import { StyledText } from '../../elements/StyledText'
import { styled } from '@stitches/react'
import { ChangeEvent, useState } from 'react'
import { articleReadingProgressMutation } from '../../../lib/networking/mutations/articleReadingProgressMutation'
import {
  clampToPercent,
  getTopOmnivoreAnchorElement,
} from '../../../lib/anchorElements'
import { FormEvent } from 'react'

type EditInfoProps = {
  item: ReadableItem
  containerRef: React.RefObject<HTMLDivElement | null>
}

export const EditItemInfoView = (props: EditInfoProps): JSX.Element => {
  const [readingProgress, setReadingProgress] = useState(
    props.item.readingProgressPercent
  )

  return (
    <VStack
      css={{
        p: '20px',
        gap: '20px',
        width: '100%',
      }}
      distribution="start"
    >
      <StyledText
        css={{
          color: '$thTextContrast2',
          fontFamily: '$inter',
          fontSize: '18px',
          fontStyle: 'normal',
          fontWeight: '600',
          lineHeight: '150%',
          m: '0px',
        }}
      >
        Edit item info
      </StyledText>
      <VStack
        css={{ width: '100%', gap: '10px', mt: '5px', mb: '20px' }}
        distribution="start"
      >
        <DateTimeRow title="Saved" date={props.item.savedAt} />
        <DateTimeRow title="Published" date={props.item.publishedAt} />
        <NumberSelectRow
          title="Reading Progress"
          type="number"
          value={readingProgress}
          max={100}
          onChange={(event: FormEvent<HTMLSelectElement>) => {
            if (
              !props.containerRef.current?.scrollHeight ||
              Number.isNaN(Number(event.currentTarget.value))
            ) {
              return
            }
            const numberValue = Number(event.currentTarget.value)
            setReadingProgress(numberValue)

            const value = numberValue / 100.0
            props.item.readingProgressPercent = value

            const position = props.containerRef.current?.scrollHeight * value
            props.containerRef?.current.scrollTo({
              top: position,
              //    behavior: 'instant',
            })
            ;(async () => {
              const articleContent = document.querySelector('#article-content')
              if (!articleContent || !props.containerRef?.current) {
                return
              }
              const anchor = getTopOmnivoreAnchorElement(
                articleContent as HTMLElement
              )
              const topPositionPercent =
                props.containerRef?.current.scrollTop /
                props.containerRef?.current.scrollHeight
              const anchorIndex = Number(anchor)

              await articleReadingProgressMutation({
                id: props.item.id,
                readingProgressPercent: clampToPercent(readingProgress),
                readingProgressTopPercent: clampToPercent(
                  topPositionPercent * 100
                ),
                readingProgressAnchorIndex:
                  anchorIndex == Number.NaN ? undefined : anchorIndex,
              })
            })()

            event.preventDefault()
          }}
        />
      </VStack>

      <FullRowText
        title="Title"
        placeholder="Edit title"
        value={props.item.title}
      />
      <FullRowText
        title="Author"
        placeholder="Edit author"
        value={props.item.author}
      />
      <FullRowText
        title="Description"
        placeholder="Edit description"
        value={props.item.description}
        multiline={true}
      />

      <FullRowText
        title="URL"
        placeholder="Edit URL"
        value={props.item.originalArticleUrl}
      />

      <FullRowText
        title="Site"
        placeholder="Edit site"
        value={props.item.siteName}
      />
    </VStack>
  )
}

type DateTimeRowProps = {
  title: string
  date: string | undefined
}

const DateTimeRow = (props: DateTimeRowProps): JSX.Element => {
  return (
    <HStack
      css={{ width: '100%', gap: '15px' }}
      distribution="end"
      alignment="center"
    >
      <StyledText
        css={{
          p: '0px',
          m: '0px',
          fontFamily: '$inter',
          fontWeight: '600',
          fontSize: '13px',
          color: '#898989',
          marginRight: 'auto',
          minWidth: '60px',
        }}
      >
        {props.title}
      </StyledText>
      <FormInput
        type="date"
        value={dayjs(props.date).format('YYYY-MM-DD')}
        onChange={(event) => {
          const dateStr = event.target.value
          // setSavedAt(dayjs(dateStr))
        }}
        css={{
          display: 'inline-flex',
          background: '$thBackground2',
          color: '$thTextSubtle',
          fontFamily: '$inter',
          fontSize: '16px',
          fontWeight: '500',
          padding: '8px 10px',
          alignItems: 'center',
          borderRadius: '5px',
          width: '148px',
          height: '35px',
        }}
      />
      <FormInput
        type="time"
        value={dayjs(props.date).format('HH:mm')}
        onChange={(event) => {
          const dateStr = event.target.value
          // setSavedAt(dayjs(dateStr))
        }}
        css={{
          background: '$thBackground2',
          color: '$thTextSubtle',
          fontFamily: '$inter',
          fontSize: '16px',
          fontWeight: '500',
          padding: '8px 10px',
          alignItems: 'center',
          borderRadius: '5px',
          width: '98px',
          height: '35px',
        }}
      />
    </HStack>
  )
}

type FullRowTextProps = {
  title: string
  value: string | undefined
  multiline?: boolean | undefined
  placeholder?: string | undefined
}

const FullRowText = (props: FullRowTextProps): JSX.Element => {
  return (
    <VStack css={{ width: '100%', gap: '5px' }}>
      <StyledText
        css={{
          fontFamily: '$inter',
          fontWeight: '600',
          fontSize: '13px',
          color: '#898989',
          marginRight: 'auto',
          m: '0px',
        }}
      >
        {props.title}
      </StyledText>
      {props.multiline ? (
        <textarea
          value={props.value}
          placeholder={props.placeholder}
          onChange={(event) => {
            const dateStr = event.target.value
            // setSavedAt(dayjs(dateStr))
          }}
          style={{
            background: 'var(--colors-thBackground2)',
            color: 'var(--colors-thTextSubtle)',
            fontFamily: 'var(--fonts-inter)',
            fontSize: '16px',
            lineHeight: '160%',
            padding: '8px 10px',
            alignItems: 'center',
            borderRadius: '5px',
            width: '100%',
            height: '160px',
            border: 'unset',
            resize: 'vertical',
          }}
        />
      ) : (
        <FormInput
          type="text"
          value={props.value}
          placeholder={props.placeholder}
          onChange={(event) => {
            const dateStr = event.target.value
            // setSavedAt(dayjs(dateStr))
          }}
          css={{
            background: '$thBackground2',
            color: '$thTextSubtle',
            fontFamily: '$inter',
            fontSize: '16px',
            fontWeight: '500',
            padding: '8px 10px',
            alignItems: 'center',
            borderRadius: '5px',
            width: '100%',
            height: '35px',
            lineHeight: '160%',
          }}
        />
      )}
    </VStack>
  )
}

type NumberSelectRowProps = {
  title: string
  type: string
  value: number
  max: number
  onChange: (event: FormEvent<HTMLSelectElement>) => void
}

const StyledSelect = styled('select', {
  display: 'inline-flex',
  background: '$thBackground2',
  color: '$thTextSubtle',
  fontFamily: '$inter',
  fontSize: '16px',
  fontWeight: '500',
  padding: '8px 10px',
  alignItems: 'center',
  borderRadius: '5px',
  width: '98px',
  height: '35px',
  border: 'unset',

  backgroundImage: `linear-gradient(45deg, transparent 50%, gray 50%),linear-gradient: '(135deg, gray 50%, transparent 50%),linear-gradient: '(to right, #ccc, #ccc)`,
  backgroundPosition: `calc(100% - 20px) calc(1em + 2px),calc(100% - 15px) calc(1em + 2px),calc(100% - 2.5em) 0.5em;`,
  backgroundSize: `5px 5px,5px 5px,1px 1.5em`,
  backgroundRepeat: 'no-repeat',
})

const NumberSelectRow = (props: NumberSelectRowProps): JSX.Element => {
  const values = []
  for (let i = 0; i <= props.max; i++) {
    values.push(i)
  }

  return (
    <HStack
      css={{ width: '100%', gap: '15px' }}
      distribution="end"
      alignment="center"
    >
      <StyledText
        css={{
          p: '0px',
          m: '0px',
          fontFamily: '$inter',
          fontWeight: '600',
          fontSize: '13px',
          color: '#898989',
          marginRight: 'auto',
          minWidth: '60px',
        }}
      >
        {props.title}
      </StyledText>
      <StyledSelect value={props.value} onChange={props.onChange}>
        {values.map((value) => {
          return (
            <option key={`option-${value}`} value={value}>
              {value}%
            </option>
          )
        })}
      </StyledSelect>
    </HStack>
  )
}
