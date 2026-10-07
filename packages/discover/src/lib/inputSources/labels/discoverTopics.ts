import { Label } from '../../../types/OmnivoreSchema'
import { fromArrayLike } from 'rxjs/internal/observable/innerFrom'

// We use this to generate the Embeddings for our topics.
const baseTopics = [
  // Technology
  {
    name: 'Technology',
    description:
      'New chips, GPUs, smartphones, laptops and gadgets - news about computer hardware and consumer electronics',
  },
  {
    name: 'Technology',
    description:
      'Apple, Google, Meta, Amazon and Microsoft - the business, power and controversies of the big tech companies',
  },
  {
    name: 'Technology',
    description:
      'Programming and software development - code, languages, frameworks, developer tools and open source',
  },
  {
    name: 'Technology',
    description:
      'Artificial intelligence news - new models from OpenAI and Anthropic, ChatGPT, AI capabilities, safety and regulation',
  },
  {
    name: 'Technology',
    description:
      'Cloud computing and enterprise IT - AWS, Azure, Kubernetes, DevOps, databases, hosting, VMware, virtualization and data centers',
  },
  {
    name: 'Politics',
    description:
      'Privacy, surveillance and civil liberties - government monitoring, data collection, facial recognition, public records and digital rights',
  },
  {
    name: 'Technology',
    description:
      'Cybersecurity - hacking, data breaches, ransomware, vulnerabilities, encryption and online privacy',
  },

  // Politics
  {
    name: 'Politics',
    description:
      'Politics and governments around the world - international news, diplomacy and foreign leaders',
  },
  {
    name: 'Politics',
    description:
      'Rivalry between nations - sanctions, military alliances, NATO, US-China tensions and struggles for influence',
  },
  {
    name: 'Politics',
    description:
      'Climate policy and environmental politics - emissions rules, climate summits and green energy debates',
  },
  {
    name: 'Politics',
    description:
      'Climate Change - global warming, extreme weather and ecosystems',
  },
  {
    name: 'Politics',
    description:
      'Economic policy - government budgets, taxes, interest rates and inflation as political issues',
  },
  {
    name: 'Politics',
    description:
      'Healthcare policy - health insurance, Medicare, drug prices and the politics of health systems',
  },
  {
    name: 'Politics',
    description:
      'Social justice and civil rights - racism, inequality, LGBTQ+ rights, feminism, protests and activism',
  },
  {
    name: 'Politics',
    description:
      'The Republican Party - GOP politicians, conservatism and right-wing US politics',
  },
  {
    name: 'Politics',
    description:
      'The Democratic Party - Democratic politicians, progressives and left-wing US politics',
  },
  {
    name: 'Politics',
    description:
      'Elections and campaigns - candidates, polls, voting and political races',
  },
  {
    name: 'Politics',
    description:
      'War and armed conflict - military operations, Ukraine, Gaza, weapons and ceasefires',
  },
  {
    name: 'Politics',
    description:
      'Government policy and regulation - new rules, executive orders, regulators and their impact',
  },
  {
    name: 'Politics',
    description:
      'Courts and the law - lawsuits, Supreme Court rulings, trials and criminal justice',
  },

  // Health & Wellbeing
  {
    name: 'Health & Wellbeing',
    description:
      'Mental health - anxiety, depression, therapy, stress, burnout and emotional wellbeing',
  },
  {
    name: 'Health & Wellbeing',
    description:
      'Personal health and medicine - illness, symptoms, treatments, doctors and staying healthy',
  },
  {
    name: 'Health & Wellbeing',
    description:
      'Food and cooking - recipes, restaurants, nutrition and what to eat',
  },
  {
    name: 'Health & Wellbeing',
    description:
      'Family and parenting - raising kids, pregnancy, family life and caring for relatives',
  },
  {
    name: 'Health & Wellbeing',
    description:
      'Relationships - friendship, marriage, conflict, communication and getting along with people',
  },
  {
    name: 'Health & Wellbeing',
    description:
      'Sex and intimacy - sexual health, desire, consent and intimacy in relationships',
  },
  {
    name: 'Health & Wellbeing',
    description:
      'Fitness and exercise - workouts, strength training, running and losing weight',
  },
  {
    name: 'Health & Wellbeing',
    description:
      'Self-care - rest, sleep, relaxation, skincare and routines for feeling well',
  },
  {
    name: 'Health & Wellbeing',
    description:
      'Self-improvement - productivity, habits, motivation and personal growth',
  },
  {
    name: 'Health & Wellbeing',
    description:
      'Dating and romance - dating apps, attraction and finding a partner',
  },

  // Business & Finance
  {
    name: 'Business & Finance',
    description:
      'Investing - stocks, bonds, crypto, markets and portfolio strategy',
  },
  {
    name: 'Business & Finance',
    description:
      'Economics - how economies work, trade, labor markets and economic theory',
  },
  {
    name: 'Business & Finance',
    description:
      'The economy - inflation, recession, GDP, jobs and the cost of living',
  },
  {
    name: 'Business & Finance',
    description:
      'Capitalism under scrutiny - inequality, billionaires, corporate power and critiques of the system',
  },
  {
    name: 'Business & Finance',
    description:
      'Personal finance - saving, budgeting, debt, salaries and everyday money',
  },
  {
    name: 'Business & Finance',
    description:
      'Business news - companies, startups, entrepreneurs, mergers and management',
  },
  {
    name: 'Business & Finance',
    description:
      'Work and careers - office culture, remote work, bosses, jobs and career advice',
  },

  // Science & Education
  {
    name: 'Science & Education',
    description:
      'Space exploration - NASA, SpaceX, rockets, planets and the universe',
  },
  {
    name: 'Science & Education',
    description:
      'Climate and environmental science - global warming research, extreme weather and ecosystems',
  },
  {
    name: 'Science & Education',
    description:
      'Education - schools, universities, students, teachers and learning',
  },
  {
    name: 'Science & Education',
    description:
      'Physics and math - quantum mechanics, particles, relativity and fundamental science',
  },
  {
    name: 'Science & Education',
    description:
      'Psychology - how the mind works, behavior, biases and cognitive science',
  },
  {
    name: 'Science & Education',
    description:
      'Biology - genetics, evolution, animals, ecosystems and the science of life',
  },
  {
    name: 'Science & Education',
    description:
      'Scientific discoveries - major new research, breakthrough findings and Nobel prizes',
  },

  // Culture
  {
    name: 'Culture',
    description:
      'Entertainment and pop culture - celebrity news, fame and show business',
  },
  {
    name: 'Culture',
    description: 'Books and literature - novels, authors, reviews and reading',
  },
  {
    name: 'Culture',
    description: 'Movies - new films, reviews, directors and the box office',
  },
  {
    name: 'Culture',
    description:
      'Sports - football, basketball, soccer, athletes, games and leagues',
  },
  {
    name: 'Culture',
    description:
      'Music - artists, albums, concerts, songs and the music industry',
  },
  {
    name: 'Culture',
    description:
      'Actors and celebrities - Hollywood stars, their roles and their lives',
  },
  {
    name: 'Culture',
    description: 'Television - new series, episodes, finales and what to watch',
  },
  {
    name: 'Culture',
    description: 'Streaming - Netflix, Disney+, HBO and the streaming business',
  },
  {
    name: 'Culture',
    description:
      'Travel - destinations, trips, tourism and exploring the world',
  },

  // Gaming
  {
    name: 'Gaming',
    description:
      'PC gaming - Steam, graphics cards, gaming rigs, mods and PC game releases',
  },
  {
    name: 'Gaming',
    description:
      'Video games - new releases, reviews, game design and gaming culture',
  },
  {
    name: 'Gaming',
    description: 'Xbox - Microsoft consoles, Game Pass and Xbox games',
  },
  {
    name: 'Gaming',
    description: 'PlayStation - PS5, Sony studios and PlayStation games',
  },
  {
    name: 'Gaming',
    description: 'Nintendo - Switch, Mario, Zelda and Pokémon',
  },
]

export const discoverTopics$ = fromArrayLike(baseTopics as Label[])
