import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import { DataService } from '../services/MockData';
import { type Aeronave } from '../models/AeroCodeTypes';

const AeronavesListPage: React.FC = () => {
    const [aeronaves, setAeronaves] = useState<Aeronave[]>([]);

    useEffect(() => {
        setAeronaves(DataService.loadAeronaves());
    }, []);

    return (
        <Layout>
            <div style={{ padding: '20px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#e2e8f0', marginBottom: '20px' }}>
                    Lista de Aeronaves ({aeronaves.length})
                </h1>

                <div style={{ padding: '24px', backgroundColor: '#1a2535', borderRadius: '10px', border: '1px solid #2d3d50' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #2d3d50' }}>
                                <th style={{ padding: '10px 0', color: '#94a3b8', fontSize: '13px', fontWeight: 600 }}>Código</th>
                                <th style={{ padding: '10px 0', color: '#94a3b8', fontSize: '13px', fontWeight: 600 }}>Modelo</th>
                                <th style={{ padding: '10px 0', color: '#94a3b8', fontSize: '13px', fontWeight: 600 }}>Tipo</th>
                                <th style={{ padding: '10px 0', color: '#94a3b8', fontSize: '13px', fontWeight: 600 }}>Capacidade</th>
                                <th style={{ padding: '10px 0', color: '#94a3b8', fontSize: '13px', fontWeight: 600 }}>Alcance (km)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {aeronaves.map(aero => (
                                <tr key={aero.codigo} style={{ borderBottom: '1px solid #243040' }}>
                                    <td style={{ padding: '12px 0', color: '#cbd5e1', fontSize: '14px' }}>{aero.codigo}</td>
                                    <td style={{ padding: '12px 0', color: '#cbd5e1', fontSize: '14px' }}>{aero.modelo}</td>
                                    <td style={{ padding: '12px 0', color: '#cbd5e1', fontSize: '14px' }}>{aero.tipo}</td>
                                    <td style={{ padding: '12px 0', color: '#cbd5e1', fontSize: '14px' }}>{aero.capacidade}</td>
                                    <td style={{ padding: '12px 0', color: '#cbd5e1', fontSize: '14px' }}>{aero.alcance}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {aeronaves.length === 0 && (
                        <p style={{ marginTop: '20px', color: '#94a3b8' }}>Nenhuma aeronave cadastrada para exibição.</p>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default AeronavesListPage;