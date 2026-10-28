import React, { useState, useEffect } from 'react';
import { 
  Megaphone, X, BookOpen, Download, ExternalLink, Play, Lock, 
  Smartphone, Monitor, Sparkles, CheckCircle2, ChevronRight 
} from 'lucide-react';
import { supabase } from '../lib/supabase';

export function AnnouncementsModal({ isOpen, onClose }) {
  const [announcements, setAnnouncements] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'ebook' | 'video'

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) {
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
        setUserProfile(profile);
      }

      const saved = localStorage.getItem('app_announcements');
      if (saved) {
        const parsed = JSON.parse(saved);
        setAnnouncements(parsed);
      } else {
        // Fallback inicial
        setAnnouncements([
          {
            id: 'demo-ebook-1',
            title: 'Guia Completo: Anatomia da Musculação & Nutrição',
            category: 'ebook',
            description: 'Material exclusivo para nossos alunos acelerarem os resultados e entenderem a ativação muscular correta.',
            mediaType: 'ebook',
            ebookDownloadUrl: '/midia/e-books/2026 anatomia da musculação.pdf',
            ebookCoverUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=600&q=80',
            videoFormat: 'vertical',
            ctaText: 'Baixar E-book Agora',
            ctaUrl: '/midia/e-books/2026 anatomia da musculação.pdf',
            targetPlan: 'all',
            isPinned: true,
            createdAt: new Date().toISOString()
          }
        ]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  // Filtragem por plano e aba
  const filtered = announcements.filter(item => {
    // Verificação de plano
    if (item.targetPlan && item.targetPlan !== 'all') {
      const userPlan = userProfile?.plan_id || userProfile?.plan;
      if (userPlan !== item.targetPlan && userProfile?.role !== 'admin' && userProfile?.role !== 'super_admin') {
        return false;
      }
    }

    if (activeTab === 'ebook') return item.category === 'ebook';
    if (activeTab === 'video') return item.category === 'video' || ['youtube', 'facebook', 'direct_video'].includes(item.mediaType);
    return true;
  });

  // Ordenar fixados primeiro
  const sorted = [...filtered].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const renderMedia = (item) => {
    if (!item.mediaUrl) return null;

    let aspectRatio = '16 / 9';
    let maxHeight = '260px';

    if (item.videoFormat === 'vertical') {
      aspectRatio = '9 / 16';
      maxHeight = '420px';
    } else if (item.videoFormat === 'square') {
      aspectRatio = '1 / 1';
      maxHeight = '320px';
    }

    if (item.mediaType === 'youtube') {
      let videoId = '';
      if (item.mediaUrl.includes('youtu.be/')) {
        videoId = item.mediaUrl.split('youtu.be/')[1]?.split('?')[0];
      } else if (item.mediaUrl.includes('watch?v=')) {
        videoId = item.mediaUrl.split('watch?v=')[1]?.split('&')[0];
      } else if (item.mediaUrl.includes('shorts/')) {
        videoId = item.mediaUrl.split('shorts/')[1]?.split('?')[0];
      } else {
        videoId = item.mediaUrl;
      }

      return (
        <div style={{ width: '100%', maxWidth: item.videoFormat === 'vertical' ? '280px' : '100%', margin: '0 auto 1rem auto', borderRadius: '12px', overflow: 'hidden', aspectRatio, background: '#000' }}>
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?playsinline=1`}
            title={item.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ width: '100%', height: '100%', border: 'none' }}
          />
        </div>
      );
    }

    if (item.mediaType === 'facebook') {
      const fbEmbedUrl = `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(item.mediaUrl)}&show_text=0`;
      return (
        <div style={{ width: '100%', maxWidth: item.videoFormat === 'vertical' ? '280px' : '100%', margin: '0 auto 1rem auto', borderRadius: '12px', overflow: 'hidden', aspectRatio, background: '#000' }}>
          <iframe
            src={fbEmbedUrl}
            title={item.title}
            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
            allowFullScreen
            style={{ width: '100%', height: '100%', border: 'none' }}
          />
        </div>
      );
    }

    if (item.mediaType === 'direct_video') {
      return (
        <div style={{ width: '100%', maxWidth: item.videoFormat === 'vertical' ? '280px' : '100%', margin: '0 auto 1rem auto', borderRadius: '12px', overflow: 'hidden' }}>
          <video
            controls
            playsInline
            style={{ width: '100%', maxHeight, borderRadius: '12px', background: '#000', objectFit: 'contain' }}
            src={item.mediaUrl}
          >
            Seu navegador não suporta este vídeo.
          </video>
        </div>
      );
    }

    return null;
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', zIndex: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backdropFilter: 'blur(5px)' }}>
      <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '580px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-dark)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '18px', overflow: 'hidden' }}>
        
        {/* Topo / Header */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: 'rgba(0, 210, 255, 0.15)', padding: '0.5rem', borderRadius: '10px' }}>
              <Megaphone size={22} color="var(--primary-color)" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', margin: 0, fontWeight: 'bold' }}>Mural de Avisos & E-books</h2>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Materiais, atualizações e vídeos exclusivos</span>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.2rem' }}>
            <X size={24} />
          </button>
        </div>

        {/* Abas */}
        <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' }}>
          {[
            { id: 'all', label: 'Todos' },
            { id: 'ebook', label: '📚 E-books' },
            { id: 'video', label: '🎬 Vídeos' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                padding: '0.75rem',
                border: 'none',
                background: 'transparent',
                color: activeTab === tab.id ? 'var(--primary-color)' : 'var(--text-secondary)',
                fontWeight: activeTab === tab.id ? 'bold' : 'normal',
                borderBottom: activeTab === tab.id ? '2px solid var(--primary-color)' : 'none',
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Lista com scroll */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {sorted.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-secondary)' }}>
              <Megaphone size={36} style={{ opacity: 0.3, marginBottom: '0.75rem' }} />
              <p>Nenhum anúncio disponível no momento.</p>
            </div>
          ) : (
            sorted.map(item => (
              <div 
                key={item.id}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: item.isPinned ? '1px solid rgba(0, 210, 255, 0.3)' : '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '14px',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.85rem'
                }}
              >
                {/* Cabeçalho do item */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ 
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '12px',
                    background: item.isPinned ? 'rgba(0, 210, 255, 0.2)' : 'rgba(255,255,255,0.08)',
                    color: item.isPinned ? 'var(--primary-color)' : 'var(--text-secondary)'
                  }}>
                    {item.isPinned ? '📌 AVISO IMPORTANTE' : item.category === 'ebook' ? '📚 E-BOOK' : item.category === 'video' ? '🎬 VÍDEO' : '📢 COMUNICADO'}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {new Date(item.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>

                <h3 style={{ margin: 0, fontSize: '1.15rem' }}>{item.title}</h3>

                {item.description && (
                  <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5, whiteSpace: 'pre-line' }}>
                    {item.description}
                  </p>
                )}

                {/* Mídia Embutida */}
                {renderMedia(item)}

                {/* Card de Download de Ebook */}
                {item.category === 'ebook' && item.ebookDownloadUrl && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(255,255,255,0.04)', padding: '0.75rem 1rem', borderRadius: '10px' }}>
                    {item.ebookCoverUrl && (
                      <img 
                        src={item.ebookCoverUrl} 
                        alt="Capa" 
                        style={{ width: '48px', height: '65px', objectFit: 'cover', borderRadius: '6px' }} 
                      />
                    )}
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: '0 0 0.2rem 0', fontSize: '0.95rem' }}>{item.title}</h4>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Formato PDF</span>
                    </div>
                    <a
                      href={item.ebookDownloadUrl}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary"
                      style={{ padding: '0.5rem 0.85rem', fontSize: '0.85rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 'bold' }}
                    >
                      <Download size={16} /> Baixar
                    </a>
                  </div>
                )}

                {/* Botão de Chamada para Ação (CTA) */}
                {item.ctaText && item.ctaUrl && (
                  <a
                    href={item.ctaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary"
                    style={{ textAlign: 'center', padding: '0.75rem', textDecoration: 'none', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}
                  >
                    <span>{item.ctaText}</span>
                    <ExternalLink size={16} />
                  </a>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
