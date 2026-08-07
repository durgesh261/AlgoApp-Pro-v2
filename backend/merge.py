import re

with open('prisma/schema_original.prisma', 'r') as f:
    orig = f.read()

# Find the start of StrategyProfile
idx = orig.find('model StrategyProfile {')
missing_part = orig[idx:]

# Remove models that were moved to the top or replaced
missing_part = re.sub(r'model TradeLedger \{.*?@@map\("trade_ledger"\)\n\}\n', '', missing_part, flags=re.DOTALL)
missing_part = re.sub(r'model StructureHistoryRecord \{.*?@@map\("structure_history_records"\)\n\}\n', '', missing_part, flags=re.DOTALL)
missing_part = re.sub(r'model StrategySignalRecord \{.*?@@map\("strategy_signal_records"\)\n\}\n', '', missing_part, flags=re.DOTALL)
missing_part = re.sub(r'model NewsCache \{.*?@@map\("news_caches"\)\n\}\n', '', missing_part, flags=re.DOTALL)
missing_part = re.sub(r'model PortfolioSnapshot \{.*?@@map\("portfolio_snapshots"\)\n\}\n', '', missing_part, flags=re.DOTALL)

# Strip out fake defaults from ChallengeSession and WalletState just like we did before
missing_part = re.sub(r'initialBalance            Float    @default\(10\.0\)', 'initialBalance            Float    ', missing_part)
missing_part = re.sub(r'currentBalance            Float    @default\(10\.0\)', 'currentBalance            Float    ', missing_part)
missing_part = re.sub(r'dailyTargetPercent        Float    @default\(0\.5\)', 'dailyTargetPercent        Float    ', missing_part)
missing_part = re.sub(r'currentBalance     Float    @default\(10\.0\)', 'currentBalance     Float    ', missing_part)
missing_part = re.sub(r'availableBalance   Float    @default\(10\.0\)', 'availableBalance   Float    ', missing_part)
missing_part = re.sub(r'equity             Float    @default\(10\.0\)', 'equity             Float    ', missing_part)
missing_part = re.sub(r'peakEquity         Float    @default\(10\.0\)', 'peakEquity         Float    ', missing_part)

with open('prisma/schema.prisma', 'a') as f:
    f.write('\n' + missing_part)
