import React, { useMemo } from 'react';
import './Progress.scss';

function ProgressBar({ current = 0, target = 100, unit = '' }) {
  const pct = useMemo(() => {
    if (target <= 0) return 0;
    return Math.min(Math.round((current / target) * 100), 100);
  }, [current, target]);

  const level = useMemo(() => {
    if (pct >= 100) return 'complete';
    if (pct >= 75) return 'high';
    if (pct >= 50) return 'mid';
    if (pct >= 25) return 'low';
    return 'start';
  }, [pct]);

  const label = useMemo(() => {
    if (pct >= 100) return '🎉 Done!';
    if (pct >= 75) return '🔥 Almost!';
    if (pct >= 50) return '💪 Halfway';
    if (pct >= 25) return '🚀 Going';
    return '🌱 Start';
  }, [pct]);

  return (
    <div className="progress-bar">
      <div className="progress-bar__info">
        <span className="progress-bar__label">{label}</span>
        <span className="progress-bar__values">
          {current} / {target} {unit} — <strong>{pct}%</strong>
        </span>
      </div>
      <div className="progress-bar__track">
        <div
          className={`progress-bar__fill progress-bar__fill--${level}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default ProgressBar;