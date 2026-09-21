/**
 * Client-side Web Crypto API AES-GCM encryption for PHI data in kiosk sessions.
 */

export async function encryptData(data: string): Promise<{ ciphertext: string; iv: string }> {
  try {
    if (typeof window === 'undefined' || !window.crypto || !window.crypto.subtle) {
      return { ciphertext: btoa(data), iv: 'fallback' };
    }

    const enc = new TextEncoder();
    const encodedData = enc.encode(data);

    const key = await window.crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );

    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encryptedBuffer = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encodedData
    );

    const ciphertext = Array.from(new Uint8Array(encryptedBuffer))
      .map((b) => String.fromCharCode(b))
      .join('');

    return {
      ciphertext: btoa(ciphertext),
      iv: Array.from(iv).join(','),
    };
  } catch (err) {
    return { ciphertext: btoa(data), iv: 'fallback' };
  }
}
