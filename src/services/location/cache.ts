import type { LocationData } from "@/types/location";
import { defaultLocationService } from "./index";

const SESSION_STORAGE_KEY = "sumitsute.location-data";

let memoryCache: LocationData | null | undefined;
let pendingRequest: Promise<LocationData | null> | null = null;

function canUseSessionStorage(): boolean {
  return typeof window !== "undefined" && typeof window.sessionStorage !== "undefined";
}

function readSessionCache(): LocationData | null {
  if (!canUseSessionStorage()) {
    return null;
  }

  const raw = window.sessionStorage.getItem(SESSION_STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as LocationData;
  } catch {
    window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
    return null;
  }
}

function writeSessionCache(value: LocationData): void {
  if (!canUseSessionStorage()) {
    return;
  }

  window.sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(value));
}

export function clearLocationCache(): void {
  memoryCache = undefined;
  pendingRequest = null;

  if (canUseSessionStorage()) {
    window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
  }
}

export async function getCachedLocationData(): Promise<LocationData | null> {
  if (memoryCache !== undefined) {
    return memoryCache;
  }

  const sessionValue = readSessionCache();
  if (sessionValue) {
    memoryCache = sessionValue;
    return sessionValue;
  }

  if (pendingRequest) {
    return pendingRequest;
  }

  pendingRequest = defaultLocationService.fetchLocation()
    .then((data) => {
      if (data) {
        memoryCache = data;
        writeSessionCache(data);
        return data;
      }

      return null;
    })
    .finally(() => {
      pendingRequest = null;
    });

  return pendingRequest;
}
