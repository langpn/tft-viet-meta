/**
 * Global reactive settings store for TFT Viet Meta.
 * Persists user preferences like 'showNames' across all comps and modals.
 */

class SettingsStore {
  #showNames = $state(
    typeof window !== 'undefined'
      ? localStorage.getItem('tft_show_names') === 'true'
      : false
  );

  get showNames(): boolean {
    return this.#showNames;
  }

  set showNames(value: boolean) {
    this.#showNames = value;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('tft_show_names', String(value));
      } catch {
        // Ignore quota/security errors in private browsing
      }
    }
  }

  toggleShowNames() {
    this.showNames = !this.#showNames;
  }
}

export const settingsStore = new SettingsStore();

export function toggleShowNames() {
  settingsStore.toggleShowNames();
}

export function getShowNames(): boolean {
  return settingsStore.showNames;
}

export function setShowNames(value: boolean) {
  settingsStore.showNames = value;
}
