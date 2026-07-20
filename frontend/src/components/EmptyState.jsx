import React from 'react';

export default function EmptyState({ title, subtitle, action }) {
  return (
    <div className="card flex flex-col items-center gap-2 p-10 text-center">
      <p className="text-base font-medium text-forest-800">{title}</p>
      {subtitle && <p className="text-sm text-forest-500">{subtitle}</p>}
      {action}
    </div>
  );
}
