import { OmnivoreArticle } from "./OmnivoreArticle";

export enum MessageType {
  ARTICLE = "ARTICLE",
}

export interface OmnivoreMessage<Type extends MessageType, Payload> {
  type: Type;
  payload: Payload;
}

export type OmnivoreArticleMessage = OmnivoreMessage<
  MessageType.ARTICLE,
  OmnivoreArticle
>;

export type OmnivoreMessage = OmnivoreArticleMessage;
