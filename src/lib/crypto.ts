// Web Crypto API AES-GCM 256-bit End-to-End Encryption

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

// Derive a 256-bit AES-GCM CryptoKey from a passphrase and salt using PBKDF2
async function deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as unknown as BufferSource,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export interface EncryptedPayloadEnvelope {
  v: number;
  salt: string; // base64
  iv: string;   // base64
  ct: string;   // base64 ciphertext
}

/**
 * Encrypt any JS object/string using AES-GCM 256
 */
export async function encryptData<T>(data: T, passphrase: string): Promise<string> {
  if (!passphrase || passphrase.trim() === '') {
    throw new Error('Encryption passphrase is required.');
  }

  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(passphrase, salt);

  const enc = new TextEncoder();
  const encodedPlaintext = enc.encode(JSON.stringify(data));

  const ciphertext = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv as unknown as BufferSource,
    },
    key,
    encodedPlaintext
  );

  const envelope: EncryptedPayloadEnvelope = {
    v: 1,
    salt: arrayBufferToBase64(salt.buffer),
    iv: arrayBufferToBase64(iv.buffer),
    ct: arrayBufferToBase64(ciphertext),
  };

  return JSON.stringify(envelope);
}

/**
 * Decrypt an AES-GCM envelope using the provided passphrase
 */
export async function decryptData<T>(payloadString: string, passphrase: string): Promise<T> {
  if (!payloadString) {
    throw new Error('No encrypted payload provided');
  }

  let envelope: EncryptedPayloadEnvelope;
  try {
    envelope = JSON.parse(payloadString);
  } catch (err) {
    // If it's legacy unencrypted or raw JSON, attempt parse
    try {
      return JSON.parse(payloadString) as T;
    } catch {
      throw new Error('Invalid encrypted payload format');
    }
  }

  if (!envelope.salt || !envelope.iv || !envelope.ct) {
    // Legacy plaintext fallback if any
    return envelope as unknown as T;
  }

  const salt = new Uint8Array(base64ToArrayBuffer(envelope.salt));
  const iv = new Uint8Array(base64ToArrayBuffer(envelope.iv));
  const ciphertextBuffer = base64ToArrayBuffer(envelope.ct);

  const key = await deriveKey(passphrase, salt);

  try {
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv as unknown as BufferSource,
      },
      key,
      ciphertextBuffer
    );

    const dec = new TextDecoder();
    const plaintext = dec.decode(decryptedBuffer);
    return JSON.parse(plaintext) as T;
  } catch {
    throw new Error('Incorrect encryption passphrase or corrupted data');
  }
}

/**
 * Quick hash identifier for key fingerprint verification
 */
export async function generateKeyFingerprint(passphrase: string): Promise<string> {
  const enc = new TextEncoder();
  const digest = await window.crypto.subtle.digest('SHA-256', enc.encode(passphrase));
  const bytes = new Uint8Array(digest);
  return Array.from(bytes.slice(0, 8))
    .map(b => b.toString(16).padStart(2, '0'))
    .join(':')
    .toUpperCase();
}
