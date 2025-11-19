
import React, { useState } from 'react';
import { type Candidate, type Voter } from '../types';
import { MAX_VOTES } from '../constants';

interface VotingPageProps {
  candidates: Candidate[];
  voter: Voter;
  onVote: (selectedCandidateIds: string[]) => void;
}

export default function VotingPage({ candidates, voter, onVote }: VotingPageProps): React.ReactElement {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const handleSelect = (candidateId: string) => {
    const newSelectedIds = new Set(selectedIds);
    if (newSelectedIds.has(candidateId)) {
      newSelectedIds.delete(candidateId);
    } else {
      if (newSelectedIds.size < MAX_VOTES) {
        newSelectedIds.add(candidateId);
      }
    }
    setSelectedIds(newSelectedIds);
  };

  const handleSubmit = () => {
    if (selectedIds.size > 0) {
      onVote(Array.from(selectedIds));
    }
  };

  return (
    <div className="w-full max-w-4xl p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Emite tu Voto</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Bienvenido/a, {voter.email}.</p>
        <p className="text-gray-600 dark:text-gray-400">Selecciona hasta {MAX_VOTES} candidatos.</p>
      </div>

      <div className="sticky top-0 bg-white dark:bg-gray-800 py-4 z-10 border-b-2 dark:border-gray-700 mb-4">
        <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">
                Seleccionados: <span className="text-blue-600 dark:text-blue-400 font-bold">{selectedIds.size} / {MAX_VOTES}</span>
            </h3>
            <button
                onClick={handleSubmit}
                disabled={selectedIds.size === 0}
                className="px-8 py-3 font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
            >
                Emitir Voto
            </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto pr-2">
        {candidates.map(candidate => {
          const isSelected = selectedIds.has(candidate.id);
          const isDisabled = !isSelected && selectedIds.size >= MAX_VOTES;
          return (
            <div
              key={candidate.id}
              onClick={() => !isDisabled && handleSelect(candidate.id)}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                isSelected 
                  ? 'bg-blue-100 dark:bg-blue-900 border-blue-500 dark:border-blue-400 shadow-md' 
                  : isDisabled
                  ? 'bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 opacity-50 cursor-not-allowed'
                  : 'bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-sm'
              }`}
            >
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isSelected}
                  disabled={isDisabled}
                  onChange={() => {}} // The div handles the click
                  className="h-5 w-5 rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="font-medium text-lg">{candidate.name}</span>
              </label>
            </div>
          );
        })}
      </div>
    </div>
  );
}