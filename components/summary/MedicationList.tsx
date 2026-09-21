'use client';
import React, { useState } from 'react';
import { Medication } from '@/types/history';
import { Pill, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MedicationListProps {
  medications: Medication[];
  onAdd: (med: Omit<Medication, 'id'>) => void;
  onRemove: (id: string) => void;
}

export function MedicationList({ medications, onAdd, onRemove }: MedicationListProps) {
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('1-0-1 after meals');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onAdd({ name, dosage: dosage || 'As directed', frequency, source: 'manual' });
      setName('');
      setDosage('');
      setShowAdd(false);
    }
  };

  return (
    <div className="bg-white border-3 border-gray-200 rounded-3xl p-6 shadow-md space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Pill className="w-8 h-8 text-primary-600" />
          <h3 className="text-2xl font-black text-gray-900">💊 Current Medications List</h3>
        </div>
        <Button variant="outline" size="md" onClick={() => setShowAdd(!showAdd)}>
          <Plus className="w-6 h-6 mr-1" /> Add Medication +
        </Button>
      </div>

      {/* Add Form */}
      {showAdd && (
        <form onSubmit={handleAddSubmit} className="bg-primary-50 p-6 rounded-2xl border-2 border-primary-300 space-y-4">
          <h4 className="text-xl font-bold text-primary-900">Add New Medication:</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Medicine Name (e.g. Paracetamol)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="p-4 border-2 border-gray-300 rounded-xl text-xl font-bold"
              required
            />
            <input
              type="text"
              placeholder="Dosage (e.g. 500mg)"
              value={dosage}
              onChange={(e) => setDosage(e.target.value)}
              className="p-4 border-2 border-gray-300 rounded-xl text-xl font-bold"
            />
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              className="p-4 border-2 border-gray-300 rounded-xl text-xl font-bold"
            >
              <option value="1-0-1 after meals">1-0-1 after meals (सुबह-शाम)</option>
              <option value="1-0-0 morning">1-0-0 morning (सुबह)</option>
              <option value="0-0-1 night">0-0-1 night (रात)</option>
              <option value="As needed (जब जरूरत हो)">As needed (जरूरत पड़ने पर)</option>
            </select>
          </div>
          <Button type="submit" variant="primary" size="md">
            Save Medication
          </Button>
        </form>
      )}

      {/* Meds List */}
      <div className="space-y-3">
        {medications.map((med) => (
          <div
            key={med.id}
            className="p-4 rounded-2xl bg-gray-50 border-2 border-gray-200 flex items-center justify-between shadow-sm"
          >
            <div>
              <p className="text-2xl font-black text-gray-900">{med.name}</p>
              <p className="text-lg font-bold text-gray-600">
                Dosage: {med.dosage} • Frequency: {med.frequency} {med.source && `(${med.source.toUpperCase()})`}
              </p>
            </div>
            <button
              onClick={() => onRemove(med.id)}
              className="p-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
              title="Delete"
            >
              <Trash2 className="w-6 h-6" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
