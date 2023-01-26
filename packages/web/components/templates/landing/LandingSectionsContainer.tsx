import { VStack, Box } from '../../elements/LayoutPrimitives'
import { Button } from '../../elements/Button'
import { LandingSection } from './LandingSection'

type GetStartedButtonProps = {
  lang: 'en' | 'zh'
}

export function GetStartedButton(props: GetStartedButtonProps): JSX.Element {
  return (
    <Button
      style="ctaDarkYellow"
      css={{
        display: 'flex',
        borderRadius: 4,
        background: 'rgb(255, 210, 52)',
        color: '#3D3D3D',
        width: '172px',
        height: '42px',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: '600',
      }}
      onClick={(e) => {
        document.location.href = '/login'
        e.preventDefault()
      }}
    >
      {props.lang == 'zh' ? `免费注册` : `Sign Up for Free`}
    </Button>
  )
}

const containerStyles = {
  px: '2vw',
  pt: 32,
  pb: 100,
  width: '100%',
  maxWidth: '1224px',
  background:
    'linear-gradient(0deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.2)), linear-gradient(0deg, rgba(253, 250, 236, 0.7), rgba(253, 250, 236, 0.7))',
  '@mdDown': {
    pt: 50,
  },
  '@md': {
    px: '6vw',
  },
  '@xl': {
    px: '100px',
  },
}

const callToActionStyles = {
  background: 'white',
  borderRadius: '24px',
  boxSizing: 'border-box',
  border: '1px solid #D8D7D5',
  boxShadow:
    '0px 7px 8px rgba(32, 31, 29, 0.03), 0px 18px 24px rgba(32, 31, 29, 0.03)',
  padding: 40,
  marginTop: 64,
  minheight: 330,
  width: 'inherit',

  '@md': {
    width: '100%',
  },
  '@xl': {
    width: '95%',
  },
}

const callToActionText = {
  color: '#3D3D3D',
  fontWeight: '700',
  fontSize: 64,
  lineHeight: '1.25',
  textAlign: 'center',
  paddingBottom: '20px',
  '@mdDown': {
    fontSize: '32px',
  },
}

type LandingSectionsContainerProps = {
  lang: 'en' | 'zh'
}

