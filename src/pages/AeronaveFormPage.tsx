import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { useAuth } from '../context/AuthContext';
import { DataService } from '../services/MockData';
import { type Aeronave, TipoAeronave, type Etapa, StatusEtapa } from '../models/AeroCodeTypes';

const C = {
    card: '#1a2535',
    border: '#2d3d50',
    borderLight: '#243040',
    textPrimary: '#e2e8f0',
    textSecondary: '#94a3b8',
    textMuted: '#64748b',
    input: '#243040',
    blue: '#4A90D9',
    green: '#2E7D32',
    red: '#c0392b',
    orange: '#E8750A',
};

const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px',
    backgroundColor: C.input,
    border: `1px solid ${C.border}`,
    borderRadius: '6px',
    color: C.textPrimary,
    boxSizing: 'border-box',
};

const labelStyle: React.CSSProperties = {
    display: 'block',
    marginBottom: '4px',
    color: C.textSecondary,
    fontSize: '13px',
    fontWeight: 600,
};

const initialAeronaveState: Aeronave = {
    codigo: '',
    modelo: '',
    tipo: TipoAeronave.COMERCIAL,
    capacidade: 0,
    alcance: 0,
    etapas: [
        { id: '', nome: 'Montagem Inicial da Estrutura', prazo: new Date(), status: StatusEtapa.PENDENTE, funcionariosDesignados: [] }
    ],
    pecas: [],
    testes: [],
    relatorio: null,
};

