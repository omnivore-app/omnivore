import { VStack, Box } from '../elements/LayoutPrimitives'
import { LandingHeader } from './landing/LandingHeader'
import {
  GetStartedButton,
  LandingSectionsContainer,
} from './landing/LandingSectionsContainer'
import { LandingFooter } from './landing/LandingFooter'

type AboutProps = {
  lang: 'en' | 'zh'
}

export function About(props: AboutProps): JSX.Element {
  return (
    <>
      <LandingHeader />
      <VStack
        alignment="center"
        css={{ background: '#2A2A2A', color: '#898989' }}
      >
        <VStack
          css={{
            alignSelf: 'center',
            marginTop: 80,
            maxWidth: 960,
            px: '2vw',
            '@md': {
              px: '6vw',
            },
            '@xl': {
              px: '120px',
            },
          }}
        >
          <Box
            as="p"
            css={{
              fontWeight: '700',
              color: '#EDEDED',
              fontSize: 45,
              lineHeight: '53px',
              padding: '10px 10px 0',
              margin: 0,
              textAlign: 'center',
            }}
          >
            {props.lang == 'zh'
              ? `Omnivore 为认真读者提供免付费read-it-later应用程序`
              : `Omnivore is the free, open source, read-it-later app for serious
            readers.`}
          </Box>
          <Box
            as="p"
            css={{
              color: '#898989',
              padding: '10px',
              margin: 0,
              textAlign: 'center',
              width: '100%',
              fontWeight: '600',
            }}
          >
            {props.lang == 'zh'
              ? `休闲阅读。保护隐私。Open source。专为知识工作者和终身学习者设计。`
              : `Distraction free. Privacy focused. Open source. Designed for
            knowledge workers and lifelong learners.`}
          </Box>

          <Box
            as="p"
            css={{
              color: '#898989',
              padding: '10px',
              margin: 0,
              textAlign: 'center',
            }}
          >
            {props.lang == 'zh'
              ? `为您保存文章、邮件订阅或文件，等休闲时再去阅读。可以随意添加注释和高亮。按自己喜好设定阅读列表。还可与其他个人电子设备同步。`
              : `Save articles, newsletters, and documents and read them later —
            focused and distraction free. Add notes and highlights. Organize
            your reading list the way you want and sync it across all your
            devices.`}
          </Box>
          <Box
            css={{
              mb: 40,
              padding: '10px',
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <GetStartedButton lang={props.lang} />
          </Box>
        </VStack>
        <LandingSectionsContainer lang={props.lang} />
      </VStack>
      <LandingFooter />
    </>
  )
}
