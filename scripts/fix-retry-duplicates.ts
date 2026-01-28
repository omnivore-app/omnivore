#!/usr/bin/env node
/**
 * Fixes duplicate LibraryItems created by earlier retry runs that didn't reuse
 * the original LibraryItem id and/or didn't preserve saved_at.
 *
 * Typical symptom:
 * - Old item is stuck in PROCESSING with URL containing tracking params (utm_*).
 * - A newer "duplicate" item exists for the same user with the cleaned URL.
 *
 * This script:
 * - Finds PROCESSING items where cleanUrl(original_url) differs from original_url
 * - If another item exists for the same user with original_url == cleaned URL:
 *   - Moves foreign key references (highlights, entity_labels, etc.) from duplicate -> original
 *   - Optionally copies "content-ish" fields from duplicate -> original if duplicate looks more complete
 *   - Updates original.original_url to the cleaned URL
 *   - Hard-deletes the duplicate row (required due to unique index on user_id+md5(original_url))
 *
 * Usage:
 *   direnv exec . npx tsx scripts/fix-retry-duplicates.ts            # dry-run
 *   direnv exec . npx tsx scripts/fix-retry-duplicates.ts --apply   # apply changes
 */

import { execSync } from "node:child_process";

type LibraryItemRow = {
	id: string;
	userId: string;
	url: string;
	state: string;
	savedAt: string;
	createdAt: string;
	updatedAt: string;
	folder: string;
	hasRealContent: boolean;
};

const POSTGRES_CONTAINER = process.env.POSTGRES_CONTAINER || "omnivore-postgres";
const APPLY = process.argv.includes("--apply");

const SAVING_CONTENT = "Your link is being saved...";

function sqlStringLiteral(value: string) {
	return `'${value.replace(/'/g, "''")}'`;
}

function cleanUrl(input: string) {
	let u: URL;
	try {
		u = new URL(input);
	} catch {
		return input;
	}

	u.hash = "";

	const isTweet =
		(u.hostname === "twitter.com" || u.hostname.endsWith(".twitter.com")) &&
		u.pathname.includes("/status");

	const filteredParams: Array<[string, string]> = [];
	for (const [key, value] of u.searchParams) {
		if (/^utm_\w+/i.test(key)) continue;
		if (isTweet && (key === "s" || key === "t")) continue;
		filteredParams.push([key, value]);
	}

	// normalize-url defaults to sorting query parameters; mimic that behavior.
	filteredParams.sort((a, b) => {
		if (a[0] < b[0]) return -1;
		if (a[0] > b[0]) return 1;
		if (a[1] < b[1]) return -1;
		if (a[1] > b[1]) return 1;
		return 0;
	});

	u.search = "";
	for (const [key, value] of filteredParams) {
		u.searchParams.append(key, value);
	}

	let out = u.toString();

	// URL serialization adds a trailing slash for bare origins; preserve the original form if it had none.
	if (/^https?:\/\/[^/]+$/i.test(input) && out.endsWith("/")) {
		out = out.slice(0, -1);
	}

	return out;
}

function runPsqlJsonLines(sql: string): any[] {
	const out = execSync(
		`docker exec ${POSTGRES_CONTAINER} psql -U postgres omnivore -v ON_ERROR_STOP=1 -t -A -c "${sql.replace(/"/g, '\\"')}"`,
		{ encoding: "utf-8" },
	);

	return out
		.trim()
		.split("\n")
		.map((line) => line.trim())
		.filter((line) => line.length > 0)
		.map((line) => JSON.parse(line));
}

function chunk<T>(arr: T[], size: number): T[][] {
	const chunks: T[][] = [];
	for (let i = 0; i < arr.length; i += size) chunks.push(arr.slice(i, i + size));
	return chunks;
}

function fetchProcessingItems(): LibraryItemRow[] {
	const sql = `
SELECT json_build_object(
  'id', id,
  'userId', user_id,
  'url', original_url,
  'state', state,
  'savedAt', saved_at,
  'createdAt', created_at,
  'updatedAt', updated_at,
  'folder', folder,
  'hasRealContent', (readable_content IS NOT NULL AND readable_content <> ${sqlStringLiteral(SAVING_CONTENT)})
)
FROM omnivore.library_item
WHERE state = 'PROCESSING' AND deleted_at IS NULL;
`;
	return runPsqlJsonLines(sql) as LibraryItemRow[];
}

