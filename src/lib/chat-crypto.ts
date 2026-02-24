/**
 * E2E Encrypted Chat — Crypto Module
 *
 * Derives X25519 keypairs from Ethereum wallet signatures,
 * computes shared secrets via ECDH, and encrypts/decrypts
 * messages with AES-256-GCM.
 *
 * SECURITY: The chat private key is NEVER persisted.
 * It lives only in JS memory for the duration of the session.
 */

import nacl from "tweetnacl";
import { decodeBase64, encodeBase64 } from "tweetnacl-util";

const CHAT_SIGN_MESSAGE = "civic-chat-keypair-v1";

// ─── In-memory key cache (session-scoped, never persisted) ──────────

let cachedKeyPair: nacl.BoxKeyPair | null = null;
const sharedSecretCache = new Map<string, Uint8Array>();

// ─── Public API ─────────────────────────────────────────────────────

/**
 * The fixed message the wallet signs to derive chat keys.
 */
export function getChatSignMessage(): string {
  return CHAT_SIGN_MESSAGE;
}

/**
 * Derive an X25519 keypair from the wallet signature.
 *
 * The wallet signs a deterministic message; the signature is hashed
 * to produce a 32-byte seed for X25519 key generation.
 *
 * @param signature - Hex-encoded Ethereum signature (0x-prefixed)
 * @returns { publicKey, secretKey } - X25519 keypair
 */
export async function deriveChatKeyPair(signature: string): Promise<nacl.BoxKeyPair> {
  // Strip 0x prefix and convert hex to bytes
  const sigBytes = hexToBytes(signature.startsWith("0x") ? signature.slice(2) : signature);
  // SHA-256 the signature to get a 32-byte seed (Web Crypto API)
  const hashBuffer = await crypto.subtle.digest("SHA-256", sigBytes as Uint8Array<ArrayBuffer>);
  const seed = new Uint8Array(hashBuffer);
  // Generate X25519 keypair from seed
  const keyPair = nacl.box.keyPair.fromSecretKey(seed);
  // Cache in memory
  cachedKeyPair = keyPair;
  sharedSecretCache.clear();
  return keyPair;
}

/**
 * Get the cached keypair (null if not yet derived this session).
 */
export function getCachedKeyPair(): nacl.BoxKeyPair | null {
  return cachedKeyPair;
}

/**
 * Get the public key as a base64 string (for uploading to server).
 */
export function getPublicKeyBase64(): string | null {
  if (!cachedKeyPair) return null;
  return encodeBase64(cachedKeyPair.publicKey);
}

/**
 * Compute a shared secret with another user via X25519 ECDH.
 * Result is cached per contact for the session.
 *
 * @param theirPublicKeyBase64 - The other user's X25519 public key (base64)
 * @returns 32-byte shared secret
 */
export function computeSharedSecret(theirPublicKeyBase64: string): Uint8Array {
  if (!cachedKeyPair) {
    throw new Error("Chat keypair not derived. Sign the chat message first.");
  }

  // Check cache
  const cached = sharedSecretCache.get(theirPublicKeyBase64);
  if (cached) return cached;

  const theirPub = decodeBase64(theirPublicKeyBase64);
  const shared = nacl.box.before(theirPub, cachedKeyPair.secretKey);
  sharedSecretCache.set(theirPublicKeyBase64, shared);
  return shared;
}

/**
 * Encrypt a plaintext message using the shared secret.
 *
 * Uses NaCl's secretbox (XSalsa20-Poly1305) keyed by the shared secret.
 * Each message gets a random 24-byte nonce.
 *
 * @returns { ciphertext, nonce } - both base64-encoded
 */
export function encryptMessage(
  sharedSecret: Uint8Array,
  plaintext: string
): { ciphertext: string; nonce: string } {
  const messageBytes = new TextEncoder().encode(plaintext);
  const nonce = nacl.randomBytes(nacl.secretbox.nonceLength); // 24 bytes
  const encrypted = nacl.secretbox(messageBytes, nonce, sharedSecret);

  return {
    ciphertext: encodeBase64(encrypted),
    nonce: encodeBase64(nonce),
  };
}

/**
 * Decrypt a ciphertext message using the shared secret.
 *
 * @param ciphertext - base64-encoded ciphertext
 * @param nonce - base64-encoded nonce
 * @returns plaintext string, or null if decryption fails
 */
export function decryptMessage(
  sharedSecret: Uint8Array,
  ciphertext: string,
  nonce: string
): string | null {
  const encryptedBytes = decodeBase64(ciphertext);
  const nonceBytes = decodeBase64(nonce);
  const decrypted = nacl.secretbox.open(encryptedBytes, nonceBytes, sharedSecret);

  if (!decrypted) return null; // Tampered or wrong key
  return new TextDecoder().decode(decrypted);
}

/**
 * Check if chat keys have been derived this session.
 */
export function isChatReady(): boolean {
  return cachedKeyPair !== null;
}

/**
 * Clear all cached keys (call on logout).
 */
export function clearChatKeys(): void {
  cachedKeyPair = null;
  sharedSecretCache.clear();
}

// ─── Helpers ────────────────────────────────────────────────────────

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}
