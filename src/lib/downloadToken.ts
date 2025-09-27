import jwt from 'jsonwebtoken';

interface DownloadTokenPayload {
  ebookId: string;
  exp: number;
}

const secret = process.env.DOWNLOAD_TOKEN_SECRET;
const EXPIRATION_TIME_IN_SECONDS = 60 * 60 * 24; // 24 hours

function getSecret(): string {
    if (!secret) {
      throw new Error('DOWNLOAD_TOKEN_SECRET is not set in the environment variables.');
    }
    return secret;
}

/**
 * Generates a signed JWT for a secure download link.
 * @param ebookId The ID of the ebook to be downloaded.
 * @returns A signed JWT string.
 */
export function generateDownloadToken(ebookId: string): string {
  const payload = {
    ebookId,
    exp: Math.floor(Date.now() / 1000) + EXPIRATION_TIME_IN_SECONDS,
  };
  return jwt.sign(payload, getSecret());
}

/**
 * Verifies a download token.
 * @param token The JWT string to verify.
 * @returns The decoded payload if the token is valid, otherwise null.
 */
export function verifyDownloadToken(token: string): DownloadTokenPayload | null {
  try {
    const decoded = jwt.verify(token, getSecret()) as DownloadTokenPayload;
    return decoded;
  } catch (error) {
    // This will catch expired tokens, invalid signatures, etc.
    console.error('Token verification failed:', error);
    return null;
  }
}
