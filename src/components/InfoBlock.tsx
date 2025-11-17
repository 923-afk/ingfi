'use client';

interface InfoBlockProps {
  icon: string;
  label: string;
  value: string;
  badgeClass?: string;
}

export function InfoBlock({ icon, label, value, badgeClass }: InfoBlockProps) {
  const content = (
    <div className="flex items-start gap-3">
      <div className="text-lg">{icon}</div>
      <div>
        <p className="text-xs font-semibold text-slate-500">{label}</p>
        <p
          className={`mt-1 text-sm font-medium text-slate-800 ${
            badgeClass ? `inline-flex rounded-full px-3 py-1 ${badgeClass}` : ''
          }`}
        >
          {value}
        </p>
      </div>
    </div>
  );

  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
      {badgeClass ? <div className="inline-flex items-center">{content}</div> : content}
    </div>
  );
}

