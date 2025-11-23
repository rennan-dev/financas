# Documento de Backlog do Produto: Sistema de Finanças Pessoais
### Contexto: Engenharia Reversa

## Introdução

Este documento apresenta o Backlog do Produto resultante do processo de Engenharia Reversa realizado sobre o código-fonte do Sistema de Finanças Pessoais. O objetivo deste artefato é documentar funcionalmente o sistema em seu estado atual, detalhando as Histórias de Usuário, Critérios de Aceitação e Regras de Negócio recuperadas através da análise estática de arquivos de backend (PHP) e frontend (React/JSX).

A documentação reflete o comportamento real do sistema, evidenciando tanto as funcionalidades implementadas quanto as limitações e regras de negócio implícitas no código.


## Requisitos Funcionais - User Stories 

Esta seção detalha as funcionalidades do sistema no formato de Histórias de Usuário, com rastreabilidade direta para os arquivos de código analisados. O primeiro passo é documentar três elementos importantes das histórias. Os elementos fornecem clareza sobre o que deve ser desenvolvido e quais critérios devem ser atendidos para a história de usuário ser considerada completa. 

Os três elementos são: (a) Descrição da história de usuário; (b) Critérios de aceitação e (c) Regras de negócio a serem atendidas pela funcionalidade. 

É importante destacar que as  evidências de cada história é apresentado de duas maneiras: 
- **(i) Evidências a nível de Backend:** apresentada na ultima linha da tabela da história com o objetivo de apresentar a conformidade da história com os fluxos internos do sistema. 
- **(ii) Evidências a nível de Frontend:** apresentada após a história através de imagens anexadas com o objetivo de apresentar a conformidade da história com a interface do sistema. 

### US01- Cadastro de Usuário
---

| Campo | Detalhe |
| :--- | :--- |
| **Identificador** | **US01** |
| **User Story** | "Enquanto **visitante**, quero **criar uma conta informando meus dados pessoais** para **obter acesso ao sistema e gerenciar minhas finanças**." |
| **Critérios de Aceitação** | 1. O sistema deve receber os dados: Nome, E-mail, Senha e Confirmação de senha.<br>2. O sistema deve limpar os campos de texto atarvés da remoção de espaços desnecessários no início e fim (`trim`).<br>3. Após o cadastro com sucesso, o sistema deve retornar a mensagem "Usuário Cadastrado com sucesso".<br>4. Comportamento específico: Após o cadastro, o usuário já deve ser considerado logado automaticamente. |
| **Regras de Negócio** | **RN01 (Consistência):** Os campos "Senha" e "Confirmação de Senha" devem ser idênticos.<br>**RN02 (Segurança):** A senha deve ter no mínimo 6 caracteres e **não** pode conter espaços em branco.<br>**RN03 (Unicidade):** Não é permitido cadastrar um e-mail já existente na base de dados.<br>**RN04 (Proteção):** A senha deve ser armazenada como Hash, nunca em texto plano. |
| **Evidência (Backend)** | **Arquivo:** `register.php`<br>• *RN02:* `if (strlen($password) < 6 ...)`<br>• *RN03:* `SELECT id FROM users WHERE email = ?`<br>• *RN04:* `password_hash($password, PASSWORD_DEFAULT)` |

#### Evidência (Interface): 

---

### US02- Validação de Login de Usuário

---
| Campo | Detalhe |
| :--- | :--- |
| **Identificador** | **US02** |
| **User Story** | "Enquanto **usuário cadastrado**, quero **realizar login com minhas credenciais** para **acessar o painel e meus dados financeiros.**" |
| **Critérios de Aceitação** | 1. O sistema deve receber E-mail e Senha via JSON.<br>2. Ao logar com sucesso, deve retornar status "success" e o ID/E-mail do usuário.<br>3. O sistema deve distinguir mensagens de erro para "Usuário não encontrado" e "Credenciais inválidas".<br>4. O acesso deve ser permitido via CORS apenas para a origem `localhost:5173`. |
| **Regras de Negócio** | **RN01 (Segurança de Hash):** A validação da senha deve usar comparação de hash (`password_verify`), jamais comparação direta de texto.<br>**RN02 (Segurança de Sessão):** Ao autenticar com sucesso, o ID da sessão deve ser regenerado (`session_regenerate_id`) para evitar sequestro de sessão.<br>**RN03 (Higienização):** O e-mail deve ter espaços removidos antes da busca.<br>**RN04 (Fluxo):** O login falha imediatamente se o e-mail não existir no banco. |
| **Evidência (Backend)** | **Arquivo:** `login.php`<br>• *RN01:* `password_verify($password, $row['password'])`<br>• *RN02:* `session_regenerate_id(true)`<br>• *RN04:* `if ($result->num_rows > 0) { ... } else { ... "Usuário não encontrado" }` |

