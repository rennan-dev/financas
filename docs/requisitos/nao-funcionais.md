# Requisitos Não Funcionais - Finanças Pessoais

Este documento descreve os requisitos não funcionais do sistema, ou seja, **características de qualidade, desempenho e segurança** que devem ser atendidas.

---

## RNF01 - Usabilidade
O sistema deve oferecer uma interface amigável, clara e intuitiva, com foco na simplicidade para usuários que não possuem conhecimento técnico avançado.

## RNF02 - Responsividade
A aplicação deve ser responsiva, funcionando corretamente em diferentes tamanhos de tela, incluindo computadores, tablets e smartphones.

## RNF03 - Desempenho
O tempo de resposta para ações como login, cadastro de despesas ou adição de métodos de pagamento deve ser inferior a 2 segundos em conexões padrão.

## RNF04 - Segurança
- Todas as senhas devem ser armazenadas de forma criptografada.
- O sistema deve implementar proteção contra SQL Injection e XSS.
- Sessões de usuários devem expirar após um período de inatividade.

## RNF05 - Escalabilidade
A arquitetura do sistema deve permitir fácil adição de novas funcionalidades e módulos, como categorias de despesas ou relatórios financeiros.

## RNF06 - Manutenibilidade
O código deve ser modular e bem documentado, permitindo manutenção facilitada por outros desenvolvedores.

## RNF07 - Portabilidade
O sistema deve poder ser executado em qualquer servidor com suporte a PHP e bancos de dados relacionais compatíveis com SQL padrão.

## RNF08 - Compatibilidade
O sistema deve funcionar corretamente nos principais navegadores modernos, incluindo:
- Google Chrome
- Mozilla Firefox
- Microsoft Edge

## RNF09 - Disponibilidade
A aplicação deve estar disponível para acesso 24 horas por dia, 7 dias por semana, salvo em períodos de manutenção programada.

## RNF10 - Persistência de Dados
Todas as informações do usuário, despesas, métodos de pagamento e histórico devem ser armazenadas de forma persistente em banco de dados.

## RNF11 - Conformidade com Padrões
A aplicação deve seguir boas práticas de desenvolvimento web, incluindo separação entre frontend e backend, e uso de frameworks e bibliotecas atualizadas.