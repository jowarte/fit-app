export const DEFAULT_PLANS = [
  {
    id: '1', name: 'Free (Iniciante)', price: '0,00', cycle: 'Mensal', isRecommended: false,
    accessHome: false, accessGym: false, accessCreate: false, accessWhatsapp: false,
    features: ['Diário de Treino Básico']
  },
  {
    id: '2', name: 'PRO (Recomendado)', price: '29,90', cycle: 'Mensal', isRecommended: true,
    accessHome: true, accessGym: true, accessCreate: true, accessWhatsapp: true,
    features: ['Acesso Total (Casa e Academia)', 'Criação ilimitada de treinos', 'Lembretes automáticos via WhatsApp', 'Gráficos de Evolução']
  }
];

export function checkUserPermission(profile, permissionKey) {
  if (!profile) return false;

  // Se o usuário estiver bloqueado, ele não tem acesso a nada
  if (profile.status === 'blocked') return false;

  // Super Admins e Admins têm acesso a tudo
  if (profile.role === 'super_admin' || profile.role === 'admin') return true;


  // Se o usuário estiver em período de teste (trial), verificar expiração
  if (profile.status === 'trial') {
    if (profile.trial_ends_at) {
      const expired = new Date() > new Date(profile.trial_ends_at);
      if (expired) return false;
    }
  }

  // 1. Verificar override individual no perfil
  const overrideKey = `${permissionKey}_override`;
  if (profile[overrideKey] !== undefined && profile[overrideKey] !== null) {
    return profile[overrideKey];
  }
  // 2. Verificar permissões do plano associado
  if (profile.plan_id) {
    // Tenta ler planos do localStorage, caso contrário usa os padrões
    let plans = DEFAULT_PLANS;
    try {
      const saved = localStorage.getItem('admin_plans');
      if (saved) {
        plans = JSON.parse(saved);
      }
    } catch (e) {
      console.error("Erro ao carregar planos:", e);
    }

    const plan = plans.find(p => p.id === profile.plan_id);
    if (plan) {
      if (permissionKey === 'access_home') return !!plan.accessHome;
      if (permissionKey === 'access_gym') return !!plan.accessGym;
      if (permissionKey === 'access_create') return !!plan.accessCreate;
      if (permissionKey === 'access_whatsapp') return !!plan.accessWhatsapp;
      if (permissionKey === 'access_advanced') return !!plan.accessAdvanced;
    }
  }

  // 3. Fallback clássico: se for premium de legado (is_premium === true), libera tudo
  if (profile.is_premium) {
    return true;
  }

  // Para usuários gratuitos não premium sem overrides de liberação:
  // Agora o treino em casa também está bloqueado por padrão no modo free
  if (permissionKey === 'access_home') {
    return false;
  }

  return false;
}

export function applySimulator(profile) {
  if (!profile) return profile;
  
  const simPlanId = localStorage.getItem('simulated_plan_id');
  if (!simPlanId) return profile;

  const simProfile = { ...profile };
  simProfile.is_admin = false; // To simulate normal user
  simProfile.role = 'user'; // Override role so admin check is bypassed in simulator
  simProfile.plan_id = simPlanId;
  
  let plans = DEFAULT_PLANS;
  try {
    const saved = localStorage.getItem('admin_plans');
    if (saved) plans = JSON.parse(saved);
  } catch (e) {}

  const plan = plans.find(p => p.id === simPlanId);
  if (plan) {
    // Copiar permissões do plano diretamente como overrides no perfil simulado
    // para que checkUserPermission funcione sem precisar re-buscar o plano
    simProfile.access_home_override = !!plan.accessHome;
    simProfile.access_gym_override = !!plan.accessGym;
    simProfile.access_create_override = !!plan.accessCreate;
    simProfile.access_whatsapp_override = !!plan.accessWhatsapp;
    simProfile.access_advanced_override = !!plan.accessAdvanced;

    if (plan.isTrial) {
      simProfile.status = 'trial';
      const endsAt = new Date();
      endsAt.setDate(endsAt.getDate() + (plan.trialDays === 'custom' || !plan.trialDays ? 7 : plan.trialDays));
      simProfile.trial_ends_at = endsAt.toISOString();
    } else {
      simProfile.status = 'active';
      simProfile.is_premium = true;
    }
  }

  return simProfile;
}
