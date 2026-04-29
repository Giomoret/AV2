import {
    type Aeronave, TipoAeronave, StatusEtapa, NivelPermissao,
    type Funcionario, TipoPeca, StatusPeca, TipoTeste, ResultadoTeste, type Etapa, type Peca
} from '../models/AeroCodeTypes';

// Mantemos o generateId aleatório apenas para Peças, Etapas e Testes
const generateId = (): string => Math.random().toString(36).substring(2, 9);

const mockFuncionarios: Funcionario[] = [
    { id: 'F001', nome: 'Administrador', telefone: '11987654321', endereco: 'Rua A, 123', usuario: 'admin', senha: '123', nivelPermissao: NivelPermissao.ADMINISTRADOR },
    { id: 'F002', nome: 'Eng. Chefe', telefone: '11999998888', endereco: 'Rua B, 456', usuario: 'engenheiro', senha: '123', nivelPermissao: NivelPermissao.ENGENHEIRO },
    { id: 'F003', nome: 'Operador Fabrica', telefone: '11977776666', endereco: 'Rua C, 789', usuario: 'operador', senha: '123', nivelPermissao: NivelPermissao.OPERADOR },
];

const mockPecas: Peca[] = [
    { id: 'P001', nome: 'Fuselage Dianteira', tipo: TipoPeca.IMPORTADA, fornecedor: 'China Aero', status: StatusPeca.EM_TRANSPORTE },
    { id: 'P002', nome: 'Asa Esquerda', tipo: TipoPeca.NACIONAL, fornecedor: 'Asas BR', status: StatusPeca.PRONTA },
    { id: 'P003', nome: 'Trem de Pouso', tipo: TipoPeca.IMPORTADA, fornecedor: 'Gear Inc', status: StatusPeca.PRONTA },
];

const etapasEmAndamento: Etapa[] = [
    { id: 'E001', nome: 'Montagem da Fuselagem', prazo: new Date(2025, 11, 15), status: StatusEtapa.CONCLUIDA, funcionariosDesignados: ['F002', 'F003'] },
    { id: 'E002', nome: 'Instalação da Asa', prazo: new Date(2026, 0, 20), status: StatusEtapa.ANDAMENTO, funcionariosDesignados: ['F002'] },
    { id: 'E003', nome: 'Instalação do Trem de Pouso', prazo: new Date(2026, 1, 10), status: StatusEtapa.PENDENTE, funcionariosDesignados: [] },
    { id: 'E004', nome: 'Testes Elétricos', prazo: new Date(2026, 2, 5), status: StatusEtapa.PENDENTE, funcionariosDesignados: [] },
];

export const mockAeronaves: Aeronave[] = [
    {
        codigo: 'E195-BR01',
        modelo: 'E195-E2',
        tipo: TipoAeronave.COMERCIAL,
        capacidade: 146,
        alcance: 4800,
        etapas: etapasEmAndamento,
        pecas: mockPecas,
        testes: [{ id: 'T001', tipo: TipoTeste.ELETRICO, resultado: ResultadoTeste.REPROVADO }],
        relatorio: null,
    },
    {
        codigo: 'C390-MIL02',
        modelo: 'KC-390 Millennium',
        tipo: TipoAeronave.MILITAR,
        capacidade: 80,
        alcance: 6000,
        etapas: [{ id: 'E100', nome: 'Montagem Inicial', prazo: new Date(2026, 5, 1), status: StatusEtapa.PENDENTE, funcionariosDesignados: [] }],
        pecas: [],
        testes: [],
        relatorio: null,
    }
];

export const AuthService = {
    login: (usuario: string, senha: string): Funcionario | null => {
        const funcionarios = DataService.loadFuncionarios();
        return funcionarios.find(f => f.usuario === usuario && f.senha === senha) || null;
    }
};

