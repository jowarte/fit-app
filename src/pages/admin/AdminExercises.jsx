import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Folder, ArrowLeft, Film, Image as ImageIcon, Video, Trash2, Edit2, Plus, Search, Filter, Eye, EyeOff, Lock, Clock, Settings as SettingsIcon, X } from 'lucide-react';

export function AdminExercises() {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Folder navigation state
  const [selectedFolder, setSelectedFolder] = useState(null);
  
  // Folder Settings Modal
  const [folderSettingsModal, setFolderSettingsModal] = useState(null);
  const [folderFormData, setFolderFormData] = useState({
    isHidden: false,
    is_premium: false,
    release_date: ''
  });
  const [mediaFilter, setMediaFilter] = useState('Todos'); // Filtro interno da pasta: 'Todos', 'GIF / Imagem', 'Vídeo'

  // Filtros globais (pastas)
  const [globalSearch, setGlobalSearch] = useState('');
  const [globalGender, setGlobalGender] = useState('Todos'); // 'Todos', 'Homem', 'Mulher'
  const [globalMedia, setGlobalMedia] = useState('Todos'); // 'Todos', 'Vídeo', 'GIF'

  // Form state for new/edit
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    name: '',
    description: '',
    muscle_group: '',
    media_url: '',
    media_type: 'local_video',
    target_gender: 'Ambos',
    is_premium: false,
    release_date: ''
  });

  useEffect(() => {
    fetchExercises();
  }, []);

  async function fetchExercises() {
    setLoading(true);
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
    } catch (error) {
      console.error('Error fetching exercises', error);
    }
    setLoading(false);
  }

  function handleEdit(ex) {
    setFormData(ex);
    setIsEditing(true);
  }

  function handleCancel() {
    setFormData({ id: null, name: '', description: '', muscle_group: selectedFolder || '', media_url: '', media_type: 'local_video', target_gender: 'Ambos', is_premium: false, release_date: '' });
    setIsEditing(false);
  }

  function handleNewExercise() {
    setFormData({ id: null, name: '', description: '', muscle_group: selectedFolder || '', media_url: '', media_type: 'local_video', target_gender: 'Ambos', is_premium: false, release_date: '' });
    setIsEditing(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    if (formData.id) {
      const { id, ...updates } = formData;
      const { error } = await supabase.from('exercises').update(updates).eq('id', id);
      if (!error) {
        fetchExercises();
        setIsEditing(false);
      } else {
        alert('Erro ao atualizar exercício');
      }
    } else {
      const { id, ...inserts } = formData;
      const { error } = await supabase.from('exercises').insert([inserts]);
      if (!error) {
        fetchExercises();
        setIsEditing(false);
      } else {
        alert('Erro ao criar exercício');
      }
    }
  }

  async function handleDelete(id) {
    if (window.confirm('Tem certeza que deseja deletar este exercício?')) {
      const { error } = await supabase.from('exercises').delete().eq('id', id);
      if (!error) {
        fetchExercises();
      } else {
        alert('Erro ao deletar exercício');
      }
    }
  }

  const folderMetas = exercises.filter(ex => ex.name === '_FOLDER_META_');
  const realExercises = exercises.filter(ex => ex.name !== '_FOLDER_BLOCKED_' && ex.name !== '_FOLDER_META_');

  const uniqueCategories = [...new Set(exercises.map(ex => ex.muscle_group).filter(Boolean))].sort();

  function openFolderSettings(e, cat) {
    e.stopPropagation();
    const meta = folderMetas.find(m => m.muscle_group === cat);
    setFolderFormData({
      isHidden: meta ? meta.media_type === 'hidden' : false,
      is_premium: meta ? meta.is_premium : false,
      release_date: meta && meta.release_date ? meta.release_date : ''
    });
    setFolderSettingsModal(cat);
  }

  async function saveFolderSettings(e) {
    e.preventDefault();
    const cat = folderSettingsModal;
    const meta = folderMetas.find(m => m.muscle_group === cat);
    
    const payload = {
      name: '_FOLDER_META_',
      muscle_group: cat,
      media_type: folderFormData.isHidden ? 'hidden' : 'local_video',
      is_premium: folderFormData.is_premium,
      release_date: folderFormData.release_date || null
    };

    if (meta) {
      await supabase.from('exercises').update(payload).eq('id', meta.id);
    } else {
      await supabase.from('exercises').insert([payload]);
    }
    
    setFolderSettingsModal(null);
    fetchExercises();
  }

  // Filtragem das Pastas (Visão Global)
  const filteredCategories = uniqueCategories.filter(cat => {
    if (globalSearch && !cat.toLowerCase().includes(globalSearch.toLowerCase())) return false;
    
    let catExs = exercises.filter(ex => ex.muscle_group === cat);
    if (globalGender !== 'Todos') {
       catExs = catExs.filter(ex => !ex.target_gender || ex.target_gender === 'Ambos' || ex.target_gender === globalGender);
       if (catExs.length === 0) return false;
    }
    if (globalMedia !== 'Todos') {
       catExs = catExs.filter(ex => {
          if (globalMedia === 'GIF') return ex.media_type === 'gif';
          return ex.media_type === 'local_video' || ex.media_type === 'youtube';
       });
       if (catExs.length === 0) return false;
    }
    return true;
  });

  // Filtragem dos exercícios de uma pasta específica
  let currentExercises = [];
  if (selectedFolder) {
    currentExercises = realExercises.filter(ex => ex.muscle_group === selectedFolder);
    if (mediaFilter !== 'Todos') {
      currentExercises = currentExercises.filter(ex => {
        if (mediaFilter === 'GIF / Imagem') return ex.media_type === 'gif';
        if (mediaFilter === 'Vídeo') return ex.media_type === 'local_video' || ex.media_type === 'youtube';
        return true;
      });
    }
  }

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {selectedFolder && !isEditing && (
            <button 
              onClick={() => { setSelectedFolder(null); setMediaFilter('Todos'); }}
              style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '0.5rem', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <ArrowLeft size={20} />
            </button>
          )}
          <h1 style={{ margin: 0 }}>
            {selectedFolder ? `Pasta: ${selectedFolder}` : 'Pastas de Exercícios'}
          </h1>
        </div>
        
        {!isEditing && (
          <button className="btn btn-primary" onClick={handleNewExercise} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plus size={18} /> Novo Exercício
          </button>
        )}
      </div>

      {isEditing && (
        <div className="glass-card" style={{ marginBottom: '2rem' }}>
          <h3>{formData.id ? 'Editar Exercício' : 'Novo Exercício'}</h3>
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
            <div>
              <label>Categoria (Pasta)</label>
              <input 
                type="text" 
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                value={formData.muscle_group}
                onChange={e => setFormData({...formData, muscle_group: e.target.value})}
              />
            </div>

            <div>
              <label>Nome do Exercício</label>
              <input 
                type="text" 
                required
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>

            <div>
              <label>URL da Mídia (Vídeo/Imagem)</label>
              <input 
                type="text" 
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                value={formData.media_url}
                onChange={e => setFormData({...formData, media_url: e.target.value})}
              />
            </div>
            
            <div>
              <label>Tipo de Mídia</label>
              <select 
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                value={formData.media_type}
                onChange={e => setFormData({...formData, media_type: e.target.value})}
              >
                <option value="local_video">Vídeo Local</option>
                <option value="youtube">YouTube</option>
                <option value="gif">GIF / Imagem</option>
              </select>
            </div>

            <div>
              <label>Público-Alvo</label>
              <select 
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                value={formData.target_gender}
                onChange={e => setFormData({...formData, target_gender: e.target.value})}
              >
                <option value="Ambos">Ambos</option>
                <option value="Homem">Homem</option>
                <option value="Mulher">Mulher</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <input 
                type="checkbox" 
                id="is_premium"
                checked={formData.is_premium}
                onChange={e => setFormData({...formData, is_premium: e.target.checked})}
                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
              />
              <label htmlFor="is_premium" style={{ cursor: 'pointer', color: 'var(--primary-color)', fontWeight: 'bold' }}>Conteúdo Premium (Exige Assinatura)</label>
            </div>

            <div>
              <label>Data de Liberação (Deixe em branco para publicar imediatamente)</label>
              <input 
                type="datetime-local" 
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                value={formData.release_date || ''}
                onChange={e => setFormData({...formData, release_date: e.target.value})}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button type="submit" className="btn btn-primary">Salvar</button>
              <button type="button" className="btn" style={{ background: 'rgba(255,255,255,0.1)' }} onClick={handleCancel}>Cancelar</button>
            </div>
          </form>
        </div>
      )}

      {!isEditing && loading ? (
        <div style={{ padding: '2rem', textAlign: 'center' }}>Carregando...</div>
      ) : !isEditing && !selectedFolder ? (
        /* VISÃO DE PASTAS */
        <>
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

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem' }}>
            {filteredCategories.map(cat => {
              const meta = folderMetas.find(m => m.muscle_group === cat);
              const isHidden = meta?.media_type === 'hidden';
              const isPremium = meta?.is_premium;
              const isScheduled = meta?.release_date && new Date(meta.release_date) > new Date();
              
              let exCount = realExercises.filter(ex => ex.muscle_group === cat);
              if (globalGender !== 'Todos') {
                exCount = exCount.filter(ex => !ex.target_gender || ex.target_gender === 'Ambos' || ex.target_gender === globalGender);
              }
              if (globalMedia !== 'Todos') {
                exCount = exCount.filter(ex => {
                  if (globalMedia === 'GIF') return ex.media_type === 'gif';
                  return ex.media_type === 'local_video' || ex.media_type === 'youtube';
                });
              }

              return (
                <div 
                  key={cat}
                  onClick={() => setSelectedFolder(cat)}
                  className="glass-card"
                  style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    padding: '2rem 1rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    border: isHidden ? '1px solid #ff4444' : isPremium ? '1px solid #ffc107' : '1px solid rgba(255,255,255,0.05)',
                    gap: '0.5rem',
                    position: 'relative',
                    opacity: isHidden ? 0.6 : 1
                  }}
                  onMouseOver={e => e.currentTarget.style.transform = 'translateY(-5px)'}
                  onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <div style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', gap: '5px' }}>
                    {isPremium && <Lock size={16} color="#ffc107" />}
                    {isScheduled && <Clock size={16} color="#2196f3" />}
                  </div>
                  <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                    <button 
                      onClick={(e) => openFolderSettings(e, cat)}
                      title="Configurações da Pasta"
                      style={{ background: 'rgba(0,0,0,0.5)', border: 'none', padding: '0.4rem', borderRadius: '50%', color: 'white', cursor: 'pointer', display: 'flex' }}
                    >
                      <SettingsIcon size={16} />
                    </button>
                  </div>
                  <Folder size={48} color={isHidden ? "#ff4444" : isPremium ? "#ffc107" : "var(--primary-color)"} />
                  <span style={{ fontWeight: '600', textAlign: 'center', marginTop: '0.5rem' }}>{cat}</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{exCount.length} arquivos</span>
                </div>
              );
            })}
          </div>
          {filteredCategories.length === 0 && (
             <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-secondary)' }}>
               Nenhuma pasta encontrada.
             </div>
          )}
        </>
      ) : !isEditing && selectedFolder ? (
        /* VISÃO DENTRO DA PASTA */
        <div className="glass-card" style={{ padding: '0' }}>
          <div style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <label style={{ color: 'var(--text-secondary)' }}>Filtro de Mídia:</label>
              <select 
                value={mediaFilter}
                onChange={e => setMediaFilter(e.target.value)}
                style={{ padding: '0.5rem', borderRadius: '8px', background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', color: 'white', minWidth: '150px' }}
              >
                <option value="Todos">Todos</option>
                <option value="Vídeo">Apenas Vídeos</option>
                <option value="GIF / Imagem">Apenas GIFs / Imagens</option>
              </select>
            </div>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              {currentExercises.length} exercícios encontrados
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.5rem', padding: '1.5rem' }}>
            {currentExercises.map(ex => {
              const isVideo = ex.media_type === 'local_video';
              return (
                <div key={ex.id} style={{ 
                  background: 'rgba(255,255,255,0.02)', 
                  border: '1px solid rgba(255,255,255,0.05)', 
                  borderRadius: '12px', 
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                }}
                onMouseOver={e => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.3)';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}>
                  <div style={{ height: '160px', width: '100%', background: '#0a0a0a', position: 'relative' }}>
                    {ex.media_type === 'gif' ? (
                      <img src={ex.media_url} alt={ex.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                    ) : isVideo ? (
                      <video 
                        src={ex.media_url} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        muted loop playsInline 
                        onMouseOver={e => e.target.play()} 
                        onMouseOut={e => e.target.pause()} 
                      />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Film size={32} color="var(--primary-color)" opacity={0.5} />
                      </div>
                    )}
                    {/* Premium / Schedule Icons */}
                    <div style={{ position: 'absolute', top: '0.5rem', left: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                      {ex.is_premium && (
                        <div title="Premium" style={{ background: 'rgba(255,193,7,0.2)', padding: '0.3rem', borderRadius: '50%', display: 'flex', border: '1px solid #ffc107', color: '#ffc107' }}>
                          <Lock size={14} />
                        </div>
                      )}
                      {ex.release_date && new Date(ex.release_date) > new Date() && (
                        <div title={`Agendado para ${new Date(ex.release_date).toLocaleString()}`} style={{ background: 'rgba(33,150,243,0.2)', padding: '0.3rem', borderRadius: '50%', display: 'flex', border: '1px solid #2196f3', color: '#2196f3' }}>
                          <Clock size={14} />
                        </div>
                      )}
                    </div>
                    
                    {/* Botões de Ação na Miniatura */}
                    <div style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleEdit(ex); }}
                        title="Editar"
                        style={{ background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.5rem', borderRadius: '50%', color: 'var(--primary-color)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <Edit2 size={14} />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDelete(ex.id); }}
                        title="Excluir"
                        style={{ background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.5rem', borderRadius: '50%', color: '#ff4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  
                  <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <h4 style={{ margin: 0, fontSize: '1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: '500' }} title={ex.name}>
                      {ex.name}
                    </h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.05)', padding: '0.2rem 0.6rem', borderRadius: '12px' }}>
                        {ex.media_type === 'gif' ? 'GIF / Imagem' : ex.media_type === 'youtube' ? 'YouTube' : 'Vídeo Local'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {currentExercises.length === 0 && (
              <div style={{ gridColumn: '1 / -1', padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                Nenhuma mídia encontrada com esse filtro.
              </div>
            )}
          </div>

          {/* Folder Settings Modal Overlay */}
          {folderSettingsModal && (
            <div style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <div className="glass-card" style={{ width: '90%', maxWidth: '400px', padding: '2rem', position: 'relative' }}>
                <button 
                  onClick={() => setFolderSettingsModal(null)}
                  style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}
                >
                  <X size={24} />
                </button>
                <h3 style={{ marginBottom: '1.5rem' }}>Configurações: {folderSettingsModal}</h3>
                
                <form onSubmit={saveFolderSettings} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <input 
                      type="checkbox" 
                      id="meta_hidden"
                      checked={folderFormData.isHidden}
                      onChange={e => setFolderFormData({...folderFormData, isHidden: e.target.checked})}
                      style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                    />
                    <label htmlFor="meta_hidden" style={{ cursor: 'pointer', color: '#ff4444', fontWeight: 'bold' }}>
                      <EyeOff size={16} style={{ verticalAlign: 'middle', marginRight: '5px' }} />
                      Ocultar Pasta (Invisível no App)
                    </label>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <input 
                      type="checkbox" 
                      id="meta_premium"
                      checked={folderFormData.is_premium}
                      onChange={e => setFolderFormData({...folderFormData, is_premium: e.target.checked})}
                      style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                    />
                    <label htmlFor="meta_premium" style={{ cursor: 'pointer', color: '#ffc107', fontWeight: 'bold' }}>
                      <Lock size={16} style={{ verticalAlign: 'middle', marginRight: '5px' }} />
                      Bloqueio Premium
                    </label>
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#2196f3', fontWeight: 'bold' }}>
                      <Clock size={16} style={{ verticalAlign: 'middle', marginRight: '5px' }} />
                      Agendar Liberação da Pasta
                    </label>
                    <input 
                      type="datetime-local" 
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                      value={folderFormData.release_date || ''}
                      onChange={e => setFolderFormData({...folderFormData, release_date: e.target.value})}
                    />
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                    Salvar Configurações
                  </button>
                </form>
              </div>
            </div>
          )}

        </div>
      ) : null}
    </div>
  );
}
