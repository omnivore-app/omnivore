export const SUMMARISE_PROMPT = (articleContent: string) =>
  `Please create a summary of the article below. Please Do not exceed 25 words. Please do not add any of your own prose.\n${articleContent}\n' Here is a 25 word summary of the article:\n`;
