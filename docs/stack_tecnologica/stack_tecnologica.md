<h2>Stack Tecnológica do Sistema de Finanças</h2>

<p style="text-align: justify;">
Esta seção apresenta uma descrição técnica detalhada da stack tecnológica empregada no desenvolvimento do Sistema de Finanças, contemplando as tecnologias, frameworks, bibliotecas, ferramentas e padrões adotados tanto no frontend quanto no backend, bem como os componentes de persistência de dados e infraestrutura. O objetivo deste mapeamento é evidenciar o ecossistema tecnológico que sustenta o sistema e identificar as dependências críticas necessárias para sua operação, manutenção e evolução.
</p>

<h3>1. Camada de Apresentação (Frontend)</h3>

<p style="text-align: justify;">
A camada de apresentação é responsável por prover a interface gráfica ao usuário, permitindo a interação com as funcionalidades do sistema por meio de uma aplicação web responsiva e orientada a componentes.
</p>

<h4>1.1 Tecnologias Base</h4>
<ul>
  <li><strong>HTML5</strong> – Linguagem de marcação utilizada para estruturar o conteúdo semântico das páginas.</li>
  <li><strong>CSS3</strong> – Utilizado na estilização visual da interface, incluindo definição de layout, responsividade e identidade visual.</li>
  <li><strong>JavaScript (ECMAScript 6+)</strong> – Linguagem de programação responsável pela lógica de interação, manipulação do DOM e controle de estados da aplicação.</li>
</ul>

<h4>1.2 Framework e Arquitetura de Interface</h4>

<p style="text-align: justify;">
O frontend foi desenvolvido utilizando a biblioteca <strong>React.js</strong>, que adota o paradigma de componentes reutilizáveis e arquitetura baseada em Virtual DOM, proporcionando melhor desempenho e organização do código. O sistema segue uma estrutura modular, onde cada funcionalidade é encapsulada em componentes específicos, facilitando manutenção e escalabilidade.
</p>

<p style="text-align: justify;">
A organização do projeto segue a estrutura padrão do React, destacando-se a presença de arquivos como <code>App.jsx</code>, <code>Dashboard.jsx</code>, <code>AddExpenseDialog.jsx</code>, <code>EditExpenseDialog.jsx</code> e <code>Layout.jsx</code>, localizados no diretório <code>src/components</code>, evidenciando uma arquitetura baseada em composição de componentes.
</p>

<h4>1.3 Gerenciamento de Pacotes e Build</h4>

<p style="text-align: justify;">
O gerenciamento de dependências e o processo de build do frontend são realizados por meio do ambiente <strong>Node.js</strong> e do gerenciador de pacotes <strong>npm</strong>, definidos nos arquivos <code>package.json</code> e <code>package-lock.json</code>, que especificam as bibliotecas e versões utilizadas no projeto.
</p>

<h4>1.4 Processamento de Estilos</h4>

<p style="text-align: justify;">
O sistema utiliza <strong>PostCSS</strong> como ferramenta de processamento de folhas de estilo, permitindo transformações automatizadas em CSS, otimização de código e aplicação de plugins para melhoria de compatibilidade e desempenho, conforme configuração definida em <code>postcss.config.js</code>.
</p>

<h4>1.5 Servidor de Aplicação Frontend</h4>

<p style="text-align: justify;">
A aplicação frontend é servida por meio do servidor web <strong>NGINX</strong>, configurado pelo arquivo <code>nginx.conf</code>, responsável por gerenciar requisições HTTP, servir arquivos estáticos e controlar rotas da aplicação cliente.
</p>

<h3>2. Camada de Aplicação (Backend)</h3>

<p style="text-align: justify;">
A camada backend é responsável pela implementação das regras de negócio, controle de autenticação, validação de dados e interação com o banco de dados. Essa camada opera como uma API REST responsável por atender às requisições do frontend.
</p>

<h4>2.1 Linguagem e Paradigma</h4>

<p style="text-align: justify;">
O backend foi desenvolvido em <strong>PHP</strong>, utilizando abordagem procedural, onde cada script é responsável por uma funcionalidade específica, caracterizando uma arquitetura baseada em endpoints isolados para execução de operações.
</p>

<h4>2.2 Estrutura da API</h4>

