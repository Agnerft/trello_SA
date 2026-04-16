# 🎯 Kanban Pro - Sistema de Gestão de Tarefas

Uma aplicação completa estilo Trello para gestão de tarefas em formato Kanban, com interface moderna, responsiva e nível SaaS.

![Kanban Pro](https://img.shields.io/badge/Kanban-Pro-blue?style=for-the-badge)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-06B6D4?style=for-the-badge&logo=tailwindcss)

## ✨ Funcionalidades

### 📌 Boards (Quadros)
- ✅ Criar, editar e deletar boards
- ✅ Cada board representa um projeto
- ✅ Escolher cor de fundo personalizada
- ✅ Favoritar boards
- ✅ Dashboard inicial com todos os boards

### 📌 Listas (Colunas)
- ✅ Criar listas dentro de cada board
- ✅ Editar nome da lista
- ✅ Reordenar listas com drag and drop

### 📌 Cards (Tarefas)
- ✅ Criar cards dentro das listas
- ✅ Editar título e descrição
- ✅ Drag and drop entre listas
- ✅ Data de vencimento
- ✅ Prioridade (baixa, média, alta)
- ✅ Checklist dentro do card
- ✅ Comentários no card
- ✅ Labels (tags coloridas)

### 📌 Usuários
- ✅ Sistema de login e cadastro com JWT
- ✅ Cada usuário vê apenas seus boards

### 📌 UX/UI
- ✅ Design moderno estilo Notion/Trello
- ✅ Modo Dark e Light
- ✅ Animações suaves
- ✅ Interface limpa e profissional
- ✅ Totalmente responsivo (mobile + desktop)

### 📌 Dashboard
- ✅ Visão geral com estatísticas
- ✅ Quantidade de tarefas
- ✅ Tarefas concluídas
- ✅ Tarefas atrasadas
- ✅ Taxa de produtividade

### 📌 Extras
- ✅ Busca global de tarefas (Ctrl+K)
- ✅ Filtro por prioridade e data
- ✅ Atalhos de teclado
- ✅ Interface rápida (SPA)

## 🚀 Tecnologias

### Backend
- **Node.js** + **Express**
- **Prisma ORM** + **SQLite**
- **JWT** para autenticação
- **bcryptjs** para hash de senhas

### Frontend
- **React 18** + **Vite**
- **Tailwind CSS** para estilização
- **Zustand** para gerenciamento de estado
- **@dnd-kit** para drag and drop
- **React Router** para navegação
- **date-fns** para manipulação de datas
- **react-hot-toast** para notificações

## 📁 Estrutura do Projeto

```
trello-clone/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma    # Modelos do banco de dados
│   ├── routes/
│   │   ├── auth.js          # Autenticação
│   │   ├── boards.js        # Boards API
│   │   ├── lists.js         # Lists API
│   │   ├── cards.js         # Cards API
│   │   ├── users.js         # Users API
│   │   └── dashboard.js     # Dashboard stats
│   ├── middleware/
│   │   └── auth.js          # JWT middleware
│   ├── lib/
│   │   └── prisma.js        # Prisma client
│   ├── server.js            # Entry point
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/      # Componentes reutilizáveis
    │   ├── pages/           # Páginas da aplicação
    │   ├── store/           # Zustand stores
    │   ├── lib/             # Utilitários
    │   ├── App.jsx
    │   └── main.jsx
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    └── package.json
```

## 🛠️ Instalação

### Pré-requisitos
- Node.js 18+
- npm ou yarn

### Passo 1: Clonar o projeto
```bash
git clone <url-do-repositorio>
cd trello-clone
```

### Passo 2: Configurar Backend
```bash
cd backend

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Edite .env com suas configurações

# Gerar cliente Prisma
npx prisma generate

# Criar banco de dados
npx prisma migrate dev --name init

# Iniciar servidor
npm run dev
```

O backend estará rodando em `http://localhost:3001`

### Passo 3: Configurar Frontend
```bash
cd ../frontend

# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev
```

O frontend estará rodando em `http://localhost:5173`

## 📝 Scripts Disponíveis

### Backend
```bash
npm run dev       # Iniciar em modo desenvolvimento
npm start         # Iniciar em modo produção
npm run db:studio # Abrir Prisma Studio
```

### Frontend
```bash
npm run dev       # Iniciar servidor de desenvolvimento
npm run build     # Build para produção
npm run preview   # Preview do build
```

## 🔑 Atalhos de Teclado

| Atalho | Ação |
|--------|------|
| `Ctrl + K` | Buscar tarefas |
| `Ctrl + N` | Novo quadro |
| `Ctrl + B` | Meus quadros |
| `Esc` | Fechar modal |

## 🎨 Cores e Design

- **Primária**: Azul (#3b82f6)
- **Secundária**: Roxo (#8b5cf6)
- **Dark Mode**: Cinza escuro (#1f2937)
- **Tipografia**: Inter

## 📱 Responsividade

A aplicação é totalmente responsiva e funciona em:
- ✅ Desktop (1024px+)
- ✅ Tablet (768px+)
- ✅ Mobile (320px+)

## 🔒 Segurança

- Autenticação JWT
- Senhas hasheadas com bcrypt
- Proteção de rotas
- CORS configurado
- Validação de inputs

## 🚀 Deploy

### Opção 1: Docker (Recomendado)

**Pré-requisitos:** Docker e Docker Compose instalados

```bash
# Clone o repositório
git clone https://github.com/Agnerft/trello_SA.git
cd trello_SA

# Iniciar com Docker Compose
docker-compose up -d

# Verificar logs
docker-compose logs -f

# Parar
docker-compose down
```

**Acesse:**
- Frontend: http://localhost
- Backend API: http://localhost:3001/api

### Opção 2: Deploy Manual

#### Backend (Railway/Render/Heroku)
1. Configure as variáveis de ambiente
2. Execute as migrações do Prisma
3. Deploy!

#### Frontend (Vercel/Netlify)
1. Configure a variável `VITE_API_URL`
2. Build e deploy!

---

## 🐳 Docker Compose

O `docker-compose.yml` inclui:
- **Backend**: Node.js na porta 3001
- **Frontend**: Nginx na porta 80
- **Banco**: SQLite (persistente via volume)
- **Network**: Comunicação interna entre serviços

### Comandos úteis:

```bash
# Rebuild após mudanças
docker-compose up -d --build

# Ver logs de um serviço específico
docker-compose logs -f backend
docker-compose logs -f frontend

# Acessar container
docker exec -it kanban-backend sh
docker exec -it kanban-frontend sh

# Reset completo
docker-compose down -v
docker-compose up -d --build
```

## 📄 Licença

MIT License - sinta-se livre para usar e modificar!

---

Feito com ❤️ para aumentar sua produtividade!
