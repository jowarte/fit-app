import { CURRENT_VERSION, RELEASE_DATE, CURRENT_CHANGELOG } from '../version';

const GITHUB_PRIMARY = 'https://raw.githubusercontent.com/jowarte/fit-app/main/public/version.json';
const GITHUB_BACKUP = 'https://raw.githubusercontent.com/jowarte/bigfit/main/public/version.json';

/**
 * Compara duas versões (ex: '1.2.1' e '1.2.0')
 * Retorna 1 se remote > local, -1 se local > remote, 0 se iguais
 */
export function compareVersions(remote, local) {
  if (!remote || !local) return 0;
  const clean = (v) => v.toString().replace(/[^0-9.]/g, '').split('.').map(n => parseInt(n, 10) || 0);
  const rParts = clean(remote);
  const lParts = clean(local);
  const maxLen = Math.max(rParts.length, lParts.length);
  for (let i = 0; i < maxLen; i++) {
    const r = rParts[i] || 0;
    const l = lParts[i] || 0;
    if (r > l) return 1;
    if (r < l) return -1;
  }
  return 0;
}

/**
 * Verifica se há uma atualização disponível consultando o repositório oficial no GitHub
 * Com cache-bust (sem cache antigo) e servidor de contingência (fallback redundante)
 */
export async function checkForUpdates() {
  let remoteInfo = null;

  const endpoints = [
    `${GITHUB_PRIMARY}?t=${Date.now()}`,
    `${GITHUB_BACKUP}?t=${Date.now()}`
  ];

  for (const url of endpoints) {
    try {
      const res = await fetch(url, {
        cache: 'no-store',
        headers: { 'Accept': 'application/json' }
      });
      if (res.ok) {
        const json = await res.json();
        if (json && json.version) {
          remoteInfo = {
            version: json.version,
            release_date: json.release_date || '',
            title: json.title || 'Atualização Oficial do Sistema',
            description: json.description || '',
            changelog: Array.isArray(json.changelog) ? json.changelog : [],
            download_url: json.download_url || 'https://github.com/jowarte/fit-app',
            source: 'github'
          };
          break; // Sucesso, não precisa tentar o backup
        }
      }
    } catch (err) {
      // Tenta próximo endpoint
    }
  }

  // Se a rede falhar, assume a versão local
  if (!remoteInfo) {
    remoteInfo = {
      version: CURRENT_VERSION,
      release_date: RELEASE_DATE,
      title: 'Versão Instalada',
      changelog: CURRENT_CHANGELOG,
      download_url: 'https://github.com/jowarte/fit-app',
      source: 'local'
    };
  }

  const hasUpdate = compareVersions(remoteInfo.version, CURRENT_VERSION) > 0;

  return {
    hasUpdate,
    localVersion: CURRENT_VERSION,
    localDate: RELEASE_DATE,
    remoteVersion: remoteInfo,
    changelog: hasUpdate ? remoteInfo.changelog : CURRENT_CHANGELOG
  };
}
