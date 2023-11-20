import { Label } from '../../../types/OmnivoreSchema'
import { fromArrayLike } from 'rxjs/internal/observable/innerFrom'

// We use this to generate the Embeddings for our topics.
const baseTopics = [
  {
    name: 'Technology',
    description:
      'Stories about Gadgets, AI, Software and other technology related topics',
  },
  {
    name: 'Politics',
    description:
      'Stories about Leadership, Elections, and issues affecting countries and the world',
  },
  {
    name: 'Health & Wellbeing',
    description: 'Stories about Physical, Mental and Preventative Health',
  },
  {
    name: 'Business & Finance',
    description:
      'Stories about the business world, startups, and the world of financial advice. ',
  },
  {
    name: 'Science & Education',
    description:
      'Stories about science, breakthroughs, and the way the world works. ',
  },
  {
    name: 'Culture',
    description:
      'Entertainment, Movies, Television and things that make life worth living',
  },
  {
    name: 'Gaming',
    description: 'PC and Console gaming, reviews, and opinions',
  },
]

export const discoveryTopics$ = fromArrayLike(baseTopics as Label[])
