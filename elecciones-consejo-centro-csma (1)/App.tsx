
import React, { useState, useCallback } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { type Candidate, type Voter } from './types';
import AdminDashboard from './components/AdminDashboard';
import VoterLogin from './components/VoterLogin';
import VotingPage from './components/VotingPage';
import Header from './components/Header';
import AdminIcon from './components/icons/AdminIcon';
import VoteIcon from './components/icons/VoteIcon';
import ResultsPage from './components/ResultsPage';

enum Page {
  HOME,
  ADMIN_LOGIN,
  ADMIN_DASHBOARD,
  VOTER_LOGIN,
  VOTING,
  VOTED,
  RESULTS
}

const ADMIN_PASSWORD = 'admin';

export default function App(): React.ReactElement {
  const [page, setPage] = useState<Page>(Page.HOME);
  const [currentUser, setCurrentUser] = useState<Voter | null>(null);
  const [adminAuthenticated, setAdminAuthenticated] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const [candidates, setCandidates] = useLocalStorage<Candidate[]>('candidates', []);
  const [voters, setVoters] = useLocalStorage<Voter[]>('voters', []);

  const handleAdminLogin = useCallback((password: string) => {
    if (password === ADMIN_PASSWORD) {
      setAdminAuthenticated(true);
      setPage(Page.ADMIN_DASHBOARD);
      setError('');
    } else {
      setError('Contraseña de administrador incorrecta.');
    }
  }, []);

  const handleVoterLogin = useCallback((email: string) => {
    const voter = voters.find(v => v.email.toLowerCase() === email.toLowerCase());
    if (voter) {
      if (voter.hasVoted) {
        setPage(Page.VOTED);
      } else {
        setCurrentUser(voter);
        setPage(Page.VOTING);
      }
      setError('');
    } else {
      setError('Este correo electrónico no está registrado para votar.');
    }
  }, [voters]);

  const handleVote = useCallback((selectedCandidateIds: string[]) => {
    if (!currentUser) return;

    // Increment votes for selected candidates
    const updatedCandidates = candidates.map(c => 
      selectedCandidateIds.includes(c.id) ? { ...c, votes: c.votes + 1 } : c
    );
    setCandidates(updatedCandidates);

    // Mark user as voted
    const updatedVoters = voters.map(v => 
      v.email === currentUser.email ? { ...v, hasVoted: true } : v
    );
    setVoters(updatedVoters);
    
    setPage(Page.VOTED);
    setCurrentUser(null);
  }, [currentUser, candidates, voters, setCandidates, setVoters]);

  const resetToHome = () => {
    setPage(Page.HOME);
    setCurrentUser(null);
    setAdminAuthenticated(false);
    setError('');
  };

  const renderPage = () => {
    switch (page) {
      case Page.ADMIN_DASHBOARD:
        return <AdminDashboard 
                 candidates={candidates} 
                 setCandidates={setCandidates} 
                 voters={voters} 
                 setVoters={setVoters} 
                 onViewResults={() => setPage(Page.RESULTS)}
               />;
      
      case Page.RESULTS:
        return <ResultsPage candidates={candidates} onBack={() => setPage(Page.ADMIN_DASHBOARD)} />;

      case Page.VOTER_LOGIN:
        return <VoterLogin onLogin={handleVoterLogin} error={error} />;
      
      case Page.VOTING:
        return currentUser && <VotingPage candidates={candidates} voter={currentUser} onVote={handleVote} />;
        
      case Page.VOTED:
        return (
          <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-green-600 dark:text-green-400 mb-4">¡Gracias!</h2>
            <p className="text-gray-700 dark:text-gray-300">Su voto ha sido emitido correctamente.</p>
          </div>
        );

      case Page.ADMIN_LOGIN:
        return (
            <div className="w-full max-w-sm p-8 space-y-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white">Acceso Administrador</h2>
                <form onSubmit={(e) => { e.preventDefault(); handleAdminLogin(e.currentTarget.password.value); }}>
                    <input
                        type="password"
                        name="password"
                        placeholder="Introduzca la contraseña de administrador"
                        className="w-full px-4 py-2 text-gray-700 bg-gray-200 dark:bg-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                     {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                    <button type="submit" className="w-full mt-4 px-4 py-2 font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-200">
                        Acceder
                    </button>
                </form>
            </div>
        );

      case Page.HOME:
      default:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
            <div onClick={() => setPage(Page.ADMIN_LOGIN)} className="p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg text-center cursor-pointer hover:shadow-2xl hover:scale-105 transition-transform duration-300">
              <AdminIcon className="w-20 h-20 mx-auto mb-4 text-blue-600 dark:text-blue-400"/>
              <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Portal del Administrador</h2>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Gestiona candidatos, votantes y consulta los resultados.</p>
            </div>
            <div onClick={() => setPage(Page.VOTER_LOGIN)} className="p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg text-center cursor-pointer hover:shadow-2xl hover:scale-105 transition-transform duration-300">
              <VoteIcon className="w-20 h-20 mx-auto mb-4 text-green-600 dark:text-green-400"/>
              <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Portal del Votante</h2>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Inicia sesión con tu correo corporativo para emitir tu voto.</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-col items-center p-4 sm:p-6 md:p-8">
      <Header onHomeClick={resetToHome} showHomeButton={page !== Page.HOME} />
      <main className="w-full flex-grow flex items-center justify-center">
        {renderPage()}
      </main>
    </div>
  );
}