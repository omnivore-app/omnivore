import { Label } from '../../../types/OmnivoreSchema'
import { fromArrayLike } from 'rxjs/internal/observable/innerFrom'

// We use this to generate the Embeddings for our topics.
const baseTopics = [
  {
    name: 'Technology',
    description: 'this article is about Hardware',
  },
  {
    name: 'Technology',
    description: 'this article is about Big Tech',
  },
  {
    name: 'Technology',
    description: 'this article is about Software Engineering',
  },
  {
    name: 'Technology',
    description: 'this article is about Artificial Intelligence',
  },
  {
    name: 'Technology',
    description: 'this article is about Cloud Engineering',
  },
  {
    name: 'Technology',
    description: 'this article is about Security',
  },
  {
    name: 'Politics',
    description: 'this article is about world politics',
  },
  {
    name: 'Politics',
    description: 'this article is about Geopolitics',
  },
  {
    name: 'Politics',
    description: 'this article is about Climate Change',
  },
  {
    name: 'Politics',
    description: 'this article is about the economy',
  },
  {
    name: 'Politics',
    description: 'this article is about the healthcare',
  },
  {
    name: 'Politics',
    description: 'this article is about Social Justice',
  },
  {
    name: 'Politics',
    description: 'this article is about Republicans',
  },
  {
    name: 'Politics',
    description: 'this article is about Democrats',
  },
  {
    name: 'Politics',
    description: 'this article is about Elections',
  },
  {
    name: 'Politics',
    description: 'this article is about War',
  },
  {
    name: 'Politics',
    description: 'this article is about Policy',
  },
  {
    name: 'Politics',
    description: 'this article is about Laws',
  },
  {
    name: 'Health & Wellbeing',
    description: 'this article is about mental health',
  },
  {
    name: 'Health & Wellbeing',
    description: 'this article is about healthcare',
  },
  {
    name: 'Health & Wellbeing',
    description: 'this article is about food',
  },
  {
    name: 'Health & Wellbeing',
    description: 'this article is about family',
  },
  {
    name: 'Health & Wellbeing',
    description: 'this article is about relationship advice',
  },
  {
    name: 'Health & Wellbeing',
    description: 'this article is about sexual advice',
  },
  {
    name: 'Health & Wellbeing',
    description: 'this article is about physical health and working out',
  },
  {
    name: 'Health & Wellbeing',
    description: 'this article is about self care',
  },
  {
    name: 'Health & Wellbeing',
    description: 'this article is about self help',
  },
  {
    name: 'Health & Wellbeing',
    description: 'this article is about dating',
  },
  {
    name: 'Business & Finance',
    description: 'this article is about investments',
  },
  {
    name: 'Business & Finance',
    description: 'this article is about economics',
  },
  {
    name: 'Business & Finance',
    description: 'this article is about the economy',
  },
  {
    name: 'Business & Finance',
    description: 'this article is about capitalism',
  },
  {
    name: 'Business & Finance',
    description: 'this article is about Business',
  },
  {
    name: 'Business & Finance',
    description: 'this article is about Work and the Office',
  },
  {
    name: 'Science & Education',
    description: 'this article is about space',
  },
  {
    name: 'Science & Education',
    description: 'this article is about climate change',
  },
  {
    name: 'Science & Education',
    description: 'this article is about school',
  },
  {
    name: 'Science & Education',
    description: 'this article is about physics',
  },
  {
    name: 'Science & Education',
    description: 'this article is about pyschology',
  },
  {
    name: 'Science & Education',
    description: 'this article is about biology',
  },
  {
    name: 'Science & Education',
    description: 'this article is about breakthroughs',
  },
  {
    name: 'Culture',
    description: 'this article is about Entertainment',
  },
  {
    name: 'Culture',
    description: 'this article is about Books',
  },
  {
    name: 'Culture',
    description: 'this article is about Movies',
  },
  {
    name: 'Culture',
    description: 'this article is about Sports',
  },
  {
    name: 'Culture',
    description: 'this article is about Music',
  },
  {
    name: 'Culture',
    description: 'this article is about Actors',
  },
  {
    name: 'Culture',
    description: 'this article is about TV',
  },
  {
    name: 'Culture',
    description: 'this article is about Streaming',
  },
  {
    name: 'Gaming',
    description: 'this article is about PC Gaming',
  },
  {
    name: 'Gaming',
    description: 'this article is about Video Games',
  },
  {
    name: 'Gaming',
    description: 'this article is about XBOX',
  },
  {
    name: 'Gaming',
    description: 'this article is about PlayStation',
  },
  {
    name: 'Gaming',
    description: 'this article is about Nintendo',
  },
]

export const discoverTopics$ = fromArrayLike(baseTopics as Label[])