#### Evidência (Interface): 
---


### US03- Alteração de Senha

---
| Campo | Detalhe |
| :--- | :--- |
| **Identificador** | **US03** |
| **User Story** | "Enquanto **usuário autenticado**, quero **redefinir minha senha de acesso** para **garantir a segurança da minha conta, validando minha identidade atual.**" |
| **Critérios de Aceitação** | 1. A funcionalidade só deve estar acessível para usuários logados (Sessão ativa).<br>2. O usuário deve informar: Senha Atual, Nova Senha e Confirmação.<br>3. O sistema deve bloquear a operação se qualquer campo estiver vazio.<br>4. Deve exibir mensagem de erro específica se a "Senha Atual" informada não corresponder à salva no banco.<br>5. Em caso de sucesso, deve retornar a mensagem "Senha alterada com sucesso". |
| **Regras de Negócio** | **RN01 (Autorização):** Se a sessão do usuário não existir (`!isset`), o sistema deve retornar erro "Não autorizado" imediatamente.<br>**RN02 (Segurança Crítica):** A alteração só é permitida se o hash da **senha atual** informada bater com o hash salvo no banco (`password_verify`).<br>**RN03 (Consistência):** A nova senha e a confirmação devem ser idênticas.<br>**RN04 (Complexidade):** A nova senha segue as mesmas regras do cadastro (mínimo 6 caracteres, sem espaços).<br>**RN05 (Sanitização):** Todos os campos de entrada sofrem `trim` (remoção de espaços nas pontas) antes da validação. |
| **Evidência (Backend)** | **Arquivo:** `update_password.php`<br>• *RN01:* `if (!isset($_SESSION['user_id']))`<br>• *RN02:* `if (!password_verify($current_password, $row['password']))`<br>• *RN04:* `if (strlen($new_password) < 6 ...)` |

#### Evidência (Interface): 

---

### US04- Exclusão de Usuário

---
| Campo | Detalhe |
| :--- | :--- |
| **Identificador** | **US04** |
| **User Story** | "Enquanto **usuário insatisfeito ou que não utiliza mais o sistema**, quero **excluir minha conta permanentemente** para **remover todos os meus dados pessoais e histórico do sistema.**" |
| **Critérios de Aceitação** | 1. A funcionalidade deve ser exclusiva para usuários com sessão ativa.<br>2. A operação é irreversível; não deve haver "lixeira" para contas.<br>3. Após a exclusão, o usuário deve ser deslogado imediatamente (Sessão encerrada).<br>4. O sistema deve retornar uma mensagem de sucesso confirmando a exclusão. |
| **Regras de Negócio** | **RN01 (Integridade Referencial):** A exclusão do usuário deve disparar, em nível de banco de dados, a exclusão em cascata (`ON DELETE CASCADE`) de todos os registros vinculados (listas, tarefas, despesas).<br>**RN02 (Autorização):** Tentativas de exclusão sem sessão válida devem ser rejeitadas com erro "Não autorizado".<br>**RN03 (Segurança de Sessão):** O comando `session_destroy()` deve ser executado obrigatoriamente após o sucesso no banco, invalidando o cookie de acesso. |
| **Evidência (Backend)** | **Arquivo:** `delete_account.php`<br>• *RN01:* Comentário técnico: `// Deleta o usuário; com ON DELETE CASCADE...`<br>• *RN02:* `if (!isset($_SESSION['user_id']))`<br>• *RN03:* `session_destroy()` |

#### Evidência (Interface): 

---

