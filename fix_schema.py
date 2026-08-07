import re

with open('backend/prisma/schema.prisma', 'r') as f:
    content = f.read()

# 1. PaperWallet
content = re.sub(r'virtualBalance  Float    @default\(10\.0\) @map\("virtual_balance"\)', 'virtualBalance  Float    @map("virtual_balance")', content)

# 2. PaperRiskConfig
content = re.sub(r'maxDailyLoss           Float    @default\(1000\.0\)', 'maxDailyLoss           Float    ', content)
content = re.sub(r'maxDrawdownPercent     Float    @default\(5\.0\)', 'maxDrawdownPercent     Float    ', content)
content = re.sub(r'maxOpenPositions       Int      @default\(10\)', 'maxOpenPositions       Int      @default(1)', content)
content = re.sub(r'maxRiskPerTradePercent Float    @default\(2\.0\)', 'maxRiskPerTradePercent Float    ', content)

# 3. MarketSnapshot
content = re.sub(r'spread       Float\n', 'spread       Float?\n', content)
content = re.sub(r'session      String   @default\("NEW_YORK"\)', 'session      String?', content)
content = re.sub(r'trend        String   @default\("BULLISH"\)', 'trend        String?', content)
content = re.sub(r'volatility   String   @default\("MEDIUM"\)', 'volatility   String?', content)

# 4. ChallengeSession
content = re.sub(r'initialBalance            Float    @default\(10\.0\)', 'initialBalance            Float    ', content)
content = re.sub(r'currentBalance            Float    @default\(10\.0\)', 'currentBalance            Float    ', content)
content = re.sub(r'dailyTargetPercent        Float    @default\(0\.5\)', 'dailyTargetPercent        Float    ', content)

# 5. WalletState
content = re.sub(r'currentBalance     Float    @default\(10\.0\)', 'currentBalance     Float    ', content)
content = re.sub(r'availableBalance   Float    @default\(10\.0\)', 'availableBalance   Float    ', content)
content = re.sub(r'equity             Float    @default\(10\.0\)', 'equity             Float    ', content)
content = re.sub(r'peakEquity         Float    @default\(10\.0\)', 'peakEquity         Float    ', content)

# 6. TradeLedger
content = re.sub(r'syncStatus          String   @default\("SIMULATED"\)', 'syncStatus          String   ', content)
content = re.sub(r'executionMode       String   @default\("PAPER"\)', 'executionMode       String   ', content)

for field in ['exitPrice', 'grossPnL', 'tradingFee', 'fundingFee', 'tax', 'netPnL', 'rewardPercent']:
    content = re.sub(r'(' + field + r'\s+Float)\s+@map', r'\1?    @map', content)
for field in ['durationSeconds']:
    content = re.sub(r'(' + field + r'\s+Int)\s+@map', r'\1?    @map', content)
for field in ['executionLatencyMs']:
    content = re.sub(r'(' + field + r'\s+Float)\s+@map', r'\1?    @map', content)
content = re.sub(r'closedAt            DateTime @default\(now\(\)\) @map', 'closedAt            DateTime? @map', content)
content = re.sub(r'exchangeOrderId     String   @map\("exchange_order_id"\)', 'exchangeOrderId     String   @map("exchange_order_id")\n  exchangeTradeId     String?  @map("exchange_trade_id")', content)

# 7. ExecutionSession
content = re.sub(r'mode          String   @default\("PAPER"\)', 'mode          String   @map("execution_mode")', content)

# 8. StrategySignalLog -> StrategySignalRecord
content = re.sub(r'model StrategySignalLog \{', 'model StrategySignalRecord {', content)
content = re.sub(r'confidenceScore Float    @default\(90\.0\)', 'confidenceScore Float    ', content)
content = re.sub(r'timestamp       DateTime @default\(now\(\)\)', 'createdAt       DateTime @default(now()) @map("created_at")\n  stopLossPrice   Float?   @map("stop_loss_price")\n  takeProfitPrice Float?   @map("take_profit_price")', content)
content = re.sub(r'@@map\("strategy_signal_logs"\)', '@@map("strategy_signal_records")', content)

content = re.sub(r'model StrategySignalRecord \{.*?\n\}', '', content, flags=re.DOTALL) # remove duplicate

