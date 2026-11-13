# FinPulse: Financial News Tracker

A financial news tracker that turns each article into a structured impact analysis: a short summary, sentiment and impact scores, the stocks it affects, the key numbers and one risk to watch. Built with React and Vite on the front end and an Express server that calls the Claude API or the OpenAI API.

**Live demo:** `https://<your-username>.github.io/<repo-name>/` (available after the first push, see [Deploy](#deploy-to-github-pages))

## Features

| Area | What it does |
| --- | --- |
| News feed | 24 sample stories across 8 categories: Markets, Earnings, Economy, Banking, Technology, Energy, Crypto and Deals |
| Search and filters | Search by ticker, company or headline (press `/`), filter by category, impact and sentiment, sort by time, impact or tone |
| AI analysis | Each story has a summary, sentiment score (-100 to 100), impact score (0 to 100) with a HIGH / MEDIUM / LOW label, per-ticker direction and expected move, key numbers, a watch-out risk, a time horizon and a confidence score |
| Analyze any article | Paste a headline and text, get the same structured analysis, and add it to the feed |
| Alert rules | Build rules by ticker, keyword, category or watchlist, with a minimum impact and a sentiment condition. Matching stories appear in the alerts panel with an unread count |
| Watchlist | Star tickers anywhere in the app and track their news pulse and latest stories |
| Analytics | Sentiment by category, news pulse by ticker, impact mix and a list of top risks |
| Export | Copy or download the current view as CSV or JSON |
| Themes | Light and dark themes, responsive from phone to desktop |

## How the analysis works

```
Browser (React)  --POST /api/analyze-->  Express server  --Messages API--->  Claude
                 <--validated JSON-----                  --Responses API-->  OpenAI GPT
                                                         <--forced tool call--
```

- The server sends the article to the model with a single tool, `record_analysis`, and forces it with `tool_choice`. The model must answer by calling the tool, so the response is always a JSON object that matches the schema in `server/prompt.js`.
- Providers live in `server/providers.js`. Set `ANTHROPIC_API_KEY` for Claude or `OPENAI_API_KEY` for GPT. If both are set, Claude is used unless `AI_PROVIDER=openai`.
- `src/lib/normalize.js` validates that object on the server and again in the browser: scores are clamped, unknown labels are replaced and lists are capped.
- The API key lives only on the server (`.env`). It is never sent to the browser.
- **Demo mode:** when no API server is reachable (for example on GitHub Pages), the app falls back to a rule-based engine in `src/lib/heuristic.js` that runs in the browser. The header shows which engine is active, and every analysis is labelled with the engine that produced it.

## Quick start

Requires Node.js 20.19 or newer (22 recommended).

```bash
git clone https://github.com/Sadiq172005/finpulse-pro.git
cd finpulse-pro
npm install
cp .env.example .env        # then add ANTHROPIC_API_KEY or OPENAI_API_KEY
npm run dev
```

Open http://localhost:5173. `npm run dev` starts the React app (port 5173) and the API (port 8787) together. Without an API key the app still runs in demo mode.

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the front end and the API with hot reload |
| `npm run dev:web` | Start only the front end (demo mode) |
| `npm run server` | Start only the API |
| `npm test` | Run the unit and API tests |
| `npm run build` | Create the production build in `dist/` |
| `npm start` | Build, then serve the app and the API from one process on port 8787 |

## Project structure

```
finpulse-pro/
├── index.html                 Vite entry page
├── src/
│   ├── main.jsx               React entry point
│   ├── App.jsx                Main file: state, filters, layout and views
│   ├── styles.css             Design tokens and all styles
│   ├── components/            ArticleCard, Analytics, AlertsView, WatchlistView, modals, pills
│   ├── data/articles.js       Sample dataset
│   └── lib/                   api, heuristic engine, normalize, alerts, stats, format, storage
├── server/
│   ├── index.js               Express API (Claude proxy, validation, rate limit)
│   └── prompt.js              System prompt and tool schema
├── tests/                     node:test suites for the libraries and the API
└── .github/workflows/         GitHub Pages deployment
```

## API

`GET /api/health` returns `{ ok, ai, provider, model }`.

`POST /api/analyze` takes `{ headline, body, category? }` and returns:

```json
{
  "analysis": {
    "summary": "Novara beat estimates on a doubling of AI accelerator sales...",
    "category": "Earnings",
    "sentiment": "bullish",
    "sentimentScore": 82,
    "impact": "HIGH",
    "impactScore": 91,
    "stockImpact": [
      { "ticker": "NOVA", "direction": "up", "expectedMove": "+5% to +8%", "rationale": "Beat, raised guidance and a buyback arrive together." }
    ],
    "keyNumbers": [{ "label": "Quarterly revenue", "value": "$8.4B (+46% YoY)" }],
    "watchOut": "Two customers make up 41% of AI revenue...",
    "horizon": "Short-term",
    "confidence": 86,
    "engine": "claude"
  },
  "model": "claude-sonnet-5-5"
}
```

Requests are limited to 20 per minute per IP. Set `ANTHROPIC_MODEL` or `OPENAI_MODEL` in `.env` to change the model.

## Deploy to GitHub Pages

1. Push the project to a GitHub repository on the `main` branch.
2. In the repository, open **Settings > Pages** and set **Source** to **GitHub Actions**.
3. The included workflow runs the tests, builds the app and publishes it. The link appears under **Actions > Deploy to GitHub Pages** and has the form `https://<your-username>.github.io/<repo-name>/`.

GitHub Pages hosts static files only, so the published site runs in demo mode. For live Claude analysis, deploy the server (`npm start`) to a Node host such as Render or Railway, set `ANTHROPIC_API_KEY` or `OPENAI_API_KEY` there, and build the front end with `VITE_API_BASE` pointing at that server.

## Notes

- The starter feed is sample data. Its companies, tickers, index and figures are fictional.
- The analysis is for information only and is not investment advice.
- The watchlist, alert rules and added articles are saved in the browser's local storage.

## License

MIT
