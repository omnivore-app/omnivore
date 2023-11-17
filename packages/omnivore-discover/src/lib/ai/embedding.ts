import {
  combineAll,
  combineLatestAll,
  combineLatestWith,
  map,
  mergeMap,
  zipAll,
  zipWith,
} from "rxjs/operators";
import { OmnivoreArticle } from "../../types/OmnivoreArticle";
import {
  combineLatest,
  Observable,
  OperatorFunction,
  pipe,
  share,
  tap,
  timer,
  zip,
} from "rxjs";
import { fromPromise } from "rxjs/internal/observable/innerFrom";
import { client } from "../clients/ai/client";
import { exponentialBackOff, rateLimiter } from "../utils/reactive";
import { Embedding } from "../../types/AiClient";
import { Label } from "../../types/OmnivoreSchema";

export type EmbeddedOmnivoreArticle = {
  embedding: Array<number>;
  article: OmnivoreArticle;
};

export type EmbeddedOmnivoreLabel = {
  embedding: Array<number>;
  label: Label;
  embeddingText?: string | undefined;
};

// Remove, for instance, "The Verge" and " - The Verge" to avoid the cosine similarity matching on that.
const prepareTitle = (article: OmnivoreArticle): string =>
  article.title
    .replace(article.site, "")
    .replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, "");

const getEmbeddingForArticle = async (
  it: OmnivoreArticle,
): Promise<EmbeddedOmnivoreArticle> => {
  console.log(`${prepareTitle(it)}: ${it.description}`);
  const embedding = await client.getEmbeddings(
    `${prepareTitle(it)}: ${it.description}`,
  );
  return {
    embedding,
    article: it,
  };
};

const getEmbeddingForLabel = async (
  label: Label,
): Promise<EmbeddedOmnivoreLabel> => {
  const embedding = await client.getEmbeddings(
    `${label.name}${label.description ? ":" + label.description : ""}`,
  );
  return {
    embedding,
    label: label,
    embeddingText: "",
  };
};

export const rateLimitEmbedding = () =>
  pipe(share(), rateLimiter({ resetLimit: 1000, timeMs: 60_000 }));

export const rateLimiting = rateLimitEmbedding();

export const addEmbeddingToLabel: OperatorFunction<
  Label,
  EmbeddedOmnivoreLabel
> = pipe(
  rateLimiting,
  mergeMap((it: Label) => fromPromise(getEmbeddingForLabel(it))),
);

export const addEmbeddingToArticle: OperatorFunction<
  OmnivoreArticle,
  EmbeddedOmnivoreArticle
> = pipe(
  rateLimiting,
  mergeMap((it: OmnivoreArticle) => fromPromise(getEmbeddingForArticle(it))),
);
