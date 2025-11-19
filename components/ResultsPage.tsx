
import React, { useState, useMemo } from 'react';
import { type Candidate } from '../types';
import { generateResultsSummary } from '../services/geminiService';
import SparkleIcon from './icons/SparkleIcon';

interface ResultsPageProps {
  candidates: Candidate[];
  onBack: () => void;
}

const Spinner = () => (
    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
);

export default function ResultsPage({ candidates, onBack }: ResultsPageProps): React.ReactElement {
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const sortedCandidates = useMemo(() => {
    return [...candidates].sort((a, b) => b.votes - a.votes);
  }, [candidates]);
  
  const maxVotes = useMemo(() => {
    return Math.max(...sortedCandidates.map(c => c.votes), 0);
  }, [sortedCandidates]);

  const handleGenerateSummary = async () => {
    setIsLoading(true);
    setSummary('');
    const result = await generateResultsSummary(candidates);
    setSummary(result);
    setIsLoading(false);
  };
  
  return (
    <div className="w-full max-w-6xl p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Resultados de la Elección</h2>
        <button onClick={onBack} className="px-4 py-2 font-semibold text-white bg-gray-600 rounded-md hover:bg-gray-700 transition">Volver al Panel</button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Vote Counts */}
        <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">Recuento de Votos</h3>
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                {sortedCandidates.map((c, index) => (
                    <div key={c.id}>
                        <div className="flex justify-between items-baseline mb-1">
                            <span className={`font-medium ${index < 9 ? 'text-green-600 dark:text-green-400' : ''}`}>{index + 1}. {c.name}</span>
                            <span className="font-bold text-lg">{c.votes}</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                            <div
                                className={`h-4 rounded-full ${index < 9 ? 'bg-green-500' : 'bg-blue-500'}`}
                                style={{ width: maxVotes > 0 ? `${(c.votes / maxVotes) * 100}%` : '0%' }}
                            ></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Gemini Summary */}
        <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Resumen Generado por IA</h3>
                <button
                    onClick={handleGenerateSummary}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-4 py-2 font-semibold text-white bg-purple-600 rounded-md hover:bg-purple-700 disabled:bg-purple-400 transition"
                >
                    {isLoading ? <Spinner/> : <SparkleIcon className="w-5 h-5" />}
                    {isLoading ? 'Generando...' : 'Generar con Gemini'}
                </button>
            </div>
            <div className="flex-grow bg-gray-100 dark:bg-gray-900 rounded-lg p-4 whitespace-pre-wrap font-mono text-sm overflow-y-auto h-96">
                {summary || 'Haz clic en el botón para generar un comunicado oficial de los resultados...'}
            </div>
        </div>
      </div>
    </div>
  );
}