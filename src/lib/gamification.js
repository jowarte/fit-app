// Lógica central de Gamificação do TreinoApp

export function pushNotification(type, title, message) {
  try {
    const notifs = JSON.parse(localStorage.getItem('in_app_notifications') || '[]');
    notifs.push({
      id: Date.now() + Math.random(),
      type,
      title,
      message,
      read: false,
      date: new Date().toISOString()
    });
    localStorage.setItem('in_app_notifications', JSON.stringify(notifs));
    window.dispatchEvent(new Event('storage'));
  } catch (e) {
    console.error("Erro ao enviar notificação", e);
  }
}

export const BADGES = [
  { id: 'first_step', name: 'O Primeiro Passo', description: 'Concluiu o primeiro treino.', icon: '🏅' },
  { id: 'dedication_5', name: 'Foco Inicial', description: 'Concluiu 5 treinos no total.', icon: '🔥' },
  { id: 'dedication_10', name: 'Máquina', description: 'Concluiu 10 treinos no total.', icon: '⚡' },
  { id: 'weekend_warrior', name: 'Guerreiro de FDS', description: 'Treinou em um Sábado ou Domingo.', icon: '⚔️' },
];

export const RANKS = [
  { minLevel: 1, name: 'Iniciante', color: '#A0AEC0' },
  { minLevel: 5, name: 'Atleta', color: '#48BB78' },
  { minLevel: 10, name: 'Mutante', color: '#ECC94B' },
  { minLevel: 20, name: 'Lenda', color: '#9F7AEA' },
];

export function getRankForLevel(level) {
  let currentRank = RANKS[0];
  for (const rank of RANKS) {
    if (level >= rank.minLevel) {
      currentRank = rank;
    }
  }
  return currentRank;
}

export function getLevelData(totalXP) {
  // Fórmula: Level = floor(sqrt(XP / 50)) + 1
  // XP para o nível L: (L - 1)^2 * 50
  
  if (totalXP < 0) totalXP = 0;
  
  const currentLevel = Math.floor(Math.sqrt(totalXP / 50)) + 1;
  const xpForCurrentLevel = Math.pow(currentLevel - 1, 2) * 50;
  const xpForNextLevel = Math.pow(currentLevel, 2) * 50;
  
  const progressInLevel = totalXP - xpForCurrentLevel;
  const xpNeededForNext = xpForNextLevel - xpForCurrentLevel;
  const progressPercentage = (progressInLevel / xpNeededForNext) * 100;

  return {
    level: currentLevel,
    currentXP: totalXP,
    nextLevelXP: xpForNextLevel,
    progressPercentage: Math.min(100, Math.max(0, progressPercentage)),
    rank: getRankForLevel(currentLevel)
  };
}

export function getGamificationState() {
  const state = localStorage.getItem('gamification_state');
  if (state) {
    return JSON.parse(state);
  }
  return {
    totalXP: 0,
    totalWorkouts: 0,
    unlockedBadges: [],
    lastWorkoutDate: null,
  };
}

export function saveGamificationState(state) {
  localStorage.setItem('gamification_state', JSON.stringify(state));
}

// Processa a conclusão de um treino e retorna as novidades (novo nível, novas medalhas)
export function processWorkoutCompletion(workoutDateString) {
  const state = getGamificationState();
  const oldLevelData = getLevelData(state.totalXP);
  
  let xpGained = 100; // XP base por treino
  const newlyUnlockedBadges = [];
  
  // Atualiza contadores
  state.totalWorkouts += 1;
  state.lastWorkoutDate = workoutDateString;
  state.totalXP += xpGained;

  // Checar Medalhas
  const checkBadge = (badgeId) => {
    if (!state.unlockedBadges.includes(badgeId)) {
      state.unlockedBadges.push(badgeId);
      newlyUnlockedBadges.push(BADGES.find(b => b.id === badgeId));
    }
  };

  if (state.totalWorkouts >= 1) checkBadge('first_step');
  if (state.totalWorkouts >= 5) checkBadge('dedication_5');
  if (state.totalWorkouts >= 10) checkBadge('dedication_10');
  
  const dateObj = new Date(workoutDateString);
  const dayOfWeek = dateObj.getDay();
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    checkBadge('weekend_warrior');
  }

  saveGamificationState(state);

  const newLevelData = getLevelData(state.totalXP);
  const leveledUp = newLevelData.level > oldLevelData.level;

  if (leveledUp) {
    pushNotification('system', `Subiu de Nível!`, `Parabéns, você alcançou o nível ${newLevelData.level} (${newLevelData.rank.name})!`);
  }

  newlyUnlockedBadges.forEach(badge => {
    pushNotification('achievement', `Nova Conquista: ${badge.name}`, badge.description);
  });

  return {
    xpGained,
    newlyUnlockedBadges,
    leveledUp,
    newLevel: newLevelData.level,
    newRank: newLevelData.rank
  };
}
