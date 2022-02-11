/* eslint-disable @typescript-eslint/naming-convention */
export enum UserRole {
  ADMIN = 'admin',
}

export enum SetClaimsRole {
  USER = 'user',
  ADMIN = 'admin',
}

export enum Table {
  USER = 'omnivore.user',
  LINKS = 'omnivore.links',

  PAGES = 'omnivore.pages',
  USER_PROFILE = 'omnivore.user_profile',
  USER_FRIEND = 'omnivore.user_friends',
  USER_FEED_ARTICLE = 'omnivore.user_feed_articles',
  USER_PERSONALIZATION = 'omnivore.user_personalization',
  ARTICLE_SAVING_REQUEST = 'omnivore.article_saving_request',
  UPLOAD_FILES = 'omnivore.upload_files',
  HIGHLIGHT = 'omnivore.highlight',
  HIGHLIGHT_REPLY = 'omnivore.highlight_reply',
  REACTION = 'omnivore.reaction',
  REMINDER = 'omnivore.reminders',
}
