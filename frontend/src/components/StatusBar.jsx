import React from 'react';

export function StatusBar({ statusText }) {
  return (
    <div id="status-bar">
      <span>{statusText}</span>
    </div>
  );
}

