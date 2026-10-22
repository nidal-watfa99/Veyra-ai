/**
 * Security and Browser Access Utilities
 * Provides safe URL validation, open redirect defense, popup-blocker resilience,
 * and Storage Access API / Cookie fallback mechanics.
 */

// Trusted redirect protocols
const ALLOWED_PROTOCOLS = ['http:', 'https:'];

/**
 * Validates return_url and restricts redirects strictly to trusted relative paths or verified origins.
 * Prevents open-redirect attacks, backslash protocol bypasses (/\ or //), and dangerous schemes (javascript:, data:).
 */
export function validateReturnUrl(returnUrl?: string | null, allowedOrigins: string[] = []): string | null {
  if (!returnUrl) return null;
  const trimmed = returnUrl.trim();
  if (!trimmed) return null;

  // Block control characters and null bytes
  if (/[\u0000-\u001F\u007F-\u009F]/.test(trimmed)) {
    console.warn('[Security] Rejected return_url containing control characters');
    return null;
  }

  // Prevent protocol-relative bypasses like '//evil.com' or '/\evil.com'
  if (trimmed.startsWith('//') || trimmed.startsWith('/\\') || trimmed.startsWith('\\')) {
    console.warn('[Security] Blocked protocol-relative redirect attempt:', trimmed);
    return null;
  }

  // Safe relative paths starting with a single '/'
  if (trimmed.startsWith('/')) {
    try {
      const decoded = decodeURIComponent(trimmed);
      if (decoded.startsWith('//') || decoded.startsWith('/\\') || decoded.startsWith('\\')) {
        console.warn('[Security] Blocked encoded protocol-relative redirect attempt:', decoded);
        return null;
      }
    } catch {
      console.warn('[Security] Malformed URI encoding in return_url');
      return null;
    }
    return trimmed;
  }

  try {
    const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://veyra.ai';
    const parsed = new URL(trimmed, currentOrigin);
    
    // Disallow dangerous protocols
    if (!ALLOWED_PROTOCOLS.includes(parsed.protocol)) {
      console.warn('[Security] Blocked unsafe protocol redirect:', parsed.protocol);
      return null;
    }

    // Must match current origin or explicitly allowed origins
    const isSameOrigin = parsed.origin === currentOrigin;
    const isAllowedDomain = allowedOrigins.some((origin) => {
      try {
        return new URL(origin).origin === parsed.origin;
      } catch {
        return false;
      }
    });

    if (isSameOrigin || isAllowedDomain) {
      return parsed.toString();
    }

    console.warn('[Security] Blocked untrusted redirect destination:', parsed.origin);
    return null;
  } catch (err) {
    console.warn('[Security] Invalid return_url parse failure:', err);
    return null;
  }
}

/**
 * Safely executes window.open with popup-blocker failure detection and graceful feedback.
 */
export function safeOpenWindow(
  url: string,
  target: string = '_blank',
  features: string = ''
): { success: boolean; error?: string; blocked?: boolean } {
  try {
    // Same-origin / relative URLs are normalised by validateReturnUrl; external https links
    // (provider portals, docs) are allowed as-is, but never non-http(s) schemes such as javascript:.
    let validated = validateReturnUrl(url);
    if (!validated) {
      let parsed: URL | null = null;
      try {
        parsed = new URL(url, typeof window !== 'undefined' ? window.location.origin : undefined);
      } catch {
        parsed = null;
      }
      if (!parsed || !ALLOWED_PROTOCOLS.includes(parsed.protocol)) {
        return { success: false, error: 'UNSAFE_URL', blocked: false };
      }
      validated = parsed.toString();
    }

    // NOTE: passing 'noopener' inside the features string makes window.open() ALWAYS return null,
    // which made every successful open look like a blocked popup. Open normally, detect the block,
    // then sever the opener reference manually (equivalent protection).
    const popup = window.open(validated, target, features);

    if (popup) {
      try {
        popup.opener = null;
      } catch {
        // cross-origin access to opener may be restricted; safe to ignore
      }
    }

    if (!popup || popup.closed || typeof popup.closed === 'undefined') {
      console.warn('[Browser] Popup was blocked by browser policies:', url);
      return {
        success: false,
        error: 'POPUP_BLOCKED',
        blocked: true,
      };
    }

    return { success: true, blocked: false };
  } catch (err) {
    console.error('[Browser] window.open failed:', err);
    return {
      success: false,
      error: (err as Error).message,
      blocked: false,
    };
  }
}

