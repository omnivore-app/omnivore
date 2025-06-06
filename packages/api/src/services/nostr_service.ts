// packages/api/src/services/nostr_service.ts
import { createEvent, NostrEvent } from '../nostr/events';
import { fetchEvents, publishEvent as publishEventToRelay } from '../nostr/relays';
import { encrypt as nip04Encrypt, decrypt as nip04Decrypt } from '../nostr/nip04'; // Added decrypt
import * as crypto from 'crypto'; // For SHA256

export interface OmnivoreArticle { // Renamed for clarity
  id: string; // Omnivore's internal ID
  url: string;
  title: string;
  content: string; // Full article content (e.g., Readability output)
  excerpt?: string;
  author?: string;
  ogImageUrl?: string;
  omnivoreTags?: string[]; // Renamed to avoid confusion with Nostr tags
  // isPrivate will be passed separately to publishing methods
}

const TEMP_USER_PRIVATE_KEY_HEX = "privkeyhexplaceholder";
const TEMP_USER_PUBLIC_KEY_HEX = "pubkeyhexplaceholder";
// const NOSTR_USER_PRIVATE_KEY = process.env.NOSTR_USER_PRIVATE_KEY || 'nsec1testprivatekey'; // Not used directly anymore
const NOSTR_USER_PUBLIC_KEY = process.env.NOSTR_USER_PUBLIC_KEY || 'npub1testpublickey'; // Used for event.pubkey if not hex
const NOSTR_DEFAULT_RELAY_URL = process.env.NOSTR_DEFAULT_RELAY_URL || 'wss://relay.example.com';

export class NostrService {
  private privateKeyHex: string; // Assuming this would be the hex private key
  private publicKeyHex: string; // Assuming this would be the hex public key
  private defaultRelayUrl: string;

  constructor() {
    this.privateKeyHex = TEMP_USER_PRIVATE_KEY_HEX; // Placeholder
    this.publicKeyHex = TEMP_USER_PUBLIC_KEY_HEX;   // Placeholder
    this.defaultRelayUrl = NOSTR_DEFAULT_RELAY_URL;

    if (!this.privateKeyHex || !this.publicKeyHex || !this.defaultRelayUrl) {
      console.warn('[NostrService] Nostr keys or default relay URL is not configured.');
    }
  }

  // Helper to serialize event for ID calculation and signing (NIP-01)
  private serializeEventForSigning(event: NostrEvent): string {
    return JSON.stringify([
      0,
      event.pubkey,
      event.created_at,
      event.kind,
      event.tags,
      event.content
    ]);
  }

  /**
   * Creates and signs a Nostr event.
   * (Placeholder for actual signing logic, uses SHA256 for ID)
   */
  public async signEvent(event: NostrEvent): Promise<NostrEvent> {
    const serializedEvent = this.serializeEventForSigning(event);
    event.id = crypto.createHash('sha256').update(serializedEvent).digest('hex');

    // Placeholder for actual signature:
    // const sig = await nobleSecp256k1.schnorr.sign(event.id, this.privateKeyHex);
    // event.sig = Buffer.from(sig).toString('hex');
    event.sig = `signed_with_${this.privateKeyHex}_for_id_${event.id}`; // Placeholder sig

    console.log(`[NostrService] Signed event: ID=${event.id}, Sig=${event.sig}`);
    return event;
  }

  // This method is removed as createAndPublishEvent is not used in the new resolver flow.
  // async createAndPublishEvent(
  //   kind: number,
  //   content: string,
  //   tags: string[][],
  //   relayUrl?: string
  // ): Promise<NostrEvent> {
  //   const targetRelay = relayUrl || this.defaultRelayUrl;
  //   if (!this.publicKeyHex) { // Changed to publicKeyHex
  //       throw new Error('Nostr public key is not configured.');
  //   }
  //   let event = createEvent(kind, content, tags, this.publicKeyHex); // Changed to publicKeyHex
  //   event = await this.signEvent(event);

