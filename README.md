# 🚀 TaskFlow • Gerenciador de Tarefas Inteligente

Uma aplicação full-stack moderna construída em **React**, **Express** e **SQLite**, com foco em alta produtividade, estética refinada e arquitetura limpa.

---

## 🛠️ Stack Tecnológica

* **Frontend:** React 19, Vite, Lucide Icons, Design System próprio (Vanilla CSS com variáveis semânticas HSL, suporte nativo a temas Dark/Light e glassmorphism).
* **Backend:** Node.js, Express, `@libsql/client` (SQLite), JWT (`jsonwebtoken`), `bcryptjs`, CORS.
* **Banco de Dados:** SQLite relacional com migrações automáticas e integridade referencial (`PRAGMA foreign_keys = ON`).

---

## 📋 Funcionalidades Implementadas (MVP v1.0)

1. **Autenticação & Isolamento Seguro:**
   * Registro e Login com senha criptografada via `bcrypt`.
   * Sessão via token JWT com isolamento estrito de dados por usuário.
   * Botão de acesso rápido para perfil de demonstração.

2. **Dashboard de Métricas em Tempo Real:**
   * **Tarefas Ativas**: contagem de tarefas pendentes.
   * **Concluídas Hoje**: total de tarefas finalizadas no dia com taxa de conclusão (%).
   * **Tarefas Atrasadas**: alerta visual para tarefas com prazo vencido.
   * **Alta Prioridade**: destaque de tarefas com urgência.
   * *Clique em qualquer card para filtrar a lista instantaneamente!*

3. **Gerenciamento Completo de Tarefas (CRUD):**
   * **Criação Rápida**: barra inline no topo com atalho `Enter`.
   * **Modal Detalhado**: título, descrição, categoria, prioridade, data de vencimento e tags.
   * **Alternância de Conclusão**: check com animação e riscado em tempo real.
   * **Edição e Exclusão**: controle completo de cada item.

4. **Filtros e Busca Dinâmica:**
   * Busca em tempo real por título ou descrição.
   * Filtro por status (Todas, Pendentes, Concluídas).
   * Filtro por prioridade (Baixa, Média, Alta, Urgente).
   * Filtro por categoria com contagem dinâmica.

5. **Design System & Temas:**
   * Suporte nativo a Tema Claro e Tema Escuro (Dark Mode).
   * Design responsivo para desktops, tablets e smartphones.

---

## ⚡ Como Executar o Projeto

### 1. Iniciar o Backend (Porta 5000)
```bash
npm run server:dev
```
O servidor estará rodando em `http://localhost:5000` e a API em `http://localhost:5000/api`.

### 2. Iniciar o Frontend (Porta 5173)
Em um novo terminal:
```bash
npm run client
```
Abra `http://localhost:5173` no seu navegador.

### 3. Rodar a Bateria de Testes Automatizados
```bash
npm run test:backend
```