### US05- Cadastro de Método de Pagamento
---
| Campo | Detalhe |
| :--- | :--- |
| **Identificador** | **US05** |
| **User Story** | "Enquanto **usuário**, quero **cadastrar nomes de formas de pagamento (ex: 'NuBank', 'Carteira')** para **classificar a origem das minhas despesas.**" |
| **Critérios de Aceitação** | 1. O sistema deve aceitar um JSON contendo o ID do usuário e o Nome do método.<br>2. O sistema deve retornar erro HTTP 400 se o nome ou ID não forem enviados.<br>3. Em caso de sucesso, deve retornar HTTP 201 (Created) e o objeto criado (incluindo o ID gerado pelo banco).<br>4. O método criado deve estar associado estritamente ao usuário informado. |
| **Regras de Negócio** | **RN01 (Obrigatoriedade):** Os campos `user_id` e `name` são mandatórios para a operação.<br>**RN02 (Tipagem e Sanitização):** O `user_id` é convertido forçadamente para inteiro (`intval`) e o nome tem espaços removidos (`trim`).<br>**RN03 (Modelo de Dados):** Neste ponto do sistema, um método de pagamento consiste apenas em uma "Etiqueta" (Nome), sem definição de limites, datas de vencimento ou saldos iniciais.<br>**RN04 (Protocolo HTTP):** O sistema utiliza códigos de resposta semânticos: 201 para sucesso na criação, 400 para erro de cliente e 500 para erro de banco. |
| **Evidência (Backend)** | **Arquivo:** `addPaymentMethod.php`<br>• *RN01:* `if (!isset($data['user_id']) || !isset($data['name']))`<br>• *RN02:* `intval($data['user_id']); trim($data['name']);`<br>• *RN04:* `http_response_code(201);` vs `http_response_code(400);` |

#### Evidência (Interface): 

---

### US06- Atualização Manual de Saldo

---
| Campo | Detalhe |
| :--- | :--- |
| **Identificador** | **US06** |
| **User Story** | "Enquanto **usuário**, quero **ajustar manualmente o saldo de um método de pagamento** para **corrigir divergências ou reconciliar com meu banco real.**" |
| **Critérios de Aceitação** | 1. O sistema deve receber o ID do usuário, o ID do método e o Novo Valor.<br>2. O campo de saldo deve aceitar valores decimais (ponto flutuante).<br>3. Se faltar qualquer parâmetro, deve retornar erro HTTP 400.<br>4. O sistema deve confirmar o sucesso da operação via JSON. |
| **Regras de Negócio** | **RN01 (Segurança de Acesso/IDOR):** A atualização só pode ocorrer se o método de pagamento pertencer ao usuário informado (`WHERE id = ? AND user_id = ?`). Isso impede alterar dados de terceiros.<br>**RN02 (Tipagem de Dados):** O saldo é tratado como número flutuante (`floatval`), permitindo centavos.<br>**RN03 (Obrigatoriedade):** Todos os três campos (User ID, Payment ID e Novo Saldo) são obrigatórios para o processamento. |
| **Evidência (Backend)** | **Arquivo:** `updateBalance.php`<br>• *RN01:* `UPDATE ... WHERE id = ? AND user_id = ?`<br>• *RN02:* `$newBalance = floatval($data['newBalance']);`<br>• *RN03:* `if (!isset(...) || !isset(...) ...)` |

#### Evidência (Interface): 

---

### US07- Exclusão de Método de Pagamento

---
| Campo | Detalhe |
| :--- | :--- |
| **Identificador** | **US07** |
| **User Story** | "Enquanto **usuário**, quero **remover métodos de pagamento que não utilizo mais** para **manter minha lista de opções limpa e organizada.**" |
| **Critérios de Aceitação** | 1. O sistema deve exigir o ID do método a ser excluído via parâmetro de URL (Query String).<br>2. Para efetivar a exclusão, a requisição deve ser do tipo `POST` contendo o campo `_method: "DELETE"` no corpo (JSON).<br>3. Em caso de sucesso, deve retornar mensagem "Cartão deletado com sucesso".<br>4. Se o ID não for fornecido, deve retornar erro HTTP 400. |
| **Regras de Negócio** | **RN01 (Method Spoofing):** O sistema não processa o verbo HTTP `DELETE` diretamente. É obrigatório enviar um `POST` simulando um delete via corpo da requisição.<br>**RN02 (Escopo da Exclusão):** A exclusão é realizada pelo ID absoluto do registro. *Observação técnica: Não há validação de propriedade (`user_id`) na query SQL.*<br>**RN03 (Validação de Entrada):** O ID deve ser um número inteiro válido passado na URL (`$_GET['id']`).<br>**RN04 (Tratamento de Erro):** Erros de conexão ou falha na preparação da query retornam HTTP 500. |
| **Evidência (Backend)** | **Arquivo:** `deletePaymentMethod.php`<br>• *RN01:* `if ($_SERVER['...'] === 'POST' && ... $input['_method'] === 'DELETE')`<br>• *RN02:* `DELETE FROM payment_methods WHERE id = ?` (Ausência de `AND user_id`)<br>• *RN03:* `if (!isset($_GET['id']))`<br> |

