# Visão Geral do Sistema - Finanças Pessoais

## 1. Objetivo do Sistema

O sistema **Finanças Pessoais** tem como objetivo fornecer uma aplicação simples e funcional para controle financeiro individual. Ele permite que os usuários registrem e gerenciem suas despesas mensais, categorizadas por métodos de pagamento (crédito e débito), acompanhem seu saldo, visualizem a distribuição de gastos e mantenham controle de pagamentos pendentes.

---

## 2. Tecnologias Utilizadas

- **Frontend**: Desenvolvido com [React.js](https://reactjs.org/), utilizando o Vite como bundler e Tailwind CSS para o design da interface.
- **Backend**: Implementado em [PHP](https://www.php.net/) através de scripts individuais para cada funcionalidade.
- **Banco de Dados**: MySQL

---

## 3. Funcionalidades Principais

### Página Inicial (Home)

- Exibição do saldo total atual.
- Distribuição de gastos em formato de gráfico (débito e crédito).
- Botões de ação para:
  - Adicionar método de pagamento.
  - Registrar compra no débito.
  - Registrar compra no crédito.
- Lista de despesas:
  - Nome da despesa.
  - Data e forma de pagamento.
  - Método de pagamento utilizado.
  - Valor da despesa.
  - Status do pagamento (pago ou pendente).

### Página de Perfil

- Visualização de dados do usuário (nome, email, data de criação da conta).
- Alteração de senha.
- Exclusão de conta.

### Página de Cartões

- Visualização de todos os cartões cadastrados (débito e crédito).
- Informações apresentadas:
  - Nome do cartão.
  - Tipo (crédito ou débito).
  - Saldo disponível.
  - Data de criação.
- Opção para deletar cartões.

### Autenticação

- Tela de login com campos de email e senha.
- Tela de cadastro com confirmação de senha.
- Funcionalidade de recuperação de senha (ainda em desenvolvimento).

---

## 4. Estrutura de Código

### Backend (`codigo_fonte/backend/`)

Organizado em scripts PHP individuais, cada um responsável por uma funcionalidade específica:

- `login.php`, `logout.php`, `register.php`: controle de autenticação.
- `addExpense.php`, `getExpenses.php`, `payCreditExpense.php`: manipulação de despesas.
- `addPaymentMethod.php`, `getPaymentMethods.php`, `updateBalance.php`: gerenciamento de métodos e saldo.
- Diretório `accounts/`: operações relacionadas à conta do usuário (perfil, senha, exclusão).

### Frontend (`codigo_fonte/frontend/`)

- Utiliza a arquitetura baseada em componentes do React.
- Arquivos principais:
  - `App.jsx`, `main.jsx`: estrutura e ponto de entrada.
  - `components/`: contém os componentes de interface e modais de ação.
  - `pages/`: telas específicas (Home, Perfil, Login, etc.).
  - `lib/utils.js`: funções utilitárias.
  - `index.css`: customizações globais de estilo.

---

## 5. Público-Alvo

Usuários finais que desejam controlar suas finanças pessoais de forma prática, com foco em simplicidade e funcionalidades essenciais para o controle básico de gastos mensais.

---

## 6. Considerações Finais

O sistema foi planejado para ser intuitivo e direto ao ponto, utilizando tecnologias modernas no frontend com React e uma abordagem procedural no backend com PHP. Sua modularidade permite fácil manutenção e expansão futura, como adição de categorias de gastos, gráficos analíticos avançados, ou integração com APIs bancárias.

