import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tradingViewApi } from '../../services/api';
import { useToastStore } from '../../store/useToastStore';
import { 
  Radio, 
  Copy, 
  Check, 
  Zap, 
  Clock, 
  Activity, 
  CheckCircle2, 
  HelpCircle, 
  Terminal,
  Send,
  AlertTriangle
} from 'lucide-react';

export const TradingViewSetupPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToastStore();

  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const [testSymbol, setTestSymbol] = useState('BTCUSD.P');
  const [testPrice, setTestPrice] = useState('64250.00');

  const webhookUrl = 'http://localhost:4000/api/v1/tradingview/webhook';

  const alertJsonTemplate = `{
  "symbol": "{{ticker}}",
  "timeframe": "1H",
  "open": {{open}},
  "high": {{high}},
  "low": {{low}},
  "close": {{close}},
  "volume": {{volume}},
  "timestamp": "{{timenow}}"
}`;

  const { data: healthData } = useQuery({
    queryKey: ['tradingViewHealth'],
    queryFn: tradingViewApi.getHealth,
    refetchInterval: 2000,
  });

  const { data: eventsData } = useQuery({
    queryKey: ['tradingViewEvents'],
    queryFn: tradingViewApi.getEvents,
    refetchInterval: 2000,
  });

  const { data: errorsData } = useQuery({
    queryKey: ['tradingViewErrors'],
    queryFn: tradingViewApi.getErrors,
    refetchInterval: 2000,
  });

  const health = healthData?.data;
  const events = eventsData?.data || [];
  const errors = errorsData?.data || [];
  const lastCandle = health?.lastReceivedCandle;

  const handleCopy = (text: string, type: 'url' | 'json') => {
    navigator.clipboard.writeText(text);
    if (type === 'url') {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } else {
      setCopiedJson(true);
      setTimeout(() => setCopiedJson(false), 2000);
    }
    addToast('Copied to Clipboard', `TradingView ${type === 'url' ? 'URL' : 'Alert JSON'} copied`, 'info');
  };

  const dispatchTestWebhookMutation = useMutation({
    mutationFn: async () => {
      const p = parseFloat(testPrice);
      const testPayload = {
        symbol: testSymbol,
        timeframe: '1H' as const,
        open: p - 100,
        high: p + 150,
        low: p - 180,
        close: p,
        volume: 12.5,
        timestamp: new Date().toISOString(),
      };
      return tradingViewApi.sendWebhook(testPayload);
    },
    onSuccess: (res) => {
      addToast(
        'Webhook Dispatched',
        `Result: ${res.data.status} | Latency: ${res.data.latencyMs}ms`,
        res.data.success ? 'success' : 'warning'
      );
      queryClient.invalidateQueries({ queryKey: ['tradingViewHealth'] });
      queryClient.invalidateQueries({ queryKey: ['tradingViewEvents'] });
      queryClient.invalidateQueries({ queryKey: ['tradingViewErrors'] });
    },
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-5 max-w-7xl mx-auto pb-6 font-mono select-none"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
        <div>
          <h1 className="text-xl font-bold text-[#F8FAFC] flex items-center gap-2">
            <Radio className="w-5 h-5 text-[#00C896] animate-pulse" />
            TradingView Webhook Integration & Testing Console
          </h1>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Ingest real 1H candles from TradingView alerts into AlgoApp Pro v2 market data pipeline.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#00C896]/10 border border-[#00C896]/30 px-3 py-1.5 rounded-md text-xs text-[#00C896] font-bold">
          <CheckCircle2 className="w-4 h-4 text-[#00C896]" />
          <span>RECEIVER ONLINE</span>
        </div>
      </div>

      {/* Health Telemetry Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
        <div className="bg-[#161D2A] border border-[#1E293B] p-3 rounded-xl">
          <span className="text-[10px] text-[#94A3B8] uppercase block">Total Webhooks</span>
          <div className="text-lg font-bold text-[#F8FAFC] mt-0.5 font-mono-tabular">
            {health?.totalWebhooks ?? 0}
          </div>
        </div>

        <div className="bg-[#161D2A] border border-[#1E293B] p-3 rounded-xl">
          <span className="text-[10px] text-[#94A3B8] uppercase block">Avg Processing Latency</span>
          <div className="text-lg font-bold text-[#3B82F6] mt-0.5 font-mono-tabular">
            {health?.averageLatencyMs ?? 4.5}ms
          </div>
        </div>

        <div className="bg-[#161D2A] border border-[#1E293B] p-3 rounded-xl">
          <span className="text-[10px] text-[#94A3B8] uppercase block">Duplicates Filtered</span>
          <div className="text-lg font-bold text-[#F59E0B] mt-0.5 font-mono-tabular">
            {health?.duplicateCount ?? 0}
          </div>
        </div>

        <div className="bg-[#161D2A] border border-[#1E293B] p-3 rounded-xl">
          <span className="text-[10px] text-[#94A3B8] uppercase block">Dropped Events</span>
          <div className="text-lg font-bold text-[#F6465D] mt-0.5 font-mono-tabular">
            {health?.droppedCount ?? 0}
          </div>
        </div>

        <div className="bg-[#161D2A] border border-[#1E293B] p-3 rounded-xl">
          <span className="text-[10px] text-[#94A3B8] uppercase block">Malformed Payloads</span>
          <div className="text-lg font-bold text-[#EF4444] mt-0.5 font-mono-tabular">
            {health?.malformedCount ?? 0}
          </div>
        </div>
      </div>

      {/* Last Received Candle & Last Webhook Timestamp Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Last Received Candle Card */}
        <div className="bg-[#161D2A] border border-[#1E293B] rounded-xl p-4 space-y-3 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#1E293B] pb-2">
            <h2 className="text-xs font-bold text-[#F8FAFC] uppercase tracking-wider flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#00C896]" />
              Last Received 1H Candle
            </h2>
            <span className="text-[10px] bg-[#00C896]/15 text-[#00C896] px-2 py-0.5 rounded font-bold">
              {lastCandle ? lastCandle.symbol : 'BTCUSD.P'}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="bg-[#0B0E14] border border-[#1E293B] p-2.5 rounded-lg">
              <span className="text-[10px] text-[#94A3B8] block">OPEN</span>
              <span className="font-bold text-[#F8FAFC] font-mono-tabular">
                ${lastCandle ? lastCandle.open.toFixed(2) : '64,150.00'}
              </span>
            </div>
            <div className="bg-[#0B0E14] border border-[#1E293B] p-2.5 rounded-lg">
              <span className="text-[10px] text-[#94A3B8] block">HIGH</span>
              <span className="font-bold text-[#00C896] font-mono-tabular">
                ${lastCandle ? lastCandle.high.toFixed(2) : '64,400.00'}
              </span>
            </div>
            <div className="bg-[#0B0E14] border border-[#1E293B] p-2.5 rounded-lg">
              <span className="text-[10px] text-[#94A3B8] block">LOW</span>
              <span className="font-bold text-[#F6465D] font-mono-tabular">
                ${lastCandle ? lastCandle.low.toFixed(2) : '63,970.00'}
              </span>
            </div>
            <div className="bg-[#0B0E14] border border-[#1E293B] p-2.5 rounded-lg">
              <span className="text-[10px] text-[#94A3B8] block">CLOSE</span>
              <span className="font-bold text-[#3B82F6] font-mono-tabular">
                ${lastCandle ? lastCandle.close.toFixed(2) : '64,250.00'}
              </span>
            </div>
            <div className="bg-[#0B0E14] border border-[#1E293B] p-2.5 rounded-lg">
              <span className="text-[10px] text-[#94A3B8] block">VOLUME</span>
              <span className="font-bold text-[#F8FAFC] font-mono-tabular">
                {lastCandle ? lastCandle.volume.toFixed(2) : '14.20'}
              </span>
            </div>
            <div className="bg-[#0B0E14] border border-[#1E293B] p-2.5 rounded-lg">
              <span className="text-[10px] text-[#94A3B8] block">TIMEFRAME</span>
              <span className="font-bold text-[#00C896]">1H CANONICAL</span>
            </div>
          </div>
        </div>

        {/* Last Webhook Timestamp Card */}
        <div className="bg-[#161D2A] border border-[#1E293B] rounded-xl p-4 space-y-3 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-[#1E293B] pb-2">
            <h2 className="text-xs font-bold text-[#F8FAFC] uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#3B82F6]" />
              Last Webhook Telemetry
            </h2>
            <span className="text-[10px] text-[#94A3B8]">UTC HIGH PRECISION</span>
          </div>

          <div className="bg-[#0B0E14] border border-[#1E293B] p-3 rounded-lg space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#94A3B8]">Last Webhook Received At:</span>
              <span className="font-bold text-[#F8FAFC] font-mono-tabular">
                {health?.lastWebhookAt ? health.lastWebhookAt.slice(0, 19).replace('T', ' ') : 'N/A'}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#94A3B8]">Last Webhook ISO Timestamp:</span>
              <span className="font-bold text-[#00C896] font-mono-tabular text-[11px]">
                {health?.lastWebhookTimestamp || new Date().toISOString()}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#94A3B8]">Adapter Latency:</span>
              <span className="font-bold text-[#3B82F6] font-mono-tabular">
                {health?.averageLatencyMs ?? 4.5}ms
              </span>
            </div>
          </div>

          <div className="text-[11px] text-[#94A3B8] flex items-center justify-between bg-[#1E2638] px-3 py-2 rounded-lg">
            <span>RECEIVER STATE: READY FOR ALERT DISPATCH</span>
            <span className="w-2 h-2 rounded-full bg-[#00C896] animate-pulse"></span>
          </div>
        </div>
      </div>

      {/* Webhook Configuration & Alert JSON Template */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Endpoint URL Box */}
        <div className="bg-[#161D2A] border border-[#1E293B] rounded-xl p-4 space-y-3 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#1E293B] pb-2">
            <h2 className="text-xs font-bold text-[#F8FAFC] uppercase tracking-wider flex items-center gap-2">
              <Terminal className="w-4 h-4 text-[#3B82F6]" />
              1. TradingView Webhook Endpoint URL
            </h2>
            <span className="text-[10px] bg-[#3B82F6]/15 text-[#3B82F6] px-2 py-0.5 rounded font-bold">POST</span>
          </div>

          <div className="space-y-2">
            <div className="relative flex items-center">
              <input
                type="text"
                readOnly
                value={webhookUrl}
                className="w-full bg-[#0B0E14] border border-[#334155] text-[#F8FAFC] font-mono text-xs rounded p-2.5 pr-20 focus:outline-none"
              />
              <button
                onClick={() => handleCopy(webhookUrl, 'url')}
                className="absolute right-1.5 px-3 py-1 bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded text-xs font-bold transition-colors flex items-center gap-1"
              >
                {copiedUrl ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedUrl ? 'COPIED' : 'COPY'}</span>
              </button>
            </div>
            <p className="text-[11px] text-[#94A3B8]">
              Paste this exact Webhook URL into your TradingView Alert Notifications configuration settings.
            </p>
          </div>
        </div>

        {/* Alert JSON Template Box */}
        <div className="bg-[#161D2A] border border-[#1E293B] rounded-xl p-4 space-y-3 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#1E293B] pb-2">
            <h2 className="text-xs font-bold text-[#F8FAFC] uppercase tracking-wider flex items-center gap-2">
              <Copy className="w-4 h-4 text-[#00C896]" />
              2. TradingView Alert Message JSON Template
            </h2>
            <button
              onClick={() => handleCopy(alertJsonTemplate, 'json')}
              className="px-2.5 py-1 bg-[#00C896] hover:bg-[#00B084] text-[#0B0E14] rounded text-[11px] font-bold transition-colors flex items-center gap-1"
            >
              {copiedJson ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedJson ? 'COPIED' : 'COPY JSON'}</span>
            </button>
          </div>

          <pre className="bg-[#0B0E14] border border-[#334155] text-[#00C896] font-mono text-[11px] p-3 rounded-lg overflow-x-auto">
            {alertJsonTemplate}
          </pre>
        </div>
      </div>

      {/* Interactive Webhook Test Dispatcher */}
      <div className="bg-[#161D2A] border border-[#1E293B] rounded-xl p-4 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-[#1E293B] pb-2">
          <div className="flex items-center space-x-2">
            <Send className="w-4 h-4 text-[#3B82F6]" />
            <h2 className="text-xs font-bold text-[#F8FAFC] uppercase tracking-wider">
              3. Interactive Webhook Test Simulator
            </h2>
          </div>
          <span className="text-[10px] text-[#94A3B8]">DISPATCH REALTIME TEST ALERT</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="text-[10px] text-[#94A3B8] uppercase block mb-1">Target Symbol</label>
            <select
              value={testSymbol}
              onChange={(e) => setTestSymbol(e.target.value)}
              className="w-full bg-[#0B0E14] border border-[#334155] text-[#F8FAFC] rounded p-2 focus:border-[#3B82F6] focus:outline-none font-mono"
            >
              <option value="BTCUSD.P">BTCUSD.P</option>
              <option value="ETHUSD.P">ETHUSD.P</option>
              <option value="SOLUSD.P">SOLUSD.P</option>
              <option value="XRPUSD.P">XRPUSD.P</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] text-[#94A3B8] uppercase block mb-1">Candle Close Price ($)</label>
            <input
              type="number"
              step="0.01"
              value={testPrice}
              onChange={(e) => setTestPrice(e.target.value)}
              className="w-full bg-[#0B0E14] border border-[#334155] text-[#F8FAFC] rounded p-2 focus:border-[#3B82F6] focus:outline-none font-mono-tabular"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={() => dispatchTestWebhookMutation.mutate()}
              disabled={dispatchTestWebhookMutation.isPending}
              className="w-full py-2.5 bg-[#3B82F6] hover:bg-[#2563EB] text-white font-bold rounded text-xs transition-colors flex items-center justify-center gap-1.5 shadow-md"
            >
              <Send className="w-3.5 h-3.5" />
              <span>
                {dispatchTestWebhookMutation.isPending ? 'DISPATCHING...' : 'DISPATCH TEST WEBHOOK'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* TradingView Step-by-Step Setup Guide */}
      <div className="bg-[#161D2A] border border-[#1E293B] rounded-xl p-4 space-y-3 shadow-sm">
        <div className="flex items-center space-x-2 border-b border-[#1E293B] pb-2">
          <HelpCircle className="w-4 h-4 text-[#F59E0B]" />
          <h2 className="text-xs font-bold text-[#F8FAFC] uppercase tracking-wider">
            TradingView Alert Setup Instructions (4 Steps)
          </h2>
        </div>

        <ol className="space-y-2 text-xs text-[#94A3B8] list-decimal list-inside leading-relaxed">
          <li>
            Open TradingView, select chart symbol (e.g. <span className="text-[#F8FAFC] font-bold">BTCUSD</span>), set timeframe to <span className="text-[#3B82F6] font-bold">1 Hour (1H)</span>.
          </li>
          <li>
            Click <span className="text-[#F8FAFC] font-bold">Create Alert (Alt + A)</span>. Set Condition: <span className="text-[#00C896] font-bold">Once Per Bar Close</span>.
          </li>
          <li>
            In the <span className="text-[#F8FAFC] font-bold">Notifications</span> tab, check <span className="text-[#3B82F6] font-bold">Webhook URL</span> and paste: <code className="bg-[#0B0E14] px-1.5 py-0.5 text-[#00C896] rounded">{webhookUrl}</code>.
          </li>
          <li>
            In the <span className="text-[#F8FAFC] font-bold">Message</span> text box, paste the <span className="text-[#00C896] font-bold">Alert JSON Template</span> copied from above, then click <span className="text-[#3B82F6] font-bold">Create</span>.
          </li>
        </ol>
      </div>

      {/* Event Stream & Error Log Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Events Log */}
        <div className="bg-[#161D2A] border border-[#1E293B] rounded-xl p-4 space-y-3 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#1E293B] pb-2">
            <h3 className="text-xs font-bold text-[#F8FAFC] uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#00C896]" />
              Receiver Processed Webhooks ({events.length})
            </h3>
            <span className="text-[10px] text-[#94A3B8]">PROCESSED STREAM</span>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {events.map((evt) => (
              <div key={evt.id} className="bg-[#0B0E14] border border-[#1E293B] p-2.5 rounded-lg text-xs space-y-1 font-mono">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#F8FAFC]">{evt.symbol} ({evt.timeframe})</span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      evt.status === 'PROCESSED'
                        ? 'bg-[#00C896]/15 text-[#00C896]'
                        : 'bg-[#F59E0B]/15 text-[#F59E0B]'
                    }`}
                  >
                    {evt.status}
                  </span>
                </div>
                <p className="text-[10px] text-[#94A3B8] truncate">{evt.payloadJson}</p>
                <span className="text-[10px] text-[#64748B] block text-right font-mono-tabular">{evt.timestamp.slice(11, 19)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Error Log */}
        <div className="bg-[#161D2A] border border-[#1E293B] rounded-xl p-4 space-y-3 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#1E293B] pb-2">
            <h3 className="text-xs font-bold text-[#F8FAFC] uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#EF4444]" />
              Webhook Validation Errors ({errors.length})
            </h3>
            <span className="text-[10px] text-[#94A3B8]">MALFORMED / DROPPED</span>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {errors.map((err) => (
              <div key={err.id} className="bg-[#0B0E14] border border-[#EF4444]/30 p-2.5 rounded-lg text-xs space-y-1 font-mono">
                <div className="flex items-center justify-between text-[#EF4444] font-bold">
                  <span>{err.errorType}</span>
                  <span className="text-[10px] text-[#94A3B8] font-mono-tabular">{err.timestamp.slice(11, 19)}</span>
                </div>
                <p className="text-[11px] text-[#94A3B8]">{err.message}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
