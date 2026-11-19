/**
 * Utilitário profissional para integração dinâmica do Facebook / Meta Pixel.
 * Suporta inicialização dinâmica por ID configurado no painel administrativo,
 * sanitização de caracteres, eventos de PageView e InitiateCheckout.
 */

export function sanitizePixelId(pixelId) {
  if (!pixelId) return '';
  return String(pixelId).replace(/\D/g, '').trim();
}

export function initFacebookPixel(pixelId) {
  const cleanId = sanitizePixelId(pixelId);
  if (!cleanId || cleanId.length < 5) {
    return false;
  }

  // Salvar no localStorage para inicialização instantânea em navegações futuras
  try {
    localStorage.setItem('fb_pixel', cleanId);
  } catch (e) {}

  // 1. Garantir que a função fbq base esteja instalada
  if (!window.fbq) {
    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
  }

  // 2. Inicializar o Pixel apenas se ainda não foi inicializado com este ID
  if (window._currentFbPixel !== cleanId) {
    window.fbq('init', cleanId);
    window._currentFbPixel = cleanId;
    console.log(`[Meta Pixel] Inicializado com sucesso para o ID: ${cleanId}`);
  }

  // 3. Disparar PageView
  window.fbq('track', 'PageView');

  // 4. Injetar fallback noscript se ainda não existir
  try {
    const existingNoscript = document.getElementById('fb-pixel-noscript');
    if (!existingNoscript) {
      const noscript = document.createElement('noscript');
      noscript.id = 'fb-pixel-noscript';
      const img = document.createElement('img');
      img.height = 1;
      img.width = 1;
      img.style.display = 'none';
      img.src = `https://www.facebook.com/tr?id=${cleanId}&ev=PageView&noscript=1`;
      noscript.appendChild(img);
      document.body.appendChild(noscript);
    }
  } catch (e) {}

  return true;
}

export function trackPixelEvent(eventName, params = {}) {
  try {
    // Se o Pixel ainda não foi inicializado nesta sessão, tenta usar o ID em cache
    if (!window._currentFbPixel) {
      const cached = localStorage.getItem('fb_pixel');
      if (cached) {
        initFacebookPixel(cached);
      }
    }

    if (window.fbq) {
      window.fbq('track', eventName, params);
      console.log(`[Meta Pixel] Evento rastreado: ${eventName}`, params);
      return true;
    }
  } catch (err) {
    console.warn('[Meta Pixel] Erro ao disparar evento:', err);
  }
  return false;
}

export function trackInitiateCheckout(plan = {}) {
  const priceStr = String(plan.price || '0').replace('R$', '').trim().replace(',', '.');
  const numericPrice = parseFloat(priceStr) || 0;

  return trackPixelEvent('InitiateCheckout', {
    content_name: plan.name || 'Plano de Treino',
    content_category: 'Assinatura',
    content_ids: [plan.id ? String(plan.id) : 'default_plan'],
    value: numericPrice,
    currency: 'BRL',
    num_items: 1
  });
}
