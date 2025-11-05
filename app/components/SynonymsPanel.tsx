'use client';

import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { getSynonyms, createSynonym, updateSynonym, deleteSynonym } from '@/lib/api';
import { Synonym } from '@/lib/types';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { InfoCard } from '@/components/common/InfoCard';
import { SynonymForm } from '@/components/common/SynonymForm';
import { SynonymItem } from '@/components/common/SynonymItem';
import { Button } from '@/components/ui/Button';

interface SynonymsPanelProps {
  onSynonymChange?: () => void;
}

export default function SynonymsPanel({ onSynonymChange }: SynonymsPanelProps) {
  const [synonyms, setSynonyms] = useState<Synonym[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTerm, setEditTerm] = useState('');
  const [editCanonical, setEditCanonical] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newTerm, setNewTerm] = useState('');
  const [newCanonical, setNewCanonical] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadSynonyms();
  }, []);

  async function loadSynonyms() {
    setIsLoading(true);
    try {
      const data = await getSynonyms();
      setSynonyms(data);
    } catch (error) {
      toast.error('Failed to load synonyms');
      console.error('Error loading synonyms:', error);
    } finally {
      setIsLoading(false);
    }
  }

  function startEdit(synonym: Synonym) {
    setEditingId(synonym.id);
    setEditTerm(synonym.term);
    setEditCanonical(synonym.canonical);
  }

  async function saveEdit() {
    if (!editingId || !editTerm || !editCanonical) return;

    setIsSaving(true);
    try {
      await updateSynonym(editingId, editTerm, editCanonical);
      setSynonyms(prev =>
        prev.map(s =>
          s.id === editingId
            ? { ...s, term: editTerm, canonical: editCanonical }
            : s
        )
      );
      setEditingId(null);
      toast.success('Synonym updated successfully');
      onSynonymChange?.();
    } catch (error) {
      toast.error('Failed to update synonym');
      console.error('Error updating synonym:', error);
    } finally {
      setIsSaving(false);
    }
  }

  function cancelEdit() {
    setEditingId(null);
    setEditTerm('');
    setEditCanonical('');
  }

  async function handleDelete(id: string) {
    try {
      await deleteSynonym(id);
      setSynonyms(prev => prev.filter(s => s.id !== id));
      toast.success('Synonym deleted successfully');
      onSynonymChange?.();
    } catch (error) {
      toast.error('Failed to delete synonym');
      console.error('Error deleting synonym:', error);
    }
  }

  async function addSynonym() {
    if (!newTerm || !newCanonical) {
      toast.error('Please fill in both fields');
      return;
    }

    const existing = synonyms.find(s => s.term.toLowerCase().trim() === newTerm.toLowerCase().trim());
    
    setIsSaving(true);
    try {
      if (existing) {
        await updateSynonym(existing.id, newTerm.trim(), newCanonical.trim());
        setSynonyms(prev =>
          prev.map(s =>
            s.id === existing.id
              ? { ...s, term: newTerm.trim(), canonical: newCanonical.trim() }
              : s
          )
        );
        toast.success('Synonym updated successfully');
      } else {
        const newSynonym = await createSynonym(newTerm.trim(), newCanonical.trim());
        setSynonyms(prev => [...prev, newSynonym]);
        toast.success('Synonym added successfully');
      }
      setNewTerm('');
      setNewCanonical('');
      setIsAdding(false);
      onSynonymChange?.();
    } catch (error: any) {
      if (error.message?.includes('already exists') || error.message?.includes('duplicate')) {
        const existingByTerm = synonyms.find(s => s.term.toLowerCase().trim() === newTerm.toLowerCase().trim());
        if (existingByTerm) {
          try {
            await updateSynonym(existingByTerm.id, newTerm.trim(), newCanonical.trim());
            setSynonyms(prev =>
              prev.map(s =>
                s.id === existingByTerm.id
                  ? { ...s, term: newTerm.trim(), canonical: newCanonical.trim() }
                  : s
              )
            );
            toast.success('Synonym updated successfully');
            setNewTerm('');
            setNewCanonical('');
            setIsAdding(false);
            onSynonymChange?.();
            return;
          } catch (updateError) {
            toast.error('Failed to update existing synonym');
            console.error('Error updating synonym:', updateError);
          }
        } else {
          toast.error('A synonym with this term already exists. Please edit the existing one.');
        }
      } else {
        toast.error(error.message || 'Failed to add synonym');
        console.error('Error adding synonym:', error);
      }
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <InfoCard
      title="Synonym Mappings"
      subtitle={`${synonyms.length} mappings • Changes apply instantly`}
      actions={
        <Button
          onClick={() => setIsAdding(true)}
          variant="primary"
          size="xs"
          className="rounded-lg flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Mapping
        </Button>
      }
    >
      <div className="p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="space-y-2">
            {isAdding && (
              <SynonymForm
                term={newTerm}
                canonical={newCanonical}
                onTermChange={setNewTerm}
                onCanonicalChange={setNewCanonical}
                onSave={addSynonym}
                onCancel={() => {
                  setIsAdding(false);
                  setNewTerm('');
                  setNewCanonical('');
                }}
                isSaving={isSaving}
              />
            )}

            {synonyms.map((synonym) => (
              <div key={synonym.id}>
                {editingId === synonym.id ? (
                  <SynonymForm
                    term={editTerm}
                    canonical={editCanonical}
                    onTermChange={setEditTerm}
                    onCanonicalChange={setEditCanonical}
                    onSave={saveEdit}
                    onCancel={cancelEdit}
                    isSaving={isSaving}
                  />
                ) : (
                  <SynonymItem
                    synonym={synonym}
                    onEdit={startEdit}
                    onDelete={handleDelete}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </InfoCard>
  );
}
