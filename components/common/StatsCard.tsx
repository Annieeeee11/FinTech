interface StatsCardProps {
  label: string;
  value: number;
}

export function StatsCard({ label, value }: StatsCardProps) {
  return (
    <div className="bg-zinc-50 rounded-lg p-4">
      <p className="text-xs text-zinc-500 mb-1">{label}</p>
      <p className="text-2xl font-semibold text-zinc-900">{value}</p>
    </div>
  );
}

