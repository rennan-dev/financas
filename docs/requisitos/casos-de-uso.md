# Casos de Uso - Finanças Pessoais

## UC01 - Cadastrar Usuário
**Ator Principal:** Visitante  
**Descrição:** Permite ao visitante criar uma nova conta no sistema.  
**Fluxo Principal:**
1. O visitante informa nome, email, senha e confirmação de senha.
2. O sistema valida os dados e cria o usuário.
3. O sistema redireciona para a página de login.

---

## UC02 - Autenticar Usuário
**Ator Principal:** Usuário  
**Descrição:** Permite ao usuário acessar o sistema com suas credenciais.  
**Fluxo Principal:**
1. O usuário informa email e senha.
2. O sistema verifica as credenciais.
3. O usuário é autenticado e redirecionado para a página inicial.

---

## UC03 - Recuperar Senha
**Ator Principal:** Usuário  
**Descrição:** Permite ao usuário redefinir sua senha em caso de esquecimento.  
**Fluxo Principal:**
1. O usuário informa o email de cadastro.
2. O sistema envia um link de recuperação por email.
3. O usuário redefine a senha através do link recebido.

---

## UC04 - Adicionar Método de Pagamento
**Ator Principal:** Usuário  
**Descrição:** Permite cadastrar um novo cartão ou tipo de pagamento.  
**Fluxo Principal:**
1. O usuário informa o nome do método e seleciona o tipo (crédito, débito ou dinheiro).
2. O sistema armazena o método no banco de dados.

---

## UC05 - Visualizar Métodos de Pagamento
**Ator Principal:** Usuário  
**Descrição:** Permite visualizar todos os métodos de pagamento cadastrados.  
**Fluxo Principal:**
1. O usuário acessa a tela de cartões.
2. O sistema lista todos os métodos, com nome, tipo, saldo e data de criação.

---

## UC06 - Deletar Método de Pagamento
**Ator Principal:** Usuário  
**Descrição:** Permite ao usuário remover um método de pagamento cadastrado.  
**Fluxo Principal:**
1. O usuário seleciona um cartão.
2. O sistema exclui o cartão e atualiza a interface.

---

## UC07 - Atualizar Saldo de Cartão de Débito
**Ator Principal:** Usuário  
**Descrição:** Permite inserir ou modificar o saldo disponível de um cartão de débito.  
**Fluxo Principal:**
1. O usuário informa o novo saldo.
2. O sistema atualiza o valor associado ao método de débito.

---

## UC08 - Registrar Compra no Débito
**Ator Principal:** Usuário  
**Descrição:** Permite registrar uma nova despesa paga com um cartão de débito.  
**Fluxo Principal:**
1. O usuário preenche os campos: descrição, valor, data e método de pagamento.
2. O sistema valida o saldo e registra a compra como "paga".

---

## UC09 - Registrar Compra no Crédito
**Ator Principal:** Usuário  
**Descrição:** Permite adicionar uma despesa no crédito, com opção de parcelamento.  
**Fluxo Principal:**
1. O usuário preenche os campos: descrição, valor, número de parcelas, data e método de pagamento.
2. O sistema registra a compra e gera parcelas na tabela `installments`.

---

## UC10 - Pagar Parcela com Débito
**Ator Principal:** Usuário  
**Descrição:** Permite o pagamento de uma parcela do crédito com um cartão de débito.  
**Fluxo Principal:**
1. O usuário seleciona a despesa e o método de débito.
2. O sistema verifica o saldo e marca a parcela como "paga".

---

## UC11 - Listar Despesas
**Ator Principal:** Usuário  
**Descrição:** Permite visualizar todas as despesas registradas.  
**Fluxo Principal:**
1. O sistema exibe uma lista contendo: nome, valor, forma de pagamento, status e data.
2. O usuário pode filtrar por mês.

---

## UC12 - Visualizar Gráfico de Gastos
**Ator Principal:** Usuário  
**Descrição:** Permite acompanhar a distribuição dos gastos mensais.  
**Fluxo Principal:**
1. O sistema calcula o total de gastos por tipo (crédito e débito).
2. Os dados são exibidos em gráfico de pizza.

---

## UC13 - Alterar Senha
**Ator Principal:** Usuário  
**Descrição:** Permite alterar a senha atual por uma nova.  
**Fluxo Principal:**
1. O usuário fornece a senha atual, a nova senha e sua confirmação.
2. O sistema valida e atualiza a senha.

---

## UC14 - Excluir Conta
**Ator Principal:** Usuário  
**Descrição:** Permite excluir permanentemente a conta do sistema.  
**Fluxo Principal:**
1. O usuário confirma a exclusão.
2. O sistema remove o usuário e todos os dados relacionados.

---

## UC15 - Visualizar Perfil
**Ator Principal:** Usuário  
**Descrição:** Permite ver informações da conta, como nome, email e data de criação.  
**Fluxo Principal:**
1. O usuário acessa a página de perfil.
2. O sistema exibe os dados do usuário.

