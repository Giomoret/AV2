import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import { DataService } from '../services/MockData';
import { type Aeronave, StatusEtapa, StatusPeca } from '../models/AeroCodeTypes';
import { useNavigate } from 'react-router-dom';

const IconePlane = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline', verticalAlign: 'middle', marginLeft: '6px' }}>
        <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
    </svg>
);

const IconeGear = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline', verticalAlign: 'middle', marginLeft: '6px' }}>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
);

const IconeAlert = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline', verticalAlign: 'middle', marginLeft: '6px' }}>
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
);

const DashboardPage: React.FC = () => {
    const [aeronaves, setAeronaves] = useState<Aeronave[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        setAeronaves(DataService.loadAeronaves());
    }, []);

    const getStatusGeral = (aeronave: Aeronave): StatusPeca => {
        if (aeronave.etapas.length === 0) return StatusPeca.EM_TRANSPORTE;
        const todasEtapasConcluidas = aeronave.etapas.every(e => e.status === StatusEtapa.CONCLUIDA);
        const algumaEtapaEmAndamento = aeronave.etapas.some(e => e.status === StatusEtapa.ANDAMENTO);
        if (todasEtapasConcluidas) return StatusPeca.PRONTA;
        if (algumaEtapaEmAndamento) return StatusPeca.EM_PRODUCAO;
        return StatusPeca.EM_TRANSPORTE;
    };

    const totalAeronaves = aeronaves.length;
    const emAndamentoCount = aeronaves.filter(a => getStatusGeral(a) === StatusPeca.EM_PRODUCAO).length;
    const pendenteCount = aeronaves.filter(a => getStatusGeral(a) === StatusPeca.EM_TRANSPORTE).length;

    // LÓGICA DO GRÁFICO DINÂMICO
    let naoIniciado = 0;
    let emAndamento = 0;
    let concluido = 0;

    aeronaves.forEach(aero => {
        aero.etapas.forEach(etapa => {
            if (etapa.status === StatusEtapa.CONCLUIDA) {
                concluido++;
            } else if (etapa.status === StatusEtapa.ANDAMENTO) {
                emAndamento++;
            } else {
                naoIniciado++;
            }
        });
    });

    const etapasData = [
        { label: 'Não Iniciado', value: naoIniciado, color: '#546E7A' },
        { label: 'Em Andamento', value: emAndamento, color: '#3b82f6' },
        { label: 'Concluído', value: concluido, color: '#2E7D32' },
    ];

    // Descobre o maior valor para calcular a altura da barra proporcionalmente
    const maxValorEtapa = Math.max(...etapasData.map(d => d.value), 1); // ,1 evita divisão por zero

    const cardStyle: React.CSSProperties = {
        padding: '24px',
        backgroundColor: '#1a2535',
        borderRadius: '10px',
        border: '1px solid #2d3d50',
        flexGrow: 1,
        minWidth: '200px',
    };

    const painelStyle: React.CSSProperties = {
        backgroundColor: '#1a2535',
        padding: '24px',
        borderRadius: '10px',
        border: '1px solid #2d3d50',
        marginBottom: '24px',
    };

    const StatusTag: React.FC<{ status: StatusPeca }> = ({ status }) => {
        const colorMap: Record<StatusPeca, { bg: string; color: string; label: string }> = {
            [StatusPeca.PRONTA]: { bg: '#2E7D32', color: 'white', label: 'Pronta' },
            [StatusPeca.EM_PRODUCAO]: { bg: '#3b82f6', color: 'white', label: 'Em Produção' },
            [StatusPeca.EM_TRANSPORTE]: { bg: '#E8750A', color: 'white', label: 'Pendente' },
        };
        const { bg, color, label } = colorMap[status];
        return (
            <span style={{ backgroundColor: bg, color, padding: '4px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                {label}
            </span>
        );
    };

    return (
        <Layout>
            {/* Cards KPI */}
            <div style={{ display: 'flex', gap: '20px', marginBottom: '24px' }}>
                <div style={cardStyle}>
                    <h4 style={{ color: '#94a3b8', margin: '0 0 12px', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center' }}>
                        Total de Aeronaves <IconePlane />
                    </h4>
                    <p style={{ fontSize: '40px', fontWeight: 'bold', color: '#e2e8f0', margin: 0, lineHeight: 1 }}>{totalAeronaves}</p>
                </div>
                <div style={cardStyle}>
                    <h4 style={{ color: '#94a3b8', margin: '0 0 12px', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center' }}>
                        Em Produção <IconeGear />
                    </h4>
                    <p style={{ fontSize: '40px', fontWeight: 'bold', color: '#e2e8f0', margin: 0, lineHeight: 1 }}>{emAndamentoCount}</p>
                </div>
                <div style={cardStyle}>
                    <h4 style={{ color: '#94a3b8', margin: '0 0 12px', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center' }}>
                        Pendente <IconeAlert />
                    </h4>
                    <p style={{ fontSize: '40px', fontWeight: 'bold', color: '#e2e8f0', margin: 0, lineHeight: 1 }}>{pendenteCount}</p>
                </div>
            </div>

            {/* Tabela */}
            <div style={painelStyle}>
                <h3 style={{ color: '#e2e8f0', marginTop: 0, marginBottom: '16px', fontSize: '16px', fontWeight: 600 }}>Aeronaves em Produção</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid #2d3d50' }}>
                            <th style={{ textAlign: 'left', padding: '10px 0', color: '#94a3b8', fontSize: '13px', fontWeight: 600 }}>Código</th>
                            <th style={{ textAlign: 'left', padding: '10px 0', color: '#94a3b8', fontSize: '13px', fontWeight: 600 }}>Modelo</th>
                            <th style={{ textAlign: 'left', padding: '10px 0', color: '#94a3b8', fontSize: '13px', fontWeight: 600 }}>Status Geral</th>
                            <th style={{ textAlign: 'left', padding: '10px 0', color: '#94a3b8', fontSize: '13px', fontWeight: 600 }}>Prazo Estimado</th>
                            <th style={{ textAlign: 'left', padding: '10px 0', color: '#94a3b8', fontSize: '13px', fontWeight: 600 }}>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {aeronaves.map((aero) => (
                            <tr key={aero.codigo} style={{ borderBottom: '1px solid #243040' }}>
                                <td style={{ padding: '12px 0', color: '#cbd5e1', fontSize: '14px' }}>{aero.codigo}</td>
                                <td style={{ padding: '12px 0', color: '#cbd5e1', fontSize: '14px' }}>{aero.modelo}</td>
                                <td style={{ padding: '12px 0' }}>
                                    <StatusTag status={getStatusGeral(aero)} />
                                </td>
                                <td style={{ padding: '12px 0', color: '#cbd5e1', fontSize: '14px' }}>
                                    {aero.etapas.length > 0 ? aero.etapas[aero.etapas.length - 1].prazo.toLocaleDateString('pt-BR') : 'N/A'}
                                </td>
                                <td style={{ padding: '12px 0' }}>
                                    <button
                                        onClick={() => navigate(`/aeronaves/${aero.codigo}`)}
                                        style={{ padding: '6px 14px', border: '1px solid #2d3d50', borderRadius: '6px', cursor: 'pointer', background: '#243040', color: '#cbd5e1', fontSize: '13px', fontWeight: 500, transition: 'background-color 0.2s' }}
                                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#2d3d50'}
                                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#243040'}
                                    >
                                        Detalhes
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {aeronaves.length === 0 && (
                    <p style={{ marginTop: '20px', color: '#94a3b8' }}>Nenhuma aeronave cadastrada.</p>
                )}
            </div>

            {/* Gráfico */}
            <div style={{ ...painelStyle, marginBottom: 0 }}>
                <h3 style={{ color: '#e2e8f0', marginTop: 0, marginBottom: '8px', fontSize: '16px', fontWeight: 600 }}>Etapas por Status (Todas Aeronaves)</h3>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', height: '180px', marginTop: '24px' }}>
                    {etapasData.map(({ label, value, color }) => {
                        // Calcula a altura da barra proporcionalmente ao maior valor (altura máxima = 130px)
                        const barHeight = (value / maxValorEtapa) * 130;

                        return (
                            <div key={label} style={{ flexGrow: 1, textAlign: 'center' }}>
                                <p style={{ fontSize: '13px', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>{value}</p>
                                <div style={{ height: `${barHeight}px`, backgroundColor: color, width: '100%', borderRadius: '6px 6px 0 0', transition: 'height 0.5s ease' }} />
                                <p style={{ marginTop: '8px', fontSize: '13px', color: '#94a3b8' }}>{label}</p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </Layout>
    );
};

export default DashboardPage;