import { useApplyLocalTheme } from '../../lib/hooks/useApplyLocalTheme'
import { SpanBox, VStack } from './../../components/elements/LayoutPrimitives'
import { Button } from '../../components/elements/Button'
import { useGetHomeItems } from '../../lib/networking/queries/useGetHome'
import { useCallback } from 'react'
import { refreshHomeMutation } from '../../lib/networking/mutations/refreshHome'

export default function DebugHome(): JSX.Element {
  const homeData = useGetHomeItems()
  console.log('home sections: ', homeData.errorMessage)
  useApplyLocalTheme()

  const refreshHome = useCallback(() => {
    ;(async () => {
      refreshHomeMutation()
    })()
  }, [])

  return (
    <VStack
      distribution="start"
      alignment="center"
      css={{
        width: '100%',
        bg: '$readerBg',
        pt: '45px',
        minHeight: '100vh',
      }}
    >
      <VStack
        distribution="start"
        css={{
          width: '646px',
          gap: '40px',
          minHeight: '100vh',
          '@mdDown': {
            width: '100%',
          },
        }}
      >
        <Button
          style="ctaBlue"
          onClick={(event) => {
            refreshHome()
            event.preventDefault()
          }}
        >
          Refresh
        </Button>
        {homeData.sections?.map((homeSection, idx) => {
          return (
            <VStack key={`homeSection-${idx}`} css={{ width: '100%' }}>
              <SpanBox>Section {idx}</SpanBox>
              <SpanBox>Title: {homeSection.title}</SpanBox>
              <SpanBox>Layout: {homeSection.layout}</SpanBox>
              <SpanBox>Layout: {homeSection.thumbnail}</SpanBox>

              {homeSection.items.map((homeItem) => {
                return (
                  <VStack key={homeItem.id}>
                    <SpanBox>
                      {' '}
                      - Title:{' '}
                      <a href={`/me/${homeItem.slug}`}>{homeItem.title}</a>
                    </SpanBox>
                    <SpanBox> - Score: {homeItem.score}</SpanBox>
                    <SpanBox> - Word count: {homeItem.wordCount}</SpanBox>
                    <SpanBox> - Date: {homeItem.date}</SpanBox>
                    <SpanBox> - </SpanBox>
                  </VStack>
                )
              })}
            </VStack>
          )
        })}
      </VStack>
    </VStack>
  )
}
