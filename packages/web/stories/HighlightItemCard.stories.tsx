import { ComponentStory, ComponentMeta } from '@storybook/react'
import { HighlightItemCard, HighlightItemCardProps } from '../components/patterns/LibraryCards/HighlightItemCard'
import { updateThemeLocally } from '../lib/themeUpdater'
import { ThemeId } from '../components/tokens/stitches.config'

export default {
  title: 'Components/HighlightItemCard',
  component: HighlightItemCard,
  argTypes: {
    item: {
      description: 'The highlight.',
    },
    handleAction: {
      description: 'Action that fires on click.'
    }
  }
} as ComponentMeta<typeof HighlightItemCard>

const highlight: HighlightItemCardProps = {
  handleAction: () => console.log('Handling Action'),
  item:{
    id: "nnnnn",
    shortId: "shortId",
    quote: "children not only participate in herding work, but are also encouraged to act independently in most other areas of life. They have a say in deciding when to eat, when to sleep, and what to wear, even at temperatures of -30C (-22F).",
    annotation: "Okay… this is wild! I love this independence. Wondering how I can reponsibly instill this type of indepence in my own kids…",
    createdAt: '',
    description: 'This is a description', 
    isArchived: false,
    originalArticleUrl: 'https://example.com',
    ownedByViewer: true,
    pageId: '1',
    readingProgressAnchorIndex: 12,
    readingProgressPercent: 50,
    slug: 'slug',
    title: "This is a title", 
    uploadFileId: '1',
    url: 'https://example.com',
    author: 'Author',
    image: 'https://logos-world.net/wp-content/uploads/2021/11/Unity-New-Logo.png',
  },
}

const Template = (props: HighlightItemCardProps) => <HighlightItemCard {...props} />

export const LightHighlightItemCard: ComponentStory<
  typeof HighlightItemCard
> = (args: any) => {
  updateThemeLocally(ThemeId.Light)
  return (
    <Template {...args}/>
  )
}
export const DarkHighlightItemCard: ComponentStory<
  typeof HighlightItemCard
> = (args: any) => {
  updateThemeLocally(ThemeId.Dark)
  return (
    <Template {...args}/>
  )
}

LightHighlightItemCard.args = {
  ...highlight
}

DarkHighlightItemCard.args = {
  ...highlight
}
