export const C = {
  bg: "#080D14",
  bgCard: "#0F1622",
  bgElevated: "#162032",
  border: "#1E2D45",
  borderLight: "#253650",
  gold: "#C8A84B",
  goldDim: "#8A7033",
  teal: "#00C2A3",
  tealDim: "#007A68",
  red: "#F06060",
  green: "#4FCE8A",
  blue: "#4E9EF5",
  purple: "#9B7FEA",
  text: "#E8EDF5",
  textMid: "#7A90B0",
  textDim: "#3D5070",
};

export const serif = "'Playfair Display', Georgia, serif";
export const sans = "'DM Sans', system-ui, sans-serif";

export const WEALTH_COMP = [
  {
    label: "Cash & Deposits",
    value: 142500,
    source: "DBS Bank (API)",
    color: C.blue,
    pct: 8,
  },
  {
    label: "Equities & ETFs",
    value: 584200,
    source: "Interactive Brokers (API)",
    color: C.teal,
    pct: 34,
  },
  {
    label: "Unit Trusts",
    value: 213000,
    source: "Endowus (API)",
    color: C.green,
    pct: 12,
  },
  {
    label: "Digital Assets",
    value: 97400,
    source: "Coinbase (API)",
    color: C.gold,
    pct: 6,
  },
  {
    label: "Property",
    value: 680000,
    source: "Manual Input",
    color: C.purple,
    pct: 39,
  },
  { label: "Other", value: 18000, source: "CSV Import", color: C.textMid, pct: 1 },
];

export const TOTAL = WEALTH_COMP.reduce((s, a) => s + a.value, 0);

export const OVER_TIME = [
  {
    month: "Aug",
    Cash: 130000,
    Equities: 410000,
    Trust: 180000,
    Digital: 45000,
    Property: 650000,
  },
  {
    month: "Sep",
    Cash: 135000,
    Equities: 450000,
    Trust: 190000,
    Digital: 62000,
    Property: 655000,
  },
  {
    month: "Oct",
    Cash: 128000,
    Equities: 430000,
    Trust: 185000,
    Digital: 55000,
    Property: 660000,
  },
  {
    month: "Nov",
    Cash: 140000,
    Equities: 500000,
    Trust: 200000,
    Digital: 78000,
    Property: 665000,
  },
  {
    month: "Dec",
    Cash: 138000,
    Equities: 520000,
    Trust: 205000,
    Digital: 82000,
    Property: 668000,
  },
  {
    month: "Jan",
    Cash: 141000,
    Equities: 555000,
    Trust: 209000,
    Digital: 90000,
    Property: 672000,
  },
  {
    month: "Feb",
    Cash: 139000,
    Equities: 570000,
    Trust: 211000,
    Digital: 94000,
    Property: 677000,
  },
  {
    month: "Mar",
    Cash: 142500,
    Equities: 584200,
    Trust: 213000,
    Digital: 97400,
    Property: 680000,
  },
];

export const METRICS = [
  {
    key: "diversification",
    label: "Diversification",
    score: 72,
    color: C.teal,
    status: "Good",
    desc: "Asset class spread & correlation",
    pts: [
      "5 asset classes across 3 geographies",
      "Low equity-crypto correlation (0.18)",
      "Property concentration is high at 39%",
    ],
  },
  {
    key: "liquidity",
    label: "Liquidity",
    score: 54,
    color: C.gold,
    status: "Moderate",
    desc: "Liquid access within 30 days",
    pts: [
      "Liquid assets: $240K (14% of portfolio)",
      "Property & private assets are illiquid",
      "Consider raising liquid buffer to $300K",
    ],
  },
  {
    key: "consistency",
    label: "Consistency",
    score: 81,
    color: C.green,
    status: "Strong",
    desc: "Regular contributions & stability",
    pts: [
      "Monthly contributions for 18 months",
      "Max portfolio drawdown: –9.2%",
      "Rebalanced 3× in the past 12 months",
    ],
  },
];

export const SPENDING_DATA = [
  { category: "Food & Dining", amount: 1200, budget: 1500, color: C.red },
  { category: "Shopping", amount: 800, budget: 1000, color: C.gold },
  { category: "Transport", amount: 400, budget: 500, color: C.blue },
  { category: "Subscriptions", amount: 180, budget: 200, color: C.purple },
  { category: "Utilities", amount: 320, budget: 400, color: C.teal },
  { category: "Entertainment", amount: 450, budget: 600, color: C.green },
];

export const MILESTONES_DATA = [
  {
    id: 1,
    name: "New Car",
    targetAmount: 80000,
    currentAmount: 25000,
    deadline: "2026-12-31",
    priority: "high" as const,
    category: "vehicle",
  },
  {
    id: 2,
    name: "vacation",
    targetAmount: 8000,
    currentAmount: 5200,
    deadline: "2026-06-30",
    priority: "medium" as const,
    category: "travel",
  },
  {
    id: 3,
    name: "Home Upgrade",
    targetAmount: 50000,
    currentAmount: 12000,
    deadline: "2027-06-30",
    priority: "medium" as const,
    category: "home",
  },
];
