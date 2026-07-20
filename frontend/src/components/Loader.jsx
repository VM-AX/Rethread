import React from 'react';

export default function Loader({ label = 'Loading...' }) {
  return (
    <div className="flex items-center justify-center gap-2 py-16 text-forest-400">
      <span className="h-2 w-2 animate-pulse rounded-full bg-forest-400" />
      <span className="h-2 w-2 animate-pulse rounded-full bg-forest-400 [animation-delay:150ms]" />
      <span className="h-2 w-2 animate-pulse rounded-full bg-forest-400 [animation-delay:300ms]" />
      <span className="ml-2 text-sm">{label}</span>
    </div>
  );
}
