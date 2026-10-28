import React, { useState, useEffect } from 'react';
import { 
  Megaphone, Plus, Trash2, Edit2, Video, BookOpen, ExternalLink, 
  CheckCircle, Play, Eye, EyeOff, Lock, Unlock, Sparkles, Smartphone,
  Monitor, Check, Share2, Layers, AlertCircle, FileText
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

export function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal de criação / edição
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    category: 'anuncio', // 'anuncio' | 'ebook' | 'video' | 'aviso'
    description: '',
    mediaType: 'none', // 'none' | 'youtube' | 'facebook' | 'direct_video' | 'ebook'
    mediaUrl: '',
    videoFormat: 'vertical', // 'vertical' (9:16) | 'horizontal' (16:9) | 'square' (1:1)
    ebookDownloadUrl: '',
    ebookCoverUrl: '',
    ctaText: '',
    ctaUrl: '',
    targetPlan: 'all', // 'all' ou id do plano
    isPinned: false,
    sendPushNotification: true
  });

  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Carregar planos disponíveis
      const { data: plansData } = await supabase.from('plans').select('id, name');
      if (plansData) {
        setPlans(plansData);
      }

      // Carregar anúncios do localStorage
      const saved = localStorage.getItem('app_announcements');
      if (saved) {
        setAnnouncements(JSON.parse(saved));
      } else {
        // Exemplo inicial de boas-vindas
        const initial = [
          {
            id: 'demo-ebook-1',
            title: 'Guia Completo: Anatomia da Musculação & Nutrição',
            category: 'ebook',
            description: 'Material exclusivo para nossos alunos acelerarem os resultados e entenderem a ativação muscular correta.',
            mediaType: 'ebook',
            mediaUrl: '/midia/e-books/2026 anatomia da musculação.pdf',
            ebookDownloadUrl: '/midia/e-books/2026 anatomia da musculação.pdf',
            ebookCoverUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=600&q=80',
            videoFormat: 'vertical',
            ctaText: 'Baixar E-book Agora',
            ctaUrl: '/midia/e-books/2026 anatomia da musculação.pdf',
            targetPlan: 'all',
            isPinned: true,
            createdAt: new Date().toISOString()
          }
        ];
        setAnnouncements(initial);
        localStorage.setItem('app_announcements', JSON.stringify(initial));
      }
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      category: 'anuncio',
      description: '',
      mediaType: 'none',
      mediaUrl: '',
      videoFormat: 'vertical',
      ebookDownloadUrl: '',
      ebookCoverUrl: '',
      ctaText: '',
      ctaUrl: '',
      targetPlan: 'all',
      isPinned: false,
      sendPushNotification: true
    });
    setEditingId(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingId(item.id);
    setFormData({
      title: item.title || '',
      category: item.category || 'anuncio',
      description: item.description || '',
      mediaType: item.mediaType || 'none',
      mediaUrl: item.mediaUrl || '',
      videoFormat: item.videoFormat || 'vertical',
      ebookDownloadUrl: item.ebookDownloadUrl || '',
      ebookCoverUrl: item.ebookCoverUrl || '',
      ctaText: item.ctaText || '',
      ctaUrl: item.ctaUrl || '',
      targetPlan: item.targetPlan || 'all',
      isPinned: !!item.isPinned,
      sendPushNotification: false // Em edição normalmente não re-dispara
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este anúncio/entregável?')) return;
    const updated = announcements.filter(a => a.id !== id);
    setAnnouncements(updated);
    localStorage.setItem('app_announcements', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      return alert('Por favor, informe o título do anúncio.');
    }

    const payload = {
      ...formData,
      id: editingId || `ann-${Date.now()}`,
      createdAt: editingId ? (announcements.find(a => a.id === editingId)?.createdAt || new Date().toISOString()) : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    let updated = [];
    if (editingId) {
      updated = announcements.map(a => a.id === editingId ? payload : a);
    } else {
      updated = [payload, ...announcements];

      // Se marcou para disparar Notificação Push no Sininho
      if (formData.sendPushNotification) {
        const globalSaved = localStorage.getItem('global_notifications');
        const notifs = globalSaved ? JSON.parse(globalSaved) : [];
        const newNotif = {
          id: `notif-${Date.now()}`,
          type: formData.category === 'ebook' ? 'ebook' : 'system',
          title: `📢 ${formData.title}`,
          message: formData.description ? formData.description.slice(0, 120) + '...' : 'Confira o novo comunicado/material disponível no app!',
          date: new Date().toISOString()
        };
        const updatedNotifs = [newNotif, ...notifs];
        localStorage.setItem('global_notifications', JSON.stringify(updatedNotifs));
        
        // Sincroniza in_app_notifications
        const userSaved = localStorage.getItem('in_app_notifications');
        const userNotifs = userSaved ? JSON.parse(userSaved) : [];
        localStorage.setItem('in_app_notifications', JSON.stringify([newNotif, ...userNotifs]));
      }
    }

    setAnnouncements(updated);
    localStorage.setItem('app_announcements', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));

    setIsModalOpen(false);
    resetForm();
    alert(editingId ? 'Anúncio atualizado com sucesso!' : 'Novo anúncio publicado para os alunos!');
  };

  // Helper para renderizar embed em preview
  const renderMediaEmbed = (mediaType, mediaUrl, videoFormat) => {
    if (!mediaUrl) return null;

    let aspectRatio = '16 / 9';
    let maxHeight = '300px';

    if (videoFormat === 'vertical') {
      aspectRatio = '9 / 16';
      maxHeight = '480px';
    } else if (videoFormat === 'square') {
      aspectRatio = '1 / 1';
      maxHeight = '350px';
    }

    if (mediaType === 'youtube') {
      let videoId = '';
      if (mediaUrl.includes('youtu.be/')) {
        videoId = mediaUrl.split('youtu.be/')[1]?.split('?')[0];
      } else if (mediaUrl.includes('watch?v=')) {
        videoId = mediaUrl.split('watch?v=')[1]?.split('&')[0];
      } else if (mediaUrl.includes('shorts/')) {
        videoId = mediaUrl.split('shorts/')[1]?.split('?')[0];
      } else {
        videoId = mediaUrl;
      }

      return (
        <div style={{ width: '100%', maxWidth: videoFormat === 'vertical' ? '280px' : '100%', margin: '0 auto', borderRadius: '12px', overflow: 'hidden', aspectRatio, background: '#000' }}>
          <iframe
            src={`https://www.youtube.com/embed/${videoId}`}
            title="YouTube"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ width: '100%', height: '100%', border: 'none' }}
          />
        </div>
      );
    }

    if (mediaType === 'facebook') {
      const fbEmbedUrl = `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(mediaUrl)}&show_text=0`;
      return (
        <div style={{ width: '100%', maxWidth: videoFormat === 'vertical' ? '280px' : '100%', margin: '0 auto', borderRadius: '12px', overflow: 'hidden', aspectRatio, background: '#000' }}>
          <iframe
            src={fbEmbedUrl}
            title="Facebook Video"
            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
            allowFullScreen
            style={{ width: '100%', height: '100%', border: 'none' }}
          />
        </div>
      );
    }

    if (mediaType === 'direct_video') {
      return (
        <div style={{ width: '100%', maxWidth: videoFormat === 'vertical' ? '280px' : '100%', margin: '0 auto', borderRadius: '12px', overflow: 'hidden' }}>
          <video
            controls
            playsInline
            style={{ width: '100%', maxHeight, borderRadius: '12px', background: '#000', objectFit: 'contain' }}
            src={mediaUrl}
          >
            Seu navegador não suporta este vídeo.
          </video>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="animate-fade-in" style={{ padding: '2rem', maxWidth: '1100px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'linear-gradient(135deg, #00d2ff, #0070f3)', padding: '0.85rem', borderRadius: '14px', boxShadow: '0 4px 15px rgba(0, 210, 255, 0.3)' }}>
            <Megaphone size={30} color="#000" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.8rem' }}>Anúncios & Entregáveis</h1>
            <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
              Publique avisos, vídeos do YouTube/Facebook e entregue E-books diretamente aos seus alunos.
            </p>
          </div>
        </div>

        <button 
          onClick={handleOpenCreate}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.8rem 1.5rem', fontWeight: 'bold' }}
        >
          <Plus size={20} />
          <span>Novo Anúncio / E-book</span>
        </button>
      </div>

      {/* Grid de estatísticas rápidas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(0, 210, 255, 0.1)', padding: '0.75rem', borderRadius: '10px' }}>
            <Megaphone size={24} color="var(--primary-color)" />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Total de Publicações</span>
            <h3 style={{ margin: 0, fontSize: '1.4rem' }}>{announcements.length}</h3>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(168, 85, 247, 0.1)', padding: '0.75rem', borderRadius: '10px' }}>
            <BookOpen size={24} color="#a855f7" />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>E-books & Entregáveis</span>
            <h3 style={{ margin: 0, fontSize: '1.4rem' }}>{announcements.filter(a => a.category === 'ebook' || a.mediaType === 'ebook').length}</h3>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '0.75rem', borderRadius: '10px' }}>
            <Video size={24} color="#ef4444" />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Vídeos (YT / FB)</span>
            <h3 style={{ margin: 0, fontSize: '1.4rem' }}>{announcements.filter(a => ['youtube', 'facebook', 'direct_video'].includes(a.mediaType)).length}</h3>
          </div>
        </div>
      </div>

      {/* Lista de Anúncios */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>Carregando anúncios...</div>
      ) : announcements.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <Megaphone size={48} color="var(--primary-color)" style={{ opacity: 0.3, marginBottom: '1rem' }} />
          <h3>Nenhum anúncio publicado ainda</h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto 1.5rem auto' }}>
            Clique no botão acima para criar seu primeiro aviso, vídeo tutorial ou disponibilizar um novo e-book em PDF.
          </p>
          <button onClick={handleOpenCreate} className="btn btn-primary">
            <Plus size={18} /> Criar Primeiro Anúncio
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {announcements.map((item) => (
            <div 
              key={item.id} 
              className="glass-card"
              style={{ 
                padding: '1.5rem', 
                borderLeft: item.isPinned ? '4px solid var(--primary-color)' : '1px solid rgba(255,255,255,0.1)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                position: 'relative'
              }}
            >
              {/* Topo do Card */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  {item.isPinned && (
                    <span style={{ background: 'rgba(0, 210, 255, 0.2)', color: 'var(--primary-color)', padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                      📌 FIXADO NO TOPO
                    </span>
                  )}
                  <span style={{ 
                    background: item.category === 'ebook' ? 'rgba(168, 85, 247, 0.2)' : item.category === 'video' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255,255,255,0.1)',
                    color: item.category === 'ebook' ? '#c084fc' : item.category === 'video' ? '#f87171' : 'white',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    fontWeight: 'bold'
                  }}>
                    {item.category === 'ebook' ? '📚 E-book' : item.category === 'video' ? '🎬 Vídeo' : '📢 Comunicado'}
                  </span>
                  
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Público: <strong style={{ color: item.targetPlan === 'all' ? '#00ff88' : '#ffc107' }}>
                      {item.targetPlan === 'all' ? 'Todos os Alunos' : (plans.find(p => p.id === item.targetPlan)?.name || 'Plano Específico')}
                    </strong>
                  </span>
                </div>

                {/* Ações */}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    onClick={() => handleOpenEdit(item)} 
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer' }}
                    title="Editar"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={() => handleDelete(item.id)} 
                    style={{ background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.2)', color: '#ff4444', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer' }}
                    title="Excluir"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Título e Descrição */}
              <div>
                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem' }}>{item.title}</h3>
                {item.description && (
                  <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: 1.5, fontSize: '0.95rem', whiteSpace: 'pre-line' }}>
                    {item.description}
                  </p>
                )}
              </div>

              {/* Pré-visualização da Mídia */}
              {item.mediaType !== 'none' && item.mediaUrl && (
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {item.videoFormat === 'vertical' ? <Smartphone size={16} color="var(--primary-color)" /> : <Monitor size={16} color="var(--primary-color)" />}
                    <span>Formato configurado: {item.videoFormat === 'vertical' ? 'Vertical para Celular (9:16 Reels/Shorts)' : item.videoFormat === 'square' ? 'Quadrado (1:1)' : 'Horizontal (16:9)'}</span>
                  </div>
                  {renderMediaEmbed(item.mediaType, item.mediaUrl, item.videoFormat)}
                </div>
              )}

              {/* Card Especial de E-book */}
              {item.category === 'ebook' && (item.ebookDownloadUrl || item.ebookCoverUrl) && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  {item.ebookCoverUrl && (
                    <img 
                      src={item.ebookCoverUrl} 
                      alt="Capa do Ebook" 
                      style={{ width: '70px', height: '95px', objectFit: 'cover', borderRadius: '6px', boxShadow: '0 4px 10px rgba(0,0,0,0.5)' }} 
                    />
                  )}
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 0.25rem 0' }}>Material para Download</h4>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>PDF pronto para leitura</span>
                  </div>
                  {item.ebookDownloadUrl && (
                    <a 
                      href={item.ebookDownloadUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn btn-primary"
                      style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                    >
                      <ExternalLink size={16} /> Ver Arquivo
                    </a>
                  )}
                </div>
              )}

              {/* Botão de Chamada para Ação (CTA) se configurado */}
              {item.ctaText && item.ctaUrl && (
                <div style={{ marginTop: '0.5rem' }}>
                  <a 
                    href={item.ctaUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn btn-primary"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', textDecoration: 'none', fontWeight: 'bold' }}
                  >
                    <span>{item.ctaText}</span>
                    <ExternalLink size={16} />
                  </a>
                </div>
              )}

              <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', marginTop: '0.5rem' }}>
                Publicado em: {new Date(item.createdAt).toLocaleDateString('pt-BR')} às {new Date(item.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Criar / Editar Anúncio */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '650px', maxHeight: '90vh', overflowY: 'auto', background: 'var(--bg-dark)', border: '1px solid rgba(255,255,255,0.15)', padding: '2rem', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.4rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Megaphone size={22} color="var(--primary-color)" />
                {editingId ? 'Editar Anúncio / Entregável' : 'Criar Novo Anúncio ou Entregável'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Categoria */}
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 'bold' }}>Tipo de Conteúdo</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
                  {[
                    { id: 'anuncio', label: '📢 Anúncio / Aviso' },
                    { id: 'ebook', label: '📚 E-book / PDF' },
                    { id: 'video', label: '🎬 Vídeo Destaque' }
                  ].map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          category: cat.id,
                          mediaType: cat.id === 'ebook' ? 'ebook' : (cat.id === 'video' ? 'youtube' : prev.mediaType)
                        }));
                      }}
                      style={{
                        padding: '0.75rem',
                        borderRadius: '10px',
                        border: formData.category === cat.id ? '2px solid var(--primary-color)' : '1px solid rgba(255,255,255,0.1)',
                        background: formData.category === cat.id ? 'rgba(0, 210, 255, 0.15)' : 'rgba(255,255,255,0.03)',
                        color: formData.category === cat.id ? 'var(--primary-color)' : 'white',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                      }}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Título */}
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 'bold' }}>Título Chamativo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Novo E-book Liberado: Dieta Seca Barriga"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  style={{ width: '100%', padding: '0.85rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }}
                />
              </div>

              {/* Descrição */}
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 'bold' }}>Mensagem / Descrição do Aviso</label>
                <textarea
                  rows="3"
                  placeholder="Escreva os detalhes, orientações ou instruções para os alunos..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  style={{ width: '100%', padding: '0.85rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', resize: 'vertical' }}
                />
              </div>

              {/* Tipo de Mídia */}
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 'bold' }}>Mídia de Vídeo ou Arquivo</label>
                <select
                  value={formData.mediaType}
                  onChange={(e) => setFormData({ ...formData, mediaType: e.target.value })}
                  style={{ width: '100%', padding: '0.85rem', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'white' }}
                >
                  <option value="none" style={{ background: '#1a1a1a' }}>Sem vídeo (Apenas texto ou E-book)</option>
                  <option value="youtube" style={{ background: '#1a1a1a' }}>YouTube (Vídeo / Shorts)</option>
                  <option value="facebook" style={{ background: '#1a1a1a' }}>Facebook / Instagram Reels</option>
                  <option value="direct_video" style={{ background: '#1a1a1a' }}>Arquivo de Vídeo Direto (MP4 / WebM)</option>
                </select>
              </div>

              {/* URL do Vídeo e Formato de Celular se tiver mídia */}
              {formData.mediaType !== 'none' && (
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                      Link / URL do Vídeo ({formData.mediaType === 'youtube' ? 'YouTube' : formData.mediaType === 'facebook' ? 'Facebook / Instagram' : 'Link Direto MP4'})
                    </label>
                    <input
                      type="url"
                      placeholder={formData.mediaType === 'youtube' ? 'https://www.youtube.com/watch?v=... ou Shorts' : formData.mediaType === 'facebook' ? 'https://www.facebook.com/.../videos/...' : 'https://.../video.mp4'}
                      value={formData.mediaUrl}
                      onChange={(e) => setFormData({ ...formData, mediaUrl: e.target.value })}
                      style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 'bold' }}>
                      Formato de Reprodução para Celular
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                      {[
                        { id: 'vertical', label: '📱 Vertical (9:16)', desc: 'Reels / Shorts' },
                        { id: 'horizontal', label: '🖥️ Horizontal (16:9)', desc: 'Padrão YouTube' },
                        { id: 'square', label: '⏹️ Quadrado (1:1)', desc: 'Feed Instagram' }
                      ].map(fmt => (
                        <button
                          key={fmt.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, videoFormat: fmt.id })}
                          style={{
                            padding: '0.6rem 0.4rem',
                            borderRadius: '8px',
                            border: formData.videoFormat === fmt.id ? '2px solid var(--primary-color)' : '1px solid rgba(255,255,255,0.1)',
                            background: formData.videoFormat === fmt.id ? 'rgba(0, 210, 255, 0.15)' : 'rgba(255,255,255,0.02)',
                            color: formData.videoFormat === fmt.id ? 'var(--primary-color)' : 'white',
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            textAlign: 'center'
                          }}
                        >
                          <div><strong>{fmt.label}</strong></div>
                          <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>{fmt.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Seção E-book */}
              {formData.category === 'ebook' && (
                <div style={{ background: 'rgba(168, 85, 247, 0.05)', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(168, 85, 247, 0.2)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <h4 style={{ margin: 0, color: '#c084fc', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <BookOpen size={18} /> Configuração do E-book
                  </h4>
                  
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem' }}>Link do Arquivo PDF para Download *</label>
                    <input
                      type="text"
                      placeholder="Ex: /midia/e-books/meu-ebook.pdf ou link Google Drive / Dropbox"
                      value={formData.ebookDownloadUrl}
                      onChange={(e) => setFormData({ ...formData, ebookDownloadUrl: e.target.value })}
                      style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem' }}>Imagem da Capa (Opcional)</label>
                    <input
                      type="url"
                      placeholder="https://.../capa-ebook.jpg"
                      value={formData.ebookCoverUrl}
                      onChange={(e) => setFormData({ ...formData, ebookCoverUrl: e.target.value })}
                      style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }}
                    />
                  </div>
                </div>
              )}

              {/* Botão de Chamada para Ação (CTA) */}
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 'bold' }}>
                  Botão de Ação / Link Externo (Opcional)
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <input
                    type="text"
                    placeholder="Texto do Botão (Ex: Entrar no Grupo VIP)"
                    value={formData.ctaText}
                    onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
                    style={{ padding: '0.8rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }}
                  />
                  <input
                    type="url"
                    placeholder="Link de Destino (Ex: WhatsApp, Telegram, etc)"
                    value={formData.ctaUrl}
                    onChange={(e) => setFormData({ ...formData, ctaUrl: e.target.value })}
                    style={{ padding: '0.8rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }}
                  />
                </div>
              </div>

              {/* Exclusividade por Plano & Fixar */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 'bold' }}>Quem tem acesso?</label>
                  <select
                    value={formData.targetPlan}
                    onChange={(e) => setFormData({ ...formData, targetPlan: e.target.value })}
                    style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'white' }}
                  >
                    <option value="all" style={{ background: '#1a1a1a' }}>Todos os Alunos (Público)</option>
                    {plans.map(p => (
                      <option key={p.id} value={p.id} style={{ background: '#1a1a1a' }}>
                        Exclusivo: {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '0.5rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                    <input
                      type="checkbox"
                      checked={formData.isPinned}
                      onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
                      style={{ width: '18px', height: '18px' }}
                    />
                    <span>📌 Fixar este aviso no topo</span>
                  </label>

                  {!editingId && (
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                      <input
                        type="checkbox"
                        checked={formData.sendPushNotification}
                        onChange={(e) => setFormData({ ...formData, sendPushNotification: e.target.checked })}
                        style={{ width: '18px', height: '18px' }}
                      />
                      <span>🔔 Notificar alunos no Sininho</span>
                    </label>
                  )}
                </div>
              </div>

              {/* Botões do Rodapé */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'white', padding: '0.8rem 1.5rem', borderRadius: '8px', cursor: 'pointer' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ padding: '0.8rem 2rem', fontWeight: 'bold' }}
                >
                  {editingId ? 'Salvar Alterações' : 'Publicar Agora'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