const sections = [
  {
    en: {
      titleText: `Save it now. Read it later.`,
      descriptionText: `Save articles, PDFs, and Twitter threads as you come across them
      using Omnivore&aposs mobile apps and browser extensions. Read them
      later using our distraction free reader.`,
    },
    zh: {
      titleText: `先保存，后阅读`,
      descriptionText: `看到有趣的内容，但没时间阅读？不论是文章、PDF或是推特线程，只需将它们保存下来，等稍后有空再阅读。Omnivore 应用程序适用于iOS、Android 和主要网络浏览扩展程序。`,
    },
    imageIdx: `03`,
  },
  {
    en: {
      titleText: `Get all your newsletters in one place.`,
      descriptionText: `Send newsletters directly to your Omnivore library rather than
      scattered across multiple inboxes. Read them on your own time, away
      from the constant distractions and interruptions of your email.`,
    },
    zh: {
      titleText: `集合邮件订阅`,
      descriptionText: `您不再需要到不同收件箱提取订阅的邮件，只要将它们发送到 Omnivore Library，即可在同一处随心阅读，不受其他电子邮件或 substack 的干扰。`,
    },
    imageIdx: `04`,
  },
  {
    en: {
      titleText: `Keep your reading organized, whatever that means to you.`,
      descriptionText: `Keep your reading organized and easily available with labels,
      filters, rules, and fully indexed text searches. We&aposre not here
      to tell you how to stay organized — our job is to give you the tools
      to build a system that works for you.`,
    },
    zh: {
      titleText: `按喜好组织阅读系统`,
      descriptionText: `我们不会限定您如何组织系统，只提供您所需的工具，如标签、过滤器和完整的文本索引搜索，让您按自己的喜好和需求设定组织规则。`,
    },
    imageIdx: `05`,
  },
  {
    en: {
      titleText: `Add highlights and notes.`,
      descriptionText: `Become a better reader — engage your brain and improve retention by
      reading actively, not passively. Highlight key sections and add
      notes as you read. You can access your highlights and notes any time
      — they stay with your articles forever.`,
    },
    zh: {
      titleText: `添加高亮和注释`,
      descriptionText: `想提高阅读效率？积极动用大脑，为关键的段落添加高亮或注释，能提高您阅读记忆的保留。这些标注将永久保存在文件里，方便您随时搜索使用。`,
    },
    imageIdx: `06`,
  },
  {
    en: {
      titleText: `Sync with your second brain.`,
      descriptionText: `Omnivore syncs with popular Personal Knowledge Management systems
      including Logseq and Obsidian, so you can pull all your saved
      reading, highlights, and notes into your second brain.`,
    },
    zh: {
      titleText: `与您的“第二大脑”同步`,
      descriptionText: `Omnivore 应用程序能与个人知识管理系统如 Logseq 和 Obsidian 同步，让您轻而易举地综合所有保存文章、高亮和注释。`,
    },
    imageIdx: `07`,
  },
  {
    en: {
      titleText: `Listen to your reading with text-to-speech.`,
      descriptionText: `Work through your to-be-read list and give your eyes a break with
      TTS, exclusively in the Omnivore app for iOS. Realistic,
      natural-sounding AI voices will read any saved article aloud.`,
    },
    zh: {
      titleText: `使用 text-to-speech 功能聆听阅读`,
      descriptionText: `使用TTS逼真、自然的人工智能声音为您阅读待读列表中的读物，让眼睛好好休息一下。这便是我们iOS 版Omnivore 应用程序的独家功能。`,
    },
    imageIdx: `08`,
    maxWidth: '85%',
  },
  {
    en: {
      titleText: `Open source means you're in control.`,
      descriptionText: `Reading is a lifetime activity, and you shouldn&apos;t have to worry
      you&apos;ll lose your library after you&apos;ve spent years building
      it. Our open-source platform ensures your reading won&apos;t be held
      prisoner in a proprietary system.`,
    },
    zh: {
      titleText: `开源软件给予您控制权`,
      descriptionText: `阅读是终身的活动，不应担心失去自己多年辛苦建立的图书馆。我们的开源平台，就是为了确保您的阅读不会受限于任何专有系统。`,
    },
    imageIdx: `09`,
  },
]
export function LandingSectionsContainer(
  props: LandingSectionsContainerProps
): JSX.Element {
  return (
    <VStack alignment="center" distribution="start" css={containerStyles}>
      <Box
        css={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '120px',
          '@mdDown': {
            margin: '0 0 10px 0',
          },
        }}
      >
        <img
          height="647"
          width="1015"
          srcSet="/static/landing/landingPage-feature@1x.png,
                  /static/landing/landingPage-feature@2x.png 2x,
                  /static/landing/landingPage-feature@3x.png 3x"
          alt="landingHero-1"
          style={{
            width: '85%',
            height: 'auto',
          }}
        />
      </Box>

      {sections.map((section) => {
        return (
          <LandingSection
            titleText={section[props.lang].titleText}
            descriptionText={<p>{section[props.lang].descriptionText}</p>}
            image={
              <img
                srcSet={`/static/landing/landingPage-${section.imageIdx}@1x.png,
                              /static/landing/landingPage-${section.imageIdx}@2x.png 2x,
                              /static/landing/landingPage-${section.imageIdx}@3x.png 3x`}
                alt={`landing-${section.imageIdx}`}
                style={{ maxWidth: section.maxWidth ?? '100%' }}
              />
            }
          />
        )
      })}

      <VStack alignment="center" css={callToActionStyles}>
        {props.lang == 'en' && (
          <Box css={callToActionText}>Get Started With Omnivore Today</Box>
        )}
        <GetStartedButton lang={props.lang} />
      </VStack>
    </VStack>
  )
}
