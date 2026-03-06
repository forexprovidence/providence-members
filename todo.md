# Providence Member Area - TODO

## Funcionalidades Principais

### Autenticação e Usuários
- [x] Sistema de autenticação com confirmação de email (mantido do projeto original)
- [x] Projeto web inicializado com suporte a banco de dados

### Banco de Dados
- [x] Estender schema com tabelas: estratégias, contas MT4/MT5, resultados mensais, CDI
- [x] Criar migrations do banco de dados

### Procedimentos tRPC
- [x] Criar procedimentos para CRUD de contas (criar, listar, atualizar, deletar)
- [x] Criar procedimentos para CRUD de estratégias (admin)
- [x] Criar procedimentos para CRUD de resultados mensais (admin)
- [x] Criar procedimentos para CRUD de CDI mensal (admin)
- [x] Criar procedimentos para cálculo de rentabilidade

### Painel Admin
- [x] Página de administração para cadastro de estratégias
- [x] Página de administração para resultados mensais por estratégia
- [x] Página de administração para CDI/renda fixa mensal
- [x] Formulários de entrada com validação

### Dashboard do Usuário
- [x] Página de contas do usuário (listagem)
- [x] Formulário para cadastro de nova conta MT4/MT5
- [x] Exibição do saldo aproximado por conta
- [x] Cálculo automático baseado em depósito inicial e resultados

### Gráficos e Visualizações
- [x] Gráfico comparativo de rentabilidade (estratégia vs CDI)
- [x] Integração com Recharts para visualizações
- [x] Exibição de evolução do capital ao longo do tempo

### Calculadora
- [x] Página da calculadora de simulação
- [x] Formulário para entrada de valor hipotético e data
- [x] Cálculo de cenários comparativos (estratégias vs renda fixa)
- [x] Exibição de resultados simulados

### UI e Tradução
- [x] Traduzir toda navegação para português brasileiro
- [x] Traduzir labels, placeholders e mensagens
- [x] Ajustar componentes de UI para dados financeiros
- [x] Implementar layout responsivo

### Testes
- [x] Testes unitários para cálculos de rentabilidade
- [ ] Testes de fluxo de cadastro de contas
- [ ] Testes do painel admin

### Correções
- [x] Atualizar página inicial (Home.tsx) com dashboard real e navegação

### Deploy
- [ ] Criar checkpoint final
- [ ] Testar fluxos críticos
- [ ] Documentar instruções de uso