#### Evidência (Interface): 

---


### US08- Registro de Despesas (Crédito e Débito)

---
| Campo | Detalhe |
| :--- | :--- |
| **Identificador** | **US08** |
| **User Story** | "Enquanto **usuário**, quero **registrar minhas despesas informando valor, data e forma de pagamento** para **atualizar meu saldo atual (se débito) ou projetar faturas futuras (se crédito).**" |
| **Critérios de Aceitação** | 1. O sistema deve aceitar dados da despesa via JSON.<br>2. Se a forma de pagamento for "Débito" (ou qualquer diferente de 'credit'), o saldo da conta deve ser debitado imediatamente.<br>3. Se a despesa for "Crédito" parcelado, o sistema deve gerar registros individuais para cada parcela.<br>4. O sistema deve retornar o objeto da despesa criada com status "success". |
| **Regras de Negócio** | **RN01 (Fluxo de Débito à Vista):** Se `payment_type` ≠ 'credit', o sistema subtrai o valor do saldo do método de pagamento (`balance - amount`) e marca a despesa como paga (`paid = 1`) imediatamente.<br>**RN02 (Sem Validação de Saldo):** O sistema permite que o saldo fique negativo, pois executa a subtração sem verificar se há fundos suficientes antes.<br>**RN03 (Lógica de Parcelamento):** Se for 'credit' com `installments > 1`, o valor é dividido igualmente pelo número de parcelas (sem lógica de arredondamento complexa visível) e salvo na tabela `installments`.<br>**RN04 (Vencimento das Parcelas):** A data de vencimento de cada parcela é calculada somando meses à data da compra (`+x month`).<br>**RN05 (Regionalização):** O sistema força o fuso horário para `America/Manaus`. |
| **Evidência (Backend)** | **Arquivo:** `addExpense.php`<br>• *RN01:* `if ($payment_type !== 'credit') { UPDATE ... balance = balance - ? ... SET paid = 1 }`<br>• *RN03:* `$installment_amount = $amount / $installments;`<br>• *RN04:* `date('Y-m-d', strtotime("+".($i-1)." month", strtotime($date)))`<br>• *RN05:* `date_default_timezone_set('America/Manaus');` |

#### Evidência (Interface): 

---

### US09- Alterar Despesa

---
| Campo | Detalhe |
| :--- | :--- |
| **Identificador** | **US09** |
| **User Story** | "Enquanto **usuário**, quero **corrigir dados de uma despesa lançada errada** para **que meu saldo financeiro e meus relatórios reflitam a realidade.**" |
| **Critérios de Aceitação** | 1. O sistema deve permitir alterar valor, data, descrição, método e tipo de pagamento.<br>2. Se a despesa editada era do tipo Débito, o sistema deve **estornar** (devolver) o valor original ao saldo da conta.<br>3. Se a nova versão da despesa for Débito, o sistema deve debitar o novo valor da conta selecionada.<br>4. A operação deve ser atômica: se houver erro em qualquer etapa, nenhuma alteração deve ser salva (Rollback). |
| **Regras de Negócio** | **RN01 (Lógica de Estorno):** Antes de salvar, o sistema verifica os dados antigos. Se `old_type !== 'credit'`, ele soma o `old_amount` de volta ao saldo da conta antiga (`balance + ?`).<br>**RN02 (Nova Cobrança):** Após salvar, se `new_type !== 'credit'`, o sistema subtrai o `new_amount` do saldo da nova conta (`balance - ?`). Isso permite inclusive trocar a despesa de um banco para outro.<br>**RN03 (Integridade Transacional):** Todas as queries (Estorno, Update da Despesa, Nova Cobrança) rodam dentro de uma transação (`$conn->begin_transaction()`).<br>**RN04 (Derivação de Status):** O campo `paid` (pago) é recalculado automaticamente: se virou Crédito = 0, se virou Débito = 1. |
| **Evidência (Backend)** | **Arquivo:** `updateExpense.php`<br>• *RN01 (Estorno):* `UPDATE payment_methods SET balance = balance + ?`<br>• *RN02 (Cobrança):* `UPDATE payment_methods SET balance = balance - ?`<br>• *RN03 (Transação):* `$conn->begin_transaction(); ... $conn->commit(); ... $conn->rollback();`<br>• *RN04:* `$is_paid = ($new_type !== 'credit') ? 1 : 0;` |