<p style="text-align: justify;">
A API REST é composta por múltiplos scripts PHP, responsáveis por operações CRUD e controles de autenticação, tais como:
</p>

<ul>
  <li><code>register.php</code> – Cadastro de usuários</li>
  <li><code>login.php</code> – Autenticação e validação de login</li>
  <li><code>addExpense.php</code> – Registro de despesas</li>
  <li><code>updateExpense.php</code> – Alteração de despesas</li>
  <li><code>deleteExpense.php</code> – Exclusão de despesas</li>
  <li><code>addPaymentMethod.php</code> – Cadastro de métodos de pagamento</li>
  <li><code>updateBalance.php</code> – Atualização de saldo</li>
</ul>

<p style="text-align: justify;">
Esses scripts recebem dados via requisições HTTP no formato JSON e realizam operações de persistência e consulta diretamente no banco de dados relacional.
</p>

<h3>3. Camada de Persistência (Banco de Dados)</h3>

<h4>3.1 Sistema Gerenciador</h4>

<p style="text-align: justify;">
O sistema utiliza <strong>MySQL</strong> como Sistema Gerenciador de Banco de Dados (SGBD), podendo também operar em ambientes compatíveis como MariaDB.
</p>

<h4>3.2 Modelagem e Estrutura</h4>

<p style="text-align: justify;">
A estrutura do banco é definida por scripts SQL localizados em <code>docs/banco-dados/scripts/create-schema.sql</code>, e é representada graficamente pelo modelo entidade-relacionamento disponível em <code>modelo-er.png</code>.
</p>

<p style="text-align: justify;">
As principais tabelas que compõem o sistema são:
</p>

<ul>
  <li><strong>users</strong> – Armazena dados dos usuários</li>
  <li><strong>payment_methods</strong> – Métodos de pagamento associados</li>
  <li><strong>expenses</strong> – Registro de despesas</li>
</ul>

<h3>4. Comunicação e Integração</h3>

<p style="text-align: justify;">
A integração entre frontend e backend ocorre por meio de requisições HTTP seguindo o padrão RESTful, utilizando principalmente os métodos POST e GET, com troca de dados no formato JSON. Essa comunicação é documentada por meio dos arquivos <code>endpoints-rest.md</code> e <code>exemplos-request-response.md</code>.
</p>

<h3>5. Autenticação e Controle de Sessão</h3>

<p style="text-align: justify;">
O sistema utiliza autenticação baseada em sessões PHP, armazenadas por meio da variável global <code>$_SESSION</code>, permitindo manter o estado do usuário autenticado durante sua navegação. O acesso a rotas protegidas é reforçado no frontend pelo componente <code>RequireAuth.jsx</code>, que valida a presença de sessão ativa antes da renderização de determinadas telas.
</p>

<h3>6. Infraestrutura Tecnológica</h3>

<table border="1" cellspacing="0" cellpadding="6" style="border-collapse: collapse; width: 100%;">
  <tr>
    <th>Camada</th>
    <th>Tecnologias</th>
  </tr>
  <tr>
    <td>Apresentação</td>
    <td>React.js, JavaScript ES6, HTML5, CSS3, PostCSS, npm, Node.js, NGINX</td>
  </tr>
  <tr>
    <td>Aplicação</td>
    <td>PHP Procedural, API REST</td>
  </tr>
  <tr>
    <td>Persistência</td>
    <td>MySQL / MariaDB</td>
  </tr>
  <tr>
    <td>Segurança</td>
    <td>Autenticação por Sessão PHP</td>
  </tr>
  <tr>
    <td>Comunicação</td>
    <td>HTTP + JSON</td>
  </tr>
</table>

<h3>7. Considerações Técnicas</h3>

<p style="text-align: justify;">
A stack tecnológica adotada permite uma clara separação entre camadas de apresentação e aplicação, favorecendo a manutenibilidade, organização do código e possibilidade de escalabilidade futura. A utilização de React no frontend proporciona melhor experiência ao usuário, enquanto o backend em PHP garante simplicidade na implementação da lógica de negócio e acesso ao banco de dados.
</p>

<p style="text-align: justify;">
Esse conjunto tecnológico viabiliza a evolução do sistema para arquiteturas mais robustas, como APIs desacopladas em microsserviços ou migração gradual para padrões orientados a objetos, sem comprometer o funcionamento atual da aplicação.
</p>
