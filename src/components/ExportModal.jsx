import { useMemo, useRef, useState } from 'react';

import { toCSV, toJSON } from '../lib/format.js';
import Modal from './Modal.jsx';

// Downloads are blocked inside sandboxed frames, so the button is only shown
// when the app runs as a normal top-level page. Copy works everywhere.
const canDownload = (() => {
  try {
    return window.self === window.top;
  } catch {
    return false;
  }
})();

export default function ExportModal({ articles, onClose }) {
  const [format, setFormat] = useState('csv');
  const [copied, setCopied] = useState('');
  const textarea = useRef(null);

  const content = useMemo(() => (format === 'csv' ? toCSV(articles) : toJSON(articles)), [format, articles]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied('Copied to clipboard.');
    } catch {
      textarea.current?.select();
      setCopied('Text selected. Press Ctrl or Cmd + C to copy.');
    }
  };

  const download = () => {
    const blob = new Blob([content], { type: format === 'csv' ? 'text/csv' : 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `finpulse-export.${format}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Modal title="Export stories" onClose={onClose}>
      <p className="form-note">
        {articles.length} {articles.length === 1 ? 'story' : 'stories'} from the current view, with the full analysis.
      </p>
      <div className="segmented" role="group" aria-label="Export format">
        {['csv', 'json'].map((option) => (
          <button
            key={option}
            type="button"
            className={format === option ? 'active' : ''}
            aria-pressed={format === option}
            onClick={() => {
              setFormat(option);
              setCopied('');
            }}
          >
            {option.toUpperCase()}
          </button>
        ))}
      </div>
      <textarea
        id="export-content"
        ref={textarea}
        className="export-text mono"
        readOnly
        rows={10}
        value={content}
        aria-label="Export content"
      />
      <div className="form-actions">
        <span className="muted" role="status">{copied}</span>
        {canDownload && (
          <button type="button" className="btn" onClick={download}>Download file</button>
        )}
        <button type="button" className="btn btn-primary" onClick={copy}>Copy</button>
      </div>
    </Modal>
  );
}
