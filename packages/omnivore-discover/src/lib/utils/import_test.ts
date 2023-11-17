import { EmbeddedOmnivoreArticle } from "../ai/embedding";
import { filter, map, mergeMap, bufferTime, buffer } from "rxjs/operators";
import { toSql } from "pgvector/pg";
import { OmnivoreArticle } from "../../types/OmnivoreArticle";
import { from, pipe } from "rxjs";
import { fromArrayLike, fromPromise } from "rxjs/internal/observable/innerFrom";
import { sqlClient } from "../store/db";
import pgformat from "pg-format";
import { v4 } from "uuid";

export interface RawArticleOutput {
  id: string;
  title: string;
  slug: string;
  url: string;
  pageType: string;
  contentReader: string;
  createdAt: Date;
  isArchived: boolean;
  readingProgressPercent: number;
  readingProgressTopPercent: number;
  readingProgressAnchorIndex: number;
  author: string;
  image: string;
  description: string;
  publishedAt: Date;
  ownedByViewer: null;
  originalArticleUrl: string;
  uploadFileId: null;
  pageId: null;
  shortId: null;
  quote: null;
  annotation: null;
  state: string;
  siteName: string;
  subscription: null;
  readAt: Date;
  savedAt: Date;
  wordsCount: number;
}

export interface Label {
  id: string;
  name: string;
  color: string;
  createdAt: string;
}

export const batchInsertArticlesSql = async (
  raw: EmbeddedOmnivoreArticle[],
) => {
  const rawToLabel = raw.map((it) => it.article);
  const params = rawToLabel.map((it) => [
    v4(),
    "c6ed810e-6b60-11ee-b78a-4f10bc8a0e4b",
    "SUCCEEDED",
    it.slug,
    it.slug,
    it.slug,
    it.title,
    it.authors,
    it.description,
    new Date(it.publishedAt),
    new Date(it.publishedAt),
    new Date(it.publishedAt),
    null,
    null,
    new Date(it.publishedAt),
    new Date(it.publishedAt),
    "EN",
    it.wordsCount,
    it.site,
    null,
    null,
    0,
    0,
    0,
    0,
    it.image,
    "ARTICLE",
    null,
    "WEB",
  ]);

  console.log(raw);
  if (raw.length > 0) {
    const formattedMultiInsert = pgformat(
      `INSERT INTO omnivore.library_item(id, user_id, state, original_url, download_url, slug, title, author, description, saved_at, created_at, published_at, archived_at, deleted_at, read_at, updated_at, item_language, word_count, site_name, site_icon, metadata, reading_progress_last_read_anchor, reading_progress_highest_read_anchor, reading_progress_top_percent, reading_progress_bottom_percent, thumbnail, item_type, upload_file_id, content_reader) VALUES %L ON CONFLICT DO NOTHING`,
      params,
    );
    await sqlClient.query(formattedMultiInsert);

    return raw;
  }

  return raw;
};

export const batchInsertLabelsSql = async (raw: Label[]) => {
  const params = raw.map((it) => [
    it.id,
    "c6ed810e-6b60-11ee-b78a-4f10bc8a0e4b",
    it.name,
    new Date(it.createdAt),
    it.color,
    "",
    0,
    false,
    new Date(it.createdAt),
  ]);

  if (raw.length > 0) {
    const formattedMultiInsert = pgformat(
      `INSERT INTO omnivore.labels(id, user_id, name, created_at, color, description, position, internal, updated_at) VALUES %L ON CONFLICT DO NOTHING`,
      params,
    );
    await sqlClient.query(formattedMultiInsert);

    return raw;
  }

  return raw;
};

export const insertRawArticleToStore = pipe(
  bufferTime(60_000, null, 1),
  mergeMap((x: EmbeddedOmnivoreArticle[]) =>
    fromPromise(batchInsertArticlesSql(x)),
  ),
  mergeMap((it: EmbeddedOmnivoreArticle[]) => fromArrayLike(it)),
);

export const insertRawLabelsToStore = pipe(
  bufferTime(5000, null, 100),
  mergeMap((x: Label[]) => fromPromise(batchInsertLabelsSql(x))),
);
