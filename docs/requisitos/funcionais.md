# Requisitos Funcionais - Finanças Pessoais

Este documento descreve os requisitos funcionais do sistema, ou seja, **as funcionalidades que o sistema deverá oferecer** para atender aos objetivos do projeto.

---

## RF01 - Cadastro de Usuário
O sistema deve permitir o cadastro de novos usuários, solicitando:
- Nome
- Email
- Senha
- Confirmação de senha

## RF02 - Autenticação
O sistema deve permitir que usuários autenticados façam login com:
- Email
- Senha

## RF03 - Recuperação de Senha
O sistema deve permitir que o usuário recupere sua senha por meio do envio de um email de recuperação.

## RF04 - Cadastro de Método de Pagamento
O usuário deve poder cadastrar um novo método de pagamento com os seguintes campos:
- Nome do método (ex: Cartão Nubank)
- Tipo: Crédito, Débito ou Dinheiro

## RF05 - Listagem de Métodos de Pagamento
O sistema deve listar todos os métodos de pagamento cadastrados pelo usuário, informando:
- Nome
- Tipo
- Saldo
- Data de criação

## RF06 - Exclusão de Método de Pagamento
O usuário deve poder deletar um método de pagamento existente.

## RF07 - Atualização de Saldo (Débito)
O sistema deve permitir que o usuário atualize o saldo de métodos do tipo **débito**.

## RF08 - Registro de Compra no Débito
O sistema deve permitir registrar uma nova compra no **débito**, com os seguintes campos:
- Descrição
- Valor total
- Data
- Método de pagamento (apenas métodos do tipo **débito**)

## RF09 - Registro de Compra no Crédito
O sistema deve permitir registrar uma nova compra no **crédito**, com os seguintes campos:
- Descrição
- Valor total
- Número de parcelas
- Data
- Método de pagamento (apenas métodos do tipo **crédito**)

## RF10 - Pagamento de Compra no Crédito
O sistema deve permitir que o usuário realize o pagamento de uma compra feita no **crédito**, utilizando um método de pagamento do tipo **débito**.

## RF11 - Listagem de Despesas
O sistema deve listar todas as despesas registradas com:
- Descrição
- Data
- Valor
- Forma de pagamento (débito/crédito)
- Método utilizado
- Status (Pago ou Pendente)

## RF12 - Visualização Gráfica das Despesas
O sistema deve exibir um gráfico de pizza com a distribuição total dos gastos:
- Total por tipo de pagamento (débito, crédito)

## RF13 - Atualização de Senha
O sistema deve permitir que o usuário altere sua senha, informando:
- Senha atual
- Nova senha
- Confirmação da nova senha

## RF14 - Exclusão de Conta
O sistema deve permitir ao usuário excluir sua conta.

## RF15 - Visualização do Perfil
O usuário deve poder visualizar seu perfil contendo:
- Nome
- Email
- Data de criação da conta

## RF16 - Filtros por Mês
O sistema deve permitir que o usuário visualize as despesas por mês.

