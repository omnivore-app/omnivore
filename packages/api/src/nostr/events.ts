// packages/api/src/nostr/events.ts
export interface NostrEvent {
  kind: number;
  pubkey: string;
  created_at: number;
  tags: string[][];
  content: string;
  id?: string; // Event ID, will be added after signing
  sig?: string; // Signature, will be added after signing
}

/**
 * Creates a basic Nostr event object (unsigned).
 * The actual event ID and signature will be added after signing.
 */
export function createEvent(
  kind: number,
  content: string,
  tags: string[][],
  pubkey: string
): NostrEvent {
  return {
    kind,
    pubkey,
    created_at: Math.floor(Date.now() / 1000),
    tags,
    content,
  };
}
