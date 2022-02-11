import { Box, VStack, HStack } from '../elements/LayoutPrimitives'
import { StyledText } from '../elements/StyledText'
import { CoverImage } from '../elements/CoverImage'
import { ArticleSubtitle } from './ArticleSubtitle'


type ShareArticleViewProps = {
  url: string
  title: string
  imageURL?: string
  author?: string
  description?: string
  originalArticleUrl: string
  publishedAt: string
}

export function ShareArticleView(props: ShareArticleViewProps): JSX.Element {
  return (
    <HStack 
      alignment='start'
      distribution='start'
      css={{
        background: 'white',
        width: '100%',
        p: '10px 0px 10px 0px',
        
        boxShadow: 'rgb(120 123 134 / 12%) 0px 4px 18px'
      }}>
      {props.imageURL && (
        <CoverImage
          src={props.imageURL}
          alt='Preview Image'
          width={120}
          height={120}
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none'
          }}
        />
      )}
      <VStack >
        <Box css={{ pl: '16px', width: '100%', color: 'black', }}>
          <StyledText style='shareTitle'>{props.title}</StyledText>
          <ArticleSubtitle
            style='shareSubtitle'
            hideButton={true}
            author={props.author}
            rawDisplayDate={props.publishedAt}
            href={props.originalArticleUrl}
          />
        </Box>
      </VStack>
    </HStack>
  )
}
