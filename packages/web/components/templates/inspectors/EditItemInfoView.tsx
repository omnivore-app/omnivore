import dayjs from 'dayjs'
import { ReadableItem } from '../../../lib/networking/queries/useGetLibraryItemsQuery'
import { FormInput } from '../../elements/FormElements'
import { Box, HStack, VStack } from '../../elements/LayoutPrimitives'
import { StyledText } from '../../elements/StyledText'

type EditInfoProps = {
  item: ReadableItem
}

export const EditItemInfoView = (props: EditInfoProps): JSX.Element => {
  return (
    <VStack
      css={{
        p: '20px',
        gap: '20px',
        width: '100%',
        height: '100%',
        minHeight: '100%',
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
        css={{ width: '100%', gap: '5px', my: '10px' }}
        distribution="start"
      >
        <DateTimeRow title="Saved" date={props.item.savedAt} />
        <DateTimeRow title="Published" date={props.item.publishedAt} />
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

      {/* <StyledText css={titleStyle}>TITLE</StyledText>
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
        /> */}
      <Box css={{ height: '320px' }}></Box>
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
          fontSize: '12px',
          fontWeight: '500',
          padding: '8px 10px',
          alignItems: 'center',
          borderRadius: '5px',
          width: '128px',
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
          fontSize: '12px',
          fontWeight: '500',
          padding: '8px 10px',
          alignItems: 'center',
          borderRadius: '5px',
          width: '128px',
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
          rows={5}
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
            fontSize: '12px',
            // fontWeight: '500',
            lineHeight: '160%',
            padding: '8px 10px',
            alignItems: 'center',
            borderRadius: '5px',
            width: '100%',
            height: '73px',
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
            fontSize: '12px',
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