#### Evidência (Interface): 

---

### US10- Excluir Despesa

---
| Campo | Detalhe |
| :--- | :--- |
| **Identificador** | **US10** |
| **User Story** | "Enquanto **usuário**, quero **excluir uma despesa lançada erroneamente** para **remover o registro do meu histórico.**" |
| **Critérios de Aceitação** | 1. O sistema deve receber `user_id` e `expense_id` via JSON (corpo da requisição).<br>2. Se os parâmetros forem nulos, deve retornar erro com mensagem "Parâmetros inválidos".<br>3. A exclusão só deve ocorrer se a despesa pertencer ao usuário solicitante.<br>4. O sistema deve confirmar a exclusão com mensagem de sucesso. |
| **Regras de Negócio** | **RN01 (Segurança de Acesso):** A query garante a propriedade do dado (`WHERE id = ? AND user_id = ?`). O usuário não consegue excluir despesa de outro.<br>**RN02 (Ausência de Estorno):** **Importante:** A exclusão do registro **não** dispara a devolução do valor ao saldo do método de pagamento. Se a despesa foi no débito, o saldo permanecerá reduzido mesmo após a exclusão.<br>**RN03 (Hard Delete):** A exclusão é física (remove a linha do banco), não lógica (não usa flag `deleted_at`). |
| **Evidência (Backend)** | **Arquivo:** `deleteExpense.php`<br>• *RN01:* `DELETE FROM expenses WHERE id = ? AND user_id = ?`<br>• *RN02:* (Evidência por ausência): Não existem comandos `UPDATE payment_methods` neste arquivo.<br>• *RN03:* Uso do comando SQL `DELETE` direto. |

#### Evidência (Interface): 

---

### US11- Calcular Saldo Após Compras (Crédito e Débito)

---
| Campo | Detalhe |
| :--- | :--- |
| **Identificador** | **US11** |
| **User Story** | "Enquanto **usuário**, quero que o **sistema desconte automaticamente o valor da compra do meu saldo atual** no momento em que registro uma despesa no débito, para que **meu saldo reflita imediatamente a realidade.**" |
| **Critérios de Aceitação** | 1. O recálculo deve ser acionado automaticamente ao finalizar o registro da despesa.<br>2. A operação deve subtrair o valor da despesa do saldo do método de pagamento escolhido.<br>3. O sistema deve ignorar esse cálculo se o pagamento for do tipo "Crédito".<br>4. O novo saldo deve ser persistido no banco de dados. |
| **Regras de Negócio** | **RN01 (Condicional de Débito):** O cálculo só é executado se `payment_type !== 'credit'`.<br>**RN02 (Matemática de Subtração):** A atualização é feita via operação direta no banco: `balance = balance - valor`.<br>**RN03 (Vínculo de Pagamento):** O sistema marca a despesa como "Paga" (`paid = 1`) no mesmo momento em que desconta do saldo. |
| **Evidência (Backend)** | **Arquivo:** `addExpense.php` (Mesmo arquivo da US08)<br>• *RN01:* `if ($payment_type !== 'credit')`<br>• *RN02:* `UPDATE payment_methods SET balance = balance - ?`<br>• *RN03:* `UPDATE expenses SET paid = 1 ...` |

#### Evidência (Interface): 

---

### US12- Listagem de Histórico de Despesas

