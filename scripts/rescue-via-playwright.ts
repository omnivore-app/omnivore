#!/usr/bin/env node
/**
 * Rescue FAILED/PROCESSING items by rendering with Playwright and pushing HTML
 * directly to Omnivore via the GraphQL `savePage` mutation.
 *
 * Why this exists:
 * - Some sites return 403/captcha to plain HTTP (axios/curl), but render in a real browser.
 * - Some domains are shortlinks (flip.it, blogs.hbr.org) where a browser-followed redirect helps.
 *
 * Usage (no local deps needed; downloads packages on demand):
 *   # One-time install (kept isolated from the repo's deps):
 *   NPM_CONFIG_CACHE=/tmp/npm-cache npm --prefix scripts/.rescue-deps init -y
 *   NPM_CONFIG_CACHE=/tmp/npm-cache npm --prefix scripts/.rescue-deps install playwright-core --no-audit --no-fund
 *
 *   # Run:
 *   direnv exec . env HEADLESS=false INTERACTIVE=true MAX_ITEMS=50 STATES=FAILED \
 *     npx tsx scripts/rescue-via-playwright.ts
 *
 * Notes:
 * - For captcha/login pages, run with HEADLESS=false INTERACTIVE=true.
 * - This will update the existing item by using `clientRequestId = item.id`.
 * - To try a Safari-like engine, use PLAYWRIGHT_ENGINE=webkit (this is Playwright WebKit, not the Safari app).
 * - To avoid the per-item "Continue?" prompt in interactive mode, set AUTO_NEXT=true.
 */

import { execSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { createRequire } from "node:module";
import { createInterface } from "node:readline/promises";
import type { IncomingMessage, RequestOptions } from "node:http";
import http from "node:http";
import https from "node:https";

const API_ENDPOINT =
	process.env.API_ENDPOINT || "http://localhost:4000/api/graphql";
const API_KEY = process.env.OMNIVORE_API_KEY;

const STATES = (process.env.STATES || "FAILED")
	.split(",")
	.map((s) => s.trim().toUpperCase())
	.filter(Boolean);

const MAX_ITEMS_ENV = process.env.MAX_ITEMS;
const MAX_ITEMS =
	MAX_ITEMS_ENV != null
		? Number.parseInt(MAX_ITEMS_ENV, 10)
		: 50;

const ITEM_IDS = (() => {
	const raw =
		process.env.ITEM_IDS ||
		process.env.ITEM_ID ||
		process.env.PAGE_ID ||
		process.env.LIBRARY_ITEM_ID;
	if (!raw) return undefined;
	const ids = raw
		.split(",")
		.map((s) => s.trim())
		.filter(Boolean);
	return ids.length ? ids : undefined;
})();

const SLEEP_MS = process.env.SLEEP_MS
	? Number.parseInt(process.env.SLEEP_MS, 10)
	: 150;

const HEADLESS = (process.env.HEADLESS || "true").toLowerCase() !== "false";
const INTERACTIVE =
	(process.env.INTERACTIVE || "false").toLowerCase() === "true";
const IS_TTY = Boolean(process.stdin.isTTY && process.stdout.isTTY);
const EFFECTIVE_INTERACTIVE = INTERACTIVE && IS_TTY;
const AUTO_NEXT = (process.env.AUTO_NEXT || "false").toLowerCase() === "true";

const PRESERVE_TITLE =
	(process.env.PRESERVE_TITLE || "true").toLowerCase() !== "false";

const PLAYWRIGHT_CHANNEL = process.env.PLAYWRIGHT_CHANNEL || "chrome";
const PLAYWRIGHT_DEPS_DIR =
	process.env.PLAYWRIGHT_DEPS_DIR || "scripts/.rescue-deps";
const BROWSER_EXECUTABLE_PATH = process.env.BROWSER_EXECUTABLE_PATH || undefined;
const PLAYWRIGHT_ENGINE = (process.env.PLAYWRIGHT_ENGINE || "chromium")
	.trim()
	.toLowerCase();
const CDP_ENDPOINT = process.env.CDP_ENDPOINT || undefined;
const CHROMIUM_PROFILE_DIRECTORY =
	process.env.CHROMIUM_PROFILE_DIRECTORY || undefined;

const USER_DATA_DIR =
	process.env.USER_DATA_DIR || `scripts/.playwright-profile-${PLAYWRIGHT_ENGINE}`;

const NAV_TIMEOUT_MS = process.env.NAV_TIMEOUT_MS
	? Number.parseInt(process.env.NAV_TIMEOUT_MS, 10)
	: 60_000;

const LAUNCH_TIMEOUT_MS = process.env.LAUNCH_TIMEOUT_MS
	? Number.parseInt(process.env.LAUNCH_TIMEOUT_MS, 10)
	: 120_000;

const CLOSE_TIMEOUT_MS = process.env.CLOSE_TIMEOUT_MS
	? Number.parseInt(process.env.CLOSE_TIMEOUT_MS, 10)
	: 30_000;

const DUMPIO = (process.env.DUMPIO || "false").toLowerCase() === "true";

const DOMAIN_IN = process.env.DOMAIN_IN
	? process.env.DOMAIN_IN.split(",").map((d) => d.trim().toLowerCase()).filter(Boolean)
	: undefined;

const SAVE_PAGE_MUTATION = `
  mutation SavePage($input: SavePageInput!) {
    savePage(input: $input) {
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

const UPDATE_PAGE_MUTATION = `
  mutation UpdatePage($input: UpdatePageInput!) {
    updatePage(input: $input) {
      ... on UpdatePageSuccess {
        updatedPage { id }
      }
      ... on UpdatePageError {
        errorCodes
      }
    }
  }
`;

const BULK_ACTION_MUTATION = `
  mutation BulkAction($query: String!, $action: BulkActionType!) {
    bulkAction(query: $query, action: $action) {
      ... on BulkActionSuccess { success }
      ... on BulkActionError { errorCodes }
    }
  }
`;

const ME_QUERY = `query Me { me { id } }`;

interface LibraryItem {
	id: string;
	url: string;
	title: string;
	folder: string;
	savedAt: string;
	publishedAt: string | null;
	labelNames: string[];
}

function validateConfig() {
	if (!API_KEY) {
		throw new Error("OMNIVORE_API_KEY environment variable not set");
	}

	const allowedStates = new Set(["FAILED", "PROCESSING"]);
	const invalid = STATES.filter((s) => !allowedStates.has(s));
	if (invalid.length) {
		throw new Error(
			`Invalid STATES: ${invalid.join(", ")} (allowed: FAILED, PROCESSING)`,
		);
	}

	if (!Number.isFinite(MAX_ITEMS) || MAX_ITEMS <= 0) {
		throw new Error(`MAX_ITEMS must be a positive integer, got: ${MAX_ITEMS_ENV}`);
	}
	if (!Number.isFinite(SLEEP_MS) || SLEEP_MS < 0) {
		throw new Error(`SLEEP_MS must be a non-negative integer, got: ${process.env.SLEEP_MS}`);
	}
	if (!Number.isFinite(NAV_TIMEOUT_MS) || NAV_TIMEOUT_MS <= 0) {
		throw new Error(
			`NAV_TIMEOUT_MS must be a positive integer, got: ${process.env.NAV_TIMEOUT_MS}`,
		);
	}
	if (!Number.isFinite(LAUNCH_TIMEOUT_MS) || LAUNCH_TIMEOUT_MS <= 0) {
		throw new Error(
			`LAUNCH_TIMEOUT_MS must be a positive integer, got: ${process.env.LAUNCH_TIMEOUT_MS}`,
		);
	}
	if (!Number.isFinite(CLOSE_TIMEOUT_MS) || CLOSE_TIMEOUT_MS <= 0) {
		throw new Error(
			`CLOSE_TIMEOUT_MS must be a positive integer, got: ${process.env.CLOSE_TIMEOUT_MS}`,
		);
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

	if (ITEM_IDS?.length) {
		for (const id of ITEM_IDS) {
			if (
				!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
					id,
				)
			) {
				throw new Error(
					`ITEM_IDS contains invalid UUID "${id}". Expected canonical UUID format.`,
				);
			}
		}
	}

	const allowedEngines = new Set(["chromium", "firefox", "webkit"]);
	if (!allowedEngines.has(PLAYWRIGHT_ENGINE)) {
		throw new Error(
			`Invalid PLAYWRIGHT_ENGINE="${PLAYWRIGHT_ENGINE}" (allowed: chromium, firefox, webkit)`,
		);
	}

	if (CDP_ENDPOINT && PLAYWRIGHT_ENGINE !== "chromium") {
		throw new Error("CDP_ENDPOINT is only supported with PLAYWRIGHT_ENGINE=chromium");
	}
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
			"Omnivore-Authorization": API_KEY!,
			"Content-Length": payloadLength,
		},
	} satisfies RequestOptions;
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

function endpointHint(statusCode: number, bodyText: string) {
	const trimmed = bodyText.trim();
	const looksLikeNextError =
		trimmed.includes("next-head-count") ||
		trimmed.includes("405: Method Not Allowed") ||
		trimmed.includes("__NEXT_DATA__");

	if (statusCode === 405 || looksLikeNextError) {
		return ` Hint: API_ENDPOINT is probably pointing at the web app (Next.js) instead of the Omnivore API service. For local self-hosting, try API_ENDPOINT=http://localhost:4000/api/graphql.`;
	}

	return "";
}