/**
 * Robust Storage Access API handler with third-party iframe and ITP fallback.
 * Checks document.hasStorageAccess() and document.requestStorageAccess() without throwing.
 */
export async function checkAndRequestStorageAccess(requestIfNeeded: boolean = true): Promise<{
  hasAccess: boolean;
  supported: boolean;
  requiredUserGesture?: boolean;
  error?: string;
}> {
  if (typeof document === 'undefined') {
    return { hasAccess: true, supported: false };
  }

  // If Storage Access API is not supported in the browser
  if (typeof (document as any).hasStorageAccess !== 'function') {
    return { hasAccess: true, supported: false };
  }

  // requestStorageAccess() only applies to embedded (third-party) frames.
  // A normal top-level page is first-party and already has full storage access.
  let embedded = false;
  try {
    embedded = typeof window !== 'undefined' && window.self !== window.top;
  } catch {
    embedded = true;
  }
  if (!embedded) {
    return { hasAccess: true, supported: true };
  }

  try {
    const alreadyGranted = await (document as any).hasStorageAccess();
    if (alreadyGranted) {
      return { hasAccess: true, supported: true };
    }

    // Passive status check only (e.g. when a dialog opens): requesting access without a user
    // gesture is rejected by browsers and only produces console noise.
    if (!requestIfNeeded) {
      return { hasAccess: false, supported: true, requiredUserGesture: true };
    }

    // Attempt request if interactive
    if (typeof (document as any).requestStorageAccess === 'function') {
      try {
        await (document as any).requestStorageAccess();
        return { hasAccess: true, supported: true };
      } catch (requestErr) {
        console.warn('[StorageAccess] requestStorageAccess rejected or requires user gesture:', requestErr);
        return {
          hasAccess: false,
          supported: true,
          requiredUserGesture: true,
          error: (requestErr as Error).message || 'STORAGE_ACCESS_DENIED',
        };
      }
    }

    return { hasAccess: false, supported: true };
  } catch (err) {
    console.warn('[StorageAccess] hasStorageAccess check failed:', err);
    return {
      hasAccess: false,
      supported: true,
      error: (err as Error).message,
    };
  }
}

/**
 * Verifies Cookie and LocalStorage accessibility safely in all environments
 */
export function verifyCookieStorageState(): {
  cookiesEnabled: boolean;
  localStorageAvailable: boolean;
  inIframe: boolean;
} {
  let inIframe = false;
  try {
    inIframe = typeof window !== 'undefined' && window.self !== window.top;
  } catch {
    inIframe = true;
  }

  let cookiesEnabled = false;
  try {
    if (typeof navigator !== 'undefined' && navigator.cookieEnabled) {
      cookiesEnabled = true;
    } else if (typeof document !== 'undefined') {
      document.cookie = '__veyra_test=1; SameSite=Lax';
      cookiesEnabled = document.cookie.indexOf('__veyra_test=') !== -1;
      document.cookie = '__veyra_test=1; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
  } catch {
    cookiesEnabled = false;
  }

  let localStorageAvailable = false;
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const testKey = '__veyra_ls_test';
      window.localStorage.setItem(testKey, '1');
      window.localStorage.removeItem(testKey);
      localStorageAvailable = true;
    }
  } catch {
    localStorageAvailable = false;
  }

  return { cookiesEnabled, localStorageAvailable, inIframe };
}

/**
 * Memory-backed fallback store when localStorage/cookies are disabled or restricted.
 */
const memoryStorage = new Map<string, string>();

export const resilientStorage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
    } catch {
      // In restricted iframe or private mode
    }
    return memoryStorage.get(key) || null;
  },

  setItem: (key: string, value: string): void => {
    memoryStorage.set(key, value);
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
      }
    } catch {
      // In restricted iframe or private mode
    }
  },

  removeItem: (key: string): void => {
    memoryStorage.delete(key);
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } catch {
      // In restricted iframe or private mode
    }
  },
};
