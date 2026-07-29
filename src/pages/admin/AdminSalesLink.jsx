import React from 'react';
import { ShoppingCart, Eye, Copy, ExternalLink, Check } from 'lucide-react';
import { Link } from 'react-router-dom';

export function AdminSalesLink() {
  const [copied, setCopied] = React.useState(false);
  const salesLink = window.location.origin + '/planos';

  const handleCopy = () => {
    navigator.clipboard.writeText(salesLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ background: 'rgba(255, 68, 68, 0.1)', padding: '0.75rem', borderRadius: '12px' }}>
          <ShoppingCart size={28} color="#ff4444" />
        </div>
        <h1 style={{ margin: 0 }}>Página de Vendas</h1>
      </div>

      <div className="glass-card" style={{ padding: '2rem', maxWidth: '800px' }}>
        <h2 style={{ marginBottom: '1rem' }}>Divulgue seu Aplicativo</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: 1.6 }}>
          Sua página de vendas é gerada automaticamente baseada nos planos que você configurou na aba "Planos". 
          Sempre que você alterar um preço ou benefício lá, esta página é atualizada instantaneamente para os seus clientes.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Visualizar */}
          <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: '0 0 0.5rem 0' }}>Visualizar como Cliente</h3>
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Abra a página para ver exatamente o que os seus futuros alunos verão.</p>
            </div>
            <Link to="/planos" target="_blank" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.8rem 1.5rem', fontSize: '1rem' }}>
              <Eye size={20} /> Ver Página
            </Link>
          </div>

          {/* Copiar Link */}
          <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <h3 style={{ margin: '0 0 1rem 0' }}>Link de Vendas (Para Instagram, WhatsApp, etc)</h3>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <input 
                type="text" 
                readOnly 
                value={salesLink}
                style={{ flex: 1, padding: '1rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', fontSize: '1rem' }}
              />
              <button 
                onClick={handleCopy}
                className="btn" 
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.1)', color: 'white', padding: '0 1.5rem', border: 'none' }}
              >
                {copied ? <Check size={20} color="var(--primary-color)"/> : <Copy size={20} />}
                {copied ? 'Copiado!' : 'Copiar'}
              </button>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
