# AutoMech - Marketplace de Serviços Automotivos

Plataforma marketplace que conecta clientes com problemas no carro a mecânicos próximos disponíveis. Inspirado em modelos como Uber e iFood, com foco em rapidez, transparência de preço e confiança.

## Arquitetura

```
automech-marketplace/
├── backend/          # NestJS + TypeORM + PostgreSQL
│   ├── src/
│   │   ├── auth/           # Autenticação JWT (register/login)
│   │   ├── users/          # Perfis de usuários
│   │   ├── mechanics/      # Perfis de mecânicos + reputação
│   │   ├── customers/      # Perfis de clientes + veículos
│   │   ├── service-requests/ # Solicitações de serviço
│   │   ├── quotes/         # Orçamentos
│   │   ├── reviews/        # Avaliações e reputação
│   │   ├── analytics/      # Eventos e métricas
│   │   ├── geolocation/    # Distância, estimativa de preço, urgência
│   │   ├── common/         # Enums compartilhados
│   │   └── database/       # Seed de dados para testes
│   └── ...
├── mobile/           # React Native (Expo)
│   ├── src/
│   │   ├── screens/        # Telas (auth, client, mechanic, common)
│   │   ├── components/     # Componentes reutilizáveis
│   │   ├── services/       # Camada de API (axios)
│   │   ├── contexts/       # AuthContext
│   │   └── types/          # TypeScript types e enums
│   └── ...
└── README.md
```

## Features do MVP

### Para Clientes
- Cadastro e login com JWT
- Solicitar serviço mecânico (12 categorias)
- Ver mecânicos próximos (ordenação por distância/avaliação)
- Receber e aceitar/recusar orçamentos
- Acompanhar status em tempo real
- Avaliar serviço (1-5 estrelas + comentário)

### Para Mecânicos
- Cadastro com perfil profissional
- Receber chamados por geolocalização
- Enviar orçamentos com preço e tempo estimado
- Atualizar status do atendimento
- Dashboard com métricas

### Sistema de Reputação
- Nota média calculada apenas com serviços finalizados
- Distribuição de notas (1 a 5 estrelas)
- Comentários organizados por data/utilidade
- Badge "Novo na plataforma"
- Selo de verificado
- Métricas: taxa de aceitação, tempo médio de resposta
- Denúncia de avaliação indevida

### Analytics
Eventos rastreados:
- `service_requested`, `quote_sent`, `quote_accepted/rejected`
- `service_accepted`, `service_started`, `service_completed`, `service_cancelled`
- `mechanic_profile_viewed`, `review_submitted`
- `user_registered`, `user_login`

Métricas calculadas:
- Taxa de conversão (pedido → serviço realizado)
- Tempo médio de aceite e conclusão
- Ticket médio
- Taxa de cancelamento

## Como Rodar Localmente

### Pré-requisitos
- Node.js 18+
- PostgreSQL 14+
- npm ou yarn

### 1. Configurar Banco de Dados

```bash
# Criar banco e usuário no PostgreSQL
psql -U postgres
CREATE USER automech WITH PASSWORD 'automech_secret';
CREATE DATABASE automech_db OWNER automech;
\q
```

### 2. Backend

```bash
cd backend

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Edite o .env com suas configurações de banco

# Rodar em desenvolvimento (cria tabelas automaticamente)
npm run start:dev

# O backend estará em http://localhost:3000
# Swagger/API docs em http://localhost:3000/api/docs
```

### 3. Seed de Dados (Opcional)

```bash
cd backend
npx ts-node src/database/seed.ts
```

Contas de teste criadas (senha: `Password123`):
- **Mecânicos**: carlos@automech.com, ana@automech.com, roberto@automech.com, maria@automech.com, joao@automech.com
- **Clientes**: pedro@example.com, lucia@example.com, marcos@example.com

### 4. Mobile App

```bash
cd mobile

# Instalar dependências
npm install

# Rodar com Expo
npx expo start
```

> **Nota**: Para conectar o app ao backend local, edite `src/services/api.ts` e ajuste o `API_URL` para o IP da sua máquina (ex: `http://192.168.1.100:3000/api`).

## Endpoints da API

### Auth
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/auth/register` | Cadastro (cliente ou mecânico) |
| POST | `/api/auth/login` | Login |

### Users
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/users/me` | Perfil do usuário logado |
| PUT | `/api/users/me` | Atualizar perfil |
| PUT | `/api/users/me/location` | Atualizar localização |

### Mechanics
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/mechanics/nearby` | Mecânicos próximos (lat, lng, radius) |
| GET | `/api/mechanics/top-rated` | Mecânicos mais bem avaliados |
| GET | `/api/mechanics/profile/:userId` | Perfil completo do mecânico |
| PUT | `/api/mechanics/profile` | Atualizar perfil |
| PUT | `/api/mechanics/availability` | Toggle disponibilidade |
| PUT | `/api/mechanics/location` | Atualizar localização |

### Service Requests
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/service-requests` | Criar solicitação |
| GET | `/api/service-requests/my-requests` | Minhas solicitações (cliente) |
| GET | `/api/service-requests/my-jobs` | Meus trabalhos (mecânico) |
| GET | `/api/service-requests/available` | Chamados disponíveis |
| GET | `/api/service-requests/:id` | Detalhes |
| PUT | `/api/service-requests/:id/status` | Atualizar status |

### Quotes
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/quotes` | Enviar orçamento |
| GET | `/api/quotes/service-request/:id` | Orçamentos por solicitação |
| GET | `/api/quotes/my-quotes` | Meus orçamentos (mecânico) |
| PUT | `/api/quotes/:id/accept` | Aceitar orçamento |
| PUT | `/api/quotes/:id/reject` | Recusar orçamento |

### Reviews
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/reviews` | Criar avaliação |
| GET | `/api/reviews/mechanic/:id` | Avaliações do mecânico |
| PUT | `/api/reviews/:id/report` | Denunciar avaliação |
| PUT | `/api/reviews/:id/helpful` | Marcar como útil |

### Analytics
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/analytics/metrics` | Dashboard de métricas |
| GET | `/api/analytics/events` | Eventos por tipo |
| GET | `/api/analytics/recent` | Eventos recentes |

### Geolocation
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/geolocation/distance` | Calcular distância |
| GET | `/api/geolocation/estimate-price` | Estimativa de preço |
| GET | `/api/geolocation/classify-urgency` | Classificar urgência |

## Fluxo de Status do Serviço

```
solicitado → orçamento recebido → aceito → em deslocamento → em atendimento → finalizado
     ↓              ↓                ↓           ↓                  ↓
  cancelado      cancelado       cancelado    cancelado          cancelado
```

## Tecnologias

**Backend**: NestJS, TypeORM, PostgreSQL, JWT (Passport), Swagger, bcrypt, class-validator

**Mobile**: React Native, Expo, React Navigation, Axios, AsyncStorage

## Modelagem de Dados

- **users**: Dados base (email, nome, role, localização)
- **mechanics_profile**: Reputação, especialidades, certificações, disponibilidade
- **customers_profile**: Dados do veículo
- **service_requests**: Solicitações com status, localização, urgência
- **quotes**: Orçamentos dos mecânicos
- **reviews**: Avaliações com nota e comentário
- **analytics_events**: Log estruturado de eventos
