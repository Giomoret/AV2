import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import { DataService } from '../services/MockData';
import { type Relatorio } from '../models/AeroCodeTypes';

const RelatoriosPage: React.FC = () => {
    const [relatoriosGerados, setRelatoriosGerados] = useState<Relatorio[]>([]);

    useEffect(() => {
        const aeronavesComRelatorio = DataService.loadAeronaves().filter(a => a.relatorio);
        const relatorios = aeronavesComRelatorio.map(a => a.relatorio!);
        setRelatoriosGerados(relatorios);
    }, []);

    const handleDownload = (content: string, filename: string) => {
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = filename;

        document.body.appendChild(link);
        link.click();

        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <Layout>
            <div style={{ padding: '20px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#e2e8f0', marginBottom: '20px' }}>
                    📄 Relatórios de Entrega Final ({relatoriosGerados.length})
                </h1>

                <div style={{ padding: '24px', backgroundColor: '#1a2535', borderRadius: '10px', border: '1px solid #2d3d50' }}>
                    {relatoriosGerados.length > 0 ? (
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid #2d3d50' }}>
                                    <th style={{ padding: '10px 0', color: '#94a3b8', fontSize: '13px', fontWeight: 600 }}>Cód. Aeronave</th>
                                    <th style={{ padding: '10px 0', color: '#94a3b8', fontSize: '13px', fontWeight: 600 }}>Cliente</th>
                                    <th style={{ padding: '10px 0', color: '#94a3b8', fontSize: '13px', fontWeight: 600 }}>Data da Entrega</th>
                                    <th style={{ padding: '10px 0', color: '#94a3b8', fontSize: '13px', fontWeight: 600 }}>Ação</th>
                                </tr>
                            </thead>
                            <tbody>
                                {relatoriosGerados.map((r, index) => (
                                    <tr key={index} style={{ borderBottom: '1px solid #243040' }}>
                                        <td style={{ padding: '12px 0', color: '#cbd5e1', fontSize: '14px' }}>{r.aeronaveCodigo}</td>
                                        <td style={{ padding: '12px 0', color: '#cbd5e1', fontSize: '14px' }}>{r.clienteNome}</td>
                                        <td style={{ padding: '12px 0', color: '#cbd5e1', fontSize: '14px' }}>{r.dataEntrega.toLocaleDateString('pt-BR')}</td>
                                        <td style={{ padding: '12px 0' }}>
                                            <button
                                                onClick={() => handleDownload(r.conteudoTexto, `RELATORIO_${r.aeronaveCodigo}.txt`)}
                                                style={{
                                                    backgroundColor: '#3b82f6',
                                                    color: 'white',
                                                    padding: '6px 12px',
                                                    border: 'none',
                                                    borderRadius: '6px',
                                                    cursor: 'pointer',
                                                    fontSize: '13px',
                                                    fontWeight: 600,
                                                    transition: 'background-color 0.15s'
                                                }}
                                            >
                                                Baixar (.txt)
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p style={{ marginTop: '20px', color: '#94a3b8' }}>Nenhum relatório final foi gerado ainda. Conclua a produção de uma aeronave para ver os dados aqui.</p>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default RelatoriosPage;