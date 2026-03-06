# Providence Member Area - Guia de Uso

Bem-vindo ao Providence Member Area, uma plataforma completa para acompanhamento de contas de copy trading MT4/MT5 com comparação de rentabilidade contra o CDI.

## Visão Geral

O sistema foi desenvolvido para permitir que membros cadastrem suas contas de trading e acompanhem o desempenho de suas estratégias em comparação com a renda fixa (CDI). Administradores podem gerenciar estratégias e alimentar os resultados mensais.

## Estrutura do Sistema

### Para Usuários Comuns

**Dashboard (/)**: Página inicial com acesso rápido às principais funcionalidades.

**Minhas Contas (/contas)**: Gerencie suas contas MT4/MT5. Aqui você pode:
- Cadastrar uma nova conta informando: número da conta, estratégia selecionada, data de aprovação do copy, e valor do depósito inicial em dólares
- Visualizar todas as suas contas cadastradas
- Deletar contas que não deseja mais acompanhar

**Gráficos (/graficos)**: Visualize a evolução do seu capital ao longo do tempo. O sistema exibe:
- Gráfico comparativo entre a rentabilidade da sua estratégia e o CDI
- Resumo com depósito inicial, saldo atual da estratégia e saldo atual do CDI
- Dados atualizados mensalmente conforme os resultados são alimentados

**Calculadora (/calculadora)**: Simule cenários hipotéticos. Você pode:
- Informar um valor inicial de investimento
- Selecionar uma data no passado
- Escolher uma estratégia
- Ver quanto teria ganho se tivesse investido esse valor desde aquela data
- Comparar com o que teria ganho em renda fixa (CDI)

### Para Administradores

**Administração (/admin)**: Painel exclusivo para administradores com três abas:

1. **Estratégias**: Crie novas estratégias de trading (ex: ULTIMATE, ALAVANCADA) e visualize as estratégias existentes

2. **Resultados de Estratégias**: Informe o retorno percentual mensal de cada estratégia
   - Selecione a estratégia, ano, mês e o percentual de retorno
   - O sistema calcula automaticamente o saldo de cada usuário baseado nestes dados

3. **CDI/Renda Fixa**: Informe o retorno percentual mensal do CDI
   - Selecione o ano, mês e o percentual de retorno
   - Estes dados são usados para comparação nos gráficos e calculadora

## Fluxo de Uso Típico

### Novo Usuário

1. **Registrar**: Acesse o site e crie uma conta com email e senha
2. **Confirmar Email**: Verifique seu email e clique no link de confirmação
3. **Acessar Área de Membros**: Faça login com suas credenciais
4. **Cadastrar Conta**: Vá para "Minhas Contas" e clique em "Nova Conta"
   - Número da conta (ex: 123456)
   - Estratégia (ex: ULTIMATE)
   - Data de aprovação do copy
   - Depósito inicial em dólares
5. **Acompanhar Performance**: Acesse "Gráficos" para ver a evolução do seu capital

### Administrador

1. **Criar Estratégias**: Vá para Administração > Estratégias e crie as estratégias disponíveis
2. **Alimentar Resultados**: 
   - Vá para Administração > Resultados de Estratégias
   - Informe o retorno percentual mensal de cada estratégia
   - Vá para Administração > CDI/Renda Fixa
   - Informe o retorno percentual mensal do CDI
3. **Monitorar**: Os usuários verão automaticamente seus saldos atualizados nos gráficos

## Cálculos e Fórmulas

### Saldo Atual de uma Conta

O saldo é calculado aplicando os retornos mensais cumulativamente:

```
Saldo Final = Depósito Inicial × (1 + Retorno Mês 1) × (1 + Retorno Mês 2) × ... × (1 + Retorno Mês N)
```

Exemplo:
- Depósito: USD 1.000
- Mês 1: +5% → USD 1.050
- Mês 2: +3% → USD 1.081,50
- Mês 3: +2% → USD 1.103,13

### Comparação com CDI

O mesmo cálculo é aplicado para o CDI, permitindo comparação direta entre a estratégia e a renda fixa.

## Dados Financeiros

Todos os valores são armazenados em dólares (USD). Os retornos são informados em percentual (ex: 5.25 para 5,25%).

## Segurança

- Cada usuário só pode visualizar suas próprias contas
- Apenas administradores podem cadastrar estratégias e resultados mensais
- Senhas são criptografadas e nunca armazenadas em texto plano
- Confirmação de email obrigatória para ativar a conta

## Suporte

Para dúvidas ou problemas, entre em contato com o administrador do sistema.
