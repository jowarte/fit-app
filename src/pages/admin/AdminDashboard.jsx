import React from 'react';

export function AdminDashboard() {
  return (
    <div className="animate-fade-in">
      <h1 style={{ marginBottom: '2rem' }}>Dashboard</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
        <div className="glass-card">
          <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Total de Exercícios</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>-</p>
        </div>
        <div className="glass-card">
          <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Rotinas Criadas</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>-</p>
        </div>
      </div>
    </div>
  );
}
