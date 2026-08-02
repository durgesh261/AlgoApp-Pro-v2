import { create } from 'zustand';
import { TerminalPage, SystemStatus } from '@algoapp/shared';

interface TerminalState {
  activePage: TerminalPage;
  activeSymbol: string;
  isSidebarCollapsed: boolean;
  isCommandPaletteOpen: boolean;
  systemStatus: SystemStatus;

  setActivePage: (page: TerminalPage) => void;
  setActiveSymbol: (symbol: string) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleCommandPalette: () => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setSystemStatus: (status: SystemStatus) => void;
}

export const useTerminalStore = create<TerminalState>((set) => ({
  activePage: TerminalPage.DASHBOARD,
  activeSymbol: 'BTCUSD.P',
  isSidebarCollapsed: false,
  isCommandPaletteOpen: false,
  systemStatus: SystemStatus.HEALTHY,

  setActivePage: (page) => set({ activePage: page }),
  setActiveSymbol: (symbol) => set({ activeSymbol: symbol }),
  toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ isSidebarCollapsed: collapsed }),
  toggleCommandPalette: () => set((state) => ({ isCommandPaletteOpen: !state.isCommandPaletteOpen })),
  setCommandPaletteOpen: (open) => set({ isCommandPaletteOpen: open }),
  setSystemStatus: (status) => set({ systemStatus: status }),
}));
