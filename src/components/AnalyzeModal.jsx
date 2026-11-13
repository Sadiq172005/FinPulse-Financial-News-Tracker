import { useState } from 'react';

import { EXAMPLE_ARTICLE } from '../data/articles.js';
import { analyzeArticle } from '../lib/api.js';
import { CATEGORIES, PROVIDER_LABELS } from '../lib/constants.js';
import { AnalysisDetail } from './ArticleCard.jsx';
import Modal from './Modal.jsx';
import { ImpactPill, SentimentPill } from './Pills.jsx';

const EMPTY = { headline: '', body: '', source: '', category: '' };

export default function AnalyzeModal({ engine, knownTickers, companies, onClose, onAdd }) {
  const [form, setForm] = useState(EMPTY);
  const [status, setStatus] = useState('idle'); // idle | loading | done
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const update = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    const headline = form.headline.trim();
    if (headline.length < 8) {
      setError('Enter a headline of at least 8 characters.');
      return;
    }
    setError('');
    setStatus('loading');
    const response = await analyzeArticle(
      { headline, body: form.body.trim(), category: form.category || undefined, knownTickers },
      engine,
    );
    setResult(response);
    setStatus('done');
  };

  const addToFeed = () => {
    const { analysis } = result;
    onAdd({
      id: `custom-${Date.now()}`,
      headline: form.headline.trim(),
      body: form.body.trim(),
      source: form.source.trim() || 'Pasted article',
      category: form.category || analysis.category || 'Markets',
      publishedAt: new Date().toISOString(),
      tickers: analysis.stockImpact.map((item) => item.ticker),
      analysis,
      isSample: false,
    });
  };

  const usingAI = engine.status === 'live';

  return (
    <Modal title="Analyze an article" onClose={onClose}>
      {status !== 'done' ? (
        <form className="form" onSubmit={submit} noValidate>
          <p className="form-note">
            {usingAI
              ? `Analysis runs on ${PROVIDER_LABELS[engine.provider] ?? 'the AI API'} (${engine.model}) and returns structured JSON.`
              : 'No API server is connected, so the built-in demo engine (rule-based) will analyse this in your browser. Run the server with a Claude or OpenAI API key for AI analysis.'}
          </p>

          <div className="field">
            <label htmlFor="an-headline">Headline</label>
            <input id="an-headline" type="text" value={form.headline} onChange={update('headline')} maxLength={300} placeholder="Paste the headline" />
          </div>

          <div className="field">
            <label htmlFor="an-body">Article text</label>
            <textarea id="an-body" rows={6} value={form.body} onChange={update('body')} maxLength={8000} placeholder="Paste the article text. Put tickers in brackets, e.g. Orbit Logistics (ORBT)." />
          </div>

          <div className="field-row">
            <div className="field">
              <label htmlFor="an-category">Category</label>
              <select id="an-category" value={form.category} onChange={update('category')}>
                <option value="">Detect automatically</option>
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="an-source">Source (optional)</label>
              <input id="an-source" type="text" value={form.source} onChange={update('source')} maxLength={60} placeholder="Publication name" />
            </div>
          </div>

          {error && <p className="form-error" role="alert">{error}</p>}

          <div className="form-actions">
            <button type="button" className="btn" onClick={() => setForm({ ...EMPTY, ...EXAMPLE_ARTICLE })}>
              Fill with an example
            </button>
            <button type="submit" className="btn btn-primary" disabled={status === 'loading'}>
              {status === 'loading' ? 'Analysing…' : 'Analyze'}
            </button>
          </div>
        </form>
      ) : (
        <div className="result">
          {result.note && <p className="form-error" role="alert">{result.note}</p>}
          <h3 className="story-title">{form.headline}</h3>
          <div className="result-pills">
            <ImpactPill impact={result.analysis.impact} score={result.analysis.impactScore} />
            <SentimentPill sentiment={result.analysis.sentiment} score={result.analysis.sentimentScore} />
            <span className="tag">{form.category || result.analysis.category || 'Markets'}</span>
          </div>
          <p className="story-summary">{result.analysis.summary}</p>
          <AnalysisDetail analysis={result.analysis} companies={companies} />
          <div className="form-actions">
            <button type="button" className="btn" onClick={() => setStatus('idle')}>Edit article</button>
            <button type="button" className="btn btn-primary" onClick={addToFeed}>Add to feed</button>
          </div>
        </div>
      )}
    </Modal>
  );
}