type TargetKey = string;
const targetKey = (userId: string, url: string): TargetKey => `${userId}::${url}`;

function fetchItemsByUserAndUrl(targets: Array<{ userId: string; url: string }>) {
	if (targets.length === 0) return new Map<TargetKey, LibraryItemRow>();

	const result = new Map<TargetKey, LibraryItemRow>();
	for (const group of chunk(targets, 200)) {
		const values = group
			.map(
				(t) =>
					`(${sqlStringLiteral(t.userId)}::uuid, ${sqlStringLiteral(t.url)}::text)`,
			)
			.join(",\n");

		const sql = `
WITH targets(user_id, original_url) AS (
  VALUES
  ${values}
)
SELECT json_build_object(
  'id', li.id,
  'userId', li.user_id,
  'url', li.original_url,
  'state', li.state,
  'savedAt', li.saved_at,
  'createdAt', li.created_at,
  'updatedAt', li.updated_at,
  'folder', li.folder,
  'hasRealContent', (li.readable_content IS NOT NULL AND li.readable_content <> ${sqlStringLiteral(SAVING_CONTENT)})
)
FROM omnivore.library_item li
INNER JOIN targets t
  ON li.user_id = t.user_id AND li.original_url = t.original_url
WHERE li.deleted_at IS NULL;
`;

		const rows = runPsqlJsonLines(sql) as LibraryItemRow[];
		for (const row of rows) result.set(targetKey(row.userId, row.url), row);
	}
	return result;
}

type FixPair = {
	original: LibraryItemRow;
	duplicate: LibraryItemRow;
	cleanedUrl: string;
};

function buildFixPairs(processing: LibraryItemRow[]): FixPair[] {
	const candidates: Array<{ userId: string; url: string }> = [];
	const cleanedByOriginalId = new Map<string, string>();

	for (const item of processing) {
		const cleaned = cleanUrl(item.url);
		if (cleaned !== item.url) {
			cleanedByOriginalId.set(item.id, cleaned);
			candidates.push({ userId: item.userId, url: cleaned });
		}
	}

	const candidateMap = fetchItemsByUserAndUrl(
		Array.from(
			new Map(candidates.map((t) => [targetKey(t.userId, t.url), t])).values(),
		),
	);

	const pairs: FixPair[] = [];
	for (const item of processing) {
		const cleanedUrl = cleanedByOriginalId.get(item.id);
		if (!cleanedUrl) continue;
		const dup = candidateMap.get(targetKey(item.userId, cleanedUrl));
		if (!dup) continue;
		if (dup.id === item.id) continue;
		pairs.push({ original: item, duplicate: dup, cleanedUrl });
	}

	// Stable output: oldest originals first
	pairs.sort((a, b) => a.original.savedAt.localeCompare(b.original.savedAt));
	return pairs;
}

