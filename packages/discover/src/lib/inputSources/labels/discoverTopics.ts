import { Label } from '../../../types/OmnivoreSchema'
import { fromArrayLike } from 'rxjs/internal/observable/innerFrom'
import { DiscoverTopic } from '../../../types/DiscoverTopic'

// We use this to generate the Embeddings for our topics.
const baseTopics = [
  // Technology
  {
    name: 'Technology',
    subject: 'Hardware',
    description:
      'New chips, GPUs, smartphones, laptops and gadgets - news about computer hardware and consumer electronics',
  },
  {
    name: 'Technology',
    subject: 'Big Tech',
    description:
      'Apple, Google, Meta, Amazon and Microsoft - the business, power and controversies of the big tech companies',
  },
  {
    name: 'Technology',
    subject: 'Programming and Software Engineering',
    description:
      'Programming and software development - code, languages, frameworks, developer tools and open source',
  },
  {
    name: 'Technology',
    subject: 'Artificial Intelligence',
    description:
      'Artificial intelligence news - new models from OpenAI and Anthropic, ChatGPT, AI capabilities, safety and regulation',
  },
  {
    name: 'Technology',
    subject: 'Cloud Computing',
    description:
      'Cloud computing and enterprise IT - AWS, Azure, Kubernetes, DevOps, databases, hosting, VMware, virtualization and data centers',
  },
  {
    name: 'Technology',
    subject: 'Cybersecurity',
    description:
      'Cybersecurity - hacking, data breaches, ransomware, vulnerabilities, encryption and online privacy',
  },

  // Politics
  {
    name: 'Politics',
    subject: 'International Politics',
    description:
      'Politics and governments around the world - international news, diplomacy and foreign leaders',
  },
  {
    name: 'Politics',
    subject: 'Civil Liberties and Privacy',
    description:
      'Political Privacy, surveillance and civil liberties - government monitoring',
  },
  {
    name: 'Politics',
    subject: 'Conflict',
    description:
      'Rivalry between nations - sanctions, military alliances, NATO, US-China tensions and struggles for influence',
  },
  {
    name: 'Politics',
    subject: 'Climate Change Politics',
    description:
      'Climate policy and environmental politics - emissions rules, climate summits and green energy debates',
  },
  {
    name: 'Politics',
    subject: 'Climate Change Events',
    description:
      'Climate Change - global warming, extreme weather and ecosystems',
  },
  {
    name: 'Politics',
    subject: 'Economic Policy',
    description:
      'Economic policy - government budgets, taxes, interest rates and inflation as political issues',
  },
  {
    name: 'Politics',
    subject: 'Healthcare',
    description:
      'Healthcare policy - health insurance, Medicare, drug prices and the politics of health systems',
  },
  {
    name: 'Politics',
    subject: 'Social Justice and civil rights',
    description:
      'Social justice and civil rights - racism, inequality, LGBTQ+ rights, feminism, protests and activism',
  },
  {
    name: 'Politics',
    subject: 'Republican Party',
    description:
      'The Republican Party - GOP politicians, conservatism and right-wing US politics',
  },
  {
    name: 'Politics',
    subject: 'Democrats',
    description:
      'The Democratic Party - Democratic politicians, progressives and left-wing US politics',
  },
  {
    name: 'Politics',
    subject: 'Elections',
    description:
      'Elections and campaigns - candidates, polls, voting and political races',
  },
  {
    name: 'Politics',
    subject: 'War',
    description:
      'War and armed conflict - military operations, Ukraine, Gaza, weapons and ceasefires',
  },
  {
    name: 'Politics',
    subject: 'Policy',
    description:
      'Government policy and regulation - new laws, executive orders',
  },
  {
    name: 'Politics',
    subject: 'Rule of Law',
    description:
      'Courts and the law - lawsuits, Supreme Court rulings, trials and criminal justice',
  },

  // Health & Wellbeing
  {
    name: 'Health & Wellbeing',
    subject: 'Mental Health',
    description:
      'Mental health - anxiety, depression, therapy, stress, burnout and emotional wellbeing',
  },
  {
    name: 'Health & Wellbeing',
    subject: 'Medicine',
    description:
      'Personal health and medicine - illness, symptoms, treatments, doctors and staying healthy',
  },
  {
    name: 'Health & Wellbeing',
    subject: 'Food and cooking',
    description:
      'Food and cooking - recipes, restaurants, nutrition and what to eat',
  },
  {
    name: 'Health & Wellbeing',
    subject: 'Family',
    description:
      'Family and parenting - raising kids, pregnancy, family life and caring for relatives',
  },
  {
    name: 'Health & Wellbeing',
    subject: 'Relationships',
    description:
      'Relationships - friendship, marriage, conflict, communication and getting along with people',
  },
  {
    name: 'Health & Wellbeing',
    subject: 'Sex and intimacy',
    description:
      'Sex and intimacy - sexual health, desire, consent and intimacy in relationships',
  },
  {
    name: 'Health & Wellbeing',
    subject: 'Fitness',
    description:
      'Fitness and exercise - workouts, strength training, running and losing weight',
  },
  {
    name: 'Health & Wellbeing',
    subject: 'Self-care',
    description:
      'Self-care - rest, sleep, relaxation, skincare and routines for feeling well',
  },
  {
    name: 'Health & Wellbeing',
    subject: 'Self Improvement and Productivity',
    description:
      'Self-improvement - productivity, habits, motivation and personal growth',
  },
  {
    name: 'Health & Wellbeing',
    subject: 'Dating and Romance',
    description:
      'Dating and romance - dating apps, attraction and finding a partner',
  },

  // Business & Finance
  {
    name: 'Business & Finance',
    subject: 'Investments',
    description:
      'Investing - stocks, bonds, crypto, markets and portfolio strategy',
  },
  {
    name: 'Business & Finance',
    subject: 'Economics and Trade',
    description:
      'Economics - how economies work, trade, labor markets and economic theory',
  },
  {
    name: 'Business & Finance',
    subject: 'The Economy',
    description:
      'The economy - inflation, recession, GDP, jobs and the cost of living',
  },
  {
    name: 'Business & Finance',
    subject: 'Capitalism',
    description:
      'Capitalism under scrutiny - inequality, billionaires, corporate power and critiques of the system',
  },
  {
    name: 'Business & Finance',
    subject: 'Personal Finance',
    description:
      'Personal finance - saving, budgeting, debt, salaries and everyday money',
  },
  {
    name: 'Business & Finance',
    subject: 'Business news',
    description:
      'Business news - companies, startups, entrepreneurs, mergers and management',
  },
  {
    name: 'Business & Finance',
    subject: 'Work and Careers',
    description:
      'Work and careers - office culture, remote work, bosses, jobs and career advice',
  },

  // Science & Education
  {
    name: 'Science & Education',
    subject: 'Space Exploration',
    description:
      'Space exploration - NASA, SpaceX, rockets, planets and the universe',
  },
  {
    name: 'Science & Education',
    subject: 'Climate Change',
    description:
      'Climate and environmental science - global warming research, extreme weather and ecosystems',
  },
  {
    name: 'Science & Education',
    subject: 'Education',
    description:
      'Education - schools, universities, students, teachers and learning',
  },
  {
    name: 'Science & Education',
    subject: 'Physics and Maths',
    description:
      'Physics and math - quantum mechanics, particles, relativity and fundamental science',
  },
  {
    name: 'Science & Education',
    subject: 'Psychology',
    description:
      'Psychology - how the mind works, behavior, biases and cognitive science',
  },
  {
    name: 'Science & Education',
    subject: 'Biology',
    description:
      'Biology - genetics, evolution, animals, ecosystems and the science of life',
  },
  {
    name: 'Science & Education',
    subject: 'Scientific Discovery',
    description:
      'Scientific discoveries - major new research, breakthrough findings and Nobel prizes',
  },

  // Culture
  {
    name: 'Culture',
    subject: 'Entertainment and Pop Culture',
    description:
      'Entertainment and pop culture - celebrity news, fame and show business',
  },
  {
    name: 'Culture',
    subject: 'Books and Literature',
    description: 'Books and literature - novels, authors, reviews and reading',
  },
  {
    name: 'Culture',
    subject: 'Movies',
    description: 'Movies - new films, reviews, directors and the box office',
  },
  {
    name: 'Culture',
    subject: 'Sports',
    description:
      'Sports - football, basketball, soccer, athletes, games and leagues',
  },
  {
    name: 'Culture',
    subject: 'Music',
    description:
      'Music - artists, albums, concerts, songs and the music industry',
  },
  {
    name: 'Culture',
    subject: 'Actors and Celebrity',
    description:
      'Actors and celebrities - Hollywood stars, their roles and their lives',
  },
  {
    name: 'Culture',
    subject: 'Television',
    description: 'Television - new series, episodes, finales and what to watch',
  },
  {
    name: 'Culture',
    subject: 'Streaming',
    description: 'Streaming - Netflix, Disney+, HBO and the streaming business',
  },
  {
    name: 'Culture',
    subject: 'Travel',
    description:
      'Travel - destinations, trips, tourism and exploring the world',
  },

  // Gaming
  {
    name: 'Gaming',
    subject: 'PC gaming',
    description:
      'PC gaming - Steam, graphics cards, gaming rigs, mods and PC game releases',
  },
  {
    name: 'Gaming',
    subject: 'Video games',
    description:
      'Video games - new releases, reviews, game design and gaming culture',
  },
  {
    name: 'Gaming',
    subject: 'Xbox',
    description: 'Xbox - Microsoft consoles, Game Pass and Xbox games',
  },
  {
    name: 'Gaming',
    subject: 'PlayStation',
    description: 'PlayStation - PS5, Sony studios and PlayStation games',
  },
  {
    name: 'Gaming',
    subject: 'Nintendo',
    description: 'Nintendo - Switch, Mario, Zelda and Pokémon',
  },
]

export const discoverTopics$ = fromArrayLike(baseTopics as DiscoverTopic[])
