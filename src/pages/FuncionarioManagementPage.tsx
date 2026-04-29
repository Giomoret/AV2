import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../components/layout/Layout';
import { DataService } from '../services/MockData';
import { type Funcionario, NivelPermissao } from '../models/AeroCodeTypes';
import { useAuth } from '../context/AuthContext';

// Constantes de estilo para manter o padrão visual claro/escuro
const C = {
    card: '#1a2535',
    border: '#2d3d50',
    textPrimary: '#e2e8f0',
    textSecondary: '#94a3b8',
    orange: '#E8750A',
};

const cardStyle: React.CSSProperties = {
    backgroundColor: C.card,
    padding: '24px',
    borderRadius: '10px',
    border: `1px solid ${C.border}`,
    marginBottom: '20px'
};

const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px',
    border: `1px solid ${C.border}`,
    borderRadius: '6px',
    boxSizing: 'border-box',
    color: '#cbd5e1',
    backgroundColor: '#0f172a',
    fontSize: '14px'
};

const buttonPrimaryStyle: React.CSSProperties = {
    backgroundColor: '#3b82f6',
    color: 'white',
    padding: '10px 15px',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.15s',
    fontWeight: 600,
    fontSize: '14px'
};

const buttonDangerStyle: React.CSSProperties = {
    backgroundColor: '#ef4444',
    color: 'white',
    padding: '6px 12px',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.15s',
    fontSize: '13px'
};

const initialNovoFuncionarioState: Omit<Funcionario, 'id'> = {
    nome: '',
    telefone: '',
    endereco: '',
    usuario: '',
    senha: '',
    nivelPermissao: NivelPermissao.ENGENHEIRO,
};

