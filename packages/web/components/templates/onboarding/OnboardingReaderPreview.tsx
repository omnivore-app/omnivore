import { SelectionOptionCard } from './SelectOption'
import { OnboardingLayout } from '../OnboardingLayout'
import { Box, HStack, VStack } from '../../elements/LayoutPrimitives'

const articleDetails = [
  {
    title: 'Winnebago Electric RV Concept',
    author: 'Omnivore',
    originText: 'wired.com',
    description:
      "An incredible number of lines from William Shakespeare's plays have becomeso ingrained in modern vernacular …",
    image: 'https://images.hgmsites.net/sml/cadillac_100789665_s.jpg',
    labels: [],
  },
  {
    title: 'Winnebago Electric RV Concept',
    author: 'Omnivore',
    originText: 'wired.com',
    description:
      "An incredible number of lines from William Shakespeare's plays have becomeso ingrained in modern vernacular …",
    image: 'https://images.hgmsites.net/sml/cadillac_100789665_s.jpg',
    labels: [],
  },
  {
    title: '21 Phrases You Use Without Realizin…',
    author: 'Omnivore',
    originText: 'wired.com',
    description:
      "An incredible number of lines from William Shakespeare's plays have becomeso ingrained in modern vernacular …",
    image: '',
    labels: [],
  },
  {
    title: '21 Phrases You Use Without Realizin…',
    author: 'Omnivore',
    originText: 'wired.com',
    description:
      "An incredible number of lines from William Shakespeare's plays have becomeso ingrained in modern vernacular …",
    image: 'https://images.hgmsites.net/sml/cadillac_100789665_s.jpg',
    labels: [],
  },
]

type OnboardingReaderPreviewProps = {
  pageNumber: number
}

export const OnboardingReaderPreview = (
  props: OnboardingReaderPreviewProps
) => {
  return (
    <OnboardingLayout
      pageNumber={props.pageNumber}
      title="Read Distraction Free"
      subTitle="Omnivore's distraction free reader gives you an uncluttered reading experience"
      description="Add some great reads to your library now:"
      image={
        <img
          src="/static/images/onboarding/expanded-controls.svg"
          alt="Expanded control"
        />
      }
    >
      <VStack
        css={{
          marginTop: '$4',
          marginBottom: '$6',
        }}
      >
        <HStack>
          <Box
            css={{
              display: 'grid',
              gridTemplateColumns: '100%',
              gridColumnGap: '$3',
              gridRowGap: '$2',
              '@md': {
                gridTemplateColumns: '50% 50%',
              },
            }}
          >
            {articleDetails.map(
              (
                { title, author, originText, description, image, labels },
                idx
              ) => (
                <SelectionOptionCard
                  key={idx}
                  {...{ title, author, originText, description, image, labels }}
                />
              )
            )}
          </Box>
        </HStack>
      </VStack>
    </OnboardingLayout>
  )
}
