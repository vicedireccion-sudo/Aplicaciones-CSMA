
import React, { useState } from 'react';

interface VoterLoginProps {
  onLogin: (email: string) => void;
  error: string;
}

export default function VoterLogin({ onLogin, error }: VoterLoginProps): React.ReactElement {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(email);
  };

  return (
    <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white">Acceso a la Votación</h2>
      <p className="text-center text-gray-600 dark:text-gray-400">
        Introduce tu correo corporativo. Si está en la lista de votantes autorizados, podrás acceder. No se necesita contraseña.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="sr-only">Dirección de correo electrónico</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 text-lg text-gray-700 bg-gray-200 dark:bg-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="tu.nombre@csma.es"
          />
        </div>
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        <div>
          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent text-lg font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition"
          >
            Acceder para Votar
          </button>
        </div>
      </form>
    </div>
  );
}
