import Image from 'next/image'
import { VStack, Box } from '../../elements/LayoutPrimitives'
import { Button } from '../../elements/Button'
import { LandingSection } from './LandingSection'

import landingPageHeroImage from '../../../public/static/images/landing/landing-00-hero.png'
import landingSection1Image from '../../../public/static/images/landing/landing-01-save-it-now.png'
import landingSection2Image from '../../../public/static/images/landing/landing-02-newsletters.png'
import landingSection3Image from '../../../public/static/images/landing/landing-03-organisation.png'
import landingSection4Image from '../../../public/static/images/landing/landing-04-highlights-and-notes.png'
import landingSection5Image from '../../../public/static/images/landing/landing-05-sync.png'
import landingSection6Image from '../../../public/static/images/landing/landing-06-tts.png'
import landingSection7Image from '../../../public/static/images/landing/landing-07-oss.png'
import Link from 'next/link'

export function GetStartedButton(props: { lang: 'en' | 'zh' }): JSX.Element {
  return (
    <Button
      as={Link}
      href="/login"
      style="ctaDarkYellow"
      css={{
        borderRadius: 4,
        background: '$omnivoreCtaYellow',
        padding: '12px 25px',
        color: '#3D3D3D',
        fontWeight: '600',
        textDecoration: 'none',
        transition: 'background-color ease-out 50ms',
        '&:hover': {
          backgroundColor: '$omnivoreYellow',
        },
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

type LandingSectionsContainerProps = {
  lang: 'en' | 'zh'
}

const sections = [
  {
    en: {
      titleText: `Save it now. Read it later.`,
      descriptionText: `Save articles, PDFs, and Twitter threads as you come across them
      using Omnivore's mobile apps and browser extensions. Read them
      later using our distraction free reader.`,
    },
    zh: {
      titleText: `先保存，后阅读`,
      descriptionText: `看到有趣的内容，但没时间阅读？不论是文章、PDF或是推特线程，只需将它们保存下来，等稍后有空再阅读。Omnivore 应用程序适用于iOS、Android 和主要网络浏览扩展程序。`,
    },
    image: landingSection1Image,
    imageAlt: '',
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
    image: landingSection2Image,
    imageAlt: '',
  },
  {
    en: {
      titleText: `Keep your reading organized, whatever that means to you.`,
      descriptionText: `Keep your reading organized and easily available with labels,
      filters, rules, and fully indexed text searches. We're not here
      to tell you how to stay organized — our job is to give you the tools
      to build a system that works for you.`,
    },
    zh: {
      titleText: `按喜好组织阅读系统`,
      descriptionText: `我们不会限定您如何组织系统，只提供您所需的工具，如标签、过滤器和完整的文本索引搜索，让您按自己的喜好和需求设定组织规则。`,
    },
    image: landingSection3Image,
    imageAlt: '',
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
    image: landingSection4Image,
    imageAlt: '',
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
    image: landingSection5Image,
    imageAlt: '',
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
    image: landingSection6Image,
    imageAlt: '',
  },
  {
    en: {
      titleText: `Open source means you're in control.`,
      descriptionText: `Reading is a lifetime activity, and you shouldn't have to worry
      you'll lose your library after you've spent years building
      it. Our open-source platform ensures your reading won't be held
      prisoner in a proprietary system.`,
    },
    zh: {
      titleText: `开源软件给予您控制权`,
      descriptionText: `阅读是终身的活动，不应担心失去自己多年辛苦建立的图书馆。我们的开源平台，就是为了确保您的阅读不会受限于任何专有系统。`,
    },
    image: landingSection7Image,
    imageAlt: '',
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
        <Image
          src={landingPageHeroImage}
          alt="Hero image"
          sizes="(max-width: 1024px) 100vw"
          style={{
            maxWidth: '85%',
            height: 'auto',
          }}
          priority
        />
      </Box>

      {sections.map((section, sectionIndex) => {
        return (
          <LandingSection
            key={sectionIndex}
            titleText={section[props.lang].titleText}
            descriptionText={section[props.lang].descriptionText}
            imagePosition={sectionIndex % 2 ? 'left' : 'right'}
            image={
              <Image
                alt={section.imageAlt}
                src={section.image}
                sizes="(max-width: 512px) 50vw, (max-width: 512px) 100vw"
                style={{ maxWidth: '100%', height: 'auto' }}
              />
            }
          />
        )
      })}

      <VStack alignment="center" css={{
            width: "100vw",
            backgroundColor: "#fff",
            paddingBottom: "40px",
            marginTop: "40px",
            borderTop: "1px solid var(--colors-omnivoreYellow)",
            borderBottom: "1px solid var(--colors-omnivoreYellow)",
            "@md": {
              marginTop: 0,
            }
      }}>
        {props.lang == 'en' && (
          <Box
            as="p"
            css={{
              color: '#3D3D3D',
              fontWeight: '700',
              fontSize: '2.5rem',
              lineHeight: '1.25',
              textAlign: 'center',
              marginBottom: '40px',
              '@mdDown': {
                fontSize: '2rem',
              },
            }}
          >
            Get Started With Omnivore Today
          </Box>
        )}
        <GetStartedButton lang={props.lang} />
      </VStack>
    </VStack>
  )
}
