export function readSessionValue<T>(key: string): T | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.sessionStorage.getItem(key);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    window.sessionStorage.removeItem(key);
    return null;
  }
}

export function writeSessionValue<T>(key: string, value: T): string | null {
  if (typeof window === "undefined") {
    return "Browser storage is not available.";
  }

  try {
    window.sessionStorage.setItem(key, JSON.stringify(value));
    return null;
  } catch {
    return "This browser session is full. Try removing one poster and uploading a smaller photo.";
  }
}

export function removeSessionValues(keys: string[]): void {
  if (typeof window === "undefined") {
    return;
  }

  for (const key of keys) {
    window.sessionStorage.removeItem(key);
  }
}