---
| Campo | Detalhe |
| :--- | :--- |
| **Identificador** | **US14** |
| **User Story** | "Enquanto **usuário**, quero **visualizar uma lista cronológica das minhas despesas** para **conferir meus gastos recentes e detalhes de cada lançamento.**" |
| **Critérios de Aceitação** | 1. O sistema deve retornar uma lista JSON contendo: ID, Descrição, Valor Total, Data, Tipo e Nome do Método de Pagamento.<br>2. A lista deve ser ordenada da despesa mais recente para a mais antiga.<br>3. Se o `user_id` não for informado, deve retornar erro HTTP 400.<br>4. A listagem deve trazer o nome do método de pagamento (ex: "Nubank") e não apenas o código dele. |
| **Regras de Negócio** | **RN01 (Privacidade dos Dados):** A consulta deve filtrar estritamente pelo ID do usuário (`WHERE user_id = ?`), impedindo acesso a dados de outros usuários.<br>**RN02 (Ordenação Padrão):** A visualização padrão é sempre decrescente por data (`ORDER BY date DESC`).<br>**RN03 (Enriquecimento de Dados):** O sistema realiza um `JOIN` obrigatório com a tabela `payment_methods` para obter o nome do método. <br>**RN04 (Contrato de API):** Os campos são renomeados na query (`AS expense_id`, `AS total_amount`) para corresponder exatamente ao que o componente visual (`ExpenseList.jsx`) espera. |
| **Evidência (Backend)** | **Arquivo:** `getExpenses.php`<br>• *RN01:* `WHERE e.user_id = ?`<br>• *RN02:* `ORDER BY e.date DESC`<br>• *RN03:* `JOIN payment_methods pm ON e.payment_method_id = pm.id`<br>• *RN04:* `e.id AS expense_id, e.amount AS total_amount` |

#### Evidência (Interface): 

---

### US13- Exibição de Resumo Financeiro

---
| Campo | Detalhe |
| :--- | :--- |
| **Identificador** | **US16** |
| **User Story** | "Enquanto **usuário**, quero **visualizar um gráfico de distribuição dos meus gastos** para **entender rapidamente quanto estou consumindo em Débito versus Crédito.**" |
| **Critérios de Aceitação** | 1. A tela inicial deve carregar automaticamente os dados ao abrir.<br>2. Deve ser exibido um Gráfico de Pizza ("Distribuição de Gastos").<br>3. O gráfico deve diferenciar claramente as categorias: "Débito" (Cor Azul) e "Crédito" (Cor Verde).<br>4. Ao lado ou sobre cada fatia, deve exibir o valor monetário total daquela categoria.<br>5. O sistema deve validar a sessão do usuário antes de exibir o painel; se não logado, redirecionar para login. |
| **Regras de Negócio** | **RN01 (Processamento no Cliente):** O backend não entrega o resumo pronto. O Frontend busca a lista completa (`getExpenses.php`) e realiza a soma/agrupamento localmente para renderizar o gráfico.<br>**RN02 (Dependência de Dados):** O gráfico depende do sucesso de duas requisições simultâneas: `getExpenses` e `getPaymentMethods`.<br>**RN03 (Tratamento de Datas):** As datas vindas do banco (String "YYYY-MM-DD") são convertidas para objetos `Date` do JavaScript para evitar erros de fuso horário na visualização.<br>**RN04 (Segurança de Sessão Frontend):** O acesso à página é bloqueado via JavaScript (`sessionStorage`) antes mesmo de chamar a API, redirecionando para `/login` se o usuário não existir. |
| **Evidência (Backend)** | **Arquivo:** `home.jsx`<br>• *RN01/RN02:* Passagem de dados brutos para o componente visual: `<Dashboard expenses={expenses} ... />`<br>• *RN03:* `const correctedDate = new Date(year, month - 1, day);`<br>• *RN04:* `if (!user) { navigate("/login"); return; }` |

#### Evidência (Interface): 

---

### US14- Encerramento de Sessão - Logout de Usuário

---
| Campo | Detalhe |
| :--- | :--- |
| **Identificador** | **US20** |
| **User Story** | "Enquanto **usuário autenticado**, quero **sair do sistema com segurança** para **impedir que outras pessoas acessem meus dados neste dispositivo.**" |
| **Critérios de Aceitação** | 1. O sistema deve aceitar a requisição de saída (suporta tanto POST quanto GET).<br>2. Todas as variáveis de sessão (como ID do usuário) devem ser limpas da memória.<br>3. O arquivo de sessão no servidor deve ser destruído.<br>4. O sistema deve retornar uma confirmação JSON de "Logout realizado com sucesso". |
| **Regras de Negócio** | **RN01 (Limpeza Profunda):** O sistema aplica uma abordagem de duas etapas: primeiro remove as variáveis (`session_unset`) e depois destrói a sessão física no servidor (`session_destroy`). Isso evita que dados residuais permaneçam acessíveis na mesma execução.<br>**RN02 (Gerenciamento de Contexto):** O comando `session_start()` é chamado antes da destruição para garantir que o PHP identifique corretamente qual sessão ativa deve ser eliminada.<br>**RN03 (CORS e Credenciais):** O header `Access-Control-Allow-Credentials: true` é mantido para permitir que o navegador gerencie (e invalide) o cookie de sessão corretamente. |
| **Evidência (Backend)** | **Arquivo:** `logout.php`<br>• *RN01:* Sequência: `session_unset(); session_destroy();`<br>• *RN02:* `session_start();` (linha inicial)<br>• *RN03:* `header("Access-Control-Allow-Credentials: true");` |

