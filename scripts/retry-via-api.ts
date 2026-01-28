#!/usr/bin/env node
/**
 * Script to retry failed/stuck library items via GraphQL API
 * This preserves existing metadata (labels, folders, notes, etc.)
 */

import { execSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import type { IncomingMessage, RequestOptions } from "node:http";
import http from "node:http";
import https from "node:https";

const API_ENDPOINT =
	process.env.API_ENDPOINT || "http://localhost:4000/api/graphql";
const API_KEY = process.env.OMNIVORE_API_KEY;
const STATES = (process.env.STATES || "PROCESSING")
	.split(",")
	.map((s) => s.trim().toUpperCase())
	.filter(Boolean);
const MAX_ITEMS = process.env.MAX_ITEMS
	? Number.parseInt(process.env.MAX_ITEMS, 10)
	: undefined;
const SLEEP_MS = process.env.SLEEP_MS
	? Number.parseInt(process.env.SLEEP_MS, 10)
	: 100;
const PROCESSING_OLDER_THAN_HOURS = process.env.PROCESSING_OLDER_THAN_HOURS
	? Number.parseInt(process.env.PROCESSING_OLDER_THAN_HOURS, 10)
	: undefined;
const UPDATED_BEFORE_ISO = process.env.UPDATED_BEFORE_ISO || undefined;
const DOMAIN_IN = process.env.DOMAIN_IN
	? process.env.DOMAIN_IN.split(",").map((d) => d.trim().toLowerCase()).filter(Boolean)
	: undefined;

const ME_QUERY = `query Me { me { id } }`;

const SAVE_URL_MUTATION = `
  mutation SaveUrl($input: SaveUrlInput!) {
    saveUrl(input: $input) {
      ... on SaveSuccess {
        url
        clientRequestId
      }
      ... on SaveError {
        errorCodes
        message
      }
    }
  }
`;

interface LibraryItem {
	id: string;
	url: string;
	title: string;
	folder: string;
	savedAt: string;
	publishedAt: string | null;
	labelNames: string[];
}

function validateApiKey() {
	if (!API_KEY) {
		console.error("Error: OMNIVORE_API_KEY environment variable not set");
		console.error("Run with: direnv exec . npx tsx scripts/retry-via-api.ts");
		process.exit(1);
	}
	console.log(`Using API key: ${API_KEY.substring(0, 8)}...`);
	console.log(`Using endpoint: ${API_ENDPOINT}`);
}

function validateConfig() {
	const allowedStates = new Set(["PROCESSING", "FAILED"]);
	const invalidStates = STATES.filter((s) => !allowedStates.has(s));
	if (invalidStates.length) {
		throw new Error(
			`Invalid STATES: ${invalidStates.join(
				", ",
			)} (allowed: PROCESSING, FAILED)`,
		);
	}

	if (UPDATED_BEFORE_ISO) {
		const parsed = Date.parse(UPDATED_BEFORE_ISO);
		if (Number.isNaN(parsed)) {
			throw new Error(
				`UPDATED_BEFORE_ISO must be an ISO timestamp, got: ${UPDATED_BEFORE_ISO}`,
			);
		}
	}

	if (DOMAIN_IN?.length) {
		for (const domain of DOMAIN_IN) {
			if (!/^[a-z0-9.-]+$/.test(domain)) {
				throw new Error(
					`DOMAIN_IN contains invalid domain "${domain}". Only [a-z0-9.-] allowed.`,
				);
			}
		}
	}
}

function getProcessingItems(userId: string): LibraryItem[] {
	if (MAX_ITEMS != null && (!Number.isFinite(MAX_ITEMS) || MAX_ITEMS <= 0)) {
		throw new Error(`MAX_ITEMS must be a positive integer, got: ${process.env.MAX_ITEMS}`);
	}
	if (
		PROCESSING_OLDER_THAN_HOURS != null &&
		(!Number.isFinite(PROCESSING_OLDER_THAN_HOURS) ||
			PROCESSING_OLDER_THAN_HOURS <= 0)
	) {
		throw new Error(
			`PROCESSING_OLDER_THAN_HOURS must be a positive integer, got: ${process.env.PROCESSING_OLDER_THAN_HOURS}`,
		);
	}

	const statesClause = ` AND state IN (${STATES.map((s) => `'${s}'`).join(", ")})`;
	const olderThanClause =
		PROCESSING_OLDER_THAN_HOURS != null
			? ` AND updated_at < (NOW() - INTERVAL '${PROCESSING_OLDER_THAN_HOURS} hours')`
			: "";
	const updatedBeforeClause = UPDATED_BEFORE_ISO
		? ` AND updated_at <= '${UPDATED_BEFORE_ISO}'::timestamptz`
		: "";
	const domainClause =
		DOMAIN_IN?.length
			? ` AND lower(regexp_replace(original_url, '^https?://([^/]+).*$', '\\\\1')) IN (${DOMAIN_IN.map((d) => `'${d}'`).join(", ")})`
			: "";

	const query = `
    SELECT json_build_object(
			'id', id,
			'url', original_url,
			'title', title,
			'folder', folder,
			'savedAt', saved_at,
			'publishedAt', published_at,
			'labelNames', label_names
		)
    FROM omnivore.library_item
    WHERE deleted_at IS NULL AND user_id = '${userId}'${statesClause}${olderThanClause}${updatedBeforeClause}${domainClause}
    ORDER BY ${
			PROCESSING_OLDER_THAN_HOURS != null ? "updated_at ASC" : "saved_at DESC"
		}
		${MAX_ITEMS ? `LIMIT ${MAX_ITEMS}` : ""};
  `;

	const result = execSync(
		`docker exec omnivore-postgres psql -U postgres omnivore -t -A -c "${query}"`,
		{ encoding: "utf-8" },
	);

	return result
		.trim()
		.split("\n")
		.filter((line) => line.length > 0)
		.map((line) => JSON.parse(line) as LibraryItem);
}

function createSaveUrlVariables(
	url: string,
	folder: string,
	clientRequestId: string,
	savedAt: string,
	publishedAt: string | null,
	labelNames: string[],
) {
	return {
		input: {
			url,
			source: "api",
			clientRequestId,
			folder,
			savedAt,
			...(publishedAt ? { publishedAt } : {}),
			labels: labelNames.map((name) => ({ name })),
		},
	};
}

function createRequestOptions(parsedUrl: URL, payloadLength: number) {
	const port = parsedUrl.port ? Number(parsedUrl.port) : undefined;
	const path = `${parsedUrl.pathname}${parsedUrl.search}`;
	return {
		hostname: parsedUrl.hostname,
		port,
		path,
		method: "POST",
		headers: {
			Accept: "application/json",
			"Content-Type": "application/json",
			"Omnivore-Authorization": API_KEY,
			"Content-Length": payloadLength,
		},
	};
}

interface GraphQLResponse {
	data?: {
		saveUrl?: {
			url?: string;
			clientRequestId?: string;
			errorCodes?: string[];
			message?: string;
		};
		[key: string]: unknown;
	};
	errors?: Array<{
		message: string;
		extensions?: Record<string, unknown>;
	}>;
}

function previewBody(text: string, maxChars: number = 240) {
	const trimmed = text.trim();
	if (trimmed.length <= maxChars) return trimmed;
	return `${trimmed.slice(0, maxChars)}…`;
}

function endpointHint(statusCode: number, bodyText: string) {
	const trimmed = bodyText.trim();
	const looksLikeNextError =
		trimmed.includes("next-head-count") ||
		trimmed.includes("405: Method Not Allowed") ||
		trimmed.includes("__NEXT_DATA__");

	if (statusCode === 405 || looksLikeNextError) {
		return ` Hint: this usually means API_ENDPOINT is pointing at the web app (Next.js) instead of the Omnivore API service. For local docker-compose, try API_ENDPOINT=http://localhost:4000/api/graphql.`;
	}

	return "";
}

async function readResponseBody(res: IncomingMessage): Promise<Buffer> {
	const chunks: Buffer[] = [];
	return new Promise((resolve, reject) => {
		res.on("data", (chunk: Buffer | string) => {
			chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
		});
		res.on("end", () => resolve(Buffer.concat(chunks)));
		res.on("error", reject);
	});
}

function isLikelyJson(contentType: string | undefined, bodyText: string) {
	const ct = contentType?.toLowerCase();
	if (ct && (ct.includes("application/json") || ct.includes("+json"))) return true;
	const trimmed = bodyText.trimStart();
	return trimmed.startsWith("{") || trimmed.startsWith("[");
}

async function parseGraphQLResponse(res: IncomingMessage): Promise<GraphQLResponse> {
	const statusCode = res.statusCode ?? 0;
	const statusMessage = res.statusMessage ?? "";
	const contentTypeHeader = res.headers["content-type"];
	const contentType = Array.isArray(contentTypeHeader)
		? contentTypeHeader.join(", ")
		: contentTypeHeader;
	const locationHeader = res.headers.location;
	const location = Array.isArray(locationHeader)
		? locationHeader.join(", ")
		: locationHeader;

	const bodyBuffer = await readResponseBody(res);
	const bodyText = bodyBuffer.toString("utf-8");

	if (!isLikelyJson(contentType, bodyText)) {
		throw new Error(
			`Non-JSON response from API (${statusCode} ${statusMessage}) content-type=${contentType ?? "unknown"}${location ? ` location=${location}` : ""} body="${previewBody(bodyText)}"${endpointHint(statusCode, bodyText)}`,
		);
	}

	let parsed: unknown;
	try {
		parsed = JSON.parse(bodyText) as unknown;
	} catch (e) {
		throw new Error(
			`Invalid JSON from API (${statusCode} ${statusMessage}) content-type=${contentType ?? "unknown"}${location ? ` location=${location}` : ""} body="${previewBody(bodyText)}"${endpointHint(statusCode, bodyText)}`,
		);
	}

	if (statusCode < 200 || statusCode >= 300) {
		throw new Error(
			`HTTP ${statusCode} from API content-type=${contentType ?? "unknown"}${location ? ` location=${location}` : ""} body="${previewBody(bodyText)}"${endpointHint(statusCode, bodyText)}`,
		);
	}

	return parsed as GraphQLResponse;
}

function makeHttpRequest(
	options: RequestOptions,
	payload: string,
): Promise<GraphQLResponse> {
	return new Promise((resolve, reject) => {
		const parsedUrl = new URL(API_ENDPOINT);
		const client = parsedUrl.protocol === "https:" ? https : http;

		const req = client.request(options, async (res) => {
			try {
				resolve(await parseGraphQLResponse(res));
			} catch (e) {
				reject(e);
			}
		});

		req.on("error", reject);
		req.write(payload);
		req.end();
	});
}

async function saveUrl(
	url: string,
	folder: string = "inbox",
	clientRequestId: string = randomUUID(),
	savedAt: string = new Date().toISOString(),
	publishedAt: string | null = null,
	labelNames: string[] = [],
) {
	const variables = createSaveUrlVariables(
		url,
		folder,
		clientRequestId,
		savedAt,
		publishedAt,
		labelNames,
	);
	const payload = JSON.stringify({ query: SAVE_URL_MUTATION, variables });
	const parsedUrl = new URL(API_ENDPOINT);
	const options = createRequestOptions(parsedUrl, Buffer.byteLength(payload));

	return makeHttpRequest(options, payload);
}

async function verifyApiConnection() {
	const payload = JSON.stringify({
		query: ME_QUERY,
	});
	const parsedUrl = new URL(API_ENDPOINT);
	const options = createRequestOptions(parsedUrl, Buffer.byteLength(payload));
	const result = await makeHttpRequest(options, payload);
	if (result.errors?.length) {
		throw new Error(`GraphQL errors: ${JSON.stringify(result.errors)}`);
	}
	const meId = (result.data as any)?.me?.id as string | undefined;
	if (!meId) {
		throw new Error("API did not return me.id");
	}
	return meId;
}

function deleteOldItem(id: string, userId: string) {
	const query = `UPDATE omnivore.library_item SET deleted_at = NOW() WHERE id = '${id}' AND user_id = '${userId}';`;
	execSync(
		`docker exec omnivore-postgres psql -U postgres omnivore -c "${query}"`,
	);
}

function displaySampleItems(items: LibraryItem[]) {
	console.log("\nSample items:");
	items.slice(0, 10).forEach((item, i) => {
		console.log(`${i + 1}. ${item.url}`);
	});

	if (items.length > 10) {
		console.log(`\n... and ${items.length - 10} more`);
	}
}

async function retryItem(
	item: LibraryItem,
	index: number,
	total: number,
	userId: string,
) {
	console.log(
		`[${index + 1}/${total}] Retrying: ${item.url.substring(0, 80)}...`,
	);

	const result = await saveUrl(
		item.url,
		item.folder || "inbox",
		item.id,
		item.savedAt,
		item.publishedAt,
		item.labelNames,
	);

	if (result.data?.saveUrl?.url) {
		const newId = result.data.saveUrl.clientRequestId;
		if (newId && newId !== item.id) {
			deleteOldItem(item.id, userId);
		}
		console.log(`  ✓ Success`);
		return { success: true };
	}

	if (result.errors?.length) {
		console.log(`  ✗ Failed: ${JSON.stringify(result.errors)}`);
		return { success: false };
	}

	const saveUrlResult = result.data?.saveUrl;
	if (saveUrlResult?.errorCodes?.includes("UNAUTHORIZED")) {
		console.error(
			`  ✗ Failed: ${JSON.stringify(saveUrlResult)} (check OMNIVORE_API_KEY)`,
		);
		process.exitCode = 1;
		throw new Error("Unauthorized");
	}

	if (
		saveUrlResult?.errorCodes?.includes("UNKNOWN") &&
		(saveUrlResult.message == null || saveUrlResult.message.length === 0)
	) {
		console.log(
			"  ↳ SaveError UNKNOWN (no message). Check API logs for the underlying exception; common causes are queue/redis/content-fetch not running or misconfigured.",
		);
	}

	console.log(`  ✗ Failed: ${JSON.stringify(result.data?.saveUrl || result)}`);
	return { success: false };
}

async function processItems(items: LibraryItem[], userId: string) {
	let successful = 0;
	let failed = 0;

	for (let i = 0; i < items.length; i++) {
		try {
			const result = await retryItem(items[i], i, items.length, userId);
			if (result.success) successful++;
			else failed++;

			await new Promise((resolve) => setTimeout(resolve, SLEEP_MS));
		} catch (error) {
			failed++;
			const message = error instanceof Error ? error.message : String(error);
			console.log(`  ✗ Error: ${message}`);
		}
	}

	return { successful, failed };
}

function displaySummary(total: number, successful: number, failed: number) {
	console.log("\n=== Summary ===");
	console.log(`Total: ${total}`);
	console.log(`Successful: ${successful}`);
	console.log(`Failed: ${failed}`);
}

async function main() {
	validateApiKey();
	validateConfig();
	const userId = await verifyApiConnection();

	console.log(`Fetching items in states: ${STATES.join(", ")}...`);
	const items = getProcessingItems(userId);

	console.log(`Found ${items.length} items to retry`);
	if (items.length === 0) {
		console.log("No items to retry!");
		return;
	}

	displaySampleItems(items);
	console.log("\nStarting retry process...");

	const { successful, failed } = await processItems(items, userId);
	displaySummary(items.length, successful, failed);
}

main().catch(console.error);
