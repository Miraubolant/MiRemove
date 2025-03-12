import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { fetchCoolifyEnvVars, updateEnvVars } from './services/coolify';

async function initApp() {
  try {
    // Récupérer les variables d'environnement de Coolify
    const envVars = await fetchCoolifyEnvVars();
    
    // Mettre à jour les variables d'environnement
    updateEnvVars(envVars);
    
    // Démarrer l'application
    createRoot(document.getElementById('root')!).render(
      <StrictMode>
        <App />
      </StrictMode>
    );
  } catch (error) {
    console.error('Erreur lors de l\'initialisation:', error);
    
    // Afficher une erreur à l'utilisateur
    document.body.innerHTML = `
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100vh;
        background-color: #0f172a;
        color: #f1f5f9;
        font-family: system-ui, -apple-system, sans-serif;
        padding: 1rem;
        text-align: center;
      ">
        <h1 style="
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 1rem;
        ">Erreur de configuration</h1>
        <p style="
          color: #94a3b8;
          max-width: 28rem;
          line-height: 1.5;
        ">
          Une erreur est survenue lors du chargement de l'application. 
          Veuillez réessayer ultérieurement ou contacter le support si le problème persiste.
        </p>
      </div>
    `;
  }
}

initApp();