import React, { useState } from 'react';
import { CheckSquare, Lock, Mail, User, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export function AuthModal() {
  const { login, register } = useAuth();
  const [tab, setTab] = useState('login'); // 'login' | 'register'

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (tab === 'register') {
      if (!name.trim()) {
        setError('Por favor, informe seu nome.');
        return;
      }
      if (password !== confirmPassword) {
        setError('As senhas digitadas não coincidem.');
        return;
      }
      if (password.length < 6) {
        setError('A senha deve ter no mínimo 6 caracteres.');
        return;
      }

      setLoading(true);
      const res = await register(name.trim(), email.trim(), password);
      setLoading(false);
      if (!res.success) {
        setError(res.message);
      }
    } else {
      if (!email.trim() || !password) {
        setError('Por favor, preencha o e-mail e a senha.');
        return;
      }

      setLoading(true);
      const res = await login(email.trim(), password);
      setLoading(false);
      if (!res.success) {
        setError(res.message);
      }
    }
  };

  const handleDemoLogin = async () => {
    setName('Desenvolvedor Demo');
    setEmail('demo@taskflow.dev');
    setPassword('senha123');

    setLoading(true);
    // Tenta fazer login, se falhar, registra o usuário demo
    let res = await login('demo@taskflow.dev', 'senha123');
    if (!res.success) {
      res = await register('Desenvolvedor Demo', 'demo@taskflow.dev', 'senha123');
    }
    setLoading(false);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        background: 'radial-gradient(circle at top, var(--brand-light) 0%, var(--bg-app) 70%)'
      }}
    >
      <div
        className="modal-content"
        style={{
          maxWidth: '440px',
          boxShadow: 'var(--shadow-xl)',
          border: '1px solid var(--border)',
          backgroundColor: 'var(--bg-surface)'
        }}
      >
        {/* Header do Card */}
        <div style={{ padding: '2rem 2rem 1.5rem 2rem', textAlign: 'center' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--brand-gradient)',
              color: '#fff',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem',
              boxShadow: 'var(--shadow-glow)'
            }}
          >
            <CheckSquare size={32} />
          </div>

          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', letterSpacing: '-0.02em' }}>
            TaskFlow
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Organize sua rotina com clareza e produtividade.
          </p>

          {/* Seletor de Aba */}
          <div
            className="tabs-status"
            style={{ marginTop: '1.5rem', width: '100%', padding: '0.35rem' }}
          >
            <button
              onClick={() => { setTab('login'); setError(null); }}
              className={`tab-btn ${tab === 'login' ? 'active' : ''}`}
              style={{ flex: 1, padding: '0.5rem' }}
            >
              Entrar
            </button>
            <button
              onClick={() => { setTab('register'); setError(null); }}
              className={`tab-btn ${tab === 'register' ? 'active' : ''}`}
              style={{ flex: 1, padding: '0.5rem' }}
            >
              Criar Conta
            </button>
          </div>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} style={{ padding: '0 2rem 2rem 2rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {error && (
              <div
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-danger-bg)',
                  color: 'var(--color-danger)',
                  fontSize: '0.8125rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {tab === 'register' && (
              <div className="form-group">
                <label className="form-label">Nome Completo</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <User size={16} style={{ position: 'absolute', left: '0.75rem', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    placeholder="Seu nome"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="form-input"
                    style={{ paddingLeft: '2.25rem', width: '100%' }}
                    required
                  />
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">E-mail</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Mail size={16} style={{ position: 'absolute', left: '0.75rem', color: 'var(--text-muted)' }} />
                <input
                  type="email"
                  placeholder="seu.email@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '2.25rem', width: '100%' }}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Senha</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Lock size={16} style={{ position: 'absolute', left: '0.75rem', color: 'var(--text-muted)' }} />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '2.25rem', width: '100%' }}
                  required
                />
              </div>
            </div>

            {tab === 'register' && (
              <div className="form-group">
                <label className="form-label">Confirme a Senha</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '0.75rem', color: 'var(--text-muted)' }} />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="form-input"
                    style={{ paddingLeft: '2.25rem', width: '100%' }}
                    required
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem' }}
            >
              <span>{loading ? 'Processando...' : tab === 'login' ? 'Entrar no TaskFlow' : 'Cadastrar e Começar'}</span>
              <ArrowRight size={16} />
            </button>

            {/* Acesso Rápido Demo */}
            <button
              type="button"
              onClick={handleDemoLogin}
              className="btn btn-secondary"
              style={{ width: '100%', padding: '0.625rem', fontSize: '0.8125rem' }}
            >
              <Sparkles size={14} color="var(--brand-primary)" />
              <span>Acessar com Usuário de Demonstração</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
