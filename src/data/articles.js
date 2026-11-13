// Sample dataset. Every company, ticker (except BTC and ETH), index and figure
// below is fictional and written for demonstration only. Publication times are
// stored as "hours ago" so the feed always looks current.

export const COMPANIES = {
  NOVA: 'Novara Semiconductors',
  VLTA: 'Volta Motors',
  BRKT: 'BrightKart',
  MRDN: 'Meridian Bank',
  KSTR: 'Keystone Financial',
  PXEL: 'Pixelforge Software',
  CLDR: 'Cloudrise Systems',
  ZNTH: 'Zenith Telecom',
  PTRX: 'Petronix Oil',
  SOLR: 'Solaris Energy',
  AURM: 'Aurum Mining',
  ORBT: 'Orbit Logistics',
  HELX: 'Helix Biologics',
  LMNA: 'Lumina Pharma',
  BTC: 'Bitcoin',
  ETH: 'Ether',
};

const SAMPLES = [
  {
    id: 's01', hoursAgo: 1, category: 'Energy', source: 'Ledger Wire',
    headline: 'Crude jumps 6% after export terminal shutdown; Petronix rallies',
    body: 'Benchmark crude rose 6% to $91 a barrel after storm damage shut a major export terminal that handles 1.2 million barrels a day. Petronix Oil (PTRX) said its upstream output is unaffected, while freight operators warned of higher fuel bills.',
    analysis: {
      summary: 'A storm-hit export terminal pushed crude up 6% to $91. Producers such as Petronix gain from the higher price, while fuel-heavy businesses face a cost squeeze.',
      sentiment: 'neutral', sentimentScore: 8, impact: 'HIGH', impactScore: 80,
      stockImpact: [
        { ticker: 'PTRX', direction: 'up', expectedMove: '+3% to +5%', rationale: 'Unaffected output is sold at a higher realised price.' },
        { ticker: 'ORBT', direction: 'down', expectedMove: '-2% to -3%', rationale: 'Fuel is the largest variable cost for a logistics fleet.' },
      ],
      keyNumbers: [
        { label: 'Crude price', value: '$91 / barrel' },
        { label: 'Daily move', value: '+6%' },
        { label: 'Terminal capacity offline', value: '1.2M barrels/day' },
      ],
      watchOut: 'The spike reverses quickly if the terminal reopens within a week. Until then, transport and airline margins carry the cost.',
      horizon: 'Short-term', confidence: 72,
    },
  },
  {
    id: 's02', hoursAgo: 1.5, category: 'Earnings', source: 'Market Dispatch',
    headline: 'Novara Semiconductors beats Q2 estimates as AI chip revenue doubles',
    body: 'Novara Semiconductors (NOVA) reported quarterly revenue of $8.4 billion, up 46% year on year, with data-centre AI accelerators contributing $4.1 billion. The company raised full-year guidance to $34 billion and announced a $5 billion buyback. Two hyperscale customers accounted for 41% of AI revenue.',
    analysis: {
      summary: 'Novara beat estimates on a doubling of AI accelerator sales, raised full-year guidance to $34 billion and added a $5 billion buyback.',
      sentiment: 'bullish', sentimentScore: 82, impact: 'HIGH', impactScore: 91,
      stockImpact: [
        { ticker: 'NOVA', direction: 'up', expectedMove: '+5% to +8%', rationale: 'Beat, raised guidance and a buyback arrive together.' },
        { ticker: 'CLDR', direction: 'up', expectedMove: '+1% to +2%', rationale: 'Strong accelerator demand signals healthy cloud spending.' },
      ],
      keyNumbers: [
        { label: 'Quarterly revenue', value: '$8.4B (+46% YoY)' },
        { label: 'AI accelerator revenue', value: '$4.1B' },
        { label: 'Full-year guidance', value: '$34B' },
        { label: 'Buyback', value: '$5B' },
      ],
      watchOut: 'Two customers make up 41% of AI revenue. A pause in their capital spending would show up in orders within a quarter.',
      horizon: 'Short-term', confidence: 86,
    },
  },
  {
    id: 's03', hoursAgo: 2, category: 'Crypto', source: 'Chain Brief',
    headline: 'Bitcoin slides 7% as exchange Coinstack halts withdrawals',
    body: 'Bitcoin (BTC) fell 7% in four hours after Coinstack, a mid-sized exchange, paused customer withdrawals pending a liquidity review. Ether (ETH) dropped 9% and about $840 million of leveraged positions were liquidated.',
    analysis: {
      summary: 'A withdrawal freeze at exchange Coinstack triggered a sharp sell-off, with Bitcoin down 7%, Ether down 9% and $840 million in forced liquidations.',
      sentiment: 'bearish', sentimentScore: -79, impact: 'HIGH', impactScore: 86,
      stockImpact: [
        { ticker: 'BTC', direction: 'down', expectedMove: '-5% to -10%', rationale: 'Counterparty fear drives forced selling and deleveraging.' },
        { ticker: 'ETH', direction: 'down', expectedMove: '-7% to -12%', rationale: 'Higher leverage in Ether markets amplifies the same move.' },
      ],
      keyNumbers: [
        { label: 'Bitcoin move', value: '-7% in 4 hours' },
        { label: 'Ether move', value: '-9%' },
        { label: 'Positions liquidated', value: '$840M' },
      ],
      watchOut: 'Withdrawal freezes have preceded insolvencies before. Check which lenders and funds hold balances at Coinstack.',
      horizon: 'Intraday', confidence: 80,
    },
  },
  {
    id: 's04', hoursAgo: 2.5, category: 'Economy', source: 'Ledger Wire',
    headline: 'Central bank holds policy rate at 6.25%, signals cut if inflation keeps cooling',
    body: 'The central bank kept its benchmark rate unchanged at 6.25% for a fourth straight meeting, in a 5-1 vote. The governor said a 25 bps cut is on the table at the next review if core inflation stays below 4%.',
    analysis: {
      summary: 'Rates stay at 6.25%, but the governor opened the door to a 25 bps cut at the next review if core inflation holds under 4%.',
      sentiment: 'bullish', sentimentScore: 44, impact: 'HIGH', impactScore: 78,
      stockImpact: [
        { ticker: 'VLTA', direction: 'up', expectedMove: '+1% to +2%', rationale: 'Cheaper vehicle loans support demand for big-ticket purchases.' },
        { ticker: 'MRDN', direction: 'flat', expectedMove: 'Range-bound', rationale: 'Lower rates trim lending margins but lift loan demand.' },
      ],
      keyNumbers: [
        { label: 'Policy rate', value: '6.25%' },
        { label: 'Vote split', value: '5-1' },
        { label: 'Possible cut', value: '25 bps' },
        { label: 'Core inflation trigger', value: 'Below 4%' },
      ],
      watchOut: 'A food or fuel price spike before the next review would take the cut off the table.',
      horizon: 'Medium-term', confidence: 77,
    },
  },
  {
    id: 's05', hoursAgo: 3, category: 'Banking', source: 'Bourse Brief',
    headline: 'Meridian Bank flags rise in unsecured loan defaults, raises provisions by 30%',
    body: 'Meridian Bank (MRDN) said bad loans in its unsecured retail book rose to 3.4% from 2.6% a quarter ago. It set aside $620 million in provisions, 30% more than the previous quarter. Unsecured lending makes up 24% of its loan book.',
    analysis: {
      summary: 'Bad loans in Meridian\'s unsecured retail book climbed to 3.4%, forcing a 30% jump in provisions to $620 million.',
      sentiment: 'bearish', sentimentScore: -68, impact: 'HIGH', impactScore: 81,
      stockImpact: [
        { ticker: 'MRDN', direction: 'down', expectedMove: '-4% to -6%', rationale: 'Higher provisions cut straight into this year\'s profit.' },
        { ticker: 'KSTR', direction: 'down', expectedMove: '-1% to -2%', rationale: 'Investors will assume the same stress in peer loan books.' },
      ],
      keyNumbers: [
        { label: 'Unsecured bad loans', value: '3.4% (from 2.6%)' },
        { label: 'Provisions', value: '$620M (+30% QoQ)' },
        { label: 'Unsecured share of book', value: '24%' },
      ],
      watchOut: 'Unsecured loans are 24% of the book. Another quarter of slippage at this pace would erase the year\'s profit growth.',
      horizon: 'Short-term', confidence: 81,
    },
  },
  {
    id: 's06', hoursAgo: 4, category: 'Earnings', source: 'Market Dispatch',
    headline: 'Volta Motors misses delivery target, trims full-year outlook',
    body: 'Volta Motors (VLTA) delivered 92,400 vehicles in the quarter, 11% below its own target, citing battery-cell shortages at its second plant. Management cut full-year delivery guidance from 480,000 to 430,000 units and gross margin slipped to 14.2%.',
    analysis: {
      summary: 'Volta delivered 11% fewer vehicles than targeted because of a battery-cell shortage and cut full-year guidance to 430,000 units.',
      sentiment: 'bearish', sentimentScore: -74, impact: 'HIGH', impactScore: 84,
      stockImpact: [
        { ticker: 'VLTA', direction: 'down', expectedMove: '-6% to -9%', rationale: 'A miss and a guidance cut together reset earnings estimates.' },
      ],
      keyNumbers: [
        { label: 'Quarterly deliveries', value: '92,400' },
        { label: 'Shortfall vs target', value: '11%' },
        { label: 'Full-year guidance', value: '430,000 (from 480,000)' },
        { label: 'Gross margin', value: '14.2%' },
      ],
      watchOut: 'If the cell shortage runs past next quarter, cash burn rises and a capital raise becomes more likely.',
      horizon: 'Short-term', confidence: 83,
    },
  },
  {
    id: 's07', hoursAgo: 5, category: 'Technology', source: 'The Daily Tape',
    headline: 'Pixelforge unveils AI coding assistant; pilot seats sell out in a week',
    body: 'Pixelforge Software (PXEL) launched an AI coding assistant priced at $30 per seat per month, and said all 40,000 pilot seats were taken within seven days. General availability is planned for next quarter.',
    analysis: {
      summary: 'Pixelforge\'s new AI coding assistant filled its 40,000-seat pilot in a week at $30 per seat, ahead of a wider launch next quarter.',
      sentiment: 'bullish', sentimentScore: 61, impact: 'MEDIUM', impactScore: 64,
      stockImpact: [
        { ticker: 'PXEL', direction: 'up', expectedMove: '+3% to +5%', rationale: 'Fast pilot uptake points to a new recurring revenue line.' },
        { ticker: 'CLDR', direction: 'up', expectedMove: '0% to +1%', rationale: 'The assistant runs on rented cloud compute.' },
      ],
      keyNumbers: [
        { label: 'Price', value: '$30 / seat / month' },
        { label: 'Pilot seats', value: '40,000' },
        { label: 'Time to sell out', value: '7 days' },
      ],
      watchOut: 'Pilot demand is not paid retention. Compute costs could dilute margins if usage grows faster than pricing.',
      horizon: 'Medium-term', confidence: 71,
    },
  },
  {
    id: 's08', hoursAgo: 6, category: 'Markets', source: 'Bourse Brief',
    headline: 'NX50 index closes at record high, led by chipmakers and telecom',
    body: 'The NX50 index rose 1.4% to close at 24,860, a record, with 38 of 50 constituents ending higher. Foreign investors were net buyers of $410 million, with Novara Semiconductors (NOVA) and Zenith Telecom (ZNTH) the top contributors.',
    analysis: {
      summary: 'The NX50 closed at a record 24,860, up 1.4%, on broad gains and $410 million of foreign buying led by chip and telecom stocks.',
      sentiment: 'bullish', sentimentScore: 57, impact: 'MEDIUM', impactScore: 59,
      stockImpact: [
        { ticker: 'NOVA', direction: 'up', expectedMove: '+1% to +2%', rationale: 'Index leadership attracts momentum and passive flows.' },
        { ticker: 'ZNTH', direction: 'up', expectedMove: '+1% to +2%', rationale: 'Top contributor on the day with sector tailwinds.' },
      ],
      keyNumbers: [
        { label: 'NX50 close', value: '24,860 (+1.4%)' },
        { label: 'Advancing stocks', value: '38 of 50' },
        { label: 'Foreign inflow', value: '$410M' },
      ],
      watchOut: 'The rally leans on foreign inflows, which reversed quickly in the last two risk-off episodes.',
      horizon: 'Intraday', confidence: 70,
    },
  },
  {
    id: 's09', hoursAgo: 7, category: 'Technology', source: 'The Daily Tape',
    headline: 'Cloudrise Systems hit by nine-hour outage across three regions',
    body: 'Cloudrise Systems (CLDR) suffered a nine-hour outage affecting three data-centre regions after a failed network configuration update. The company said about 14% of customers were affected and that service credits will be issued.',
    analysis: {
      summary: 'A failed network update took three Cloudrise regions offline for nine hours, affecting about 14% of customers.',
      sentiment: 'bearish', sentimentScore: -55, impact: 'MEDIUM', impactScore: 67,
      stockImpact: [
        { ticker: 'CLDR', direction: 'down', expectedMove: '-2% to -4%', rationale: 'Reliability is the core selling point for enterprise contracts.' },
      ],
      keyNumbers: [
        { label: 'Outage duration', value: '9 hours' },
        { label: 'Regions affected', value: '3' },
        { label: 'Customers affected', value: '14%' },
      ],
      watchOut: 'Service credits are small. The larger risk is enterprise customers moving part of their workload to a second provider at renewal.',
      horizon: 'Short-term', confidence: 75,
    },
  },
  {
    id: 's10', hoursAgo: 8, category: 'Deals', source: 'Ledger Wire',
    headline: 'Helix Biologics to acquire Lumina Pharma\'s oncology unit for $3.2 billion',
    body: 'Helix Biologics (HELX) agreed to buy the oncology business of Lumina Pharma (LMNA) for $3.2 billion in cash, a 35% premium to analyst valuations. The deal adds two late-stage cancer drugs and is expected to close in six months.',
    analysis: {
      summary: 'Helix is paying $3.2 billion in cash, a 35% premium, for Lumina\'s oncology unit and its two late-stage cancer drugs.',
      sentiment: 'neutral', sentimentScore: 12, impact: 'HIGH', impactScore: 76,
      stockImpact: [
        { ticker: 'HELX', direction: 'down', expectedMove: '-2% to -4%', rationale: 'Buyers usually fall on a large cash premium for unapproved drugs.' },
        { ticker: 'LMNA', direction: 'up', expectedMove: '+6% to +9%', rationale: 'The seller receives cash above the valuation of the unit.' },
      ],
      keyNumbers: [
        { label: 'Deal value', value: '$3.2B cash' },
        { label: 'Premium', value: '35%' },
        { label: 'Late-stage drugs', value: '2' },
        { label: 'Expected close', value: '6 months' },
      ],
      watchOut: 'Both drugs are still in trials. A failed late-stage readout would leave Helix with a large write-down.',
      horizon: 'Medium-term', confidence: 79,
    },
  },
  {
    id: 's11', hoursAgo: 9, category: 'Earnings', source: 'Market Dispatch',
    headline: 'BrightKart posts first profitable quarter on lower logistics costs',
    body: 'BrightKart (BRKT) reported net profit of $38 million against a loss of $112 million a year ago, as cost per shipment fell 17%. Gross merchandise value grew 22% to $6.9 billion.',
    analysis: {
      summary: 'BrightKart turned its first quarterly profit, $38 million, as shipping costs fell 17% and sales volume grew 22%.',
      sentiment: 'bullish', sentimentScore: 58, impact: 'MEDIUM', impactScore: 63,
      stockImpact: [
        { ticker: 'BRKT', direction: 'up', expectedMove: '+3% to +5%', rationale: 'A first profit changes how the business is valued.' },
        { ticker: 'ORBT', direction: 'flat', expectedMove: 'Range-bound', rationale: 'Higher volumes for carriers are offset by lower rates per shipment.' },
      ],
      keyNumbers: [
        { label: 'Net profit', value: '$38M' },
        { label: 'Year-ago result', value: '-$112M' },
        { label: 'Cost per shipment', value: '-17%' },
        { label: 'Gross merchandise value', value: '$6.9B (+22%)' },
      ],
      watchOut: 'Festive-season discounting next quarter could push margins back below breakeven.',
      horizon: 'Short-term', confidence: 74,
    },
  },
  {
    id: 's12', hoursAgo: 11, category: 'Energy', source: 'Ledger Wire',
    headline: 'Solaris Energy wins 1.8 GW solar-plus-storage contract',
    body: 'Solaris Energy (SOLR) won a 25-year contract to build and operate 1.8 GW of solar capacity with 600 MW of battery storage. The order is worth about $1.4 billion and lifts its backlog by 28%.',
    analysis: {
      summary: 'Solaris secured a 25-year, $1.4 billion contract for 1.8 GW of solar with 600 MW of storage, lifting its backlog by 28%.',
      sentiment: 'bullish', sentimentScore: 66, impact: 'MEDIUM', impactScore: 68,
      stockImpact: [
        { ticker: 'SOLR', direction: 'up', expectedMove: '+4% to +6%', rationale: 'A 28% larger backlog improves revenue visibility for years.' },
      ],
      keyNumbers: [
        { label: 'Solar capacity', value: '1.8 GW' },
        { label: 'Battery storage', value: '600 MW' },
        { label: 'Contract value', value: '$1.4B' },
        { label: 'Backlog increase', value: '28%' },
      ],
      watchOut: 'A fixed tariff over 25 years leaves Solaris exposed to module and financing cost overruns during construction.',
      horizon: 'Long-term', confidence: 78,
    },
  },
  {
    id: 's13', hoursAgo: 14, category: 'Economy', source: 'Bourse Brief',
    headline: 'Retail inflation cools to 3.8%, lowest in 14 months',
    body: 'Consumer price inflation eased to 3.8% in the latest month from 4.3%, helped by a 6.1% fall in vegetable prices. Core inflation was steady at 3.9%.',
    analysis: {
      summary: 'Headline inflation fell to a 14-month low of 3.8% on cheaper vegetables, while core inflation held at 3.9%.',
      sentiment: 'bullish', sentimentScore: 38, impact: 'MEDIUM', impactScore: 61,
      stockImpact: [
        { ticker: 'BRKT', direction: 'up', expectedMove: '0% to +1%', rationale: 'Lower food bills free up household spending.' },
      ],
      keyNumbers: [
        { label: 'Retail inflation', value: '3.8% (from 4.3%)' },
        { label: 'Vegetable prices', value: '-6.1%' },
        { label: 'Core inflation', value: '3.9%' },
      ],
      watchOut: 'The drop is food-led and core inflation has not moved. A weak harvest could reverse the trend quickly.',
      horizon: 'Medium-term', confidence: 72,
    },
  },
  {
    id: 's14', hoursAgo: 16, category: 'Markets', source: 'The Daily Tape',
    headline: 'Volatility gauge spikes 22% ahead of rate decision and earnings rush',
    body: 'The market volatility index jumped 22% to 18.6 as traders bought protection before the central bank meeting and a week with 140 company results.',
    analysis: {
      summary: 'Traders paid up for protection before the rate decision and a heavy results week, lifting the volatility index 22% to 18.6.',
      sentiment: 'bearish', sentimentScore: -28, impact: 'LOW', impactScore: 38,
      stockImpact: [],
      keyNumbers: [
        { label: 'Volatility index', value: '18.6 (+22%)' },
        { label: 'Results due this week', value: '140 companies' },
      ],
      watchOut: 'Option premiums are elevated, so hedges are expensive. A calm outcome would unwind the spike just as fast.',
      horizon: 'Intraday', confidence: 65,
    },
  },
  {
    id: 's15', hoursAgo: 18, category: 'Deals', source: 'Market Dispatch',
    headline: 'Fintech lender PayNest files for $900 million IPO',
    body: 'PayNest filed draft papers for an IPO to raise $900 million, comprising $550 million of new shares and a $350 million sale by existing investors. Revenue grew 64% last year but the company reported a net loss of $48 million.',
    analysis: {
      summary: 'PayNest plans a $900 million IPO, of which $350 million goes to selling investors. Revenue grew 64% but it remains loss-making.',
      sentiment: 'neutral', sentimentScore: 10, impact: 'MEDIUM', impactScore: 50,
      stockImpact: [
        { ticker: 'KSTR', direction: 'flat', expectedMove: 'Range-bound', rationale: 'The listing sets a valuation benchmark for digital lending peers.' },
      ],
      keyNumbers: [
        { label: 'IPO size', value: '$900M' },
        { label: 'New shares', value: '$550M' },
        { label: 'Sale by investors', value: '$350M' },
        { label: 'Revenue growth', value: '64%' },
        { label: 'Net loss', value: '$48M' },
      ],
      watchOut: 'More than a third of the issue is existing investors cashing out, and the company has yet to make a profit.',
      horizon: 'Medium-term', confidence: 72,
    },
  },
  {
    id: 's16', hoursAgo: 20, category: 'Banking', source: 'Bourse Brief',
    headline: 'Keystone Financial wins approval for digital-only banking licence',
    body: 'Keystone Financial (KSTR) received regulatory approval to launch a digital-only bank, with operations expected within nine months. The company plans to invest $250 million over three years.',
    analysis: {
      summary: 'Keystone has regulatory approval for a digital-only bank, due to launch within nine months with $250 million of investment.',
      sentiment: 'bullish', sentimentScore: 52, impact: 'MEDIUM', impactScore: 58,
      stockImpact: [
        { ticker: 'KSTR', direction: 'up', expectedMove: '+2% to +4%', rationale: 'The licence opens a low-cost channel for deposits and lending.' },
      ],
      keyNumbers: [
        { label: 'Launch timeline', value: '9 months' },
        { label: 'Planned investment', value: '$250M' },
        { label: 'Investment period', value: '3 years' },
      ],
      watchOut: 'Digital banks typically take years to break even, so near-term earnings will carry the build-out cost.',
      horizon: 'Long-term', confidence: 70,
    },
  },
  {
    id: 's17', hoursAgo: 22, category: 'Crypto', source: 'Chain Brief',
    headline: 'Ether staking yield falls to 2.9% as validator count passes 1.2 million',
    body: 'The annualised staking yield on Ether (ETH) slipped to 2.9% from 3.3% three months ago as the number of validators crossed 1.2 million.',
    analysis: {
      summary: 'More validators are sharing the same rewards, pulling the Ether staking yield down to 2.9% from 3.3%.',
      sentiment: 'neutral', sentimentScore: -12, impact: 'LOW', impactScore: 28,
      stockImpact: [
        { ticker: 'ETH', direction: 'flat', expectedMove: 'Range-bound', rationale: 'Yield compression is gradual and already visible on-chain.' },
      ],
      keyNumbers: [
        { label: 'Staking yield', value: '2.9% (from 3.3%)' },
        { label: 'Validators', value: '1.2 million' },
      ],
      watchOut: 'Lower yields reduce the incentive to stake. A wave of exits would add supply to the market.',
      horizon: 'Long-term', confidence: 62,
    },
  },
  {
    id: 's18', hoursAgo: 26, category: 'Technology', source: 'Ledger Wire',
    headline: 'Zenith Telecom to raise mobile tariffs by 12% from next month',
    body: 'Zenith Telecom (ZNTH) will raise prepaid and postpaid tariffs by an average of 12%, its first increase in 18 months. Analysts expect average revenue per user to rise from $2.60 to about $2.90.',
    analysis: {
      summary: 'Zenith is lifting mobile tariffs by 12% on average, its first increase in 18 months, which should raise revenue per user to about $2.90.',
      sentiment: 'bullish', sentimentScore: 49, impact: 'MEDIUM', impactScore: 60,
      stockImpact: [
        { ticker: 'ZNTH', direction: 'up', expectedMove: '+2% to +4%', rationale: 'Tariff increases flow almost directly into operating profit.' },
      ],
      keyNumbers: [
        { label: 'Average tariff increase', value: '12%' },
        { label: 'Revenue per user now', value: '$2.60' },
        { label: 'Expected revenue per user', value: '$2.90' },
        { label: 'Months since last increase', value: '18' },
      ],
      watchOut: 'Some subscribers switch to cheaper rivals in the quarters after an increase, which offsets part of the gain.',
      horizon: 'Medium-term', confidence: 73,
    },
  },
  {
    id: 's19', hoursAgo: 30, category: 'Economy', source: 'Market Dispatch',
    headline: 'Factory output growth slows to 2.1% as export orders weaken',
    body: 'Industrial production grew 2.1% year on year, down from 4.6% the previous month. The export orders sub-index fell to 47.8, its third month below 50.',
    analysis: {
      summary: 'Factory output growth more than halved to 2.1%, and export orders stayed in contraction for a third month.',
      sentiment: 'bearish', sentimentScore: -41, impact: 'MEDIUM', impactScore: 52,
      stockImpact: [
        { ticker: 'ORBT', direction: 'down', expectedMove: '-1% to -2%', rationale: 'Weaker exports mean lower freight volumes.' },
      ],
      keyNumbers: [
        { label: 'Output growth', value: '2.1% (from 4.6%)' },
        { label: 'Export orders index', value: '47.8' },
        { label: 'Months below 50', value: '3' },
      ],
      watchOut: 'If export orders stay under 50 for another quarter, engineering and logistics firms are likely to defer capital spending.',
      horizon: 'Medium-term', confidence: 68,
    },
  },
  {
    id: 's20', hoursAgo: 33, category: 'Energy', source: 'The Daily Tape',
    headline: 'Gold hits record high as investors seek safety; Aurum Mining extends gains',
    body: 'Gold rose 1.9% to a record $2,940 an ounce amid a weaker dollar and trade tensions. Aurum Mining (AURM) has gained 12% this month.',
    analysis: {
      summary: 'Gold set a record at $2,940 an ounce on a weaker dollar and trade tensions, extending Aurum Mining\'s 12% gain this month.',
      sentiment: 'bullish', sentimentScore: 47, impact: 'LOW', impactScore: 38,
      stockImpact: [
        { ticker: 'AURM', direction: 'up', expectedMove: '+1% to +3%', rationale: 'Miner profits rise faster than the gold price itself.' },
      ],
      keyNumbers: [
        { label: 'Gold price', value: '$2,940 / oz' },
        { label: 'Daily move', value: '+1.9%' },
        { label: 'AURM this month', value: '+12%' },
      ],
      watchOut: 'Miners already price in high gold. A rebound in the dollar would hit AURM harder than the metal.',
      horizon: 'Short-term', confidence: 66,
    },
  },
  {
    id: 's21', hoursAgo: 36, category: 'Markets', source: 'Bourse Brief',
    headline: 'Orbit Logistics to join NX50 index, replacing Lumina Pharma',
    body: 'Orbit Logistics (ORBT) will join the NX50 index from the 28th, replacing Lumina Pharma (LMNA). Index funds tracking the benchmark are expected to buy about $320 million of ORBT shares.',
    analysis: {
      summary: 'Orbit Logistics replaces Lumina Pharma in the NX50 from the 28th, with index funds expected to buy about $320 million of its shares.',
      sentiment: 'bullish', sentimentScore: 35, impact: 'LOW', impactScore: 36,
      stockImpact: [
        { ticker: 'ORBT', direction: 'up', expectedMove: '+2% to +3%', rationale: 'Index funds must buy the stock before inclusion.' },
        { ticker: 'LMNA', direction: 'down', expectedMove: '-2% to -3%', rationale: 'The same funds must sell the stock that leaves.' },
      ],
      keyNumbers: [
        { label: 'Expected passive buying', value: '$320M' },
        { label: 'Effective date', value: 'The 28th' },
      ],
      watchOut: 'Inclusion gains are often bought in advance and fade after the effective date.',
      horizon: 'Short-term', confidence: 74,
    },
  },
  {
    id: 's22', hoursAgo: 40, category: 'Banking', source: 'Ledger Wire',
    headline: 'Regulator tightens capital rules for consumer lending',
    body: 'The banking regulator raised risk weights on unsecured consumer loans from 100% to 125%, effective next quarter. Lenders will need to hold more capital against personal loans and credit cards.',
    analysis: {
      summary: 'From next quarter banks must hold more capital against personal loans and credit cards, as risk weights rise from 100% to 125%.',
      sentiment: 'bearish', sentimentScore: -46, impact: 'MEDIUM', impactScore: 66,
      stockImpact: [
        { ticker: 'MRDN', direction: 'down', expectedMove: '-2% to -3%', rationale: 'A large unsecured book means a larger capital charge.' },
        { ticker: 'KSTR', direction: 'down', expectedMove: '-1% to -2%', rationale: 'Higher capital needs slow growth in consumer credit.' },
      ],
      keyNumbers: [
        { label: 'New risk weight', value: '125% (from 100%)' },
        { label: 'Effective', value: 'Next quarter' },
      ],
      watchOut: 'Banks may pass the cost on through higher loan rates, slowing credit growth just as defaults rise.',
      horizon: 'Medium-term', confidence: 76,
    },
  },
  {
    id: 's23', hoursAgo: 44, category: 'Crypto', source: 'Chain Brief',
    headline: 'Lawmakers propose licensing regime for stablecoin issuers',
    body: 'A draft bill would require stablecoin issuers to hold 100% reserves in cash and short-term government debt and to publish monthly audits. Public comment is open for 60 days.',
    analysis: {
      summary: 'A draft bill would make stablecoin issuers hold full reserves in cash and short-term government debt and publish monthly audits.',
      sentiment: 'neutral', sentimentScore: 10, impact: 'LOW', impactScore: 34,
      stockImpact: [
        { ticker: 'BTC', direction: 'flat', expectedMove: 'Range-bound', rationale: 'Clear rules help adoption, but the bill is only a draft.' },
      ],
      keyNumbers: [
        { label: 'Required reserves', value: '100%' },
        { label: 'Audit frequency', value: 'Monthly' },
        { label: 'Comment period', value: '60 days' },
      ],
      watchOut: 'Draft bills change. Smaller issuers that cannot meet the reserve rule may wind down, concentrating volume in the largest names.',
      horizon: 'Long-term', confidence: 64,
    },
  },
  {
    id: 's24', hoursAgo: 47, category: 'Deals', source: 'The Daily Tape',
    headline: 'Zenith Telecom in talks to sell tower business for $2.1 billion',
    body: 'Zenith Telecom (ZNTH) is in advanced talks to sell its 18,000-tower portfolio to an infrastructure fund for about $2.1 billion, people familiar with the matter said. Proceeds would cut net debt by nearly 30%.',
    analysis: {
      summary: 'Zenith may sell its 18,000 towers for about $2.1 billion, which would cut net debt by nearly 30%. The talks are not confirmed.',
      sentiment: 'bullish', sentimentScore: 40, impact: 'MEDIUM', impactScore: 54,
      stockImpact: [
        { ticker: 'ZNTH', direction: 'up', expectedMove: '+2% to +3%', rationale: 'Lower debt reduces interest costs and balance-sheet risk.' },
      ],
      keyNumbers: [
        { label: 'Towers', value: '18,000' },
        { label: 'Reported value', value: '$2.1B' },
        { label: 'Net debt reduction', value: 'Nearly 30%' },
      ],
      watchOut: 'The talks are unconfirmed, and leasing the towers back adds long-term rental costs that offset part of the interest saving.',
      horizon: 'Medium-term', confidence: 60,
    },
  },
];

/** Returns the sample feed with timestamps relative to `now`. */
export function buildSampleArticles(now = Date.now()) {
  return SAMPLES.map(({ hoursAgo, analysis, ...article }) => ({
    ...article,
    publishedAt: new Date(now - hoursAgo * 3600 * 1000).toISOString(),
    tickers: analysis.stockImpact.map((item) => item.ticker),
    analysis: { ...analysis, category: article.category, engine: 'sample' },
    isSample: true,
  }));
}

export const EXAMPLE_ARTICLE = {
  headline: 'Orbit Logistics wins $1.1 billion five-year contract, raises full-year guidance',
  body: 'Orbit Logistics (ORBT) won a five-year contract worth $1.1 billion to run warehousing and last-mile delivery for BrightKart (BRKT). The company raised its full-year revenue guidance by 9% and said the deal will add 2,400 jobs. Shares jumped 6% in early trade.',
  source: 'Pasted article',
};
