"use client";

import { useState } from 'react';
import styles from '../styles/Home.module.css';

declare global {
  interface Window {
    electronAPI: {
      registrarUsuario: (data: { usuario: string; senha: string }) => Promise<{ sucesso: boolean; erro?: string }>;
      loginUsuario: (data: { usuario: string; senha: string }) => Promise<{ sucesso: boolean; erro?: string }>;
    };
  }
}

export default function Home() {
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [msg, setMsg] = useState('');
  const [modo, setModo] = useState<'login' | 'registro'>('login');

  const registrar = async () => {
    if (!usuario || !senha) {
      setMsg('Preencha usuário e senha.');
      return;
    }
    const res = await window.electronAPI.registrarUsuario({ usuario, senha });
    if (res.sucesso) {
      setMsg('Usuário registrado! Agora faça login.');
      setModo('login');
    } else {
      setMsg(res.erro ?? 'Ocorreu um erro desconhecido.');
    }
  };

  const login = async () => {
    if (!usuario || !senha) {
      setMsg('Preencha usuário e senha.');
      return;
    }
    const res = await window.electronAPI.loginUsuario({ usuario, senha });
    if (res.sucesso) {
      setMsg(`Bem-vindo, ${usuario}!`);
    } else {
      setMsg(res.erro ?? 'Ocorreu um erro desconhecido.');
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{modo === 'login' ? 'Login' : 'Registro'}</h1>

      <input
        placeholder="Usuário"
        value={usuario}
        onChange={(e) => setUsuario(e.target.value)}
        className={styles.input}
      />

      <input
        placeholder="Senha"
        type="password"
        value={senha}
        onChange={(e) => setSenha(e.target.value)}
        className={styles.input}
      />

      <button
        onClick={modo === 'login' ? login : registrar}
        className={styles.button}
      >
        {modo === 'login' ? 'Entrar' : 'Registrar'}
      </button>

      <button
        onClick={() => {
          setModo(modo === 'login' ? 'registro' : 'login');
          setMsg('');
        }}
        className={styles.toggleButton}
      >
        {modo === 'login' ? 'Criar uma conta' : 'Já tenho uma conta'}
      </button>

      {msg && (
        <p
          className={`${styles.message} ${
            msg.toLowerCase().includes('erro') || msg.toLowerCase().includes('preencha')
              ? styles.error
              : styles.success
          }`}
        >
          {msg}
        </p>
      )}
    </div>
  );
}
