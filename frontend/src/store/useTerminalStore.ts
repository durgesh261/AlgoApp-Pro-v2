import { create } from 'zustand';
import { TerminalPage, SystemStatus } from '@algoapp/shared';

export interface WidgetVisibilityState {
  showCurrentPair: boolean;
  showAccountSummary: boolean;
  showChallengeSummary: boolean;
  showOpportunityRadar: boolean;
  showEquityCurve: boolean;
  showPnLChart: boolean;
  showWinRate: boolean;
  showOpenTrades: boolean;
  showSignals: boolean;
}

const STORAGE_KEY = 'algoapp_terminal_layout_v2';

const defaultWidgetState: WidgetVisibilityState = {
  showCurrentPair: true,
  showAccountSummary: true,
  showChallengeSummary: true,
  showOpportunityRadar: true,
  showEquityCurve: true,
  showPnLChart: true,
  showWinRate: true,
  showOpenTrades: true,
  showSignals: true,
};

const loadInitialWidgetState = (): WidgetVisibilityState => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return { ...defaultWidgetState, ...JSON.parse(saved) };
    }
  } catch {
    // fallback
  }
  return defaultWidgetState;
};

interface TerminalState {
  activePage: TerminalPage;
  activeSymbol: string;
  isSidebarCollapsed: boolean;
  isMarketWatchOpen: boolean;
  isCommandPaletteOpen: boolean;
  systemStatus: SystemStatus;
  widgets: WidgetVisibilityState;

  setActivePage: (page: TerminalPage) => void;
  setActiveSymbol: (symbol: string) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleMarketWatch: () => void;
  setMarketWatchOpen: (open: boolean) => void;
  toggleCommandPalette: () => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setSystemStatus: (status: SystemStatus) => void;

  toggleWidget: (widgetKey: keyof WidgetVisibilityState) => void;
  resetWidgetLayout: () => void;
}

export const useTerminalStore = create<TerminalState>((set, get) => ({
  activePage: TerminalPage.DASHBOARD,
  activeSymbol: 'BTCUSD.P',
  isSidebarCollapsed: false,
  isMarketWatchOpen: true,
  isCommandPaletteOpen: false,
  systemStatus: SystemStatus.HEALTHY,
  widgets: loadInitialWidgetState(),

  setActivePage: (page) => set({ activePage: page }),
  setActiveSymbol: (symbol) => set({ activeSymbol: symbol }),
  toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ isSidebarCollapsed: collapsed }),
  toggleMarketWatch: () => set((state) => ({ isMarketWatchOpen: !state.isMarketWatchOpen })),
  setMarketWatchOpen: (open) => set({ isMarketWatchOpen: open }),
  toggleCommandPalette: () => set((state) => ({ isCommandPaletteOpen: !state.isCommandPaletteOpen })),
  setCommandPaletteOpen: (open) => set({ isCommandPaletteOpen: open }),
  setSystemStatus: (status) => set({ systemStatus: status }),

  toggleWidget: (widgetKey) => {
    const currentWidgets = get().widgets;
    const updated = { ...currentWidgets, [widgetKey]: !currentWidgets[widgetKey] };
    set({ widgets: updated });
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
  },

  resetWidgetLayout: () => {
    set({ widgets: defaultWidgetState });
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultWidgetState));
    } catch {
      // ignore
    }
  },
}));
