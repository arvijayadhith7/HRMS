import React from 'react';

export default function EmptyState({ icon = 'draft', title = 'No data available', description = 'There is currently no data to display here.', action = null }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white border border-outline-variant border-dashed rounded-2xl h-full min-h-[300px]">
      <div className="w-16 h-16 mb-4 flex items-center justify-center rounded-full bg-surface">
        {typeof icon === 'string' ? (
          <span className="material-symbols-outlined text-[32px] text-outline">{icon}</span>
        ) : (
          React.createElement(icon, { className: "w-8 h-8 text-outline text-slate-400" })
        )}
      </div>
      <h3 className="text-headline-sm font-bold text-on-surface mb-2 tracking-tight">{title}</h3>
      <p className="text-body-md text-on-surface-variant max-w-md mb-6 leading-relaxed">
        {description}
      </p>
      {action && (
        <div className="mt-2">
          {action}
        </div>
      )}
    </div>
  );
}
