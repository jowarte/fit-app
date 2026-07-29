import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Search, Folder, LayoutGrid, Filter, Lock } from 'lucide-react';
import { VideoPlayer } from '../components/VideoPlayer';
import { useNavigate } from 'react-router-dom';
import { checkUserPermission, applySimulator } from '../lib/permissions';

export function CategoriesPage() {
  const navigate = useNavigate();
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Filtros Globais para as Pastas
  const [globalSearch, setGlobalSearch] = useState('');
  const [globalGender, setGlobalGender] = useState('Todos'); // 'Todos', 'Homem', 'Mulher'
  const [globalMedia, setGlobalMedia] = useState('Todos'); // 'Todos', 'Vídeo', 'GIF'

  useEffect(() => {
    async function fetchExercisesAndProfile() {
      try {
        let allData = [];
        let from = 0;
        const step = 1000;
        while (true) {
          const { data, error } = await supabase.from('exercises').select('*').order('name').range(from, from + step - 1);
          if (error) throw error;
          if (!data || data.length === 0) break;
          allData = allData.concat(data);
          from += step;
          if (data.length < step) break;
        }
        setExercises(allData);
      } catch (err) {
        console.error('Error fetching exercises', err);
      }

      // Buscar Sessão e Perfil
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) {
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
        setUserProfile(applySimulator(profile));
      }

      setLoading(false);
    }
    fetchExercisesAndProfile();
  }, []);

  // Identifica metas de pastas e exercícios reais
  const now = new Date();
  const folderMetas = exercises.filter(ex => ex.name === '_FOLDER_META_');
  const blockedFolders = exercises.filter(ex => ex.name === '_FOLDER_BLOCKED_').map(ex => ex.muscle_group); // legacy
  const realExercises = exercises.filter(ex => {
    if (ex.name === '_FOLDER_BLOCKED_' || ex.name === '_FOLDER_META_') return false;
    if (ex.release_date && new Date(ex.release_date) > now) return false;
    return true;
  });

  const uniqueCategories = [...new Set(realExercises.map(ex => ex.muscle_group).filter(Boolean))].sort();

  if (loading) {
    return <div className="container" style={{ paddingTop: '2rem', textAlign: 'center' }}>Carregando biblioteca...</div>;
  }

  // Visualizando todas as categorias
  if (!selectedCategory) {
    
    const filteredCategories = uniqueCategories.filter(cat => {
      // Verifica regras do meta da pasta
      const meta = folderMetas.find(m => m.muscle_group === cat);
      if (meta) {
        if (meta.media_type === 'hidden') return false;
        if (meta.release_date && new Date(meta.release_date) > now) return false;
      }
      // Remove pastas bloqueadas (legacy)
      if (blockedFolders.includes(cat)) {
        return false;
      }

      if (globalSearch && !cat.toLowerCase().includes(globalSearch.toLowerCase())) {
        return false;
      }
      
      let catExs = realExercises.filter(ex => ex.muscle_group === cat);
      
      // Filtro de Gênero
      if (globalGender !== 'Todos') {
         catExs = catExs.filter(ex => !ex.target_gender || ex.target_gender === 'Ambos' || ex.target_gender === globalGender);
         if (catExs.length === 0) return false;
      }
  
      // Filtro de Mídia
      if (globalMedia !== 'Todos') {
         catExs = catExs.filter(ex => {
            if (globalMedia === 'GIF') return ex.media_type === 'gif';
            if (globalMedia === 'Vídeo') return ex.media_type === 'local_video' || ex.media_type === 'youtube';
            return true;
         });
         if (catExs.length === 0) return false;
      }
  
      return true;
    });

    return (
      <div className="container animate-fade-in" style={{ paddingTop: '2rem', paddingBottom: '6rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <LayoutGrid color="var(--primary-color)" size={28} />
          <h2 style={{ margin: 0 }}>Categorias de Treinos</h2>
        </div>

        <div className="glass-card" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
          
          <div style={{ position: 'relative', marginBottom: '1rem' }}>
            <Search size={20} color="var(--text-secondary)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              placeholder="Buscar pasta..."
              value={globalSearch}
              onChange={e => setGlobalSearch(e.target.value)}
              style={{ 
                width: '100%', padding: '0.8rem 1rem 0.8rem 3rem', 
                borderRadius: '8px', background: 'rgba(255,255,255,0.05)', 
                border: '1px solid rgba(255,255,255,0.1)', color: 'white'
              }}
            />
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Filter size={18} color="var(--text-secondary)" />
              <label style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Público:</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {['Todos', 'Homem', 'Mulher'].map(opt => (
                  <button 
                    key={opt}
                    onClick={() => setGlobalGender(opt)}
                    style={{
                      background: globalGender === opt ? 'var(--primary-color)' : 'rgba(255,255,255,0.05)',
                      color: globalGender === opt ? 'black' : 'white',
                      border: '1px solid ' + (globalGender === opt ? 'var(--primary-color)' : 'rgba(255,255,255,0.1)'),
                      padding: '0.4rem 0.8rem', borderRadius: '20px', cursor: 'pointer', fontSize: '0.85rem'
                    }}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.2)' }}></div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <label style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Mídia:</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {['Todos', 'Vídeo', 'GIF'].map(opt => (
                  <button 
                    key={opt}
                    onClick={() => setGlobalMedia(opt)}
                    style={{
                      background: globalMedia === opt ? 'var(--primary-color)' : 'rgba(255,255,255,0.05)',
                      color: globalMedia === opt ? 'black' : 'white',
                      border: '1px solid ' + (globalMedia === opt ? 'var(--primary-color)' : 'rgba(255,255,255,0.1)'),
                      padding: '0.4rem 0.8rem', borderRadius: '20px', cursor: 'pointer', fontSize: '0.85rem'
                    }}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem' }}>
          {filteredCategories.map(cat => {
            // Count matching exercises inside
            let exCount = exercises.filter(ex => ex.muscle_group === cat);
            if (globalGender !== 'Todos') {
              exCount = exCount.filter(ex => !ex.target_gender || ex.target_gender === 'Ambos' || ex.target_gender === globalGender);
            }
            if (globalMedia !== 'Todos') {
              exCount = exCount.filter(ex => {
                if (globalMedia === 'GIF') return ex.media_type === 'gif';
                return ex.media_type === 'local_video' || ex.media_type === 'youtube';
              });
            }

            const meta = folderMetas.find(m => m.muscle_group === cat);
            const isHome = cat === 'Treino em Casa';
            const isLocked = isHome ? !checkUserPermission(userProfile, 'access_home') : !checkUserPermission(userProfile, 'access_gym');
            
            return (
              <div 
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className="glass-card"
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  padding: '2rem 1rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  border: '1px solid rgba(255,255,255,0.05)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <div style={{ 
                  position: 'absolute', top: '-10px', right: '-10px', 
                  width: '60px', height: '60px', 
                  background: 'var(--primary-color)', opacity: '0.1', 
                  borderRadius: '50%' 
                }}></div>
                <div style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', gap: '5px' }}>
                  {(isLocked || meta?.is_premium) && <Lock size={16} color="#ffc107" />}
                </div>
                <Folder size={40} color={isLocked || meta?.is_premium ? "#ffc107" : "var(--primary-color)"} style={{ marginBottom: '0.5rem' }} />
                <span style={{ fontWeight: '600', fontSize: '1.1rem', textAlign: 'center', color: 'white' }}>{cat}</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                  {exCount.length} exercícios
                </span>
              </div>
            );
          })}
        </div>
        
        {filteredCategories.length === 0 && (
           <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-secondary)' }}>
             Nenhuma categoria encontrada com esses filtros.
           </div>
        )}
      </div>
    );
  }

  // Visualizando exercícios de uma categoria
  let categoryExercises = realExercises.filter(ex => ex.muscle_group === selectedCategory);
  const catMeta = folderMetas.find(m => m.muscle_group === selectedCategory);
  
  if (searchQuery) {
    categoryExercises = categoryExercises.filter(ex => ex.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }
  if (globalGender !== 'Todos') {
    categoryExercises = categoryExercises.filter(ex => !ex.target_gender || ex.target_gender === 'Ambos' || ex.target_gender === globalGender);
  }
  if (globalMedia !== 'Todos') {
    categoryExercises = categoryExercises.filter(ex => {
      if (globalMedia === 'GIF') return ex.media_type === 'gif';
      return ex.media_type === 'local_video' || ex.media_type === 'youtube';
    });
  }

  return (
    <div className="container animate-fade-in" style={{ paddingTop: '2rem', paddingBottom: '6rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <button 
          onClick={() => { setSelectedCategory(null); setSearchQuery(''); }}
          style={{ 
            background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', 
            padding: '0.5rem', borderRadius: '50%', cursor: 'pointer', 
            display: 'flex', alignItems: 'center', justifyContent: 'center' 
          }}
        >
          <ArrowLeft size={24} />
        </button>
        <h2 style={{ margin: 0 }}>{selectedCategory}</h2>
      </div>

      <div style={{ position: 'relative', marginBottom: '2rem' }}>
        <Search size={20} color="var(--text-secondary)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
        <input 
          type="text" 
          placeholder={`Buscar em ${selectedCategory}...`}
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          style={{ 
            width: '100%', padding: '1rem 1rem 1rem 3rem', 
            borderRadius: '12px', background: 'rgba(255,255,255,0.05)', 
            border: '1px solid rgba(255,255,255,0.1)', color: 'white',
            fontSize: '1rem'
          }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {categoryExercises.map(ex => {
          const isHome = selectedCategory === 'Treino em Casa';
          const hasCategoryAccess = isHome ? checkUserPermission(userProfile, 'access_home') : checkUserPermission(userProfile, 'access_gym');
          const isPremiumUser = userProfile?.is_premium === true;
          // Se o exercício é premium OU se a pasta inteira é premium OU se o usuário não tem acesso à categoria
          const isLocked = !hasCategoryAccess || ((ex.is_premium || catMeta?.is_premium) && !isPremiumUser); 
          
          return (
            <div key={ex.id} className="glass-card" style={{ padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
              <h3 style={{ marginBottom: '1rem', color: isLocked ? 'var(--text-secondary)' : 'var(--primary-color)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {isLocked && <Lock size={18} color="#ffc107" />}
                {ex.name}
              </h3>
              
              <div style={{ position: 'relative' }}>
                <div style={{ filter: isLocked ? 'blur(10px)' : 'none', transition: 'filter 0.3s', pointerEvents: isLocked ? 'none' : 'auto', userSelect: isLocked ? 'none' : 'auto' }}>
                  <VideoPlayer 
                    type={ex.media_type} 
                    url={ex.media_url} 
                    title="" 
                  />
                </div>
                
                {isLocked && (
                  <div style={{ 
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, 
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    background: 'rgba(0,0,0,0.4)', borderRadius: '12px', zIndex: 10
                  }}>
                    <Lock size={48} color="#ffc107" style={{ marginBottom: '1rem' }} />
                    <h3 style={{ margin: '0 0 0.5rem 0', color: 'white', textAlign: 'center', fontSize: '1.1rem' }}>
                      {userProfile?.status === 'trial' ? 'Indisponível no Teste' : 'Conteúdo Exclusivo Pro'}
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', textAlign: 'center', maxWidth: '85%', marginBottom: '1rem', marginTop: 0 }}>
                      {userProfile?.status === 'trial' 
                        ? 'Essa funcionalidade não está inclusa no seu período de teste. Assine um plano para liberar!' 
                        : 'Acesse essa categoria assinando um de nossos planos.'}
                    </p>
                    <button 
                      className="btn btn-primary" 
                      onClick={() => {
                        // Verifica se está logado
                        supabase.auth.getSession().then(({ data }) => {
                          if (!data.session) {
                            alert('Você precisa criar uma conta primeiro para vincular o seu acesso Premium!');
                            navigate('/login');
                          } else {
                            // Link do Checkout do Cakto
                            navigate('/planos');
                          }
                        });
                      }}
                    >
                      Desbloquear Agora
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        
        {categoryExercises.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-secondary)' }}>
            Nenhum exercício encontrado.
          </div>
        )}
      </div>
    </div>
  );
}
