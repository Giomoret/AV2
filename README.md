


# ✈️ Aerocode - Gestão Aeronáutica (AV2)

O **Aerocode** evoluiu! De uma interface de linha de comando (CLI) para uma aplicação Web completa (GUI). O sistema gerencia todo o ciclo de vida de produção de aeronaves, desde o cadastro técnico até o dashboard de indicadores de desempenho, com persistência em tempo real.

Projeto desenvolvido para a disciplina de **Programação Orientada a Objetos (POO)** do curso de Análise e Desenvolvimento de Sistemas da **Fatec São José dos Campos**.

---

## ⚙️ Principais Funcionalidades

* **Dashboard Web:** Visualização de KPIs dinâmicos (aeronaves concluídas, em produção e total).
* **Controle de Acesso:** Autenticação baseada em perfis (Admin, Engenheiro, Operador) com rotas protegidas.
* **Linha de Montagem:** Gestão de aeronaves com sistema de status e geração automática de IDs sequenciais.
* **Relatórios e Auditoria:** Geração de relatórios detalhados para download em formato `.txt`.
* **Persistência Dinâmica:** Armazenamento automático utilizando `LocalStorage` para simular um banco de dados.

---

## 💻 Stack Tecnológica

* **Linguagem:** TypeScript (POO e Tipagem Estática)
* **Frontend:** React.js (Componentização e Hooks)
* **Build Tool:** Vite (Performance e Hot Reload)
* **Ambiente:** Node.js (v18+)

---

## 🚀 Como Rodar o Projeto

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/Giomoret/AV2.git
   ```

2. **Acesse o diretório do projeto:**
   ```bash
   cd AV2
   ```

3. **Instalação:**
   ```bash
   npm install
   ```

4. **Execução (Desenvolvimento)::**
   ```bash
   npm run dev
   ```

---

## 🔐 Matriz de Permissões

| Perfil | Dashboard | Gerir Funcionários | Criar Aeronave | Gerar Relatórios |
| :--- | :---: | :---: | :---: | :---: |
| **Admin** | ✅ | ✅ | ✅ | ✅ |
| **Engenheiro** | ✅ | ❌ | ✅ | ✅ |
| **Operador** | ✅ | ❌ | ❌ | ✅ |

---

## 📁 Arquitetura do Código

```text
aerocode-gui
├── src
│   ├── components   # Elementos visuais (Layout, Header, Cards)
│   ├── context      # Gestão de Autenticação (AuthContext)
│   ├── models       # Interfaces e Enums (Aeronave, Peça, Funcionario)
│   ├── pages        # Telas principais do sistema (Dashboard, Login, etc.)
│   ├── services     # Lógica de persistência de dados (MockData)
│   └── App.tsx      # Configuração de rotas e rotas protegidas
├── public           # Ativos estáticos (Ícones e Favicons)
├── package.json     # Gerenciamento de dependências
└── tsconfig.json    # Configurações do compilador TypeScript
```

---

## 📌 Dicionário de Status (Enums)

* **Status Etapa:** `PENDENTE`, `EM_ANDAMENTO`, `CONCLUIDA`.
* **Nível Permissão:** `ADMINISTRADOR`, `ENGENHEIRO`, `OPERADOR`.
* **Tipo Aeronave:** `COMERCIAL`, `MILITAR`.

---

**Desenvolvido por:** Giovanni Moretto  
**Fatec São José dos Campos - 2026**
