export interface EquityPoint {
  time: string;
  equity: number;
  drawdown: number;
}

export interface PnLBarPoint {
  date: string;
  realized: number;
  unrealized: number;
}

export interface WinRateData {
  wins: number;
  losses: number;
  breakeven: number;
  winRatePercent: number;
  profitFactor: number;
}

export interface ChallengePoint {
  day: string;
  balance: number;
  targetLine: number;
  drawdownLimit: number;
}

export const mockEquityCurveData: EquityPoint[] = [
  { time: '09:00', equity: 10000, drawdown: 0 },
  { time: '10:00', equity: 10150, drawdown: 0 },
  { time: '11:00', equity: 10080, drawdown: -0.69 },
  { time: '12:00', equity: 10320, drawdown: 0 },
  { time: '13:00', equity: 10450, drawdown: 0 },
  { time: '14:00', equity: 10390, drawdown: -0.57 },
  { time: '15:00', equity: 10680, drawdown: 0 },
  { time: '16:00', equity: 10820, drawdown: 0 },
  { time: '17:00', equity: 10750, drawdown: -0.64 },
  { time: '18:00', equity: 11120, drawdown: 0 },
  { time: '19:00', equity: 11340, drawdown: 0 },
  { time: '20:00', equity: 11520, drawdown: 0 },
];

export const mockPnLBarData: PnLBarPoint[] = [
  { date: 'Mon', realized: 320, unrealized: 110 },
  { date: 'Tue', realized: -140, unrealized: 45 },
  { date: 'Wed', realized: 510, unrealized: 210 },
  { date: 'Thu', realized: 280, unrealized: -30 },
  { date: 'Fri', realized: 430, unrealized: 180 },
  { date: 'Sat', realized: -90, unrealized: 60 },
  { date: 'Sun', realized: 620, unrealized: 340 },
];

export const mockWinRateData: WinRateData = {
  wins: 48,
  losses: 22,
  breakeven: 5,
  winRatePercent: 68.5,
  profitFactor: 2.45,
};

export const mockChallengeProgressData: ChallengePoint[] = [
  { day: 'Day 1', balance: 10000, targetLine: 10200, drawdownLimit: 9500 },
  { day: 'Day 2', balance: 10250, targetLine: 10400, drawdownLimit: 9500 },
  { day: 'Day 3', balance: 10180, targetLine: 10600, drawdownLimit: 9500 },
  { day: 'Day 4', balance: 10490, targetLine: 10800, drawdownLimit: 9500 },
  { day: 'Day 5', balance: 10720, targetLine: 11000, drawdownLimit: 9500 },
  { day: 'Day 6', balance: 10980, targetLine: 11200, drawdownLimit: 9500 },
  { day: 'Day 7', balance: 11250, targetLine: 11400, drawdownLimit: 9500 },
];
