import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTerminalStore } from '../../store/useTerminalStore';
import { useMarketPairs } from '../../hooks/useMarketPairs';
import { TradingTimeframe, NotificationDto } from '@algoapp/shared';
import { 
  PanelLeftClose, 
  PanelLeft,
  Search,
  ShieldAlert,
  Bell,
  CheckCircle2,
  AlertTriangle,
  Info,
  CheckCheck,
  Trash2,
  Radio,
  X,
  Loader2
} from 'lucide-react';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { deltaApi, realtimeOperationsApi, scannerApi, settingsApi, systemApi } from '../../services/api';
import { toISTTimeShort } from '../../utils/time';

export const Header: React.FC = () => {
  const queryClient = useQueryClient();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const { data: deltaHealth } = useQuery({
    queryKey: ['deltaHealth'],
    queryFn: deltaApi.getHealth,
    refetchInterval: 5000,
  });

  const { data: systemSettingsData } = useQuery({
    queryKey: ['systemSettings'],
    queryFn: settingsApi.getSettings,
  });

  const { data: notifsData } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => realtimeOperationsApi.getNotifications(),
    refetchInterval: 3000,
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => realtimeOperationsApi.markAllRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const clearAllMutation = useMutation({
    mutationFn: () => realtimeOperationsApi.clearAll(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markSingleReadMutation = useMutation({
    mutationFn: (id: string) => realtimeOperationsApi.markNotificationRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const notifications: NotificationDto[] = notifsData?.data || [];
  const unreadCount = notifications.filter((n) => !n.read).length;

  const isDeltaConnected = deltaHealth?.data?.connectionState === 'CONNECTED';

  const { 
    activeSymbol, 
    activeTimeframe,
    setActiveTimeframe,
    setActiveProfileId,
    isSidebarCollapsed, 
    toggleSidebar, 
    toggleCommandPalette,
    isDeveloperMode,
    toggleDeveloperMode,
    isAlgoRunning,
    setIsAlgoRunning
  } = useTerminalStore();

  const startScannerMutation = useMutation({ mutationFn: scannerApi.start, onSuccess: () => setIsAlgoRunning(true) });
  const stopScannerMutation = useMutation({ mutationFn: scannerApi.stop, onSuccess: () => setIsAlgoRunning(false) });

  const { pairs } = useMarketPairs();
  const currentPair = pairs[activeSymbol];

  // Close notifications on outside click & ESC key for modal
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showResetModal && !isResetting) {
        setShowResetModal(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showResetModal, isResetting]);

  const getSeverityIcon = (sev: string) => {
    switch (sev) {
      case 'CRITICAL':
        return <ShieldAlert className="w-3.5 h-3.5 text-[#EF4444] shrink-0 mt-0.5" />;
      case 'WARNING':
        return <AlertTriangle className="w-3.5 h-3.5 text-[#F59E0B] shrink-0 mt-0.5" />;
      case 'SUCCESS':
        return <CheckCircle2 className="w-3.5 h-3.5 text-[#00C896] shrink-0 mt-0.5" />;
      default:
        return <Info className="w-3.5 h-3.5 text-[#3B82F6] shrink-0 mt-0.5" />;
    }
  };

  return (
    <header className="h-14 glass-header flex items-center justify-between px-4 z-20 select-none font-mono relative">
      {/* Left Selectors (Symbol, Timeframe, Profile) */}
      <div className="flex items-center space-x-3">
        {/* Toggle Left Sidebar */}
        <button
          onClick={toggleSidebar}
          className="p-1.5 bg-[#161D2A] hover:bg-[#1E2638] border border-[#1E293B] hover:border-[#334155] rounded-lg text-[#94A3B8] hover:text-[#F8FAFC] transition-colors"
          title={isSidebarCollapsed ? 'Expand Sidebar (Ctrl+B)' : 'Collapse Sidebar (Ctrl+B)'}
        >
          {isSidebarCollapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
        </button>

        {/* Global Strategy / Engine Mode Pill */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              if (isAlgoRunning) {
                stopScannerMutation.mutate();
              } else {
                startScannerMutation.mutate();
              }
            }}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors shadow-sm ${
              isAlgoRunning
                ? 'bg-[#00C896]/10 text-[#00C896] border-[#00C896]/30 hover:bg-[#00C896]/20'
                : 'bg-[#F6465D]/10 text-[#F6465D] border-[#F6465D]/30 hover:bg-[#F6465D]/20'
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${isAlgoRunning ? 'bg-[#00C896] animate-pulse' : 'bg-[#F6465D]'}`} />
            <span>{isAlgoRunning ? 'ALGO TRADING: ON' : 'ALGO TRADING: OFF'}</span>
          </button>

          {/* Timeframe Segmented Selector */}
          <div className="flex items-center bg-[#0B0E14] border border-[#1E293B] p-0.5 rounded-lg text-xs">
            {(['1H'] as TradingTimeframe[]).map((tf) => (
              <button
                key={tf}
                onClick={() => {
                  setActiveTimeframe(tf);
                  if (tf === '15M') setActiveProfileId('DEF-15M-PROF');
                  if (tf === '1H') setActiveProfileId('DEF-1H-PROF');
                }}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                  activeTimeframe === tf
                    ? 'bg-[#3B82F6] text-white shadow-sm'
                    : 'text-[#94A3B8] hover:text-[#F8FAFC]'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          {/* Live Price Ticker */}
          <div className="hidden xl:flex items-center space-x-2 px-2.5 py-1 bg-[#161D2A] border border-[#1E293B] rounded-lg text-xs font-mono">
            {currentPair && (
              <span className="text-[#94A3B8] font-bold mr-1">
                {currentPair.symbol}
              </span>
            )}
            <span className="text-[#F8FAFC] font-bold font-mono-tabular">
              {currentPair ? currentPair.priceLabel : '—'}
            </span>
            {currentPair && (
              <span className={`font-semibold font-mono-tabular ${currentPair.isPositive ? 'text-[#00C896]' : 'text-[#F6465D]'}`}>
                {currentPair.changeLabel}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Center Search / Command Palette Shortcut */}
      <button
        onClick={toggleCommandPalette}
        className="hidden md:flex items-center space-x-2 bg-[#161D2A] hover:bg-[#1E2638] border border-[#1E293B] hover:border-[#334155] text-[#94A3B8] px-3 py-1 rounded-lg text-xs transition-colors w-96 lg:w-[450px] justify-between"
      >
        <div className="flex items-center space-x-2">
          <Search className="w-3.5 h-3.5" />
          <span>Search symbol, profile...</span>
        </div>
        <kbd className="bg-[#0B0E14] border border-[#334155] px-1.5 py-0.5 rounded text-[10px] text-[#F8FAFC]">
          Ctrl K
        </kbd>
      </button>

      {/* Right Telemetry & Actions */}
      <div className="flex items-center space-x-2.5">
        {/* Developer Mode Switch — HIDDEN IN PRODUCTION */}
        {import.meta.env.DEV && (
          <button
            onClick={toggleDeveloperMode}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold border transition-colors ${
              isDeveloperMode
                ? 'bg-[#F59E0B]/20 text-[#F59E0B] border-[#F59E0B]/40'
                : 'bg-[#1E293B] text-[#94A3B8] border-[#334155] hover:text-white'
            }`}
          >
            <span>{isDeveloperMode ? 'DEV MODE ON' : 'DEV MODE'}</span>
          </button>
        )}

        {/* Developer Mode Hard Reset DB Button */}
        {isDeveloperMode && (
          <button
            onClick={() => setShowResetModal(true)}
            className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold border transition-colors bg-[#F6465D]/20 text-[#F6465D] border-[#F6465D]/40 hover:bg-[#F6465D]/30 shadow-sm animate-in fade-in"
            title="Wipe local SQLite database"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-[#F6465D]" />
            <span>HARD RESET DB</span>
          </button>
        )}

        {/* Delta Live Status */}
        <button
          onClick={async () => {
            if (isDeltaConnected) {
              await deltaApi.disconnect();
            } else {
              const envToConnect = systemSettingsData?.data?.deltaEnvironment || 'SANDBOX';
              await deltaApi.connect(envToConnect as any); 
            }
            queryClient.invalidateQueries({ queryKey: ['deltaHealth'] });
          }}
          className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold border transition-colors ${
            isDeltaConnected
              ? 'bg-[#00C896]/10 text-[#00C896] border-[#00C896]/30'
              : 'bg-[#1E293B] text-[#94A3B8] border-[#334155]'
          }`}
        >
          <Radio className={`w-3 h-3 ${isDeltaConnected ? 'text-[#00C896]' : 'text-[#94A3B8]'}`} />
          <span>{isDeltaConnected ? 'DELTA LIVE' : 'DELTA OFF'}</span>
        </button>

        {/* Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className={`relative p-1.5 rounded-lg border transition-colors ${
              showNotifications 
                ? 'bg-[#1E293B] text-white border-[#3B82F6]' 
                : 'bg-[#161D2A] text-[#94A3B8] border-[#1E293B] hover:text-white'
            }`}
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#F6465D] text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#0B0E14] border border-[#1E293B] rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[480px]">
              {/* Notifications Header */}
              <div className="px-4 py-3 border-b border-[#1E293B] flex items-center justify-between bg-[#161D2A]/80 backdrop-blur">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-xs text-[#F8FAFC]">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="bg-[#3B82F6]/20 text-[#3B82F6] text-[10px] px-1.5 py-0.5 rounded font-bold">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-1">
                  {unreadCount > 0 && (
                    <button
                      onClick={() => markAllReadMutation.mutate()}
                      title="Mark all as read"
                      className="p-1 hover:bg-[#1E293B] text-[#94A3B8] hover:text-white rounded transition-colors"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button
                      onClick={() => clearAllMutation.mutate()}
                      title="Clear all"
                      className="p-1 hover:bg-[#1E293B] text-[#94A3B8] hover:text-[#F6465D] rounded transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Notifications List */}
              <div className="overflow-y-auto divide-y divide-[#1E293B]/50 p-1 flex-1">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-[#94A3B8] text-xs">
                    No notifications
                  </div>
                ) : (
                  notifications.map((n: NotificationDto) => (
                    <div
                      key={n.id}
                      onClick={() => !n.read && markSingleReadMutation.mutate(n.id)}
                      className={`p-3 rounded-lg flex items-start space-x-3 transition-colors ${
                        !n.read ? 'bg-[#161D2A]/60' : 'hover:bg-[#161D2A]/30'
                      }`}
                    >
                      {getSeverityIcon(n.severity)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-bold text-[#F8FAFC] truncate text-[11px]">{n.title}</span>
                          <span className="text-[9px] text-[#94A3B8] shrink-0">
                            {toISTTimeShort(n.timestamp)} IST
                          </span>
                        </div>
                        <p className="text-[#94A3B8] text-[11px] mt-0.5 leading-relaxed break-words">{n.message}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Perfectly Centered Hard Reset Database Modal via React Portal */}
      {showResetModal && typeof document !== 'undefined' && createPortal(
        <div 
          className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md transition-all animate-in fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isResetting) {
              setShowResetModal(false);
            }
          }}
        >
          <div 
            className="relative w-full max-w-md bg-[#0B0E14] border-2 border-[#F6465D] rounded-2xl p-6 shadow-2xl shadow-[#F6465D]/20 text-left font-mono"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => !isResetting && setShowResetModal(false)}
              disabled={isResetting}
              className="absolute top-4 right-4 text-[#94A3B8] hover:text-white p-1 rounded-lg hover:bg-[#161D2A] transition-colors disabled:opacity-50"
              title="Close modal (Esc)"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center space-x-3 text-[#F6465D] mb-4">
              <div className="p-2.5 bg-[#F6465D]/10 border border-[#F6465D]/30 rounded-xl">
                <ShieldAlert className="w-6 h-6 text-[#F6465D]" />
              </div>
              <div>
                <h2 className="text-base font-bold text-[#F8FAFC]">HARD RESET DATABASE</h2>
                <span className="text-[10px] text-[#F6465D] font-semibold tracking-wider uppercase">Permanent Destructive Action</span>
              </div>
            </div>

            {/* Warning Details */}
            <div className="bg-[#161D2A] border border-[#1E293B] rounded-xl p-4 mb-5 text-xs text-[#94A3B8] leading-relaxed space-y-2">
              <p>
                WARNING: This will completely wipe all local <strong className="text-white">SQLite database</strong> records including trades, orders, settings, algorithms, and credentials.
              </p>
              <div className="p-2.5 bg-[#F6465D]/10 border border-[#F6465D]/30 rounded-lg text-[#F6465D] font-bold text-[11px] flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>This action is irreversible!</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center space-x-3">
              <button
                type="button"
                disabled={isResetting}
                onClick={() => setShowResetModal(false)}
                className="flex-1 py-2.5 bg-[#1E293B] hover:bg-[#334155] disabled:opacity-50 text-[#F8FAFC] rounded-xl font-bold text-xs transition-colors"
              >
                CANCEL
              </button>
              <button
                type="button"
                disabled={isResetting}
                onClick={async () => {
                  try {
                    setIsResetting(true);
                    await systemApi.hardReset();
                    setShowResetModal(false);
                    alert('Database wiped successfully. The application will now reload.');
                    window.location.reload();
                  } catch (e: any) {
                    alert('Hard reset failed: ' + (e?.response?.data?.message || e.message));
                    setIsResetting(false);
                  }
                }}
                className="flex-1 py-2.5 bg-[#F6465D] hover:bg-[#F6465D]/90 disabled:opacity-50 text-white rounded-xl font-bold text-xs transition-all flex items-center justify-center space-x-2 shadow-lg shadow-[#F6465D]/30"
              >
                {isResetting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>WIPING...</span>
                  </>
                ) : (
                  <span>CONFIRM WIPE</span>
                )}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </header>
  );
};