const AeronaveFormPage: React.FC = () => {
    const { isAdmin } = useAuth();
    const navigate = useNavigate();
    const [aeronaveData, setAeronaveData] = useState<Aeronave>(initialAeronaveState);
    const [erro, setErro] = useState('');
    const [mensagemSucesso, setMensagemSucesso] = useState('');

    if (!isAdmin) {
        return (
            <Layout>
                <div style={{ backgroundColor: '#1a2535', padding: '30px', borderRadius: '10px', border: '1px solid #2d3d50' }}>
                    <h1 style={{ color: '#E8750A' }}>Acesso Negado</h1>
                    <p style={{ color: '#94a3b8' }}>Apenas administradores podem cadastrar aeronaves.</p>
                </div>
            </Layout>
        );
    }

    const handleAeronaveChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setAeronaveData(prev => ({
            ...prev,
            [name]: name === 'capacidade' || name === 'alcance' ? parseInt(value) || 0 : value
        }));
        setErro('');
        setMensagemSucesso('');
    };

    // FUNÇÃO CORRIGIDA: Trava de segurança para "Invalid Date"
    const handleEtapaChange = (index: number, name: keyof Etapa, value: string | Date) => {
        const newEtapas = [...aeronaveData.etapas];

        let finalValue = value;
        if (name === 'prazo') {
            // Se o usuário apagar a data (value vazio), usa a data de hoje ao invés de crashar o sistema
            finalValue = value ? new Date(value as string) : new Date();
        }

        (newEtapas[index] as any)[name] = finalValue;
        setAeronaveData(prev => ({ ...prev, etapas: newEtapas }));
    };

    const handleAddEtapa = () => {
        setAeronaveData(prev => ({
            ...prev,
            etapas: [...prev.etapas, { id: '', nome: '', prazo: new Date(), status: StatusEtapa.PENDENTE, funcionariosDesignados: [] }]
        }));
    };

    const handleRemoveEtapa = (index: number) => {
        if (aeronaveData.etapas.length <= 1) return;
        setAeronaveData(prev => ({ ...prev, etapas: prev.etapas.filter((_, i) => i !== index) }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setErro('');
        setMensagemSucesso('');
        if (!aeronaveData.codigo || !aeronaveData.modelo || aeronaveData.capacidade <= 0) {
            setErro('Preencha Código, Modelo e Capacidade corretamente.');
            return;
        }
        if (DataService.getAeronaveByCodigo(aeronaveData.codigo)) {
            setErro('O código da aeronave já existe. Escolha outro código.');
            return;
        }
        try {
            DataService.saveAeronave(aeronaveData);
            setMensagemSucesso(`Aeronave ${aeronaveData.codigo} cadastrada com sucesso!`);
            setAeronaveData(initialAeronaveState);
            navigate('/dashboard');
        } catch (error) {
            setErro('Erro ao salvar no sistema.');
            console.error(error);
        }
    };

    return (
        <Layout>
            <h1 style={{ marginBottom: '20px', color: C.textPrimary, fontSize: '22px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.textSecondary} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
                </svg>
                Cadastro de Nova Aeronave
            </h1>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px', backgroundColor: C.card, padding: '30px', borderRadius: '10px', border: `1px solid ${C.border}`, maxWidth: '800px', margin: '0 auto' }}>

                <h2 style={{ color: C.textPrimary, fontSize: '16px', margin: '0 0 4px' }}>Informações Básicas da Aeronave</h2>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div>
                        <label style={labelStyle}>Código Único:</label>
                        <input type="text" name="codigo" value={aeronaveData.codigo} onChange={handleAeronaveChange} required style={inputStyle} />
                    </div>
                    <div>
                        <label style={labelStyle}>Modelo:</label>
                        <input type="text" name="modelo" value={aeronaveData.modelo} onChange={handleAeronaveChange} required style={inputStyle} />
                    </div>
                    <div>
                        <label style={labelStyle}>Tipo:</label>
                        <select name="tipo" value={aeronaveData.tipo} onChange={handleAeronaveChange} style={inputStyle}>
                            <option value={TipoAeronave.COMERCIAL}>{TipoAeronave.COMERCIAL}</option>
                            <option value={TipoAeronave.MILITAR}>{TipoAeronave.MILITAR}</option>
                        </select>
                    </div>
                    <div>
                        <label style={labelStyle}>Capacidade (Passageiros/Carga):</label>
                        <input type="number" name="capacidade" value={aeronaveData.capacidade} onChange={handleAeronaveChange} required style={inputStyle} />
                    </div>
                    <div>
                        <label style={labelStyle}>Alcance (km):</label>
                        <input type="number" name="alcance" value={aeronaveData.alcance} onChange={handleAeronaveChange} required style={inputStyle} />
                    </div>
                </div>

                <hr style={{ borderColor: C.border, margin: '4px 0' }} />

                <h2 style={{ color: C.textPrimary, fontSize: '16px', margin: '0 0 4px' }}>Etapas Iniciais de Produção</h2>
                <p style={{ fontSize: '12px', color: C.textMuted, margin: '-12px 0 0' }}>Defina a sequência inicial das etapas. Elas serão controladas em ordem lógica.</p>

                {aeronaveData.etapas.map((etapa, index) => (
                    <div key={index} style={{ border: `1px solid ${C.border}`, padding: '15px', borderRadius: '8px', display: 'flex', gap: '15px', alignItems: 'flex-end', backgroundColor: C.input }}>
                        <span style={{ fontWeight: 'bold', color: C.textSecondary, paddingBottom: '8px' }}>{index + 1}.</span>
                        <div style={{ flex: 2 }}>
                            <label style={labelStyle}>Nome da Etapa:</label>
                            <input type="text" value={etapa.nome} onChange={(e) => handleEtapaChange(index, 'nome', e.target.value)} required style={inputStyle} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={labelStyle}>Prazo (Estimado):</label>
                            {/* A linha abaixo usa um try/catch disfarçado para nunca crashar o .toISOString */}
                            <input
                                type="date"
                                value={!isNaN(etapa.prazo.getTime()) ? etapa.prazo.toISOString().split('T')[0] : ''}
                                onChange={(e) => handleEtapaChange(index, 'prazo', e.target.value)}
                                required
                                style={inputStyle}
                            />
                        </div>
                        {aeronaveData.etapas.length > 1 && (
                            <button type="button" onClick={() => handleRemoveEtapa(index)}
                                style={{ padding: '8px 12px', backgroundColor: C.red, color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                                Remover
                            </button>
                        )}
                    </div>
                ))}

                <button type="button" onClick={handleAddEtapa}
                    style={{ padding: '10px 20px', backgroundColor: C.blue, color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', alignSelf: 'flex-start' }}>
                    + Adicionar Etapa
                </button>

                {erro && <p style={{ color: C.orange, fontWeight: 'bold', margin: 0 }}>{erro}</p>}
                {mensagemSucesso && <p style={{ color: '#4CAF50', fontWeight: 'bold', margin: 0 }}>{mensagemSucesso}</p>}

                <button type="submit"
                    style={{ padding: '14px 30px', backgroundColor: C.green, color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '16px', fontWeight: 600, marginTop: '10px' }}>
                    Cadastrar Aeronave
                </button>
            </form>
        </Layout>
    );
};

export default AeronaveFormPage;