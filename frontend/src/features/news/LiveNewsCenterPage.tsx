import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { newsApi } from '../../services/api';
import { useToastStore } from '../../store/useToastStore';
import { LiveNewsItemDto, NewsCategory, NewsImportance } from '@algoapp/shared';
import { toISTTimeShort, toISTDate } from '../../utils/time';
import {
  Newspaper,
  Flame,
  Globe,
  TrendingUp,
  TrendingDown,
  Minus,
  ExternalLink,
  Search,
  RefreshCw,
  Clock,
  CalendarDays,
  AlertTriangle,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

const CATEGORIES: { label: string; value: NewsCategory | 'ALL' }[] = [
  { label: 'All Feeds', value: 'ALL' },
  { label: 'Bitcoin', value: 'BITCOIN' },
  { label: 'Ethereum', value: 'ETHEREUM' },
  { label: 'Delta Exchange', value: 'DELTA_EXCHANGE' },
  { label: 'Macro Economy', value: 'MACRO_ECONOMY' },
  { label: 'Regulatory & SEC', value: 'REGULATORY' },
  { label: 'Crypto Markets', value: 'CRYPTO' },
];

export const LiveNewsCenterPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'news' | 'calendar'>('news');
  const [selectedCategory, setSelectedCategory] = useState<NewsCategory | 'ALL'>('ALL');
  const [selectedImportance, setSelectedImportance] = useState<NewsImportance | 'ALL'>('ALL');
  const [selectedSymbol, setSelectedSymbol] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const [isForceRefetching, setIsForceRefetching] = useState(false);
  const { addToast } = useToastStore();
  // Track all previously seen article IDs. On first load we silently
  // populate this set so we never toast for articles that were already there.
  const seenNewsIds = React.useRef<Set<string>>(new Set());
  const isFirstLoad = React.useRef(true);

  const { data: newsResponse, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['liveNews', selectedCategory, selectedImportance, selectedSymbol],
    queryFn: () =>
      newsApi.getNews({
        category: selectedCategory === 'ALL' ? undefined : selectedCategory,
        importance: selectedImportance === 'ALL' ? undefined : selectedImportance,
        symbol: selectedSymbol === 'ALL' ? undefined : selectedSymbol,
        limit: 60,
      }),
    refetchInterval: 15000,
  });

  const { data: calendarResponse, isLoading: isCalLoading, refetch: refetchCal } = useQuery({
    queryKey: ['economicCalendar'],
    queryFn: () => newsApi.getCalendar(false),
    refetchInterval: 300000,
  });

  // Use a stable string key derived from all current IDs so the effect only
  // fires when the actual article list changes, not just on every array ref change.
  const newsIdsKey = (newsResponse?.data || []).map((n: LiveNewsItemDto) => n.id).join(',');

  React.useEffect(() => {
    if (!newsResponse?.data || newsResponse.data.length === 0) return;

    if (isFirstLoad.current) {
      // Silent seed — mark all current articles as already seen
      newsResponse.data.forEach((item: LiveNewsItemDto) => seenNewsIds.current.add(item.id));
      isFirstLoad.current = false;
      return;
    }

    // Find articles that are genuinely new (not in the seen set)
    const newArticles = newsResponse.data.filter(
      (item: LiveNewsItemDto) => !seenNewsIds.current.has(item.id)
    );

    if (newArticles.length > 0) {
      // Toast only the latest new article
      const latest = newArticles[0];
      addToast(
        '🔔 Live News Update',
        latest.headline,
        latest.importance === 'HIGH' ? 'warning' : 'info'
      );
      // Mark all new articles as seen
      newArticles.forEach((item: LiveNewsItemDto) => seenNewsIds.current.add(item.id));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newsIdsKey]);

  const handleRefreshFeed = async () => {
    setIsForceRefetching(true);
    try {
      await newsApi.getNews({
        category: selectedCategory === 'ALL' ? undefined : selectedCategory,
        importance: selectedImportance === 'ALL' ? undefined : selectedImportance,
        symbol: selectedSymbol === 'ALL' ? undefined : selectedSymbol,
        limit: 60,
        forceRefresh: true,
      });
      await refetch();
    } finally {
      setIsForceRefetching(false);
    }
  };

  const newsItems: LiveNewsItemDto[] = newsResponse?.data || [];

  const filteredNews = newsItems.filter((item) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      item.headline.toLowerCase().includes(query) ||
      item.summary.toLowerCase().includes(query) ||
      item.source.toLowerCase().includes(query)
    );
  });

  const highImpactItems = newsItems.filter((n) => n.importance === 'HIGH');

  return (
    <div className="min-h-screen bg-[#07090E] text-[#E2E8F0] p-4 lg:p-6 space-y-6 font-sans">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1E293B] pb-5">
        <div>
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 border border-indigo-500/40 rounded-xl text-indigo-400">
              <Newspaper className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                Live News &amp; Macro Intelligence
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                  REAL-TIME STREAM
                </span>
              </h1>
              <p className="text-xs text-[#94A3B8] mt-0.5">
                Real-time institutional cryptocurrency headlines, macroeconomic catalysts, and regulatory sentiment feeds.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Tab Switcher */}
          <div className="flex bg-[#0E121A] border border-[#1E293B] rounded-lg p-1 gap-1">
            <button
              onClick={() => setActiveTab('news')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold transition ${
                activeTab === 'news' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Globe className="w-3.5 h-3.5" /> Live News
            </button>
            <button
              onClick={() => setActiveTab('calendar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold transition ${
                activeTab === 'calendar' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" /> Economic Calendar
            </button>
          </div>
          <button
            onClick={() => activeTab === 'news' ? handleRefreshFeed() : refetchCal()}
            disabled={isFetching || isForceRefetching || isCalLoading}
            className="flex items-center gap-2 px-3 py-1.5 bg-[#161D2A] border border-[#1E293B] hover:border-slate-600 rounded-lg text-xs font-semibold text-slate-300 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching || isForceRefetching || isCalLoading ? 'animate-spin text-indigo-400' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* High Impact Alert Banner (if any) */}
      {highImpactItems.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-amber-950/40 via-red-950/20 to-amber-950/40 border border-amber-500/30 rounded-xl p-3 flex items-center justify-between gap-3 text-xs"
        >
          <div className="flex items-center gap-2 text-amber-300 font-semibold">
            <Flame className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
            <span className="font-bold uppercase tracking-wide">High Impact Macro Alert:</span>
            <span className="text-slate-200 truncate max-w-xl font-normal">
              {highImpactItems[0]?.headline}
            </span>
          </div>
          <span className="px-2 py-0.5 bg-amber-500/20 border border-amber-500/40 text-amber-300 rounded text-[10px] font-mono shrink-0">
            Impact: {highImpactItems[0]?.impactScore}/10
          </span>
        </motion.div>
      )}

      {/* Content Area */}
      {activeTab === 'news' ? (
        <div className="space-y-6">
          {/* Controls & Filter Bar */}
          <div className="bg-[#0E121A] border border-[#1E293B] rounded-xl p-4 space-y-4">
            {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat.value
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 border border-indigo-500'
                  : 'bg-[#161D2A] text-slate-400 hover:text-white border border-[#1E293B]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Secondary Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#1E293B]/60">
          {/* Symbol Chips */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-[#64748B] text-[11px] font-medium mr-1">Asset:</span>
            {['ALL', 'BTC', 'ETH', 'SOL', 'XRP'].map((sym) => (
              <button
                key={sym}
                onClick={() => setSelectedSymbol(sym)}
                className={`px-2.5 py-1 rounded text-[11px] font-mono font-bold transition ${
                  selectedSymbol === sym
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'bg-[#161D2A] text-slate-400 hover:text-white border border-[#1E293B]'
                }`}
              >
                {sym}
              </button>
            ))}
          </div>

          {/* Importance Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-[#64748B] text-[11px] font-medium mr-1">Impact:</span>
            {(['ALL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((imp) => (
              <button
                key={imp}
                onClick={() => setSelectedImportance(imp)}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold transition ${
                  selectedImportance === imp
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                    : 'bg-[#161D2A] text-slate-400 hover:text-white border border-[#1E293B]'
                }`}
              >
                {imp}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[200px] flex-1 sm:flex-none">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search news & keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#161D2A] border border-[#1E293B] focus:border-indigo-500 rounded-lg pl-8 pr-3 py-1 text-xs text-slate-200 outline-none transition"
            />
          </div>
        </div>
      </div>

      {/* News Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-44 bg-[#0E121A] border border-[#1E293B] rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filteredNews.length === 0 ? (
        <div className="bg-[#0E121A] border border-[#1E293B] rounded-xl p-12 text-center text-slate-500">
          <Globe className="w-10 h-10 mx-auto mb-3 text-slate-600" />
          <p className="text-sm font-semibold text-slate-400">No news articles found for selected filters</p>
          <p className="text-xs text-slate-600 mt-1">Try broadening your search or selecting 'All Feeds'.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filteredNews.map((news) => {
              const isBullish = news.sentiment === 'BULLISH';
              const isBearish = news.sentiment === 'BEARISH';

              return (
                <motion.div
                  key={news.id}
                  layout
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="bg-[#0E121A] hover:bg-[#121722] border border-[#1E293B] hover:border-slate-700 rounded-xl p-4 flex flex-col justify-between transition-all group"
                >
                  <div className="space-y-2.5">
                    {/* Top Row Badges */}
                    <div className="flex items-center justify-between gap-2 text-[10px]">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded font-mono font-bold bg-[#161D2A] text-slate-300 border border-[#1E293B]">
                          {news.source}
                        </span>
                        <span
                          className={`px-1.5 py-0.5 rounded font-bold uppercase ${
                            news.importance === 'HIGH'
                              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                              : news.importance === 'MEDIUM'
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : 'bg-slate-500/20 text-slate-400 border border-slate-500/30'
                          }`}
                        >
                          {news.importance} IMPACT
                        </span>
                      </div>

                      {/* Sentiment */}
                      <span
                        className={`flex items-center gap-1 px-1.5 py-0.5 rounded font-bold ${
                          isBullish
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : isBearish
                            ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                            : 'bg-slate-500/10 text-slate-400 border border-slate-500/30'
                        }`}
                      >
                        {isBullish && <TrendingUp className="w-3 h-3" />}
                        {isBearish && <TrendingDown className="w-3 h-3" />}
                        {!isBullish && !isBearish && <Minus className="w-3 h-3" />}
                        {news.sentiment || 'NEUTRAL'}
                      </span>
                    </div>

                    {/* Headline */}
                    <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-2 leading-snug">
                      {news.headline}
                    </h3>

                    {/* Summary */}
                    <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                      {news.summary}
                    </p>
                  </div>

                  {/* Footer Row */}
                  <div className="pt-3 mt-3 border-t border-[#1E293B]/70 flex items-center justify-between text-[11px] text-slate-500">
                    <div className="flex items-center gap-2 font-mono text-[10px]">
                      <Clock className="w-3 h-3 text-slate-600" />
                      <span>
                        {toISTDate(news.publishedAt)},{' '}
                        {toISTTimeShort(news.publishedAt)} IST
                      </span>
                      {news.symbols && news.symbols.length > 0 && (
                        <div className="flex items-center gap-1">
                          {news.symbols.map((s) => (
                            <span key={s} className="px-1 rounded bg-[#161D2A] text-slate-400 font-mono text-[9px]">
                              {s}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {news.url && (
                      <a
                        href={news.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-semibold transition"
                      >
                        Read <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
        </div>
      ) : (
        <div className="bg-[#0E121A] border border-[#1E293B] rounded-xl overflow-hidden">
          {isCalLoading ? (
            <div className="p-8 text-center text-indigo-400 font-mono text-sm animate-pulse">Loading Economic Calendar...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-[#121722] border-b border-[#1E293B] text-xs uppercase text-slate-400 font-bold">
                    <th className="py-3 px-4 w-32">Date/Time</th>
                    <th className="py-3 px-4 w-20">Curr</th>
                    <th className="py-3 px-4 w-24">Impact</th>
                    <th className="py-3 px-4">Event</th>
                    <th className="py-3 px-4 w-24 text-right">Actual</th>
                    <th className="py-3 px-4 w-24 text-right">Forecast</th>
                    <th className="py-3 px-4 w-24 text-right">Previous</th>
                    <th className="py-3 px-4 w-24 text-center">Outcome</th>
                  </tr>
                </thead>
                <tbody className="text-sm font-medium text-slate-300 divide-y divide-[#1E293B]/50">
                  {calendarResponse?.data?.map((event: any) => {
                    const isBeat = event.outcome === 'beat';
                    const isMiss = event.outcome === 'miss';
                    const isHigh = event.impact === 'High';
                    const isMed = event.impact === 'Medium';

                    
                    return (
                      <tr key={event.id} className="hover:bg-[#161D2A]/50 transition group">
                        <td className="py-2.5 px-4">
                          <div className="flex flex-col">
                            <span className="text-slate-200">{new Date(event.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                            <span className="text-slate-500 text-xs font-mono">{event.time}</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-4 font-bold text-slate-400">{event.currency || event.country}</td>
                        <td className="py-2.5 px-4">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            isHigh ? 'bg-red-500/20 text-red-400' : isMed ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-500/20 text-slate-400'
                          }`}>
                            {isHigh && <AlertTriangle className="w-3 h-3" />}
                            {event.impact}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-slate-200 group-hover:text-white transition">{event.title}</td>
                        <td className={`py-2.5 px-4 text-right font-mono font-bold ${isBeat ? 'text-emerald-400' : isMiss ? 'text-red-400' : 'text-slate-300'}`}>
                          {event.actual || '-'}
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono text-slate-400">{event.forecast || '-'}</td>
                        <td className="py-2.5 px-4 text-right font-mono text-slate-500">{event.previous || '-'}</td>
                        <td className="py-2.5 px-4 text-center">
                          {event.outcome !== 'pending' && event.outcomeLabel ? (
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold ${
                              isBeat ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                              isMiss ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                              'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                            }`}>
                              {isBeat && <CheckCircle2 className="w-3 h-3" />}
                              {isMiss && <XCircle className="w-3 h-3" />}
                              {event.outcomeLabel}
                            </span>
                          ) : (
                            <span className="text-slate-600 text-xs">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LiveNewsCenterPage;