async function requestGraphQL(payload: unknown) {
	const body = JSON.stringify(payload);
	const parsedUrl = new URL(API_ENDPOINT);
	const options = createRequestOptions(parsedUrl, Buffer.byteLength(body));
	const client = parsedUrl.protocol === "https:" ? https : http;

	return new Promise<any>((resolve, reject) => {
		const req = client.request(options, async (res) => {
			try {
				const status = res.statusCode ?? 0;
				const contentTypeHeader = res.headers["content-type"];
				const contentType = Array.isArray(contentTypeHeader)
					? contentTypeHeader.join(", ")
					: contentTypeHeader;

				const buf = await readResponseBody(res);
				const text = buf.toString("utf-8");

				if (!isLikelyJson(contentType, text)) {
					return reject(
						new Error(
							`Non-JSON response from API (status=${status}) content-type=${contentType ?? "unknown"} body=${JSON.stringify(
								text.slice(0, 240),
							)}${endpointHint(status, text)}`,
						),
					);
				}

				const parsed = JSON.parse(text) as any;
				if (status < 200 || status >= 300) {
					return reject(
						new Error(
							`HTTP ${status} from API body=${JSON.stringify(text.slice(0, 240))}${endpointHint(status, text)}`,
						),
					);
				}
				resolve(parsed);
			} catch (e) {
				reject(e);
			}
		});
		req.on("error", reject);
		req.write(body);
		req.end();
	});
}

async function verifyApiConnection() {
	const result = await requestGraphQL({ query: ME_QUERY });
	const meId = result?.data?.me?.id as string | undefined;
	if (!meId) throw new Error("API did not return me.id");
	return meId;
}

function domainFromUrl(url: string) {
	try {
		return new URL(url).hostname.toLowerCase();
	} catch {
		return "";
	}
}

