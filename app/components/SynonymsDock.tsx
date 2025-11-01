'use client';

import { useState } from 'react';
import { Plus, X, Edit2, Trash2, Check } from 'lucide-react';

interface Synonym {
  id: string;
  term: string;
  canonical: string;
  mappings: string[];
}

interface SynonymsDockProps {
  synonyms: Synonym[];
  onAdd: () => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function SynonymsDock({
  synonyms,
  onAdd,
  onEdit,
  onDelete,
}: SynonymsDockProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="relative">
      {/* Pills Row */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mr-2">
          Synonyms
        </span>

        {synonyms.map((synonym) => (
          <button
            key={synonym.id}
            onClick={() => toggleExpand(synonym.id)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              expandedId === synonym.id
                ? 'bg-zinc-900 text-white'
                : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
            }`}
          >
            {synonym.term}
          </button>
        ))}

        <button
          onClick={onAdd}
          className="px-3 py-1.5 rounded-full text-sm font-medium bg-zinc-100 text-zinc-700 hover:bg-zinc-200 transition-colors flex items-center gap-1"
          title="Add new synonym"
        >
          <Plus className="w-3 h-3" />
          <span>Add</span>
        </button>
      </div>

      {/* Expanded Detail Card */}
      {expandedId && (
        <div className="absolute top-full left-0 right-0 mt-3 bg-white border border-zinc-200 rounded-lg shadow-lg p-4 z-50 animate-in slide-in-from-top-2 duration-200">
          {(() => {
            const synonym = synonyms.find((s) => s.id === expandedId);
            if (!synonym) return null;

            return (
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-lg font-semibold text-zinc-900">
                      {synonym.term}
                    </h4>
                    <p className="text-sm text-zinc-500">
                      Canonical: {synonym.canonical}
                    </p>
                  </div>
                  <button
                    onClick={() => setExpandedId(null)}
                    className="p-1 hover:bg-zinc-100 rounded transition-colors"
                  >
                    <X className="w-4 h-4 text-zinc-600" />
                  </button>
                </div>

                {/* Mappings */}
                <div>
                  <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                    Mapped Terms
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {synonym.mappings.map((mapping, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-zinc-50 text-zinc-700 text-sm rounded border border-zinc-200"
                      >
                        {mapping}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t border-zinc-200">
                  <button
                    onClick={() => {
                      onEdit(synonym.id);
                      setExpandedId(null);
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100 rounded transition-colors"
                  >
                    <Edit2 className="w-3 h-3" />
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      onDelete(synonym.id);
                      setExpandedId(null);
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    Delete
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Backdrop */}
      {expandedId && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setExpandedId(null)}
        />
      )}
    </div>
  );
}

