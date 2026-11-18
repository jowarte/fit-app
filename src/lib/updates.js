import { supabase } from './supabase';
import { CURRENT_VERSION, RELEASE_DATE, CURRENT_CHANGELOG } from '../version';

const GITHUB_RAW_FALLBACK = 'https://raw.githubusercontent.com/jowarte/fit-app/main/public/version.json';

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
 * Verifica se há uma atualização disponível consultando:
 * 1. Tabela 'system_updates' no Supabase
 * 2. Fallback via GitHub Raw / endpoint público
 */
export async function checkForUpdates() {
  let remoteInfo = null;

  // 1. Tenta buscar do Supabase
  try {
    const { data, error } = await supabase
      .from('system_updates')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1);

    if (!error && data && data.length > 0) {
      remoteInfo = {
        version: data[0].version,
        release_date: data[0].release_date ? new Date(data[0].release_date).toLocaleDateString('pt-BR') : '',
        title: data[0].title || 'Nova Versão Disponível',
        description: data[0].description || '',
        changelog: Array.isArray(data[0].changelog) ? data[0].changelog : (data[0].changelog ? [data[0].changelog] : []),
        download_url: data[0].download_url || 'https://github.com/jowarte/fit-app',
        source: 'supabase'
      };
    }
  } catch (err) {
    console.warn('Verificação Supabase updates indisponível:', err);
  }

  // 2. Se não encontrou no Supabase, tenta buscar no GitHub Raw oficial
  if (!remoteInfo) {
    try {
      const res = await fetch(`${GITHUB_RAW_FALLBACK}?t=${Date.now()}`);
      if (res.ok) {
        const json = await res.json();
        remoteInfo = {
          version: json.version,
          release_date: json.release_date || '',
          title: json.title || 'Atualização Oficial do Sistema',
          description: json.description || '',
          changelog: Array.isArray(json.changelog) ? json.changelog : [],
          download_url: json.download_url || 'https://github.com/jowarte/fit-app',
          source: 'github'
        };
      }
    } catch (e) {
      // Ignora erro de rede/offline
    }
  }

  // Se nenhuma fonte remota respondeu, assume a versão local
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

/**
 * Publica uma nova atualização no Supabase para que todas as cópias recebam
 */
export async function publishSystemUpdate({ version, title, description, changelog, download_url }) {
  try {
    const changelogArray = Array.isArray(changelog) 
      ? changelog 
      : changelog.split('\n').map(s => s.trim()).filter(Boolean);

    const { data, error } = await supabase
      .from('system_updates')
      .insert([{
        version: version.trim(),
        title: title.trim(),
        description: description?.trim() || '',
        changelog: changelogArray,
        download_url: download_url?.trim() || 'https://github.com/jowarte/fit-app',
        release_date: new Date().toISOString()
      }])
      .select();

    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    console.error('Erro ao publicar atualização:', err);
    return { success: false, error: err.message || 'Erro ao publicar no banco de dados' };
  }
}

/**
 * Dispara o Deploy Hook da Vercel para recompilar a cópia do cliente
 */
export async function triggerVercelDeploy(deployHookUrl) {
  if (!deployHookUrl || !deployHookUrl.startsWith('http')) {
    throw new Error('URL do Deploy Hook inválida. Configure seu webhook da Vercel nas opções abaixo.');
  }

  try {
    // Vercel aceita requisições POST com 'no-cors' se disparado do browser
    await fetch(deployHookUrl, {
      method: 'POST',
      mode: 'no-cors'
    });
    return { success: true };
  } catch (err) {
    console.error('Erro ao acionar webhook da Vercel:', err);
    throw err;
  }
}