const FuncionarioManagementPage: React.FC = () => {
    // Extraindo apenas isAdmin para evitar o aviso de variável não utilizada (usuario)
    const { isAdmin } = useAuth();
    const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
    const [novoFuncionario, setNovoFuncionario] = useState<Omit<Funcionario, 'id'>>(initialNovoFuncionarioState);
    const [erro, setErro] = useState('');

    const loadFuncionarios = useCallback(() => {
        const data = DataService.loadFuncionarios();
        setFuncionarios(data);
        setErro('');
    }, []);

    useEffect(() => {
        loadFuncionarios();
    }, [loadFuncionarios]);

    if (!isAdmin) {
        return (
            <Layout>
                <div style={{ backgroundColor: '#1a2535', padding: '30px', borderRadius: '10px', border: '1px solid #2d3d50' }}>
                    <h1 style={{ color: '#E8750A' }}>Acesso Negado</h1>
                    <p style={{ color: '#94a3b8' }}>Apenas administradores podem gerenciar funcionários.</p>
                </div>
            </Layout>
        );
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setNovoFuncionario(prev => ({
            ...prev,
            [name]: value,
        } as Omit<Funcionario, 'id'>));
        setErro('');
    };

    const handleAddFuncionario = (e: React.FormEvent) => {
        e.preventDefault();

        if (!isAdmin) {
            alert('Apenas Administradores podem adicionar novos funcionários.');
            return;
        }

        if (!novoFuncionario.nome || !novoFuncionario.usuario || !novoFuncionario.senha) {
            setErro('Os campos Nome, Usuário e Senha são obrigatórios.');
            return;
        }

        const success = DataService.addFuncionario(novoFuncionario);

        if (success) {
            alert(`Funcionário ${novoFuncionario.nome} adicionado com sucesso!`);
            loadFuncionarios();
            setNovoFuncionario(initialNovoFuncionarioState);
            setErro('');
        } else {
            setErro('Falha ao adicionar: Usuário de login já existe.');
        }
    };

    const handleRemoveFuncionario = (id: string, nome: string) => {
        if (!isAdmin) {
            alert('Apenas Administradores podem remover funcionários.');
            return;
        }
        if (id === 'F001') {
            alert('Ação Bloqueada: O Administrador principal não pode ser removido.');
            return;
        }

        if (window.confirm(`Tem certeza que deseja remover o funcionário ${nome}?`)) {
            const success = DataService.deleteFuncionario(id);
            if (success) {
                alert('Funcionário removido com sucesso!');
                loadFuncionarios();
            } else {
                setErro('Falha ao remover funcionário.');
            }
        }
    };

    return (
        <Layout>
            <div style={{ padding: '20px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#e2e8f0', marginBottom: '20px' }}>
                    Gestão de Funcionários (Admin)
                </h1>

                <div style={{ display: 'flex', gap: '30px', maxWidth: '1200px', margin: '0 auto', flexWrap: 'wrap' }}>

                    <div style={{ ...cardStyle, flex: 1, minWidth: '350px' }}>
                        <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px', color: '#e2e8f0' }}>Cadastrar Novo</h2>

                        <form onSubmit={handleAddFuncionario} style={{ display: 'grid', gap: '15px' }}>
                            {erro && <p style={{ color: '#ef4444', fontWeight: 'bold', fontSize: '14px' }}>{erro}</p>}

                            <input type="text" name="nome" value={novoFuncionario.nome} onChange={handleInputChange} style={inputStyle} placeholder="Nome Completo" required />
                            <input type="text" name="usuario" value={novoFuncionario.usuario} onChange={handleInputChange} style={inputStyle} placeholder="Usuário de Login" required />

                            <input type="password" name="senha" value={novoFuncionario.senha} onChange={handleInputChange} style={inputStyle} placeholder="Senha Inicial" required />
                            <select name="nivelPermissao" value={novoFuncionario.nivelPermissao} onChange={handleInputChange} style={inputStyle} required>
                                <option value={NivelPermissao.ENGENHEIRO}>Engenheiro</option>
                                <option value={NivelPermissao.OPERADOR}>Operador</option>
                            </select>

                            <input type="text" name="telefone" value={novoFuncionario.telefone} onChange={handleInputChange} style={inputStyle} placeholder="Telefone (Opcional)" />
                            <input type="text" name="endereco" value={novoFuncionario.endereco} onChange={handleInputChange} style={inputStyle} placeholder="Endereço (Opcional)" />

                            <button
                                type="submit"
                                style={{ ...buttonPrimaryStyle, marginTop: '10px' }}
                            >
                                Salvar Funcionário
                            </button>
                        </form>
                    </div>

                    <div style={{ ...cardStyle, flex: 2, minWidth: '350px' }}>
                        <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px', color: '#e2e8f0' }}>Lista de Funcionários ({funcionarios.length})</h2>

                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid #2d3d50' }}>
                                        <th style={{ padding: '10px 0', color: '#94a3b8', fontSize: '13px', fontWeight: 600 }}>ID</th>
                                        <th style={{ padding: '10px 0', color: '#94a3b8', fontSize: '13px', fontWeight: 600 }}>Nome</th>
                                        <th style={{ padding: '10px 0', color: '#94a3b8', fontSize: '13px', fontWeight: 600 }}>Usuário</th>
                                        <th style={{ padding: '10px 0', color: '#94a3b8', fontSize: '13px', fontWeight: 600 }}>Permissão</th>
                                        <th style={{ padding: '10px 0', color: '#94a3b8', fontSize: '13px', fontWeight: 600 }}>Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {funcionarios.map((f) => (
                                        <tr key={f.id} style={{ borderBottom: '1px solid #243040' }}>
                                            <td style={{ padding: '12px 0', color: '#cbd5e1', fontSize: '14px' }}>{f.id}</td>
                                            <td style={{ padding: '12px 0', color: '#cbd5e1', fontSize: '14px' }}>{f.nome}</td>
                                            <td style={{ padding: '12px 0', color: '#cbd5e1', fontSize: '14px' }}>{f.usuario}</td>
                                            <td style={{ padding: '12px 0', color: '#cbd5e1', fontSize: '14px' }}>{f.nivelPermissao}</td>
                                            <td style={{ padding: '12px 0' }}>
                                                {f.id !== 'F001' && (
                                                    <button
                                                        onClick={() => handleRemoveFuncionario(f.id, f.nome)}
                                                        style={buttonDangerStyle}
                                                    >
                                                        Remover
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {funcionarios.length === 0 && (
                                <p style={{ marginTop: '20px', color: '#94a3b8' }}>Nenhum funcionário cadastrado para exibição.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default FuncionarioManagementPage;