export const DataService = {
    // --- GESTÃO DE AERONAVES ---
    loadAeronaves: (): Aeronave[] => {
        const stored = localStorage.getItem('aerocodeAeronaves');
        if (!stored) return mockAeronaves;
        const aeronaves: Aeronave[] = JSON.parse(stored);
        aeronaves.forEach(aero => {
            aero.etapas.forEach(etapa => etapa.prazo = new Date(etapa.prazo));
            if (aero.relatorio) aero.relatorio.dataEntrega = new Date(aero.relatorio.dataEntrega);
        });
        return aeronaves;
    },

    saveAeronaves: (aeronaves: Aeronave[]): void => {
        localStorage.setItem('aerocodeAeronaves', JSON.stringify(aeronaves));
    },

    getAeronaveByCodigo: (codigo: string): Aeronave | undefined => {
        return DataService.loadAeronaves().find(a => a.codigo === codigo);
    },

    saveAeronave: (newAeronave: Aeronave): void => {
        const aeronaves = DataService.loadAeronaves();
        const index = aeronaves.findIndex(a => a.codigo === newAeronave.codigo);
        newAeronave.etapas = newAeronave.etapas.map(e => e.id ? e : { ...e, id: generateId() });
        newAeronave.pecas = newAeronave.pecas.map(p => p.id ? p : { ...p, id: generateId() });
        if (index > -1) aeronaves[index] = newAeronave;
        else aeronaves.push(newAeronave);
        DataService.saveAeronaves(aeronaves);
    },

    // --- GESTÃO DE FUNCIONÁRIOS (ALTERADO PARA ID SEQUENCIAL) ---
    loadFuncionarios: (): Funcionario[] => {
        const stored = localStorage.getItem('aerocodeFuncionarios');
        return stored ? JSON.parse(stored) : mockFuncionarios;
    },

    saveFuncionarios: (funcionarios: Funcionario[]): void => {
        localStorage.setItem('aerocodeFuncionarios', JSON.stringify(funcionarios));
    },

    addFuncionario: (newFuncionarioData: Omit<Funcionario, 'id'>): boolean => {
        const funcionarios = DataService.loadFuncionarios();

        if (funcionarios.some(f => f.usuario === newFuncionarioData.usuario)) {
            return false;
        }

        // Lógica de ID Sequencial (F001, F002...)
        const numerosIds = funcionarios.map(f => parseInt(f.id.replace('F', '')) || 0);
        const maiorId = Math.max(...numerosIds, 0);
        const novoId = `F${(maiorId + 1).toString().padStart(3, '0')}`;

        const newFuncionario: Funcionario = {
            ...newFuncionarioData,
            id: novoId,
            senha: newFuncionarioData.senha || '123',
        };

        funcionarios.push(newFuncionario);
        DataService.saveFuncionarios(funcionarios);
        return true;
    },

    deleteFuncionario: (id: string): boolean => {
        const funcionarios = DataService.loadFuncionarios();
        if (id === 'F001') return false; // Bloqueia remoção do Admin principal
        const newFuncionarios = funcionarios.filter(f => f.id !== id);
        if (newFuncionarios.length < funcionarios.length) {
            DataService.saveFuncionarios(newFuncionarios);
            return true;
        }
        return false;
    },

    // --- MÉTODOS DE PRODUÇÃO ---
    updateEtapaStatus: (aeronaveCodigo: string, etapaId: string, novoStatus: StatusEtapa): boolean => {
        const aeronaves = DataService.loadAeronaves();
        const aero = aeronaves.find(a => a.codigo === aeronaveCodigo);
        if (!aero) return false;
        const etapaIndex = aero.etapas.findIndex(e => e.id === etapaId);
        if (etapaIndex === -1) return false;

        // Regra de ordem sequencial
        if (novoStatus === StatusEtapa.CONCLUIDA && etapaIndex > 0) {
            if (aero.etapas[etapaIndex - 1].status !== StatusEtapa.CONCLUIDA) return false;
        }

        aero.etapas[etapaIndex].status = novoStatus;
        DataService.saveAeronaves(aeronaves);
        return true;
    },

    generateAndSaveRelatorio: (aeronaveCodigo: string, clienteNome: string, dataEntrega: Date): string | false => {
        const aeronaves = DataService.loadAeronaves();
        const aero = aeronaves.find(a => a.codigo === aeronaveCodigo);
        if (!aero || !aero.etapas.every(e => e.status === StatusEtapa.CONCLUIDA)) return false;

        const conteudoTexto = `--- RELATÓRIO FINAL: ${aero.codigo} ---\nCLIENTE: ${clienteNome}\nMODELO: ${aero.modelo}\nSTATUS: CONCLUÍDO`;

        aero.relatorio = {
            clienteNome, dataEntrega, aeronaveCodigo: aero.codigo,
            aeronaveModelo: aero.modelo, aeronaveTipo: aero.tipo,
            aeronaveCapacidade: aero.capacidade, aeronaveAlcance: aero.alcance,
            etapasRealizadas: [...aero.etapas], pecasUtilizadas: [...aero.pecas],
            resultadosTestes: [...aero.testes], conteudoTexto
        };

        DataService.saveAeronaves(aeronaves);
        return conteudoTexto;
    }
};

// Inicialização única
if (!localStorage.getItem('aerocodeAeronaves')) DataService.saveAeronaves(mockAeronaves);
if (!localStorage.getItem('aerocodeFuncionarios')) DataService.saveFuncionarios(mockFuncionarios);