function applyFix(pair: FixPair) {
	const originalId = pair.original.id;
	const duplicateId = pair.duplicate.id;
	const cleanedUrl = pair.cleanedUrl;

	const shouldCopyContent =
		pair.duplicate.state !== "PROCESSING" || pair.duplicate.hasRealContent;

	const sql = `
BEGIN;

-- Move FKs from duplicate -> original (avoid cascade deletes losing data)
UPDATE omnivore.highlight SET library_item_id = ${sqlStringLiteral(originalId)}::uuid
WHERE library_item_id = ${sqlStringLiteral(duplicateId)}::uuid;

-- Avoid unique conflicts for labels, then move library-item labels
DELETE FROM omnivore.entity_labels el_dup
USING omnivore.entity_labels el_old
WHERE el_dup.library_item_id = ${sqlStringLiteral(duplicateId)}::uuid
  AND el_dup.highlight_id IS NULL
  AND el_old.library_item_id = ${sqlStringLiteral(originalId)}::uuid
  AND el_old.highlight_id IS NULL
  AND el_dup.label_id = el_old.label_id;

UPDATE omnivore.entity_labels
SET library_item_id = ${sqlStringLiteral(originalId)}::uuid
WHERE library_item_id = ${sqlStringLiteral(duplicateId)}::uuid
  AND highlight_id IS NULL;

UPDATE omnivore.ai_summaries
SET library_item_id = ${sqlStringLiteral(originalId)}::uuid
WHERE library_item_id = ${sqlStringLiteral(duplicateId)}::uuid;

UPDATE omnivore.recommendation
SET library_item_id = ${sqlStringLiteral(originalId)}::uuid
WHERE library_item_id = ${sqlStringLiteral(duplicateId)}::uuid;

UPDATE omnivore.discover_feed_save_link
SET article_save_id = ${sqlStringLiteral(originalId)}::uuid
WHERE article_save_id = ${sqlStringLiteral(duplicateId)}::uuid;

-- If the duplicate has progressed further, copy content-ish fields back to the original.
-- Keep original saved_at/folder/note/etc.
${shouldCopyContent ? `UPDATE omnivore.library_item dst
SET
  state = src.state,
  title = src.title,
  author = src.author,
  description = src.description,
  metadata = src.metadata,
  thumbnail = src.thumbnail,
  item_type = src.item_type,
  upload_file_id = src.upload_file_id,
  content_reader = src.content_reader,
  readable_content = src.readable_content,
  text_content_hash = src.text_content_hash,
  item_language = src.item_language,
  word_count = src.word_count,
  site_name = src.site_name,
  site_icon = src.site_icon,
  download_url = src.download_url,
  preview_content_type = src.preview_content_type,
  preview_content = src.preview_content,
  links = src.links,
  feed_content = src.feed_content
FROM omnivore.library_item src
WHERE dst.id = ${sqlStringLiteral(originalId)}::uuid
  AND src.id = ${sqlStringLiteral(duplicateId)}::uuid;` : "-- skip content copy"}

-- Make the original URL canonical (post-cleanUrl)
UPDATE omnivore.library_item
SET original_url = ${sqlStringLiteral(cleanedUrl)}::text
WHERE id = ${sqlStringLiteral(originalId)}::uuid;

-- Recompute label_names so retry script can preserve labels correctly going forward
UPDATE omnivore.library_item li
SET label_names = COALESCE((
  SELECT ARRAY_AGG(l.name ORDER BY l.name)
  FROM omnivore.entity_labels el
  INNER JOIN omnivore.labels l ON l.id = el.label_id
  WHERE el.library_item_id = li.id AND el.highlight_id IS NULL
), ARRAY[]::text[])
WHERE li.id = ${sqlStringLiteral(originalId)}::uuid;

-- Hard delete is required due to unique index on (user_id, md5(original_url)) not considering deleted_at.
DELETE FROM omnivore.library_item WHERE id = ${sqlStringLiteral(duplicateId)}::uuid;

COMMIT;
`;

	execSync(
		`docker exec ${POSTGRES_CONTAINER} psql -U postgres omnivore -v ON_ERROR_STOP=1 -c "${sql.replace(/"/g, '\\"')}"`,
		{ stdio: "inherit" },
	);
}

function main() {
	const processing = fetchProcessingItems();
	const pairs = buildFixPairs(processing);

	console.log(
		`Found ${pairs.length} duplicate pair(s) where a PROCESSING item has a cleaned-URL duplicate.`,
	);
	if (pairs.length === 0) return;

	console.log("\nSample (up to 10):");
	for (const p of pairs.slice(0, 10)) {
		console.log(
			`- user=${p.original.userId} keep=${p.original.id} drop=${p.duplicate.id}\n  old=${p.original.url}\n  new=${p.duplicate.url}`,
		);
	}

	if (!APPLY) {
		console.log(
			"\nDry-run only. Re-run with `--apply` to perform the merge + delete.",
		);
		return;
	}

	console.log("\nApplying fixes...");
	for (const p of pairs) {
		console.log(
			`Fixing keep=${p.original.id} drop=${p.duplicate.id} url=${p.cleanedUrl}`,
		);
		applyFix(p);
	}

	console.log("\nDone.");
}

main();
