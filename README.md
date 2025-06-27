Ateliê Fio & Alma
Este repositório contém o projeto "Ateliê Fio & Alma", uma plataforma colaborativa que conecta criadores de moda personalizada a clientes interessados em peças exclusivas. O objetivo é ser uma ponte entre quem busca confecções únicas e artistas que transformam ideias em realidade, com foco em roupas personalizadas.

Visão Geral do Projeto
O Ateliê Fio & Alma funciona como um e-commerce de exposição, onde criadores podem divulgar suas peças e clientes podem expressar interesse através de formulários, possibilitando a confecção personalizada. Administradores gerenciam as aplicações de criadores, usuários e produtos.

Funcionalidades Principais
Para Clientes (Visitantes):

Vitrine de Peças: Visualização de criações expostas pelos criadores.

Página de Detalhes do Produto: Informações detalhadas sobre cada peça.

Formulário de Contato/Interesse: Clientes podem preencher um formulário para entrar em contato diretamente com o criador sobre uma peça específica, demonstrando interesse em adquirir ou personalizar.

Para Criadores (Após Aprovação):

Cadastro e Login: Criadores podem se registrar e fazer login em um espaço exclusivo.

Painel do Criador: Área para gerenciar suas próprias peças.

Adicionar Nova Peça: Formulário para upload de novas criações, incluindo título, descrição e imagens.

Editar Peça Existente: Funcionalidade para atualizar detalhes e imagens de peças já cadastradas.

Remover Peça: Opção para excluir peças do seu portfólio.

Troca de Senha Obrigatória: Para garantir a segurança no primeiro acesso.

Para Administradores:

Painel Administrativo Completo: Gerenciamento centralizado de todas as operações da plataforma.

Aprovação/Rejeição de Criadores: Processo de curadoria para novas aplicações de criadores, incluindo envio de e-mails de notificação e senhas temporárias.

Gerenciamento de Usuários: Visualização e exclusão de contas de usuário (criadores e administradores).

Gerenciamento de Produtos: Visualização e exclusão de todas as peças cadastradas na plataforma.

Arquitetura do Sistema
O projeto segue uma arquitetura Client-Server (Frontend e Backend separados) utilizando um banco de dados NoSQL.

Frontend: Construído com React.js, provendo uma interface de usuário interativa e responsiva.

Backend: Desenvolvido com Node.js e Express.js, oferecendo uma API RESTful para comunicação com o banco de dados e lógica de negócio.

Banco de Dados: MongoDB (NoSQL), acessado via Mongoose.

Upload de Imagens: Utiliza Multer no backend para tratamento de uploads de arquivos.

Serviço de E-mail: Nodemailer para envio de notificações (aprovação de criadores, redefinição de senha).

Como Rodar o Projeto Localmente
Siga os passos abaixo para configurar e executar o projeto em sua máquina local.

Pré-requisitos
Node.js (versão 14.x ou superior recomendada)

npm (gerenciador de pacotes do Node.js, geralmente vem com o Node.js)

MongoDB (instância local ou um cluster MongoDB Atlas na nuvem)

Uma conta Gmail para configurar o envio de e-mails (e uma Senha de App gerada).

1. Configuração do Backend
Clone o Repositório:

git clone <URL_DO_SEU_REPOSITORIO>
cd fio-e-alma/backend

Instale as Dependências:

npm install

Crie o Arquivo de Variáveis de Ambiente (.env):
Na pasta backend/, crie um arquivo chamado .env e adicione as seguintes variáveis:

MONGO_URI=sua_string_de_conexao_mongodb
JWT_SECRET=uma_chave_secreta_forte_para_jwt
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=seu_email_gmail@gmail.com
EMAIL_PASS=sua_senha_de_app_do_gmail

MONGO_URI: A string de conexão para o seu banco de dados MongoDB (ex: mongodb+srv://usuario:senha@cluster.mongodb.net/database?retryWrites=true&w=majority).

JWT_SECRET: Uma string aleatória longa e complexa. Você pode gerar uma online ou usar algo como node -e "console.log(require('crypto').randomBytes(32).toString('hex'))".

EMAIL_USER: Seu endereço de e-mail do Gmail que será usado para enviar e-mails.

EMAIL_PASS: A senha de aplicativo do Gmail, não a senha normal da sua conta Google. (Veja o link "Senha de App" nos pré-requisitos se precisar de ajuda para gerar).

Crie a Pasta de Uploads:
Na pasta backend/uploads/, crie uma subpasta chamada products. A estrutura deve ser backend/uploads/products/. O servidor Node.js é configurado para criar essas pastas automaticamente ao iniciar, mas é bom verificar.

Inicie o Servidor Backend:

npm run dev

O servidor será iniciado em https://fio-alma-main.onrender.com.

2. Configuração do Frontend
Navegue para a Pasta do Frontend:

cd ../frontend # Se você estiver na pasta backend, use isso. Caso contrário, vá para a pasta 'frontend'

Instale as Dependências:

npm install

Inicie o Aplicativo Frontend:

npm start

O aplicativo será aberto em https://fio-alma-main.vercel.app/ no seu navegador padrão.

Rotas da API (Backend)
Aqui está um resumo das rotas principais da API:

GET /api/products: Obtém todos os produtos (vitrine).

GET /api/products/:id: Obtém detalhes de um produto específico.

GET /api/products/my-products (Protegida - Criador/Admin): Lista os produtos do criador logado.

POST /api/products (Protegida - Criador/Admin): Adiciona um novo produto.

PUT /api/products/:id (Protegida - Criador/Admin): Atualiza um produto existente.

DELETE /api/products/:id (Protegida - Criador/Admin): Deleta um produto.

POST /api/contacts: Envia um formulário de contato.

POST /api/creator-applications: Envia uma aplicação "Faça Parte".

POST /api/auth/register: Registra um novo usuário.

POST /api/auth/login: Realiza o login do usuário.

POST /api/auth/change-password (Protegida): Permite que o usuário mude a senha (usado após o primeiro login).

POST /api/auth/forgot-password: Inicia o processo de recuperação de senha.

POST /api/auth/reset-password/:token: Redefine a senha com um token.

PUT /api/auth/profile (Protegida): Atualiza informações do perfil do usuário.

GET /api/admin/applications (Protegida - Admin): Lista todas as aplicações de criadores.

POST /api/auth/admin/approve-creator (Protegida - Admin): Aprova uma aplicação de criador e cria/atualiza o usuário.

POST /api/auth/admin/reject-creator (Protegida - Admin): Rejeita uma aplicação de criador.

GET /api/admin/users (Protegida - Admin): Lista todos os usuários.

DELETE /api/auth/admin/users/:id (Protegida - Admin): Deleta um usuário.

Tecnologias Utilizadas
Frontend: React.js, HTML, CSS, JavaScript, React Router DOM.

Backend: Node.js, Express.js, Mongoose, Multer, Nodemailer, bcryptjs, jsonwebtoken, dotenv, cors.

Banco de Dados: MongoDB.

Design: Figma.

Contribuição
Sinta-se à vontade para explorar o código, sugerir melhorias ou relatar problemas.

Licença
[Escolha uma licença, por exemplo: MIT License]