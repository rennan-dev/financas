# Decisões Arquiteturais - Finanças Pessoais

Este documento registra as principais decisões arquiteturais tomadas para o desenvolvimento do sistema, com justificativas técnicas e estratégicas.

---

## 🧩 1. Linguagem e Framework Backend: PHP

**Decisão:** Utilizar PHP como linguagem principal no backend.

**Justificativa:**
- Familiaridade da equipe com a linguagem.
- Compatibilidade com o plano atual da Hostinger, que oferece suporte nativo ao PHP.
- Boa integração com bancos de dados relacionais como MySQL.
- Facilidade de implantação em ambientes de hospedagem compartilhada.

---

## 🗃️ 2. Banco de Dados: MySQL

**Decisão:** Utilizar MySQL como sistema gerenciador de banco de dados relacional.

**Justificativa:**
- Compatibilidade direta com PHP.
- Suporte da Hostinger.
- Facilidade de modelagem para dados estruturados (usuários, agendamentos, serviços).
- Ferramentas visuais e ampla documentação.

---

## 🖼️ 3. Frontend: React.js com TailwindCSS

**Decisão:** Utilizar React.js para construção da interface do usuário, com TailwindCSS para estilização.

**Justificativa:**
- React permite criação de interfaces dinâmicas e reativas, com bom desempenho e organização em componentes.
- Tailwind oferece produtividade alta com CSS utilitário, ideal para projetos pequenos e médios.
- Familiaridade da equipe com essas tecnologias.

---

## ☁️ 4. Hospedagem: Hostinger

**Decisão:** Utilizar a Hostinger como provedora de hospedagem.

**Justificativa:**
- Plano já contratado pela equipe.
- Suporte completo a PHP e MySQL.
- Ferramentas de gerenciamento simples via painel.
- Custo-benefício atrativo para projetos em fase inicial.

---

## 🔒 5. Autenticação: Sessões PHP e validação manual

**Decisão:** Utilizar sessões do PHP nativas e lógica própria para autenticação.

**Justificativa:**
- Simplicidade e controle.
- Evita dependência de bibliotecas externas.
- Facilita integração com front via requisições REST.

---

## 🔄 6. Comunicação Frontend ↔ Backend: API RESTful

**Decisão:** Desenvolver o backend como uma API RESTful que será consumida pelo frontend em React.

**Justificativa:**
- Permite separação clara entre frontend e backend.
- Facilita manutenção e testes.
- Abre espaço para evolução futura para apps mobile, por exemplo.

---

## 🗂️ 7. Estrutura de Diretórios e Deploy

**Decisão:** Organizar os arquivos em duas pastas principais: `codigo_fonte/frontend/` (React) e `codigo_fonte/backend/` (PHP).

**Justificativa:**
- Facilita organização e deploy separado.
- O frontend pode ser compilado e hospedado como arquivos estáticos.
- O backend será hospedado nas pastas PHP da Hostinger, acessando o banco MySQL.

---

## 🧪 8. Testes e Qualidade

**Decisão:** Iniciar com testes manuais e validações simples em formulários. Posteriormente, adicionar testes automatizados no backend (PHPUnit).

**Justificativa:**
- No MVP, o foco está em funcionalidade.
- Testes automatizados serão incluídos em fluxos críticos (agendamento, login).
- Possibilidade de evoluir com ferramentas como Postman, Cypress e Jest no frontend.

---

## 🧱 9. Escalabilidade e Futuro

**Decisão:** Construir o sistema com separação de responsabilidades e estrutura modular.

**Justificativa:**
- Facilita a migração futura para Laravel ou outro framework robusto.
- Possibilita substituir partes isoladas (ex: migrar para API em Node.js ou backend em nuvem).
