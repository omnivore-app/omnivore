/* eslint-disable react/no-children-prop */
import { PrimaryLayout } from '../../../components/templates/PrimaryLayout'
import { useRouter } from 'next/router'
import { Toaster } from 'react-hot-toast'
import {
  Blockquote,
  HStack,
  SpanBox,
  VStack,
} from '../../../components/elements/LayoutPrimitives'
import { styled, theme } from '../../../components/tokens/stitches.config'
import { Avatar } from '../../../components/elements/Avatar'
import { Circle, DotsThree } from 'phosphor-react'
import ReactMarkdown from 'react-markdown'
import { highlightColorVar } from '../../../lib/themeUpdater'
import { useGetPostQuery } from '../../../lib/networking/queries/useGetPost'

import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

export default function Post(): JSX.Element {
  const router = useRouter()
  const postResponse = useGetPostQuery(router.query.idx as string)

  console.log('loading post: ', postResponse, 'for', router.query.idx)

  return (
    <PrimaryLayout
      pageTestId="home-page-tag"
      pageMetaDataProps={{
        title: '',
        path: router.pathname,
        description: '',
      }}
    >
      <Toaster />
      <VStack
        id="article-wrapper"
        alignment="center"
        distribution="start"
        className="disable-webkit-callout"
        css={{
          width: '100%',
          height: '100%',
          background: '$readerBg',
          overflow: 'scroll',
          '@media print': {
            paddingTop: '0px',
          },
          bg: '$readerBg',
        }}
      >
        <VStack
          id="article-container"
          alignment="start"
          distribution="start"
          css={{
            gap: '10px',
            width: '100%',
            height: '100vh',
            padding: '16px',
            maxWidth: '527px',
            paddingTop: '100px',
            background: theme.colors.thPostBg.toString(),
            '--blockquote-padding': '0.5em 1em',
            '--blockquote-icon-font-size': '1.3rem',
            '--figure-margin': '1.6rem auto',
            '--hr-margin': '1em',
          }}
        >
          {postResponse?.post && !postResponse.isValidating && (
            <HStack
              alignment="center"
              distribution="start"
              css={{ gap: '10px', width: '100%' }}
            >
              <Avatar
                height={'25px'}
                fallbackText={''}
                imageURL={postResponse.post.userAvatar}
              />
              <SpanBox style="postPosterName">
                {postResponse.post.displayName || postResponse.post.username}
              </SpanBox>
              <Circle
                size={4}
                weight="fill"
                color={theme.colors.thNotebookSubtle.toString()}
              />
              <SpanBox style="postPostTime" title={postResponse.post.createdAt}>
                {dayjs(postResponse.post.createdAt).fromNow()}
              </SpanBox>
              <SpanBox
                style="postPostTime"
                css={{ ml: 'auto', display: 'flex' }}
              >
                <DotsThree
                  size="20"
                  color={theme.colors.thNotebookSubtle.toString()}
                />
              </SpanBox>
            </HStack>
          )}
          {postResponse?.post && !postResponse.isValidating && (
            <SpanBox>{postResponse.post.content}</SpanBox>
          )}
          <SpanBox css={{ height: '10px' }} />
          <PostHighlight
            title="The Secrets of Arctic Survival Parenting"
            content="majority of Sámi, her family is no longer fully nomadic, instead travelling widely by snow-mobile, which has transformed the lives of reindeer herders and allowed them to become more settled."
            highlightColor={highlightColorVar('yellow')}
          ></PostHighlight>
          <SpanBox style="postPosterName" css={{ mt: '35px' }}>
            Links
          </SpanBox>
          <PostLink
            siteName="bbc.com"
            title="The Secrets of Arctic Survival Parenting"
            author="Jane Nealsen, Alfie Kohn"
            imageURL="https://dynaimage.cdn.cnn.com/cnn/digital-images/org/f2d83c25-dd01-4b47-952c-5b9b2aa3bfd4.jpg"
          ></PostLink>
        </VStack>
      </VStack>
    </PrimaryLayout>
  )
}

const StyledQuote = styled(Blockquote, {
  p: '0px',
  pl: '10px',
  pb: '0px',
  margin: '0px 0px 0px 0px',
  fontSize: '18px',
  lineHeight: '27px',
  width: '100%',
  borderLeft: '2px solid #FFD234',
})

type PostHighlightProps = {
  title: string
  content: string
  highlightColor: string
}

function PostHighlight(props: PostHighlightProps): JSX.Element {
  return (
    <VStack
      css={{
        bg: '$readerMargin',
        py: '10px',
        px: '15px',
        pb: '15px',
        borderRadius: '5px',
        gap: '10px',
      }}
    >
      <SpanBox style="postHighlightTitle">{props.title}</SpanBox>
      <StyledQuote>
        <SpanBox
          css={{
            '> *': {
              display: 'inline',
              padding: '3px',
              backgroundColor: `rgba(${props.highlightColor}, var(--colors-highlight_background_alpha))`,
              boxDecorationBreak: 'clone',
              borderRadius: '2px',
            },
            '> ul': {
              display: 'block',
              boxShadow: 'unset',
              backgroundColor: 'unset',
            },
            fontSize: '15px',
            lineHeight: 1.5,
            color: '$thTextSubtle2',
            img: {
              display: 'block',
              margin: '0.5em auto !important',
              maxWidth: '100% !important',
              height: 'auto',
            },
          }}
        >
          <ReactMarkdown children={props.content} />
        </SpanBox>
      </StyledQuote>
    </VStack>
  )
}

type PostLinkProps = {
  siteName: string
  title: string
  author: string
  imageURL: string
}

function PostLink(props: PostLinkProps): JSX.Element {
  return (
    <HStack
      css={{
        bg: '$readerMargin',
        py: '10px',
        px: '15px',
        borderRadius: '5px',
        gap: '35px',
        width: '100%',
      }}
      alignment="start"
      distribution="start"
    >
      <SpanBox css={{ width: '30px', height: '50px' }}>
        <img src={props.imageURL} width={30} height={50} />
      </SpanBox>
      <VStack distribution="start" alignment="start">
        <SpanBox style="postLinkSubtle" css={{ mb: 'auto' }}>
          {props.siteName}
        </SpanBox>
        <SpanBox style="postLinkBold">{props.title}</SpanBox>
        <SpanBox style="postLinkSubtle" css={{ mb: 'auto' }}>
          {props.author}
        </SpanBox>
      </VStack>
    </HStack>
  )
}
