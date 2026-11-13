import { useEffect, useRef } from 'react';

export default function Modal({ title, onClose, children }) {
  const panel = useRef(null);

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Move focus into the dialog once, when it opens.
  useEffect(() => {
    panel.current?.querySelector('input, textarea, select')?.focus();
  }, []);

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" ref={panel}>
        <header className="modal-head">
          <h2 id="modal-title">{title}</h2>
          <button type="button" className="btn btn-icon" onClick={onClose} aria-label="Close">
            {'✕'}
          </button>
        </header>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}