#### Evidência (Interface): 

---

## Requisitos Não Funcionais 

A tabela abaixo descreve os requisitos de qualidade e restrições técnicas identificadas na análise da arquitetura do sistema. A classificação segue o modelo de tipos (Produto, Organizacional, Externo) e suas respectivas categorias.

### Requisito Não Funcional 001- 
---
| Campo | Detalhe |
| :--- | :--- |
| **Identificador** | **RNF001** |
| **Tipo do Requisito** | Requisito do Produto |
| **Categoria** | Usabilidade |
| **Prioridade** | Obrigatório |
| **Descrição** | O sistema deve prover feedback visual imediato (notificações do tipo "Toast") ao usuário após a conclusão de qualquer operação de cadastro, edição ou exclusão, informando claramente o sucesso ou a falha da ação. |
---

### Requisito Não Funcional 002 - 
---
| Campo | Detalhe |
| :--- | :--- |
| **Identificador** | **RNF002** |
| **Tipo do Requisito** | Requisito do Produto |
| **Categoria** | Portabilidade |
| **Prioridade** | Importante |
| **Descrição** | A interface do usuário deve ser responsiva, utilizando containers flexíveis (CSS Flexbox/Grid) para se ajustar automaticamente a diferentes resoluções de tela (Desktop e Mobile) sem quebra de layout ou perda de funcionalidade. |
---

### Requisito Não Funcional 003-
---
| Campo | Detalhe |
| :--- | :--- |
| **Identificador** | **RNF003** |
| **Tipo do Requisito** | Requisito do Produto |
| **Categoria** | Desempenho |
| **Prioridade** | Desejável |
| **Descrição** | O tempo de resposta entre a requisição ao servidor (API) e a renderização dos dados em tela (ex: carregar a lista de despesas) não deve exceder 3 segundos em condições normais de rede (4G/Wi-Fi). |
---

### Requisito Não Funcional 004 - 
---
| Campo | Detalhe |
| :--- | :--- |
| **Identificador** | **RNF004** |
| **Tipo do Requisito** | Requisito do Produto |
| **Categoria** | Capacidade |
| **Prioridade** | Desejável |
| **Descrição** | O banco de dados deve suportar o armazenamento histórico acumulativo e ilimitado de despesas e transações por usuário, limitado apenas pelo espaço físico de disco do servidor, sem degradação perceptível na consulta. |
---

### Requisito Não Funcional 005-
---
| Campo | Detalhe |
| :--- | :--- |
| **Identificador** | **RNF005** |
| **Tipo do Requisito** | Requisito do Produto |
| **Categoria** | Segurança |
| **Prioridade** | Obrigatório |
| **Descrição** | As senhas dos usuários jamais devem ser armazenadas em texto plano no banco de dados. É obrigatório o uso de algoritmos de hash unidirecional robustos (função `password_hash` do PHP). |
---

### Requisito Não Funcional 006-
---
| Campo | Detalhe |
| :--- | :--- |
| **Identificador** | **RNF006** |
| **Tipo do Requisito** | Requisito do Produto |
| **Categoria** | Segurança |
| **Prioridade** | Obrigatório |
| **Descrição** | O sistema deve garantir o isolamento lógico dos dados (Multi-tenancy), assegurando que todas as consultas SQL filtrem estritamente pelo `user_id` da sessão ativa, impedindo acesso cruzado a dados de outros usuários. |
---