function getItems(userId: string): LibraryItem[] {
	const statesClause = `state IN (${STATES.map((s) => `'${s}'`).join(", ")})`;
	const domainClause =
		DOMAIN_IN?.length
			? ` AND lower(regexp_replace(original_url, '^https?://([^/]+).*$', '\\\\1')) IN (${DOMAIN_IN.map((d) => `'${d}'`).join(", ")})`
			: "";
	const idsClause = ITEM_IDS?.length
		? ` AND id IN (${ITEM_IDS.map((id) => `'${id}'`).join(", ")})`
		: "";

	const orderByClause = ITEM_IDS?.length
		? `ORDER BY array_position(ARRAY[${ITEM_IDS.map((id) => `'${id}'::uuid`).join(
				", ",
			)}], id)`
		: "ORDER BY updated_at ASC, id ASC";

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
    WHERE deleted_at IS NULL AND user_id = '${userId}' AND ${statesClause}${domainClause}
		${idsClause}
    ${orderByClause}
		LIMIT ${MAX_ITEMS};
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

function chunk<T>(arr: T[], size: number): T[][] {
	const out: T[][] = [];
	for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
	return out;
}

async function deleteItemsViaApi(ids: string[]) {
	const unique = Array.from(new Set(ids)).filter(Boolean);
	if (unique.length === 0) return;

	// BulkAction is synchronous for <=20 items (see server resolver batchSize=20).
	for (const batch of chunk(unique, 20)) {
		const query = `includes:${batch.join(",")}`;
		const gql = await requestGraphQL({
			query: BULK_ACTION_MUTATION,
			variables: { query, action: "DELETE" },
		});

		const result = gql?.data?.bulkAction;
		if (!result?.success) {
			throw new Error(`bulkAction DELETE failed: ${JSON.stringify(result || gql)}`);
		}
	}
}

async function deleteItemViaApi(id: string) {
	await deleteItemsViaApi([id]);
}

async function markFailedInOmnivore(args: { pageId: string }) {
	const { pageId } = args;
	return requestGraphQL({
		query: UPDATE_PAGE_MUTATION,
		variables: { input: { pageId, state: "FAILED" } },
	});
}

async function markContentNotFetchedInOmnivore(args: { pageId: string }) {
	const { pageId } = args;
	return requestGraphQL({
		query: UPDATE_PAGE_MUTATION,
		variables: { input: { pageId, state: "CONTENT_NOT_FETCHED" } },
	});
}

async function savePageToOmnivore(args: {
	item: LibraryItem;
	finalUrl: string;
	title: string;
	originalContent: string;
}) {
	const { item, finalUrl, title, originalContent } = args;
	const variables = {
		input: {
			clientRequestId: item.id,
			url: finalUrl || item.url,
			source: "playwright-rescue",
			originalContent,
			title: title || undefined,
			folder: item.folder || "inbox",
			savedAt: item.savedAt,
			...(item.publishedAt ? { publishedAt: item.publishedAt } : {}),
			labels: (item.labelNames || []).map((name) => ({ name })),
		},
	};

	return requestGraphQL({ query: SAVE_PAGE_MUTATION, variables });
}

function looksLikeInterstice(url: string, title: string) {
	const u = url.toLowerCase();
	const t = title.toLowerCase();

	return (
		u.includes("captcha") ||
		u.includes("geo.captcha-delivery.com") ||
		u.includes("/sorry/") ||
		t.includes("just a moment") ||
		t.includes("access denied") ||
		t.includes("captcha")
	);
}

function detectChromiumExecutablePath(): string | undefined {
	if (process.platform === "darwin") {
		const candidates = [
			"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
			"/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary",
			"/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
			"/Applications/Chromium.app/Contents/MacOS/Chromium",
		];
		return candidates.find((p) => existsSync(p));
	}

	// Linux/Windows users can set BROWSER_EXECUTABLE_PATH explicitly.
	return undefined;
}

function listChromeProfileDirectories(userDataDir: string): string[] {
	try {
		const entries = readdirSync(userDataDir);
		const candidates: string[] = [];
		for (const entry of entries) {
			try {
				const full = `${userDataDir}/${entry}`;
				if (!statSync(full).isDirectory()) continue;
				if (existsSync(`${full}/Preferences`)) candidates.push(entry);
			} catch {
				// ignore unreadable entries
			}
		}
		return candidates.sort((a, b) => a.localeCompare(b));
	} catch {
		return [];
	}
}

function readChromeProfileName(userDataDir: string, profileDir: string): string | undefined {
	try {
		const prefPath = `${userDataDir}/${profileDir}/Preferences`;
		if (!existsSync(prefPath)) return undefined;
		const raw = readFileSync(prefPath, "utf-8");
		const data = JSON.parse(raw) as any;
		const name = data?.profile?.name;
		return typeof name === "string" && name.trim().length ? name : undefined;
	} catch {
		return undefined;
	}
}

function readChromeLocalStateProfiles(userDataDir: string): Array<{
	dir: string;
	name?: string;
}> {
	try {
		const path = `${userDataDir}/Local State`;
		if (!existsSync(path)) return [];
		const raw = readFileSync(path, "utf-8");
		const data = JSON.parse(raw) as any;
		const info = data?.profile?.info_cache;
		if (!info || typeof info !== "object") return [];
		return Object.entries(info)
			.map(([dir, v]) => ({
				dir,
				name: typeof (v as any)?.name === "string" ? (v as any).name : undefined,
			}))
			.sort((a, b) => a.dir.localeCompare(b.dir));
	} catch {
		return [];
	}
}

function listChromeProfiles(userDataDir: string) {
	const fromLocalState = readChromeLocalStateProfiles(userDataDir);
	if (fromLocalState.length) return fromLocalState;

	return listChromeProfileDirectories(userDataDir).map((dir) => ({
		dir,
		name: readChromeProfileName(userDataDir, dir),
	}));
}

async function withTimeout<T>(
	promise: Promise<T>,
	timeoutMs: number,
	label: string,
): Promise<T> {
	let timeout: NodeJS.Timeout | undefined;
	try {
		return await Promise.race([
			promise,
			new Promise<T>((_, reject) => {
				timeout = setTimeout(() => {
					reject(new Error(`${label} (timeout after ${timeoutMs}ms)`));
				}, timeoutMs);
			}),
		]);
	} finally {
		if (timeout) clearTimeout(timeout);
	}
}

type BrowserTypeLike = {
	launchPersistentContext: (userDataDir: string, options: any) => Promise<any>;
	connectOverCDP?: (endpointURL: string, options?: any) => Promise<any>;
};

function extractBrowserType(mod: any, engine: string): BrowserTypeLike | undefined {
	const root = mod?.default ?? mod?.["module.exports"] ?? mod;
	return root?.[engine] as BrowserTypeLike | undefined;
}

async function getPlaywrightBrowserType(): Promise<BrowserTypeLike> {
	const require = createRequire(import.meta.url);

	try {
		const mod = (await import("playwright-core")) as any;
		const browserType = extractBrowserType(mod, PLAYWRIGHT_ENGINE);
		if (!browserType) {
			throw new Error(
				`playwright-core loaded but "${PLAYWRIGHT_ENGINE}" is missing`,
			);
		}
		return browserType;
	} catch {
		// Fall back to a dedicated deps folder (recommended for this repo due to pnpm/npm store perms).
		try {
			const resolved = require.resolve("playwright-core", {
				paths: [PLAYWRIGHT_DEPS_DIR],
			});
			const mod = (await import(resolved)) as any;
			const browserType = extractBrowserType(mod, PLAYWRIGHT_ENGINE);
			if (!browserType) {
				throw new Error(
					`playwright-core loaded but "${PLAYWRIGHT_ENGINE}" is missing`,
				);
			}
			return browserType;
		} catch {
			try {
				const mod = (await import("playwright")) as any;
				const browserType = extractBrowserType(mod, PLAYWRIGHT_ENGINE);
				if (!browserType) {
					throw new Error(`playwright loaded but "${PLAYWRIGHT_ENGINE}" is missing`);
				}
				return browserType;
			} catch {
				throw new Error(
					`Playwright is not installed. Install playwright-core in ${PLAYWRIGHT_DEPS_DIR}:\n` +
						`  NPM_CONFIG_CACHE=/tmp/npm-cache npm --prefix ${PLAYWRIGHT_DEPS_DIR} init -y\n` +
						`  NPM_CONFIG_CACHE=/tmp/npm-cache npm --prefix ${PLAYWRIGHT_DEPS_DIR} install playwright-core --no-audit --no-fund`,
				);
			}
		}
	}
}

async function promptAction(
	rl: ReturnType<typeof createInterface>,
	prompt: string,
): Promise<string> {
	const answer = await rl.question(prompt);
	return answer.trim().toLowerCase();
}

async function tryPrintChromeVersionInfo(context: any) {
	try {
		const page = await context.newPage();
		try {
			await page.goto("chrome://version/", { waitUntil: "domcontentloaded" });
			const text = await page.evaluate(() => document.body?.innerText || "");
			const lines = text
				.split("\n")
				.map((l) => l.trim())
				.filter(Boolean);

			const findLine = (prefix: string) =>
				lines.find((l) => l.startsWith(prefix))?.slice(prefix.length).trim();

			const profilePath = findLine("Profile Path");
			const executablePath = findLine("Executable Path");
			const commandLine = findLine("Command Line");

			if (profilePath) console.log(`Chrome reported profile path: ${profilePath}`);
			if (executablePath) console.log(`Chrome reported executable path: ${executablePath}`);
			if (commandLine) console.log(`Chrome reported command line: ${commandLine}`);
		} finally {
			await page.close().catch(() => {});
		}
	} catch {
		// Ignore: some environments block internal pages.
	}
}

async function main() {
	validateConfig();
	console.log(`Using endpoint: ${API_ENDPOINT}`);
	console.log(`States: ${STATES.join(", ")}`);
	if (DOMAIN_IN?.length) console.log(`Domains: ${DOMAIN_IN.join(", ")}`);
	if (ITEM_IDS?.length) console.log(`Item IDs: ${ITEM_IDS.join(", ")}`);
	console.log(`Playwright engine: ${PLAYWRIGHT_ENGINE}`);
	console.log(
		`Headless: ${HEADLESS} | Interactive: ${INTERACTIVE} | TTY: ${IS_TTY} | Effective interactive: ${EFFECTIVE_INTERACTIVE}`,
	);
	if (EFFECTIVE_INTERACTIVE) console.log(`Auto-next: ${AUTO_NEXT}`);
	console.log(`Launch timeout: ${LAUNCH_TIMEOUT_MS}ms`);
	console.log(`Close timeout: ${CLOSE_TIMEOUT_MS}ms`);
	if (DUMPIO) console.log("DumpIO: true (browser stdout/stderr will be printed)");
	if (CHROMIUM_PROFILE_DIRECTORY) {
		console.log(`Chromium profile directory: ${CHROMIUM_PROFILE_DIRECTORY}`);
	}
	console.log(`User data dir: ${USER_DATA_DIR}`);
	if (PLAYWRIGHT_ENGINE === "chromium" && CHROMIUM_PROFILE_DIRECTORY) {
		const profilePath = `${USER_DATA_DIR}/${CHROMIUM_PROFILE_DIRECTORY}`;
		if (!existsSync(`${profilePath}/Preferences`)) {
			const known = listChromeProfiles(USER_DATA_DIR);
			throw new Error(
				`CHROMIUM_PROFILE_DIRECTORY="${CHROMIUM_PROFILE_DIRECTORY}" does not look like a Chrome profile directory (missing ${profilePath}/Preferences).\n` +
					`Valid profiles under USER_DATA_DIR: ${
						known.length
							? known.map((p) => `${p.dir}${p.name ? ` (${p.name})` : ""}`).join(", ")
							: "(none found)"
					}.`,
			);
		}

		const knownProfiles = readChromeLocalStateProfiles(USER_DATA_DIR);
		if (knownProfiles.length) {
			const match = knownProfiles.find((p) => p.dir === CHROMIUM_PROFILE_DIRECTORY);
			if (match?.name) {
				console.log(`Selected Chrome profile name: ${match.name}`);
			} else if (!match) {
				console.log(
					`Warning: "${CHROMIUM_PROFILE_DIRECTORY}" is not listed in USER_DATA_DIR/Local State profile.info_cache. Chrome may treat this as an unrecognized profile.`,
				);
			}
		} else {
			const selectedName = readChromeProfileName(
				USER_DATA_DIR,
				CHROMIUM_PROFILE_DIRECTORY,
			);
			if (selectedName) console.log(`Selected Chrome profile name: ${selectedName}`);
		}
	}
	if (
		PLAYWRIGHT_ENGINE === "chromium" &&
		USER_DATA_DIR.includes("Library/Application Support/Google/Chrome")
	) {
		console.log(
			"Note: using your real Chrome profile. Chrome must be completely closed or the profile may be locked and launch can hang.",
		);
	}
	if (CDP_ENDPOINT) console.log(`CDP endpoint: ${CDP_ENDPOINT}`);
	if (INTERACTIVE && !IS_TTY) {
		console.log(
			"Note: INTERACTIVE=true but stdin/stdout is not a TTY, so prompts won't work. Run this from a normal terminal session (not background/nohup).",
		);
	}

	const userId = await verifyApiConnection();
	const items = getItems(userId);
	console.log(`Found ${items.length} items`);
	if (items.length === 0) return;

	const browserType = await getPlaywrightBrowserType();

	let context: any;
	let ownsContext = true;
		let attachedBrowser: any | null = null;
		let rl: ReturnType<typeof createInterface> | null = null;
		let quit = false;
		let shutdownInProgress = false;

		const closeReadline = () => {
			if (!rl) return;
			try {
				rl.close();
			} catch {
				// ignore
			}
			rl = null;
			try {
				process.stdin.pause();
			} catch {
				// ignore
			}
		};

		const closeBrowserResources = async () => {
			const mode = CDP_ENDPOINT ? "cdp" : "persistent";
			console.log(
				`Closing browser resources… (mode=${mode}, ownsContext=${ownsContext}, hasContext=${Boolean(
					context,
				)}, attachedBrowser=${Boolean(attachedBrowser)})`,
			);

			if (ownsContext && context?.close) {
				console.log("  - Closing Playwright context…");
				await withTimeout(
					context.close().catch(() => {}),
					CLOSE_TIMEOUT_MS,
					"Timed out closing browser context",
				).catch((e) => {
					console.log(`  ! ${e instanceof Error ? e.message : String(e)}`);
				});
			} else {
				console.log("  - Skipping context.close()");
			}

			if (attachedBrowser) {
				if (typeof attachedBrowser.disconnect === "function") {
					console.log("  - Disconnecting from attached browser…");
					await withTimeout(
						attachedBrowser.disconnect().catch(() => {}),
						CLOSE_TIMEOUT_MS,
						"Timed out disconnecting from attached browser",
					).catch((e) => {
						console.log(`  ! ${e instanceof Error ? e.message : String(e)}`);
					});
				} else if (typeof attachedBrowser.close === "function") {
					console.log("  - Closing attached browser…");
					await withTimeout(
						attachedBrowser.close().catch(() => {}),
						CLOSE_TIMEOUT_MS,
						"Timed out closing attached browser",
					).catch((e) => {
						console.log(`  ! ${e instanceof Error ? e.message : String(e)}`);
					});
				}
			}

			console.log("Browser resources closed.");
		};

		const closeResources = async (opts?: { closeReadline?: boolean }) => {
			await closeBrowserResources();
			if (opts?.closeReadline) closeReadline();
		};

		const shutdown = async (reason: string) => {
			if (shutdownInProgress) return;
			shutdownInProgress = true;
			quit = true;
			console.log(`\nShutdown requested (${reason})…`);
			await closeResources({ closeReadline: true });
			console.log("Done.");
		};

	const onSigInt = () => {
		void shutdown("SIGINT").finally(() => {
			process.exitCode = 130;
		});
	};
	const onSigTerm = () => {
		void shutdown("SIGTERM").finally(() => {
			process.exitCode = 143;
		});
	};
	process.once("SIGINT", onSigInt);
	process.once("SIGTERM", onSigTerm);

	if (CDP_ENDPOINT) {
		if (!browserType.connectOverCDP) {
			throw new Error("This Playwright build does not support connectOverCDP");
		}
		console.log("Attaching to Chromium via CDP…");
		attachedBrowser = await withTimeout(
			browserType.connectOverCDP(CDP_ENDPOINT),
			LAUNCH_TIMEOUT_MS,
			"Timed out connecting over CDP",
		);
		const ctxCount =
			typeof attachedBrowser.contexts === "function"
				? attachedBrowser.contexts().length
				: 0;
		console.log(`Attached to Chromium via CDP (contexts=${ctxCount})`);
		ownsContext = false;
		context =
			attachedBrowser.contexts?.()[0] ??
			(attachedBrowser.newContext ? await attachedBrowser.newContext() : null);
		if (!context) throw new Error("Failed to obtain a browser context via CDP");
	} else {
		const systemChromiumExecutablePath = detectChromiumExecutablePath();
		const useSystemChromium =
			PLAYWRIGHT_ENGINE === "chromium" && Boolean(BROWSER_EXECUTABLE_PATH);
		const chromiumExecutablePath =
			PLAYWRIGHT_ENGINE === "chromium"
				? (BROWSER_EXECUTABLE_PATH || systemChromiumExecutablePath)
				: undefined;

		if (PLAYWRIGHT_ENGINE === "chromium" && chromiumExecutablePath) {
			console.log(
				`Chromium executable: ${chromiumExecutablePath}${useSystemChromium ? " (forced)" : ""}`,
			);
		}

		try {
			const baseOptions: any = {
				headless: HEADLESS,
				viewport: { width: 1280, height: 900 },
				dumpio: DUMPIO,
			};

			// Only Chromium supports `channel` and our executable-path fallback.
			if (PLAYWRIGHT_ENGINE === "chromium") {
				// If BROWSER_EXECUTABLE_PATH is provided, always prefer it (use the system Chrome),
				// even if Playwright-managed browsers are installed.
				if (BROWSER_EXECUTABLE_PATH) {
					baseOptions.executablePath = BROWSER_EXECUTABLE_PATH;
				} else {
					baseOptions.channel = PLAYWRIGHT_CHANNEL;
				}

				if (CHROMIUM_PROFILE_DIRECTORY) {
					baseOptions.args = [
						`--profile-directory=${CHROMIUM_PROFILE_DIRECTORY}`,
					];
				}
			}

			console.log("Launching browser context…");
			context = await withTimeout(
				browserType.launchPersistentContext(USER_DATA_DIR, baseOptions),
				LAUNCH_TIMEOUT_MS,
				"Timed out launching browser context",
			);
		} catch (e) {
			const message = e instanceof Error ? e.message : String(e);
			if (
				PLAYWRIGHT_ENGINE === "chromium" &&
				BROWSER_EXECUTABLE_PATH &&
				(message.includes("ProcessSingleton") ||
					message.includes("SingletonLock") ||
					message.includes("profile is already in use"))
			) {
				throw new Error(
					`Chrome profile is already in use (locked). Quit Chrome completely or use a separate USER_DATA_DIR.\n` +
						`If you need to keep Chrome open, attach via CDP_ENDPOINT instead.`,
				);
			}

			// Fallback 1: use system Chrome/Edge if Playwright's managed browsers aren't installed.
			if (
				PLAYWRIGHT_ENGINE === "chromium" &&
				!BROWSER_EXECUTABLE_PATH &&
				chromiumExecutablePath
			) {
				try {
					console.log("Retrying launch with explicit executablePath…");
					context = await withTimeout(
						browserType.launchPersistentContext(USER_DATA_DIR, {
							headless: HEADLESS,
							executablePath: chromiumExecutablePath,
							viewport: { width: 1280, height: 900 },
							dumpio: DUMPIO,
							args: CHROMIUM_PROFILE_DIRECTORY
								? [`--profile-directory=${CHROMIUM_PROFILE_DIRECTORY}`]
								: undefined,
						}),
						LAUNCH_TIMEOUT_MS,
						"Timed out launching browser context (retry executablePath)",
					);
				} catch {
					// ignore and fall through
				}
			}

			// Fallback 2: retry without `channel` so Playwright can use its managed install (if present).
			if (!context) {
				if (BROWSER_EXECUTABLE_PATH) {
					throw e;
				}
				console.log("Retrying launch without channel…");
				context = await withTimeout(
					browserType.launchPersistentContext(USER_DATA_DIR, {
						headless: HEADLESS,
						viewport: { width: 1280, height: 900 },
						dumpio: DUMPIO,
						args: CHROMIUM_PROFILE_DIRECTORY
							? [`--profile-directory=${CHROMIUM_PROFILE_DIRECTORY}`]
							: undefined,
					}),
					LAUNCH_TIMEOUT_MS,
					"Timed out launching browser context (retry no channel)",
				);
			}
		}
	}

	if (PLAYWRIGHT_ENGINE === "chromium") {
		await tryPrintChromeVersionInfo(context);
	}

	rl = EFFECTIVE_INTERACTIVE
		? createInterface({ input: process.stdin, output: process.stdout })
		: null;

	let success = 0;
	let failed = 0;
	const failedItemIds: string[] = [];

	try {
		for (let i = 0; i < items.length; i++) {
			if (quit) break;
			const item = items[i];
			console.log(
				`[${i + 1}/${items.length}] ${item.id} Playwright: ${domainFromUrl(item.url)} ${item.url}`,
			);

			const page = await context.newPage();
			page.setDefaultNavigationTimeout(NAV_TIMEOUT_MS);

			try {
				if (!HEADLESS) {
					try {
						await page.bringToFront();
					} catch {
						// ignore
					}
				}
				const navigate = async () => {
					await page.goto(item.url, { waitUntil: "domcontentloaded" });
					try {
						await page.waitForLoadState("networkidle", { timeout: 15_000 });
					} catch {
						// ignore
					}
				};

				await navigate();

				while (true) {
					const finalUrl = page.url();
					const pageTitle = (await page.title()) || "";

					if (looksLikeInterstice(finalUrl, pageTitle) && rl) {
						console.log(
							`  ↳ Interstitial detected (${finalUrl}). Solve/login in the browser window, then press Enter.`,
						);
						await rl.question("");
					}

					const finalUrl2 = page.url();
					const pageTitle2 = (await page.title()) || pageTitle;

					const titleToUse =
						PRESERVE_TITLE && item.title ? item.title : pageTitle2 || item.title;

					if (rl) {
						console.log(`  ↳ Final URL: ${finalUrl2}`);
						console.log(`  ↳ Title: ${titleToUse || "(empty)"}`);

						const action = await promptAction(
							rl,
							"  Action [Enter=save, r=reload, f=fail, d=delete link, s=skip, q=quit]: ",
						);

						if (action === "q") {
							quit = true;
							break;
						}
						if (action === "r") {
							await page.reload({ waitUntil: "domcontentloaded" });
							continue;
						}
						if (action === "f") {
							await markFailedInOmnivore({ pageId: item.id }).catch((e) => {
								console.log(
									`  ✗ Failed to mark as FAILED via API: ${e instanceof Error ? e.message : String(e)}`,
								);
							});
							console.log("  ✓ Marked FAILED");
							failed++;
							failedItemIds.push(item.id);
							break;
						}
						if (action === "d") {
							await deleteItemViaApi(item.id);
							console.log("  ✓ Deleted link (API)");
							break;
						}
						if (action === "s" || action === "skip") {
							await markContentNotFetchedInOmnivore({ pageId: item.id }).catch(
								(e) => {
									console.log(
										`  ✗ Failed to mark as CONTENT_NOT_FETCHED via API: ${e instanceof Error ? e.message : String(e)}`,
									);
								},
							);
							console.log("  ↷ Skipped (CONTENT_NOT_FETCHED)");
							break;
						}
						// default = save
					}

					const html = await page.content();

					const gql = await savePageToOmnivore({
						item,
						finalUrl: finalUrl2 || item.url,
						title: titleToUse || "",
						originalContent: html,
					});

					const result = gql?.data?.savePage;
					if (result?.url) {
						const returnedId = result.clientRequestId as string | undefined;
						if (returnedId && returnedId !== item.id) {
							const msg = `API merged into a different item (returned clientRequestId=${returnedId}, original=${item.id}).`;
							if (rl) {
								console.log(`  ! ${msg}`);
								const answer = await promptAction(
									rl,
									"  Merge: delete the original item? [d=delete, Enter=keep]: ",
								);
								if (answer === "d" || answer === "del" || answer === "delete") {
									await deleteItemViaApi(item.id);
									console.log("  ! Deleted original item (API).");
								} else {
									console.log("  ! Kept original item.");
								}
							} else {
								console.log(`  ! ${msg} (non-interactive; keeping original item)`);
							}
						}
						console.log("  ✓ Saved");
						success++;
					} else {
						console.log(`  ✗ Save failed: ${JSON.stringify(result || gql)}`);
						failed++;
						failedItemIds.push(item.id);
					}
					break;
				}
			} catch (e) {
				const message = e instanceof Error ? e.message : String(e);
				console.log(`  ✗ Error: ${message}`);
				await markFailedInOmnivore({ pageId: item.id }).catch(() => {});
				failed++;
				failedItemIds.push(item.id);
			} finally {
				await page.close().catch(() => {});
			}

					if (SLEEP_MS) {
						await new Promise((r) => setTimeout(r, SLEEP_MS));
					}

					if (rl && !quit && !AUTO_NEXT) {
						const cont = await promptAction(
							rl,
							"  Continue to next item? [Enter=yes, q=quit]: ",
						);
						if (cont === "q") quit = true;
					}
				}

			console.log("\n=== Summary ===");
			console.log(`Total: ${items.length}`);
			console.log(`Saved: ${success}`);
			console.log(`Failed: ${failed}`);

			if (rl) {
				const uniqueFailed = Array.from(new Set(failedItemIds));
				if (uniqueFailed.length) {
					const answer = await promptAction(
						rl,
						`Delete failed items? (${uniqueFailed.length}) [d=delete, Enter=keep]: `,
					);
					if (answer === "d" || answer === "del" || answer === "delete") {
						const confirm = await promptAction(
							rl,
							`Type DELETE to confirm deleting ${uniqueFailed.length} items: `,
						);
						if (confirm === "delete") {
							await deleteItemsViaApi(uniqueFailed);
							console.log(`Deleted via API: ${uniqueFailed.length}`);
						} else {
							console.log("Canceled deletion.");
						}
					}
				}
			}
		} finally {
			await closeResources({ closeReadline: true });
			process.off("SIGINT", onSigInt);
			process.off("SIGTERM", onSigTerm);
		}

		console.log("Done.");
	}

main().catch((e) => {
	console.error(e);
	process.exitCode = 1;
});
