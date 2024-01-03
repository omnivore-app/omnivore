import { SpanBox, VStack } from '../../elements/LayoutPrimitives'

type FallbackImageProps = {
  title: string
  width: string
  height: string
  fontSize: string
}

export const GridFallbackImage = (props: FallbackImageProps): JSX.Element => {
  return (
    <VStack
      distribution="center"
      alignment="center"
      css={{
        width: props.width,
        height: props.height,
        fontSize: '16px',
        fontFamily: 'FuturaBold',
        padding: '40px',
        borderRadius: '4px',
        color: '$thFallbackImageForeground',
        backgroundColor: '$thFallbackImageBackground',
      }}
    >
      <SpanBox
        css={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          wordBreak: 'break-word',
          display: '-webkit-box',
          '-webkit-line-clamp': '2',
          '-webkit-box-orient': 'vertical',
        }}
      >
        {props.title}
      </SpanBox>
    </VStack>
  )
}

export const ListFallbackImage = (props: FallbackImageProps): JSX.Element => {
  return (
    <VStack
      distribution="center"
      alignment="center"
      css={{
        width: props.width,
        height: props.height,
        fontSize: '16px',
        fontFamily: 'FuturaBold',
        padding: '5px',
        borderRadius: '4px',
        color: '$thFallbackImageForeground',
        backgroundColor: '$thFallbackImageBackground',
      }}
    >
      <SpanBox
        css={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          wordBreak: 'break-word',
          display: '-webkit-box',
          '-webkit-line-clamp': '2',
          '-webkit-box-orient': 'vertical',
        }}
      >
        {props.title.substring(0, 3).toLocaleUpperCase()}
      </SpanBox>
    </VStack>
  )
}
