import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { DataService } from '../services/MockData';
import {
    type Aeronave, StatusEtapa, type Etapa, type Peca, StatusPeca, TipoPeca,
    type Teste, TipoTeste, ResultadoTeste, type Funcionario
} from '../models/AeroCodeTypes';
import { useAuth } from '../context/AuthContext';

// Paleta escura
const C = {
    bg: '#111c28',
    card: '#1a2535',
    border: '#2d3d50',
    borderLight: '#243040',
    textPrimary: '#e2e8f0',
    textSecondary: '#94a3b8',
    textMuted: '#64748b',
    blue: '#4A90D9',
    green: '#2E7D32',
    greenLight: '#4CAF50',
    orange: '#E8750A',
    yellow: '#FFC107',
    input: '#243040',
};

interface RelatorioGenerationProps {
    aeronave: Aeronave;
    onRelatorioGenerated: () => void;
}

const RelatorioGeneration: React.FC<RelatorioGenerationProps> = ({ aeronave, onRelatorioGenerated }) => {
    const { isAdmin } = useAuth();
    const [clienteNome, setClienteNome] = useState('');
    const [dataEntrega, setDataEntrega] = useState(new Date().toISOString().split('T')[0]);

    const isReadyForReport = aeronave.etapas.every(e => e.status === StatusEtapa.CONCLUIDA);
    const reportExists = aeronave.relatorio !== null;

    const downloadRelatorio = (conteudo: string | undefined) => {
        const finalContent = conteudo ?? 'Relatório vazio.';
        const element = document.createElement("a");
        const file = new Blob([finalContent], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = `Relatorio_Aeronave_${aeronave.codigo!}.txt`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    const handleGenerateReport = (e: React.FormEvent) => {
        e.preventDefault();
        if (!isAdmin) { alert('Apenas o Administrador pode gerar o Relatório Final.'); return; }
        if (!isReadyForReport) { alert('Todas as etapas devem estar CONCLUÍDAS.'); return; }
        if (!clienteNome) { alert('O nome do cliente é obrigatório.'); return; }
        const dataEntregaObj = new Date(dataEntrega);
        const relatorioConteudo = DataService.generateAndSaveRelatorio(aeronave.codigo!, clienteNome, dataEntregaObj);
        if (typeof relatorioConteudo === 'string') {
            downloadRelatorio(relatorioConteudo);
            alert('Relatório Final gerado e salvo com sucesso!');
            onRelatorioGenerated();
        } else {
            alert('Falha ao gerar o relatório.');
        }
    };

    if (reportExists) {
        return (
            <div style={{ marginTop: '20px', padding: '15px', border: `1px solid ${C.green}`, backgroundColor: '#1a2f1a', borderRadius: '8px' }}>
                <h3 style={{ margin: '0 0 10px 0', color: C.greenLight }}>Produção Concluída</h3>
                <p style={{ color: C.textSecondary }}>Relatório gerado em: {aeronave.relatorio?.dataEntrega.toLocaleDateString('pt-BR')}</p>
                <button onClick={() => downloadRelatorio(aeronave.relatorio?.conteudoTexto ?? '')}
                    style={{ padding: '8px 15px', backgroundColor: C.green, color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                    Baixar Relatório (TXT)
                </button>
            </div>
        );
    }

    return (
        <div style={{ marginTop: '20px', padding: '15px', border: `1px solid ${C.border}`, borderRadius: '8px', backgroundColor: C.input }}>
            <h3 style={{ margin: '0 0 10px 0', color: C.textPrimary }}>Geração de Relatório Final</h3>
            {!isReadyForReport && <p style={{ color: C.orange, fontWeight: 'bold' }}>Necessário concluir TODAS as etapas para liberar o relatório.</p>}
            <form onSubmit={handleGenerateReport} style={{ display: 'grid', gap: '10px' }}>
                <div>
                    <label style={{ display: 'block', fontWeight: 'bold', color: C.textSecondary, marginBottom: '4px' }}>Nome do Cliente:</label>
                    <input type="text" value={clienteNome} onChange={(e) => setClienteNome(e.target.value)}
                        style={{ width: '100%', padding: '8px', backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: '6px', color: C.textPrimary, boxSizing: 'border-box' }}
                        disabled={!isAdmin || !isReadyForReport} required />
                </div>
                <div>
                    <label style={{ display: 'block', fontWeight: 'bold', color: C.textSecondary, marginBottom: '4px' }}>Data de Entrega:</label>
                    <input type="date" value={dataEntrega} onChange={(e) => setDataEntrega(e.target.value)}
                        style={{ width: '100%', padding: '8px', backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: '6px', color: C.textPrimary, boxSizing: 'border-box' }}
                        disabled={!isAdmin || !isReadyForReport} required />
                </div>
                <button type="submit" disabled={!isAdmin || !isReadyForReport}
                    style={{ padding: '10px 20px', backgroundColor: C.blue, color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', marginTop: '10px', opacity: (!isAdmin || !isReadyForReport) ? 0.5 : 1 }}>
                    Gerar e Finalizar Entrega
                </button>
            </form>
        </div>
    );
};

interface PecaManagementProps {
    aeronaveCodigo: string;
    pecas: Peca[];
    onPecaUpdate: () => void;
}

const PecaManagement: React.FC<PecaManagementProps> = ({ aeronaveCodigo, pecas, onPecaUpdate }) => {
    const { isAdmin, isEngineer } = useAuth();
    const [novaPeca, setNovaPeca] = useState<Omit<Peca, 'id' | 'status'>>({ nome: '', tipo: TipoPeca.NACIONAL, fornecedor: '' });
    const [statusChange, setStatusChange] = useState<{ [id: string]: StatusPeca }>({});

    const handleAddPeca = (e: React.FormEvent) => {
        e.preventDefault();
        if (!isAdmin || !novaPeca.nome || !novaPeca.fornecedor) { alert('Apenas Admin pode adicionar peças e todos os campos devem ser preenchidos.'); return; }
        DataService.addPecaToAeronave(aeronaveCodigo, { ...novaPeca, id: '', status: StatusPeca.EM_PRODUCAO });
        setNovaPeca({ nome: '', tipo: TipoPeca.NACIONAL, fornecedor: '' });
        onPecaUpdate();
    };

    const handleUpdateStatus = (pecaId: string) => {
        const novoStatus = statusChange[pecaId];
        if (!novoStatus || !isEngineer) return;
        const success = DataService.updatePecaStatus(aeronaveCodigo, pecaId, novoStatus);
        if (success) {
            alert(`Status atualizado para: ${novoStatus}`);
            setStatusChange(prev => { const s = { ...prev }; delete s[pecaId]; return s; });
            onPecaUpdate();
        } else { alert('Falha ao atualizar status.'); }
    };

    const StatusPecaTag: React.FC<{ status: StatusPeca }> = ({ status }) => {
        const colorMap = {
            [StatusPeca.PRONTA]: { bg: C.green, color: 'white' },
            [StatusPeca.EM_PRODUCAO]: { bg: C.blue, color: 'white' },
            [StatusPeca.EM_TRANSPORTE]: { bg: C.yellow, color: '#1a1a1a' },
        };
        const { bg, color } = colorMap[status];
        return <span style={{ backgroundColor: bg, color, padding: '3px 8px', borderRadius: '4px', fontSize: '12px' }}>{status}</span>;
    };

    const inputStyle: React.CSSProperties = { flex: 1, padding: '8px', backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: '6px', color: C.textPrimary };
    const selectStyle: React.CSSProperties = { ...inputStyle };

    return (
        <div style={{ marginTop: '30px' }}>
            <h3 style={{ color: C.textPrimary }}>Gestão de Peças Associadas</h3>
            {isAdmin && (
                <form onSubmit={handleAddPeca} style={{ border: `1px dashed ${C.border}`, padding: '15px', borderRadius: '8px', marginBottom: '20px', backgroundColor: C.input }}>
                    <h4 style={{ marginTop: 0, color: C.textSecondary }}>Adicionar Nova Peça (Admin)</h4>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <input type="text" placeholder="Nome da Peça" value={novaPeca.nome} onChange={(e) => setNovaPeca(p => ({ ...p, nome: e.target.value }))} required style={{ ...inputStyle, flex: 2 }} />
                        <input type="text" placeholder="Fornecedor" value={novaPeca.fornecedor} onChange={(e) => setNovaPeca(p => ({ ...p, fornecedor: e.target.value }))} required style={{ ...inputStyle, flex: 1.5 }} />
                        <select value={novaPeca.tipo} onChange={(e) => setNovaPeca(p => ({ ...p, tipo: e.target.value as TipoPeca }))} style={{ ...selectStyle, flex: 1 }}>
                            <option value={TipoPeca.NACIONAL}>Nacional</option>
                            <option value={TipoPeca.IMPORTADA}>Importada</option>
                        </select>
                        <button type="submit" style={{ padding: '8px 15px', backgroundColor: C.blue, color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Adicionar</button>
                    </div>
                </form>
            )}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
                <thead>
                    <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                        {['Nome', 'Tipo', 'Fornecedor', 'Status Atual', 'Ação (Engenheiro)'].map(h => (
                            <th key={h} style={{ textAlign: 'left', padding: '10px 0', color: C.textSecondary, fontSize: '13px' }}>{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {pecas.map((peca) => (
                        <tr key={peca.id} style={{ borderBottom: `1px solid ${C.borderLight}` }}>
                            <td style={{ padding: '10px 0', color: C.textPrimary }}>{peca.nome}</td>
                            <td style={{ padding: '10px 0', color: C.textSecondary }}>{peca.tipo}</td>
                            <td style={{ padding: '10px 0', color: C.textSecondary }}>{peca.fornecedor}</td>
                            <td style={{ padding: '10px 0' }}><StatusPecaTag status={peca.status} /></td>
                            <td style={{ padding: '10px 0', display: 'flex', gap: '5px' }}>
                                {(isEngineer && peca.status !== StatusPeca.PRONTA) ? (
                                    <>
                                        <select value={statusChange[peca.id] || peca.status} onChange={(e) => setStatusChange(prev => ({ ...prev, [peca.id]: e.target.value as StatusPeca }))}
                                            style={{ padding: '5px', borderRadius: '4px', backgroundColor: C.card, border: `1px solid ${C.border}`, color: C.textPrimary }}>
                                            {Object.values(StatusPeca).map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                        <button onClick={() => handleUpdateStatus(peca.id)}
                                            disabled={!statusChange[peca.id] || statusChange[peca.id] === peca.status}
                                            style={{ padding: '5px 10px', backgroundColor: C.blue, color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                                            Mudar
                                        </button>
                                    </>
                                ) : <span style={{ color: C.textMuted }}>{peca.status === StatusPeca.PRONTA ? 'Pronta' : 'Indisponível'}</span>}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

interface TesteManagementProps {
    aeronaveCodigo: string;
    testes: Teste[];
    onTestUpdate: () => void;
}

const TesteManagement: React.FC<TesteManagementProps> = ({ aeronaveCodigo, testes, onTestUpdate }) => {
    const { isEngineer } = useAuth();
    const [tipoTeste, setTipoTeste] = useState<TipoTeste>(TipoTeste.ELETRICO);
    const [resultado, setResultado] = useState<ResultadoTeste>(ResultadoTeste.APROVADO);

    const handleAddTeste = (e: React.FormEvent) => {
        e.preventDefault();
        if (!isEngineer) { alert('Sem permissão para registrar testes.'); return; }
        DataService.addTesteToAeronave(aeronaveCodigo, tipoTeste, resultado);
        onTestUpdate();
        alert(`Teste ${tipoTeste} registrado como ${resultado}.`);
    };

    const isTestFailed = testes.some(t => t.resultado === ResultadoTeste.REPROVADO);
    const selectStyle: React.CSSProperties = { padding: '8px', flex: 1, backgroundColor: '#243040', border: `1px solid ${C.border}`, borderRadius: '6px', color: C.textPrimary };

    return (
        <div style={{ marginTop: '30px', padding: '20px', border: `1px solid ${C.border}`, borderRadius: '8px', backgroundColor: C.input }}>
            <h3 style={{ color: C.textPrimary, marginTop: 0 }}>Registro de Testes</h3>
            {isEngineer && (
                <form onSubmit={handleAddTeste} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                    <select value={tipoTeste} onChange={(e) => setTipoTeste(e.target.value as TipoTeste)} style={selectStyle}>
                        {Object.values(TipoTeste).map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <select value={resultado} onChange={(e) => setResultado(e.target.value as ResultadoTeste)} style={selectStyle}>
                        <option value={ResultadoTeste.APROVADO}>Aprovado</option>
                        <option value={ResultadoTeste.REPROVADO}>Reprovado</option>
                    </select>
                    <button type="submit" style={{ padding: '8px 15px', backgroundColor: C.blue, color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Registrar</button>
                </form>
            )}
            {isTestFailed && <p style={{ color: C.orange, fontWeight: 'bold' }}>ATENÇÃO: Falha em um ou mais testes!</p>}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
                <thead>
                    <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                        {['Tipo de Teste', 'Resultado', 'Data'].map(h => (
                            <th key={h} style={{ textAlign: 'left', padding: '10px 0', color: C.textSecondary, fontSize: '13px' }}>{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {testes.map((t) => (
                        <tr key={t.id} style={{ borderBottom: `1px solid ${C.borderLight}` }}>
                            <td style={{ padding: '10px 0', color: C.textPrimary }}>{t.tipo}</td>
                            <td style={{ padding: '10px 0', color: t.resultado === ResultadoTeste.APROVADO ? '#4CAF50' : C.orange, fontWeight: 'bold' }}>{t.resultado}</td>
                            <td style={{ padding: '10px 0', color: C.textSecondary }}>{new Date().toLocaleDateString('pt-BR')}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const AeronaveDetailsPage: React.FC = () => {
    const { codigo } = useParams<{ codigo: string }>();
    const { isAdmin, isEngineer } = useAuth();
    const [aeronave, setAeronave] = useState<Aeronave | null>(null);
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState('');
    const [funcionarioSelecionado, setFuncionarioSelecionado] = useState('');
    const todosFuncionarios: Funcionario[] = DataService.loadFuncionarios();

    const loadAeronaveData = useCallback(() => {
        if (codigo) {
            const loadedAeronave = DataService.getAeronaveByCodigo(codigo);
            if (loadedAeronave?.relatorio) loadedAeronave.relatorio.dataEntrega = new Date(loadedAeronave.relatorio.dataEntrega);
            if (loadedAeronave) setAeronave(loadedAeronave);
            else setErro(`Aeronave com código ${codigo} não encontrada.`);
        }
        setLoading(false);
    }, [codigo]);

    useEffect(() => { loadAeronaveData(); }, [loadAeronaveData]);

    const handleUpdateEtapaStatus = (etapaId: string, statusAtual: StatusEtapa) => {
        if (!aeronave || !codigo || !isEngineer) { alert('Sem permissão.'); return; }
        const etapaIndex = aeronave.etapas.findIndex(e => e.id === etapaId);
        let novaStatus: StatusEtapa;
        if (statusAtual === StatusEtapa.PENDENTE) novaStatus = StatusEtapa.ANDAMENTO;
        else if (statusAtual === StatusEtapa.ANDAMENTO) novaStatus = StatusEtapa.CONCLUIDA;
        else return;
        if (novaStatus === StatusEtapa.CONCLUIDA && etapaIndex > 0 && aeronave.etapas[etapaIndex - 1].status !== StatusEtapa.CONCLUIDA) {
            alert('A etapa anterior deve ser concluída primeiro!'); return;
        }
        if (DataService.updateEtapaStatus(codigo!, etapaId, novaStatus)) loadAeronaveData();
        else alert('Falha ao atualizar etapa.');
    };

    const handleAssociateFuncionario = (etapaId: string) => {
        if (!aeronave || !codigo || !funcionarioSelecionado) { alert('Selecione um funcionário.'); return; }
        if (!isEngineer) { alert('Sem permissão.'); return; }
        if (DataService.addFuncionarioToEtapa(codigo!, etapaId, funcionarioSelecionado)) {
            alert('Funcionário associado!');
            setFuncionarioSelecionado('');
            loadAeronaveData();
        } else alert('Funcionário já associado.');
    };

    const handleRemoveFuncionario = (etapaId: string, funcionarioId: string) => {
        if (!isEngineer) { alert('Sem permissão.'); return; }
        if (DataService.removeFuncionarioFromEtapa(codigo!, etapaId, funcionarioId)) {
            alert('Funcionário removido!'); loadAeronaveData();
        } else alert('Falha ao remover.');
    };

    const handleSaveDetails = () => {
        if (!aeronave || !isAdmin) { alert('Sem permissão.'); return; }
        DataService.saveAeronave(aeronave);
        alert('Detalhes salvos!');
    };

    if (loading) return <Layout><h1 style={{ color: C.textPrimary }}>Carregando...</h1></Layout>;
    if (erro) return <Layout><h1 style={{ color: C.orange }}>Erro: {erro}</h1></Layout>;
    if (!aeronave) return <Layout><h1 style={{ color: C.textPrimary }}>Aeronave não especificada.</h1></Layout>;

    const inputStyle: React.CSSProperties = { width: '100%', padding: '8px', backgroundColor: C.input, border: `1px solid ${C.border}`, borderRadius: '6px', color: C.textPrimary, boxSizing: 'border-box' };

    const EtapasList: React.FC<{ etapas: Etapa[] }> = ({ etapas }) => (
        <div style={{ padding: '20px', border: `1px solid ${C.border}`, borderRadius: '8px', backgroundColor: C.input }}>
            <h2 style={{ color: C.textPrimary, marginTop: 0 }}>Etapas de Produção</h2>
            {etapas.map((etapa, index) => {
                const etapaAnteriorConcluida = index === 0 || etapas[index - 1].status === StatusEtapa.CONCLUIDA;
                const isNextEtapaReady = etapa.status === StatusEtapa.PENDENTE && etapaAnteriorConcluida;
                let buttonText = '';
                let buttonAction = StatusEtapa.PENDENTE;
                if (etapa.status === StatusEtapa.PENDENTE && isNextEtapaReady) { buttonText = 'Iniciar'; buttonAction = StatusEtapa.PENDENTE; }
                else if (etapa.status === StatusEtapa.ANDAMENTO) { buttonText = 'Finalizar'; buttonAction = StatusEtapa.ANDAMENTO; }
                const funcionariosAssociados = etapa.funcionariosDesignados.map(id => todosFuncionarios.find(f => f.id === id)?.nome || `ID: ${id}`);

                return (
                    <div key={etapa.id} style={{ marginBottom: '15px', border: `1px solid ${C.border}`, padding: '12px', borderRadius: '6px', backgroundColor: C.card }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ flex: 2 }}>
                                <strong style={{ color: etapa.status === StatusEtapa.CONCLUIDA ? '#4CAF50' : C.textPrimary }}>
                                    {index + 1}. {etapa.nome}
                                </strong>
                                <p style={{ fontSize: '12px', color: C.textMuted, margin: '4px 0 0' }}>Prazo: {etapa.prazo.toLocaleDateString('pt-BR')}</p>
                            </div>
                            <div style={{ flex: 1 }}>
                                <span style={{ fontWeight: 'bold', color: etapa.status === StatusEtapa.CONCLUIDA ? '#4CAF50' : etapa.status === StatusEtapa.ANDAMENTO ? C.blue : C.textMuted }}>
                                    {etapa.status}
                                </span>
                            </div>
                            <div style={{ flex: 1, textAlign: 'right' }}>
                                {buttonText && isEngineer ? (
                                    <button onClick={() => handleUpdateEtapaStatus(etapa.id, buttonAction)}
                                        style={{
                                            padding: '5px 10px', borderRadius: '4px', border: 'none', fontWeight: 'bold',
                                            backgroundColor: etapa.status === StatusEtapa.PENDENTE ? C.yellow : C.blue,
                                            color: etapa.status === StatusEtapa.PENDENTE ? '#1a1a1a' : 'white', cursor: 'pointer'
                                        }}>
                                        {buttonText}
                                    </button>
                                ) : etapa.status === StatusEtapa.CONCLUIDA ? (
                                    <span style={{ color: '#4CAF50', fontWeight: 'bold' }}>Concluída</span>
                                ) : (
                                    <span style={{ color: C.textMuted, fontWeight: 'bold' }}>Bloqueada</span>
                                )}
                            </div>
                        </div>
                        <div style={{ marginTop: '10px', borderTop: `1px dashed ${C.border}`, paddingTop: '10px' }}>
                            <p style={{ margin: '0 0 5px', fontSize: '12px', fontWeight: 'bold', color: C.textSecondary }}>Responsáveis:</p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '10px' }}>
                                {funcionariosAssociados.map((nome, i) => (
                                    <span key={i} style={{ backgroundColor: '#1e3a5f', padding: '3px 8px', borderRadius: '15px', fontSize: '12px', display: 'flex', alignItems: 'center', color: C.textPrimary }}>
                                        {nome}
                                        {isEngineer && (
                                            <button type="button" onClick={() => handleRemoveFuncionario(etapa.id, etapa.funcionariosDesignados[i])}
                                                style={{ marginLeft: '5px', background: 'none', border: 'none', color: C.orange, fontSize: '10px', cursor: 'pointer', padding: 0 }}>x</button>
                                        )}
                                    </span>
                                ))}
                            </div>
                            {isEngineer && (
                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                    <select value={funcionarioSelecionado} onChange={(e) => setFuncionarioSelecionado(e.target.value)}
                                        style={{ padding: '5px', borderRadius: '4px', flex: 1, backgroundColor: C.card, border: `1px solid ${C.border}`, color: C.textPrimary }}>
                                        <option value="">Selecione Funcionário...</option>
                                        {todosFuncionarios.map(f => <option key={f.id} value={f.id}>{f.nome} ({f.nivelPermissao})</option>)}
                                    </select>
                                    <button type="button" onClick={() => handleAssociateFuncionario(etapa.id)} disabled={!funcionarioSelecionado}
                                        style={{ padding: '5px 10px', backgroundColor: C.green, color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                                        Associar
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );

    return (
        <Layout>
            <h1 style={{ marginBottom: '20px', color: C.textPrimary, fontSize: '22px' }}>
                Detalhes da Aeronave: {aeronave.codigo} ({aeronave.modelo})
            </h1>
            <div style={{ display: 'flex', gap: '24px' }}>
                <div style={{ flex: 1, backgroundColor: C.card, padding: '20px', borderRadius: '10px', border: `1px solid ${C.border}` }}>
                    <RelatorioGeneration aeronave={aeronave} onRelatorioGenerated={loadAeronaveData} />
                    <hr style={{ margin: '20px 0', borderColor: C.border }} />
                    <h2 style={{ color: C.textPrimary, fontSize: '16px', marginTop: 0 }}>Informações Básicas</h2>
                    <div style={{ marginTop: '15px', display: 'grid', gap: '10px' }}>
                        <div>
                            <label style={{ display: 'block', fontWeight: 'bold', color: C.textSecondary, marginBottom: '4px' }}>Modelo:</label>
                            {isAdmin ? (
                                <input type="text" value={aeronave.modelo} onChange={(e) => setAeronave(prev => prev ? { ...prev, modelo: e.target.value } : null)} style={inputStyle} />
                            ) : (
                                <p style={{ padding: '8px', border: `1px solid ${C.border}`, borderRadius: '6px', color: C.textPrimary, margin: 0 }}>{aeronave.modelo}</p>
                            )}
                        </div>
                        <div>
                            <label style={{ display: 'block', fontWeight: 'bold', color: C.textSecondary, marginBottom: '4px' }}>Capacidade:</label>
                            {isAdmin ? (
                                <input type="number" value={aeronave.capacidade} onChange={(e) => setAeronave(prev => prev ? { ...prev, capacidade: parseInt(e.target.value) } : null)} style={inputStyle} />
                            ) : (
                                <p style={{ padding: '8px', border: `1px solid ${C.border}`, borderRadius: '6px', color: C.textPrimary, margin: 0 }}>{aeronave.capacidade} passageiros</p>
                            )}
                        </div>
                    </div>
                    {isAdmin && (
                        <button onClick={handleSaveDetails}
                            style={{ padding: '10px 20px', backgroundColor: C.green, color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', marginTop: '20px' }}>
                            Salvar Detalhes
                        </button>
                    )}
                </div>
                <div style={{ flex: 2, backgroundColor: C.card, padding: '20px', borderRadius: '10px', border: `1px solid ${C.border}` }}>
                    <EtapasList etapas={aeronave.etapas} />
                    <hr style={{ margin: '30px 0', borderColor: C.border }} />
                    <PecaManagement aeronaveCodigo={aeronave.codigo} pecas={aeronave.pecas} onPecaUpdate={loadAeronaveData} />
                    <hr style={{ margin: '30px 0', borderColor: C.border }} />
                    <TesteManagement aeronaveCodigo={aeronave.codigo} testes={aeronave.testes} onTestUpdate={loadAeronaveData} />
                </div>
            </div>
        </Layout>
    );
};

export default AeronaveDetailsPage;