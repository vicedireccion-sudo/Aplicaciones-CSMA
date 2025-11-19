
import React, { useState } from 'react';
import { type Candidate, type Voter } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface AdminDashboardProps {
  candidates: Candidate[];
  setCandidates: React.Dispatch<React.SetStateAction<Candidate[]>>;
  voters: Voter[];
  setVoters: React.Dispatch<React.SetStateAction<Voter[]>>;
  onViewResults: () => void;
}

export default function AdminDashboard({ candidates, setCandidates, voters, setVoters, onViewResults }: AdminDashboardProps): React.ReactElement {
  const [newCandidateName, setNewCandidateName] = useState('');
  const [voterEmails, setVoterEmails] = useState('');
  const [resetSuccessMessage, setResetSuccessMessage] = useState('');
  
  // Modal states
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [copiedState, setCopiedState] = useState<string | null>(null);
  // Estado para el enlace editable.
  const [votingLink, setVotingLink] = useState('');

  const handleAddCandidate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCandidateName.trim()) {
      const newCandidate: Candidate = {
        id: uuidv4(),
        name: newCandidateName.trim(),
        votes: 0,
      };
      setCandidates(prev => [...prev, newCandidate]);
      setNewCandidateName('');
    }
  };
  
  const handleRemoveCandidate = (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este candidato? Esta acción no se puede deshacer.')) {
        setCandidates(prev => prev.filter(c => c.id !== id));
    }
  };

  const handleAddVoters = (e: React.FormEvent) => {
    e.preventDefault();
    const emails = voterEmails.split('\n').map(email => email.trim().toLowerCase()).filter(email => email);
    const newVoters = emails
      .filter(email => !voters.some(v => v.email === email))
      .map(email => ({ email, hasVoted: false }));
    
    setVoters(prev => [...prev, ...newVoters]);
    setVoterEmails('');
  };

  const getNotificationData = (urlOverride?: string) => {
      const emailList = voters.map(v => v.email).join(',');
      const subject = 'Elecciones del Consejo de Centro CSMA';
      
      // Si el usuario no ha puesto nada, usamos un placeholder en el texto
      const finalUrl = urlOverride && urlOverride.trim() !== '' ? urlOverride : '[ENLACE_A_LA_VOTACION]';
      
      const body = `Estimado/a profesor/a,

Se le ha habilitado para votar en las elecciones de representantes del profesorado para el Consejo de Centro del CSMA.

Puede emitir su voto accediendo al siguiente enlace e introduciendo su correo electrónico corporativo:
${finalUrl}

Gracias por su participación.

Atentamente,
La Dirección del CSMA`;

    return { emailList, subject, body };
  };

  const isBadUrl = (url: string) => {
      return url.startsWith('blob:') || url.includes('localhost') || url.includes('127.0.0.1');
  };

  const handleOpenNotifyModal = () => {
    if (voters.length === 0) {
        alert('No hay votantes para notificar.');
        return;
    }
    
    const currentUrl = window.location.href;
    
    // Solo rellenamos automáticamente si la URL parece legítima (producción)
    if (isBadUrl(currentUrl)) {
        setVotingLink(''); // Dejamos vacío para que el usuario lo rellene manualmente
    } else {
        setVotingLink(currentUrl);
    }
    
    setShowNotifyModal(true);
  };

  const handleMailto = () => {
      // Validar antes de abrir correo
      if (!votingLink || isBadUrl(votingLink)) {
          alert('Por favor, introduce el enlace público real de la aplicación antes de abrir el correo.');
          return;
      }
      const { emailList, subject, body } = getNotificationData(votingLink);
      const mailtoLink = `mailto:?bcc=${emailList}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.location.href = mailtoLink;
  };

  const handleCopy = (text: string, key: string) => {
      navigator.clipboard.writeText(text);
      setCopiedState(key);
      setTimeout(() => setCopiedState(null), 2000);
  };

  const handleResetElection = () => {
    if (window.confirm('¿Estás seguro de que quieres reiniciar la elección? Esto restablecerá todos los votos y los estados de los votantes a cero.')) {
      setCandidates(prev => prev.map(c => ({ ...c, votes: 0 })));
      setVoters(prev => prev.map(v => ({ ...v, hasVoted: false })));
      setResetSuccessMessage('¡Elección reiniciada con éxito! Los votos y el estado de los votantes han sido restablecidos.');
      setTimeout(() => setResetSuccessMessage(''), 5000);
    }
  };

  // Calculamos los datos dinámicamente basándonos en el enlace editable
  const { emailList, subject, body } = getNotificationData(votingLink);

  // Detectar si lo que ha escrito el usuario es temporal
  const isTemporaryUrl = votingLink.length > 0 && isBadUrl(votingLink);
  const isEmpty = votingLink.trim() === '';

  return (
    <div className="w-full max-w-6xl p-4 md:p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg relative">
      <h2 className="text-3xl font-bold text-center mb-6 text-gray-800 dark:text-white">Panel de Administración</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Manage Candidates */}
        <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
          <h3 className="text-xl font-semibold mb-4">Gestionar Candidatos</h3>
          <form onSubmit={handleAddCandidate} className="flex gap-2 mb-4">
            <input
              type="text"
              value={newCandidateName}
              onChange={(e) => setNewCandidateName(e.target.value)}
              placeholder="Nombre del nuevo candidato"
              className="flex-grow px-3 py-2 text-gray-700 bg-gray-200 dark:bg-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button type="submit" className="px-4 py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 transition">Añadir</button>
          </form>
          <div className="max-h-60 overflow-y-auto">
            <ul>
              {candidates.map(c => (
                <li key={c.id} className="flex justify-between items-center p-2 border-b dark:border-gray-700">
                  <span>{c.name}</span>
                  <button onClick={() => handleRemoveCandidate(c.id)} className="text-red-500 hover:text-red-700 text-sm font-semibold">Eliminar</button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Manage Voters */}
        <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
          <h3 className="text-xl font-semibold mb-4">Gestionar Votantes</h3>
          <form onSubmit={handleAddVoters} className="mb-4">
            <textarea
              value={voterEmails}
              onChange={(e) => setVoterEmails(e.target.value)}
              placeholder="Introduce los correos de los votantes, uno por línea"
              rows={5}
              className="w-full px-3 py-2 text-gray-700 bg-gray-200 dark:bg-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
             <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 mb-2">
              Nota: Los votantes accederán solo con su email, sin contraseña.
             </p>
            <div className="flex gap-2">
              <button type="submit" className="flex-1 px-4 py-2 font-semibold text-white bg-green-600 rounded-md hover:bg-green-700 transition">Añadir Votantes</button>
              <button type="button" onClick={handleOpenNotifyModal} className="flex-1 px-4 py-2 font-semibold text-white bg-teal-600 rounded-md hover:bg-teal-700 transition">Notificar Votantes</button>
            </div>
          </form>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Votantes Totales: {voters.length}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Han votado: {voters.filter(v => v.hasVoted).length}</p>
        </div>

      </div>

      <div className="mt-8 flex flex-col md:flex-row gap-4 justify-center items-center">
        <button onClick={onViewResults} className="px-6 py-3 font-bold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition w-full md:w-auto">Ver Resultados</button>
        <button onClick={handleResetElection} className="px-6 py-3 font-bold text-white bg-red-600 rounded-md hover:bg-red-700 transition w-full md:w-auto">Reiniciar Elección</button>
      </div>
      {resetSuccessMessage && (
        <div className="mt-4 text-center text-green-600 dark:text-green-400 font-semibold">
          {resetSuccessMessage}
        </div>
      )}

      {/* Notification Modal */}
      {showNotifyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Notificar a los Votantes</h3>
                <button onClick={() => setShowNotifyModal(false)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                    Para enviar la notificación, primero debes publicar tu web en internet (ej. Vercel, Netlify). Luego, pega el enlace público aquí abajo.
                </p>

                {/* Campo editable para la URL */}
                <div className="mb-6">
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                        Enlace Público a la Votación
                    </label>
                    
                    <input 
                        type="text" 
                        value={votingLink}
                        onChange={(e) => setVotingLink(e.target.value)}
                        placeholder="Pega aquí tu enlace (ej: https://mi-eleccion.vercel.app)"
                        className={`w-full px-3 py-2 text-gray-700 bg-white dark:bg-gray-900 dark:text-white border rounded-md focus:outline-none focus:ring-2 ${isTemporaryUrl || isEmpty ? 'border-orange-500 focus:ring-orange-500' : 'border-green-500 focus:ring-green-500'}`}
                    />
                    
                    {isTemporaryUrl && (
                        <div className="mt-2 text-red-500 text-sm font-bold">
                            ⚠️ Estás usando un enlace temporal o local. Esto no funcionará para los profesores.
                        </div>
                    )}
                    {isEmpty && (
                        <div className="mt-2 text-orange-600 text-sm">
                             ☝️ Debes pegar aquí el enlace real de tu aplicación publicada.
                        </div>
                    )}
                </div>

                <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                    <h4 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">Opción 1: Abrir Cliente de Correo</h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mb-4">
                        Si tienes un programa de correo instalado (Outlook, Mail, etc.), usa este botón.
                    </p>
                    <button 
                        onClick={handleMailto}
                        disabled={isEmpty || isTemporaryUrl}
                        className={`w-full py-3 font-bold text-white rounded-md transition flex justify-center items-center gap-2 ${isEmpty || isTemporaryUrl ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                        Abrir Cliente de Correo
                    </button>
                </div>

                <div className="border-t dark:border-gray-700 pt-6">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Opción 2: Copiar y Pegar (Webmail)</h4>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Destinatarios (BCC / Copia Oculta)</label>
                            <div className="flex gap-2">
                                <input readOnly value={emailList} className="flex-grow px-3 py-2 bg-gray-100 dark:bg-gray-700 border rounded-md text-sm" />
                                <button 
                                    onClick={() => handleCopy(emailList, 'emails')}
                                    className={`px-4 py-2 text-sm font-medium text-white rounded-md transition ${copiedState === 'emails' ? 'bg-green-600' : 'bg-gray-600 hover:bg-gray-700'}`}
                                >
                                    {copiedState === 'emails' ? '¡Copiado!' : 'Copiar'}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Asunto</label>
                            <div className="flex gap-2">
                                <input readOnly value={subject} className="flex-grow px-3 py-2 bg-gray-100 dark:bg-gray-700 border rounded-md text-sm" />
                                <button 
                                    onClick={() => handleCopy(subject, 'subject')}
                                    className={`px-4 py-2 text-sm font-medium text-white rounded-md transition ${copiedState === 'subject' ? 'bg-green-600' : 'bg-gray-600 hover:bg-gray-700'}`}
                                >
                                    {copiedState === 'subject' ? '¡Copiado!' : 'Copiar'}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cuerpo del Mensaje</label>
                            <div className="flex gap-2 items-start">
                                <textarea readOnly value={body} rows={6} className="flex-grow px-3 py-2 bg-gray-100 dark:bg-gray-700 border rounded-md text-sm resize-none" />
                                <button 
                                    onClick={() => handleCopy(body, 'body')}
                                    className={`px-4 py-2 text-sm font-medium text-white rounded-md transition ${copiedState === 'body' ? 'bg-green-600' : 'bg-gray-600 hover:bg-gray-700'}`}
                                >
                                    {copiedState === 'body' ? '¡Copiado!' : 'Copiar'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="p-6 border-t dark:border-gray-700 flex justify-end">
                <button onClick={() => setShowNotifyModal(false)} className="px-6 py-2 text-sm font-bold text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition">
                    Cerrar
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
