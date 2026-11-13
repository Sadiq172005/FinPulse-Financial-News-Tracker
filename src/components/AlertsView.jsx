import { useState } from 'react';

import { describeRule, SCOPE_LABELS } from '../lib/alerts.js';
import { CATEGORIES } from '../lib/constants.js';
import { timeAgo } from '../lib/format.js';
import { ImpactPill, SentimentPill } from './Pills.jsx';

const EMPTY_RULE = { name: '', scope: 'ticker', value: '', minImpact: 'MEDIUM', sentiment: 'any' };

export function AlertItem({ alert, unread, onOpen }) {
  const { article } = alert;
  return (
    <li className={`alert-item ${unread ? 'unread' : ''}`}>
      <button type="button" className="alert-open" onClick={() => onOpen(article.id)}>
        <span className="alert-title">
          {unread && <span className="unread-dot" aria-label="Unread" />}
          {article.headline}
        </span>
        <span className="alert-meta">
          <ImpactPill impact={article.analysis.impact} score={article.analysis.impactScore} />
          <SentimentPill sentiment={article.analysis.sentiment} />
          <span className="muted">{timeAgo(article.publishedAt)}</span>
        </span>
        <span className="alert-rules muted">Triggered by: {alert.rules.join(', ')}</span>
      </button>
    </li>
  );
}

export default function AlertsView({ alerts, readIds, onOpen, onMarkAllRead, rules, onRulesChange }) {
  const [draft, setDraft] = useState(EMPTY_RULE);
  const [error, setError] = useState('');
  const unreadCount = alerts.filter((alert) => !readIds.includes(alert.id)).length;
  const needsValue = ['ticker', 'keyword', 'category'].includes(draft.scope);

  const update = (field) => (event) => {
    const value = event.target.value;
    setDraft((current) => ({
      ...current,
      [field]: value,
      ...(field === 'scope' ? { value: value === 'category' ? CATEGORIES[0] : '' } : {}),
    }));
  };

  const addRule = (event) => {
    event.preventDefault();
    const value = draft.scope === 'ticker' ? draft.value.trim().toUpperCase() : draft.value.trim();
    if (needsValue && !value) {
      setError(`Enter a ${SCOPE_LABELS[draft.scope].toLowerCase()} for this rule.`);
      return;
    }
    const rule = { ...draft, value: needsValue ? value : '', id: `rule-${Date.now()}`, enabled: true };
    rule.name = draft.name.trim() || describeRule(rule);
    onRulesChange([...rules, rule]);
    setDraft(EMPTY_RULE);
    setError('');
  };

  const toggleRule = (id) =>
    onRulesChange(rules.map((rule) => (rule.id === id ? { ...rule, enabled: !rule.enabled } : rule)));
  const removeRule = (id) => onRulesChange(rules.filter((rule) => rule.id !== id));

  return (
    <div className="view">
      <div className="view-head">
        <h2>Alerts</h2>
        <p className="muted">Stories that match your rules. {unreadCount} unread of {alerts.length}.</p>
      </div>

      <div className="alerts-layout">
        <section className="card panel">
          <div className="panel-head">
            <h3>Triggered alerts</h3>
            <button type="button" className="btn btn-small" onClick={onMarkAllRead} disabled={unreadCount === 0}>
              Mark all read
            </button>
          </div>
          {alerts.length === 0 ? (
            <p className="empty">No story matches your rules right now. Loosen a rule or add a new one.</p>
          ) : (
            <ul className="alert-list">
              {alerts.map((alert) => (
                <AlertItem key={alert.id} alert={alert} unread={!readIds.includes(alert.id)} onOpen={onOpen} />
              ))}
            </ul>
          )}
        </section>

        <section className="card panel">
          <h3>Alert rules</h3>
          <ul className="rule-list">
            {rules.map((rule) => (
              <li key={rule.id} className={rule.enabled ? '' : 'rule-off'}>
                <label className="switch">
                  <input type="checkbox" id={`toggle-${rule.id}`} checked={rule.enabled} onChange={() => toggleRule(rule.id)} />
                  <span>
                    <strong>{rule.name}</strong>
                    <small className="muted">{describeRule(rule)}</small>
                  </span>
                </label>
                <button type="button" className="btn btn-small" onClick={() => removeRule(rule.id)} aria-label={`Delete rule ${rule.name}`}>
                  Delete
                </button>
              </li>
            ))}
            {rules.length === 0 && <li className="muted">No rules yet. Add one below.</li>}
          </ul>

          <form className="form rule-form" onSubmit={addRule} noValidate>
            <h4>New rule</h4>
            <div className="field-row">
              <div className="field">
                <label htmlFor="rule-scope">Applies to</label>
                <select id="rule-scope" value={draft.scope} onChange={update('scope')}>
                  {Object.entries(SCOPE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
              {needsValue && (
                <div className="field">
                  <label htmlFor="rule-value">{SCOPE_LABELS[draft.scope]}</label>
                  {draft.scope === 'category' ? (
                    <select id="rule-value" value={draft.value} onChange={update('value')}>
                      {CATEGORIES.map((category) => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      id="rule-value"
                      type="text"
                      value={draft.value}
                      onChange={update('value')}
                      maxLength={40}
                      placeholder={draft.scope === 'ticker' ? 'e.g. NOVA' : 'e.g. guidance'}
                    />
                  )}
                </div>
              )}
            </div>
            <div className="field-row">
              <div className="field">
                <label htmlFor="rule-impact">Minimum impact</label>
                <select id="rule-impact" value={draft.minImpact} onChange={update('minImpact')}>
                  <option value="LOW">Any impact</option>
                  <option value="MEDIUM">Medium or above</option>
                  <option value="HIGH">High only</option>
                </select>
              </div>
              <div className="field">
                <label htmlFor="rule-sentiment">Sentiment</label>
                <select id="rule-sentiment" value={draft.sentiment} onChange={update('sentiment')}>
                  <option value="any">Any</option>
                  <option value="bullish">Bullish only</option>
                  <option value="bearish">Bearish only</option>
                  <option value="neutral">Neutral only</option>
                </select>
              </div>
            </div>
            <div className="field">
              <label htmlFor="rule-name">Name (optional)</label>
              <input id="rule-name" type="text" value={draft.name} onChange={update('name')} maxLength={50} placeholder="e.g. Chip stocks" />
            </div>
            {error && <p className="form-error" role="alert">{error}</p>}
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">Add rule</button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
