import crypto from 'crypto';

const SECRET_KEY = process.env.SIGNED_URL_SECRET || 'fallback-secret-key-for-development';

export interface SignedUrlOptions {
  reportId: string;
  expiresInHours?: number;
}

export interface ParsedSignedUrl {
  reportId: string;
  expires: number;
  signature: string;
  isValid: boolean;
  isExpired: boolean;
}

/**
 * Generate a signed URL for a report with expiration
 */
export function generateSignedUrl({ reportId, expiresInHours = 24 }: SignedUrlOptions): string {
  const expirationTime = Date.now() + (expiresInHours * 60 * 60 * 1000);
  
  // Create signature using HMAC-SHA256
  const payload = `${reportId}:${expirationTime}`;
  const signature = crypto
    .createHmac('sha256', SECRET_KEY)
    .update(payload)
    .digest('hex');
  
  return `/view-report/${reportId}?expires=${expirationTime}&signature=${signature}`;
}

/**
 * Generate a full signed URL with domain
 */
export function generateFullSignedUrl({ reportId, expiresInHours = 24 }: SignedUrlOptions, baseUrl?: string): string {
  const signedPath = generateSignedUrl({ reportId, expiresInHours });
  const domain = baseUrl || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  return `${domain}${signedPath}`;
}

/**
 * Verify a signed URL and check if it's valid and not expired
 */
export function verifySignedUrl(reportId: string, expires: string, signature: string): ParsedSignedUrl {
  const result: ParsedSignedUrl = {
    reportId,
    expires: parseInt(expires),
    signature,
    isValid: false,
    isExpired: false
  };

  // Check if URL has expired
  const now = Date.now();
  if (result.expires < now) {
    result.isExpired = true;
    return result;
  }

  // Verify signature
  const payload = `${reportId}:${expires}`;
  const expectedSignature = crypto
    .createHmac('sha256', SECRET_KEY)
    .update(payload)
    .digest('hex');

  result.isValid = signature === expectedSignature;
  return result;
}

/**
 * Parse and validate a signed URL from request parameters
 */
export function parseSignedUrlParams(
  reportId: string, 
  searchParams: URLSearchParams
): ParsedSignedUrl | null {
  const expires = searchParams.get('expires');
  const signature = searchParams.get('signature');

  if (!expires || !signature) {
    return null; // Not a signed URL, allow normal access
  }

  return verifySignedUrl(reportId, expires, signature);
}

/**
 * Format expiration time for display
 */
export function formatExpiration(expirationTime: number): string {
  const date = new Date(expirationTime);
  const now = new Date();
  
  const diffHours = Math.ceil((expirationTime - now.getTime()) / (1000 * 60 * 60));
  
  if (diffHours < 1) {
    return 'Expires soon';
  } else if (diffHours < 24) {
    return `Expires in ${diffHours} hour${diffHours === 1 ? '' : 's'}`;
  } else {
    const diffDays = Math.ceil(diffHours / 24);
    return `Expires in ${diffDays} day${diffDays === 1 ? '' : 's'}`;
  }
}