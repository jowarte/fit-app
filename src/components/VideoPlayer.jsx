import React from 'react';

export function VideoPlayer({ url, type, title }) {
  // type pode ser 'youtube', 'local_video', ou 'gif'
  
  if (!url) return <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>Mídia não encontrada</div>;

  const renderMedia = () => {
    if (type === 'youtube') {
      // Extrair o ID do vídeo do YouTube para colocar no iframe
      // Suporta urls do tipo watch?v=ID ou youtu.be/ID
      let videoId = '';
      try {
        if (url.includes('youtu.be/')) {
          videoId = url.split('youtu.be/')[1].split('?')[0];
        } else if (url.includes('watch?v=')) {
          videoId = url.split('watch?v=')[1].split('&')[0];
        }
      } catch(e) {
        console.error("Erro ao ler URL do youtube", e);
      }

      return (
        <iframe 
          width="100%" 
          height="100%" 
          src={`https://www.youtube.com/embed/${videoId}?loop=1&playlist=${videoId}`} 
          title={title || "YouTube video player"} 
          frameBorder="0" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
          allowFullScreen
          style={{ borderRadius: '12px', minHeight: '250px' }}
        ></iframe>
      );
    } 
    
    if (type === 'local_video') {
      return (
        <video 
          width="100%" 
          controls 
          autoPlay 
          loop 
          muted // muted é recomendado para autoplay em mobile funcionar bem
          playsInline // muito importante para iOS (iPhone)
          style={{ borderRadius: '12px', backgroundColor: '#000', maxHeight: '400px' }}
        >
          <source src={url} type="video/mp4" />
          Seu navegador não suporta vídeos.
        </video>
      );
    }

    if (type === 'gif') {
      return (
        <img 
          src={url} 
          alt={title || "GIF de Treino"} 
          style={{ width: '100%', borderRadius: '12px', objectFit: 'contain', maxHeight: '400px' }}
        />
      );
    }

    return null;
  };

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {renderMedia()}
      {title && <h3 style={{ fontSize: '1.1rem', marginTop: '0.5rem' }}>{title}</h3>}
    </div>
  );
}
