export type OmnivoreArticle = {
  slug: string;
  title: string;
  description: string;
  image?: string;
  authors: string;
  site: string;
  publishedAt: Date;
  wordsCount: number;
};

export type RSSArticle = {
  title: string;
  link: string;
  description: string;
  "media:thumbnail": { "@_url": string };
  "dc:creator": string;
  pubDate: string;
};
