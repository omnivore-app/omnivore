import { ComponentStory, ComponentMeta } from '@storybook/react'
import { ShareHighlightModal } from '../components/templates/article/ShareHighlightModal'
import { Highlight } from '../lib/networking/fragments/highlightFragment'
import { updateThemeLocally } from '../lib/themeUpdater'
import { ThemeId } from '../components/tokens/stitches.config'

export default {
  title: 'Components/ShareHighlightModal',
  parameters: {
    previewTabs: {
      'storybook/docs/panel': { hidden: true },
    },
    viewMode: 'canvas',
  },
  component: ShareHighlightModal,
  argTypes: {
    author: { control: 'text' },
    title: { control: 'text' },
  },
} as ComponentMeta<typeof ShareHighlightModal>

const Template = (props: {
  highlight: Highlight
  handleOpenChange: () => void
  title: string
  author: string
}) => {
  return (
    <ShareHighlightModal
      url={`https://example.com/${props.highlight.shortId}`}
      title={props.title}
      author={props.author}
      highlight={props.highlight}
      onOpenChange={() => props.handleOpenChange()}
    />
  )
}

const highlight: Highlight = {
  id: 'nnnnn',
  shortId: 'shortId',
  quote:
    'children not only participate in herding work, but are also encouraged to act independently in most other areas of life. They have a say in deciding when to eat, when to sleep, and what to wear, even at temperatures of -30C (-22F).',
  patch: 'patchhhhhhy',
  createdByMe: true,
  updatedAt: '123',
  sharedAt: '123',
  prefix:
    "Among the Sami, an indigenous people spread across the northernmost regions of Norway, Sweden, Finland and Russia's Kola Peninsula,",
  suffix:
    ' To outsiders, that independence can be surprising. Missionaries who visited the Arctic in the 18th Century and later, wrote in their diaries that it seemed like Sámi children could do whatever they liked, and that they lacked discipline altogether.',
}

const highlightWithAnnotation: Highlight = {
  ...highlight,
  annotation:
    'Okay… this is wild! I love this independence. Wondering how I can reponsibly instill this type of indepence in my own kids…',
}

export const LightShareHightlightModal: ComponentStory<
  typeof ShareHighlightModal
> = (args: any) => {
  updateThemeLocally(ThemeId.Light)
  highlight.annotation = undefined
  return (
    <Template {...args} handleOpenChange={() => console.log('open changed')} />
  )
}

export const DarkShareHightlightModal: ComponentStory<
  typeof ShareHighlightModal
> = (args: any) => {
  updateThemeLocally(ThemeId.Dark)
  highlight.annotation = undefined
  return (
    <Template {...args} handleOpenChange={() => console.log('open changed')} />
  )
}

export const LightShareHightlightModalWithNote: ComponentStory<
  typeof ShareHighlightModal
> = (args: any) => {
  updateThemeLocally(ThemeId.Light)
  return (
    <Template {...args} handleOpenChange={() => console.log('open changed')} />
  )
}

export const DarkShareHightlightModalWithNote: ComponentStory<
  typeof ShareHighlightModal
> = (args: any) => {
  updateThemeLocally(ThemeId.Dark)
  return (
    <Template {...args} handleOpenChange={() => console.log('open changed')} />
  )
}

LightShareHightlightModal.args = {
  highlight: highlight,
  title: 'The secret of Arctic ‘survival parenting',
  author: ' by Suvi Pilvi King by bbc.com',
}

DarkShareHightlightModal.args = {
  ...LightShareHightlightModal.args,
}

LightShareHightlightModalWithNote.args = {
  ...LightShareHightlightModal.args,
  highlight: highlightWithAnnotation,
}

DarkShareHightlightModalWithNote.args = {
  ...LightShareHightlightModalWithNote.args,
}
