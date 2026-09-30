export interface PlatformSettings {
  commission_percent: number; // Domestic slider 1-20%, default 8%
  international_commission: number; // International slider 1-20%, default 12%
  updated_by: string;
  updated_at: string;
}

const DEFAULT_SETTINGS: PlatformSettings = {
  commission_percent: 8,
  international_commission: 12,
  updated_by: 'mark@maximus.ug',
  updated_at: new Date().toISOString(),
};

const SETTINGS_KEY = 'maximus_platform_settings_v1';

export async function fetchPlatformSettings(): Promise<PlatformSettings> {
  try {
    const res = await fetch('/api/settings');
    if (res.ok) {
      const data = await res.json();
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(data));
      return data;
    }
  } catch (err) {
    console.warn('Fallback to local storage settings', err);
  }

  const stored = localStorage.getItem(SETTINGS_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // fallback
    }
  }

  return DEFAULT_SETTINGS;
}

export function getCachedPlatformSettings(): PlatformSettings {
  const stored = localStorage.getItem(SETTINGS_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // fallback
    }
  }
  return DEFAULT_SETTINGS;
}

export async function savePlatformSettings(newSettings: Partial<PlatformSettings>): Promise<PlatformSettings> {
  const payload = {
    commission_percent: Math.min(20, Math.max(1, Number(newSettings.commission_percent ?? 8))),
    international_commission: Math.min(20, Math.max(1, Number(newSettings.international_commission ?? 12))),
    updated_by: newSettings.updated_by || 'mark@maximus.ug',
    updated_at: new Date().toISOString(),
  };

  try {
    const res = await fetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const saved = await res.json();
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(saved));
      window.dispatchEvent(new CustomEvent('maximus_settings_updated', { detail: saved }));
      return saved;
    }
  } catch (e) {
    console.warn('Could not post to /api/admin/settings, saving to localStorage:', e);
  }

  localStorage.setItem(SETTINGS_KEY, JSON.stringify(payload));
  window.dispatchEvent(new CustomEvent('maximus_settings_updated', { detail: payload }));
  return payload;
}
