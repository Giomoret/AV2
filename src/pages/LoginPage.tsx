import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage: React.FC = () => {
    const [usuario, setUsuario] = useState('');
    const [senha, setSenha] = useState('');
    const [erro, setErro] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setErro('');

        if (login(usuario, senha)) {
            navigate('/dashboard');
        } else {
            setErro('Credenciais inválidas. Tente novamente.');
        }
    };

    const styles = {
        container: {
            display: 'flex',
            flexDirection: 'column' as 'column',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            backgroundColor: '#0f172a', // Fundo principal escuro
            fontFamily: 'Arial, sans-serif',
        },
        card: {
            backgroundColor: '#1a2535', // Cor do card escuro
            padding: '40px',
            borderRadius: '10px',
            border: '1px solid #2d3d50', // Borda sutil
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
            width: '100%',
            maxWidth: '400px',
            textAlign: 'center' as 'center',
        },
        iconContainer: {
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '20px',
        },
        icon: {
            backgroundColor: '#3b82f6', // Azul do botão principal
            borderRadius: '50%',
            width: '56px',
            height: '56px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 10px rgba(59, 130, 246, 0.3)',
        },
        title: {
            fontSize: '24px',
            marginBottom: '30px',
            color: '#e2e8f0', // Texto claro
            fontWeight: 'bold' as 'bold',
        },
        form: {
            display: 'flex',
            flexDirection: 'column' as 'column',
            gap: '15px',
        },
        label: {
            textAlign: 'left' as 'left',
            fontWeight: 600,
            marginBottom: '5px',
            fontSize: '14px',
            color: '#94a3b8', // Texto secundário claro
        },
        input: {
            padding: '12px',
            borderRadius: '6px',
            border: '1px solid #2d3d50',
            backgroundColor: '#0f172a', // Fundo do input escuro
            fontSize: '15px',
            color: '#cbd5e1', // Texto digitado claro
            outline: 'none',
        },
        button: {
            backgroundColor: '#3b82f6', // Azul padrão
            color: 'white',
            padding: '12px',
            borderRadius: '6px',
            border: 'none',
            fontSize: '16px',
            fontWeight: 600,
            cursor: 'pointer',
            marginTop: '10px',
            transition: 'background-color 0.2s',
        },
        errorText: {
            color: '#ef4444', // Vermelho padrão
            marginTop: '5px',
            fontSize: '14px',
            fontWeight: 'bold' as 'bold',
        },
        tip: {
            marginTop: '30px',
            color: '#64748b',
            fontSize: '13px',
            textAlign: 'center' as 'center',
            maxWidth: '450px',
            lineHeight: '1.5',
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <div style={styles.iconContainer}>
                    <div style={styles.icon}>
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
                        </svg>
                    </div>
                </div>
                <h1 style={styles.title}>SISTEMA AEROCODE</h1>

                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <label style={styles.label}>Usuário</label>
                        <input
                            type="text"
                            placeholder="Digite seu usuário"
                            value={usuario}
                            onChange={(e) => setUsuario(e.target.value)}
                            style={styles.input}
                            required
                        />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <label style={styles.label}>Senha</label>
                        <input
                            type="password"
                            placeholder="Digite sua senha"
                            value={senha}
                            onChange={(e) => setSenha(e.target.value)}
                            style={styles.input}
                            required
                        />
                    </div>

                    {erro && <p style={styles.errorText}>{erro}</p>}

                    <button
                        type="submit"
                        style={styles.button}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
                    >
                        Entrar
                    </button>
                </form>
            </div>
            <p style={styles.tip}>
                Dicas de Acesso:<br />
                Admin: <strong>admin</strong> / 123 | Eng: <strong>engenheiro</strong> / 123 | Op: <strong>operador</strong> / 123
            </p>
        </div>
    );
};

export default LoginPage;