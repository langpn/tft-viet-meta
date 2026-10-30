/**
 * Global reactive tooltip store for TFT Academy tooltips.
 */

export type TooltipType = 'champion' | 'item' | 'augment' | 'trait';

export interface TooltipState {
  visible: boolean;
  type: TooltipType;
  id: string;
  name?: string;
  data: any | null;
  loading: boolean;
  x: number;
  y: number;
  placement: 'top' | 'bottom';
}

const cache = new Map<string, any>();

let tooltipState = $state<TooltipState>({
  visible: false,
  type: 'champion',
  id: '',
  name: '',
  data: null,
  loading: false,
  x: 0,
  y: 0,
  placement: 'top'
});

let hideTimer: any = null;
let showTimer: any = null;

export function getTooltipState() {
  return tooltipState;
}

export async function showTooltip(
  payload: { type: TooltipType; id: string; name?: string; fallbackData?: any },
  targetEl: HTMLElement
) {
  clearTimeout(hideTimer);
  clearTimeout(showTimer);

  if (!targetEl) return;

  const rect = targetEl.getBoundingClientRect();
  const screenW = window.innerWidth;
  const screenH = window.innerHeight;

  // Center horizontally over target element, clamp to viewport
  const cardW = 340;
  let targetX = rect.left + rect.width / 2;
  // Ensure card stays on screen
  if (targetX - cardW / 2 < 16) {
    targetX = cardW / 2 + 16;
  } else if (targetX + cardW / 2 > screenW - 16) {
    targetX = screenW - cardW / 2 - 16;
  }

  // Choose top or bottom placement
  const placement: 'top' | 'bottom' = rect.top > 320 ? 'top' : 'bottom';
  const targetY = placement === 'top' ? rect.top - 12 : rect.bottom + 12;

  const cacheKey = `${payload.type}:${payload.id || payload.name}`;

  if (cache.has(cacheKey)) {
    tooltipState = {
      visible: true,
      type: payload.type,
      id: payload.id,
      name: payload.name,
      data: cache.get(cacheKey),
      loading: false,
      x: targetX,
      y: targetY,
      placement
    };
    return;
  }

  // If fallback data passed directly (e.g. from comp or parent)
  if (payload.fallbackData) {
    cache.set(cacheKey, payload.fallbackData);
    tooltipState = {
      visible: true,
      type: payload.type,
      id: payload.id,
      name: payload.name,
      data: payload.fallbackData,
      loading: false,
      x: targetX,
      y: targetY,
      placement
    };
    return;
  }

  tooltipState = {
    visible: true,
    type: payload.type,
    id: payload.id,
    name: payload.name,
    data: null,
    loading: true,
    x: targetX,
    y: targetY,
    placement
  };

  try {
    const q = new URLSearchParams({
      type: payload.type,
      id: payload.id || '',
      name: payload.name || ''
    });
    const res = await fetch(`/api/tooltip?${q.toString()}`);
    if (res.ok) {
      const data = await res.json();
      cache.set(cacheKey, data);
      if (tooltipState.id === payload.id) {
        tooltipState.data = data;
        tooltipState.loading = false;
      }
    } else {
      tooltipState.loading = false;
    }
  } catch (err) {
    tooltipState.loading = false;
  }
}

export function hideTooltip(delay = 80) {
  clearTimeout(showTimer);
  clearTimeout(hideTimer);
  hideTimer = setTimeout(() => {
    tooltipState.visible = false;
  }, delay);
}
