const COOLIFY_API_URL = import.meta.env.VITE_COOLIFY_API_URL;
const COOLIFY_TOKEN = import.meta.env.VITE_COOLIFY_TOKEN;

interface CoolifyEnvVar {
  name: string;
  value: string;
}

export async function fetchCoolifyEnvVars(): Promise<Record<string, string>> {
  try {
    if (!COOLIFY_API_URL || !COOLIFY_TOKEN) {
      throw new Error('Les variables d\'environnement Coolify ne sont pas configurées');
    }

    const response = await fetch(`${COOLIFY_API_URL}/api/v1/environment-variables`, {
      headers: {
        'Authorization': `Bearer ${COOLIFY_TOKEN}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Erreur lors de la récupération des variables: ${response.statusText}`);
    }

    const data = await response.json() as CoolifyEnvVar[];
    
    // Convertir le tableau en objet
    return data.reduce((acc, { name, value }) => {
      acc[name] = value;
      return acc;
    }, {} as Record<string, string>);
  } catch (error) {
    console.error('Erreur lors de la récupération des variables Coolify:', error);
    return {};
  }
}

export function updateEnvVars(envVars: Record<string, string>): void {
  Object.entries(envVars).forEach(([key, value]) => {
    if (key.startsWith('VITE_')) {
      // @ts-ignore - Mise à jour dynamique des variables d'environnement
      import.meta.env[key] = value;
    }
  });
}