  //   await publishEventToRelay(targetRelay, event);
  //   console.log(`[NostrService] Event published to ${targetRelay}:`, event);
  //   return event;
  // }

  async fetchEventsFromRelay(filters: any[], relayUrl?: string): Promise<NostrEvent[]> {
    const targetRelay = relayUrl || this.defaultRelayUrl;
    const events = await fetchEvents(targetRelay, filters);
    console.log(`[NostrService] Events fetched from ${targetRelay}:`, events);
    return events;
  }

  // getPublicKey() is removed as getPublicKeyHex() is more specific
  // getPublicKey(): string | undefined {
  //   return this.publicKeyHex; // Would return hex now
  // }

  // --- BEGIN NEW/MODIFIED METHODS from previous step, adapted for hex keys ---

  /**
   * Encrypts content if the article is private.
   * Uses the user's own public key for encryption, making it a self-dm.
   */
  private async encryptIfPrivate(content: string, isPrivate: boolean): Promise<string> {
    if (!isPrivate) {
      return content;
    }
    if (!this.privateKeyHex || !this.publicKeyHex) {
      throw new Error('User Nostr keys not configured for encryption.');
    }
    return nip04Encrypt(this.privateKeyHex, this.publicKeyHex, content);
  }

  /**
   * Maps Omnivore article data to a Nostr kind:30000 event object (unsigned).
   */
  async mapArticleToNostrKind30000(article: OmnivoreArticle, isPrivate: boolean): Promise<NostrEvent> {
    if (!this.publicKeyHex) {
      throw new Error('Nostr public key (hex) is not configured.');
    }
    const tags: string[][] = [];
    tags.push(['omnivore_id', article.id]);
    tags.push(['url', article.url]);
    if (article.excerpt) {
      tags.push(['description', article.excerpt]);
    }
    if (article.ogImageUrl) {
      tags.push(['image', article.ogImageUrl]);
    }
    if (article.author) {
      tags.push(['author', article.author]);
    }
    if (article.omnivoreTags && article.omnivoreTags.length > 0) { // Renamed from article.tags
      article.omnivoreTags.forEach(tag => tags.push(['t', tag]));
    }
    tags.push(['kind', isPrivate ? 'private' : 'public']);

    const eventContent = await this.encryptIfPrivate(article.title, isPrivate);

    // Pubkey in createEvent should be the user's public key in hex format for consistency with signing
    return createEvent(30000, eventContent, tags, this.publicKeyHex);
  }

  /**
   * Maps Omnivore article content to a Nostr kind:30001 event object (unsigned).
   * @param articleContent The full article content.
   * @param associatedKind30000EventId The event ID of the parent kind:30000 event.
   * @param isPrivate Whether the article is private (determines if content needs encryption).
   */
  async mapArticleToNostrKind30001(
    articleContent: string,
    associatedKind30000EventId: string,
    isPrivate: boolean
  ): Promise<NostrEvent> {
    if (!this.publicKeyHex) {
      throw new Error('Nostr public key (hex) is not configured.');
    }
    const tags: string[][] = [];
    tags.push(['e', associatedKind30000EventId]);
    tags.push(['format', 'html']); // Assuming HTML content for now, could be markdown

    const encryptedContent = await this.encryptIfPrivate(articleContent, isPrivate);

    return createEvent(30001, encryptedContent, tags, this.publicKeyHex); // Pubkey should be hex
  }
  // --- END NEW/MODIFIED METHODS ---

  async publishEvent(event: NostrEvent, relayUrl?: string): Promise<void> {
    const targetRelay = relayUrl || this.defaultRelayUrl;
    await publishEventToRelay(targetRelay, event);
    console.log(`[NostrService] Event published to ${targetRelay}:`, event.id);
  }

  getPublicKeyHex(): string | undefined {
    return this.publicKeyHex;
  }
  }
  // --- END NEW/MODIFIED METHODS ---
}

// Export an instance or provide a way to get an instance
export const nostrService = new NostrService();
