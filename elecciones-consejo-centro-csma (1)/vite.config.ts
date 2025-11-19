import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Cargar variables de entorno basadas en el modo (development/production)
  // El tercer argumento '' le dice a Vite que cargue todas las variables, no solo las que empiezan por VITE_
  // Fix: Cast process to any to avoid TypeScript error "Property 'cwd' does not exist on type 'Process'"
  const env = loadEnv(mode, (process as any).cwd(), '');

  return {
    plugins: [react()],
    define: {
      // Hacemos disponible process.env.API_KEY específicamente para el cliente
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
      // Definición de seguridad para evitar errores de acceso a process
      'process.env': {}
    }
  };
});