### Requisito Não Funcional 007-
---
| Campo | Detalhe |
| :--- | :--- |
| **Identificador** | **RNF07** |
| **Tipo do Requisito** | Requisito do Produto |
| **Categoria** | Segurança |
| **Prioridade** | Obrigatório |
| **Descrição** | O gerenciamento de sessão deve ser seguro, incluindo a regeneração do ID da sessão após o login (`session_regenerate_id`) para evitar sequestro de sessão e validação de autenticação em todos os endpoints da API. |
---

### Requisito Não Funcional 008-
---
| Campo | Detalhe |
| :--- | :--- |
| **Identificador** | **RNF008** |
| **Tipo do Requisito** | Requisito do Produto |
| **Categoria** | Confiabilidade |
| **Prioridade** | Importante |
| **Descrição** | O backend deve tratar exceções de banco de dados e erros de servidor (HTTP 500), retornando mensagens JSON estruturadas e amigáveis ao invés de expor falhas de código ou stack traces ao usuário final. |
---

### Requisito Não Funcional 009-
---
| Campo | Detalhe |
| :--- | :--- |
| **Identificador** | **RNF09** |
| **Tipo do Requisito** | Requisito do Produto |
| **Categoria** | Confiabilidade |
| **Prioridade** | Obrigatório |
| **Descrição** | As operações financeiras complexas (edição com recálculo de saldo) devem ser atômicas (ACID). O sistema deve utilizar transações de banco de dados (`commit` / `rollback`) para garantir a integridade dos dados em caso de falha no meio do processo. |
---

### Requisito Não Funcional 010-
---
| Campo | Detalhe |
| :--- | :--- |
| **Identificador** | **RNF010** |
| **Tipo do Requisito** |  Requisito Externo |
| **Categoria** | Compatibilidade |
| **Prioridade** | Importante |
| **Descrição** | O Frontend (interface visual) deve ser compatível e renderizar corretamente, sem erros de script, nos principais navegadores modernos baseados nas engines Chromium (Google Chrome, Edge) e Gecko (Mozilla Firefox). |
---

### Requisito Não Funcional 011-
---
| Campo | Detalhe |
| :--- | :--- |
| **Identificador** | **RNF011** |
| **Tipo do Requisito** | Requisito Organizacional |
| **Categoria** | Padrão |
| **Prioridade** | Obrigatório |
| **Descrição** | O sistema deve seguir rigorosamente uma arquitetura cliente-servidor desacoplada, onde o Backend fornece apenas APIs RESTful (JSON) e o Frontend gerencia toda a visualização (SPA - Single Page Application). |
---

### Requisito Não Funcional 012-
---
| Campo | Detalhe |
| :--- | :--- |
| **Identificador** | **RNF012** |
| **Tipo do Requisito** | Requisito Organizacional |
| **Categoria** | Implementação |
| **Prioridade** | Importante |
| **Descrição** | As respostas da API devem seguir os padrões semânticos do protocolo HTTP para facilitar a integração e manutenção (ex: 200 OK, 201 Created, 400 Bad Request, 401 Unauthorized, 500 Internal Server Error). |
---

## Considerações Finais

A elaboração deste Backlog de Produto, baseada no processo de Engenharia Reversa, permitiu mapear com precisão o estado atual (As-Is) do Sistema de Finanças Pessoais. A análise estática do código-fonte (PHP e React) revelou nuances que não seriam perceptíveis apenas pela navegação na interface, garantindo uma documentação fidedigna.

Sobre os **Requisitos Funcionais (User Stories)**: A análise evidenciou que o núcleo do sistema possui regras de negócio robustas para a criação e edição de transações (como a lógica de estorno automático e parcelamento). No entanto, identificou-se uma inconsistência crítica na funcionalidade de exclusão (US10), onde não há o retorno financeiro do saldo, gerando divergências de caixa. Documentar essa falha é essencial para futuras manutenções corretivas.

Sobre os **Requisitos Não Funcionais (RNF)**: Foi possível categorizar a arquitetura do sistema como uma aplicação desacoplada (SPA), onde o Backend atua estritamente como API e o Frontend assume responsabilidades de processamento, como a consolidação dos dados para o Dashboard. Em termos de segurança, o sistema adota boas práticas de isolamento de dados (Multi-tenancy) e proteção de credenciais, atendendo aos critérios obrigatórios de qualidade.

Este documento serve agora como uma linha de base (baseline) confiável para qualquer esforço futuro de evolução, refatoração ou auditoria do sistema.