# 9. SupplyZone & DemandZone -> OrderBlock
content = re.sub(r'model SupplyZone \{.*?@@map\("supply_zones"\)\n\}', '', content, flags=re.DOTALL)
content = re.sub(r'model DemandZone \{.*?@@map\("demand_zones"\)\n\}', '''model OrderBlock {
  id         String   @id @default(uuid())
  symbol     String
  timeframe  String   @default("1H")
  type       String   // SUPPLY | DEMAND
  upperPrice Float    @map("upper_price")
  lowerPrice Float    @map("lower_price")
  source     String   @default("NATIVE_ENGINE")
  strength   Float
  width      Float
  widthPercent Float  @map("width_percent")
  freshness  Float    @default(100.0)
  touchCount Int      @default(0) @map("touch_count")
  status     String   @default("FRESH")
  isTraded   Boolean  @default(false) @map("is_traded")
  createdAt  DateTime @default(now()) @map("created_at")
  updatedAt  DateTime @updatedAt @map("updated_at")

  @@index([symbol, status, isTraded])
  @@index([symbol, timeframe, createdAt])
  @@map("order_blocks")
}''', content, flags=re.DOTALL)

# 10. Add New Models
new_models = '''
model ExchangeBalance {
  id              String   @id @default(uuid())
  assetSymbol     String   @map("asset_symbol")
  balance         Float    @default(0)
  availableBalance Float   @default(0) @map("available_balance")
  marginAmount    Float    @default(0) @map("margin_amount")
  updatedAt       DateTime @updatedAt @map("updated_at")

  @@unique([assetSymbol])
  @@map("exchange_balances")
}

model ExchangePosition {
  id            String   @id @default(uuid())
  productSymbol String   @map("product_symbol")
  side          String
  size          Float
  entryPrice    Float    @map("entry_price")
  markPrice     Float    @map("mark_price")
  liquidationPrice Float? @map("liquidation_price")
  marginAmount  Float    @map("margin_amount")
  leverage      Float
  unrealizedPnl Float    @default(0) @map("unrealized_pnl")
  realizedPnl   Float    @default(0) @map("realized_pnl")
  updatedAt     DateTime @updatedAt @map("updated_at")

  @@unique([productSymbol])
  @@map("exchange_positions")
}

model ExchangeOrder {
  id              String   @id @default(uuid())
  orderId         String   @unique @map("order_id")
  clientOrderId   String?  @map("client_order_id")
  productSymbol   String   @map("product_symbol")
  side            String
  orderType       String   @map("order_type")
  size            Float
  price           Float?
  stopPrice       Float?   @map("stop_price")
  filledSize      Float    @default(0) @map("filled_size")
  state           String   
  stopLoss        Float?   @map("stop_loss")
  takeProfit      Float?   @map("take_profit")
  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt @map("updated_at")

  @@index([productSymbol, state])
  @@map("exchange_orders")
}

model ScannerState {
  id            String   @id @default("default-scanner")
  state         String   @default("IDLE") 
  activeSymbol  String?  @map("active_symbol")
  lastScanAt    DateTime? @map("last_scan_at")
  lastTradeAt   DateTime? @map("last_trade_at")
  tradesToday   Int      @default(0) @map("trades_today")
  updatedAt     DateTime @updatedAt @map("updated_at")

  @@map("scanner_states")
}

model LiquiditySweepRecord {
  id         String   @id @default(uuid())
  symbol     String
  timeframe  String   @default("1H")
  sweepType  String   @map("sweep_type") 
  level      Float
  candleTime DateTime @map("candle_time")
  detectedAt DateTime @default(now()) @map("detected_at")

  @@index([symbol, timeframe, candleTime])
  @@map("liquidity_sweep_records")
}
'''
content += new_models

# Replace NewsCache with NewsEvent
content = re.sub(r'model NewsCache \{.*?@@map\("news_caches"\)\n\}', '''model NewsEvent {
  id             String   @id @default(uuid())
  articleId      String   @unique @map("article_id")
  title          String
  content        String?
  source         String
  category       String   @default("GENERAL") 
  impactLevel    String   @default("MEDIUM") @map("impact_level") 
  publishedAt    DateTime @map("published_at")
  sentimentScore Float?   @map("sentiment_score")
  sentimentLabel String?  @map("sentiment_label")
  isBlocking     Boolean  @default(false) @map("is_blocking") 
  metadataJson   String?  @map("metadata_json")
  createdAt      DateTime @default(now()) @map("created_at")

  @@index([publishedAt, category, impactLevel])
  @@map("news_events")
}''', content, flags=re.DOTALL)

with open('backend/prisma/schema.prisma', 'w') as f:
    f.write(content)
