require('dotenv').config(); // Carrega as variáveis de ambiente do arquivo .env
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path'); // Para servir arquivos estáticos e imagens

// Importa as rotas da API
const productRoutes = require('./routes/productRoutes');
const contactRoutes = require('./routes/contactRoutes');
const creatorApplicationRoutes = require('./routes/creatorApplicationRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 5000; // Define a porta do servidor, padrão 5000

// Middleware para permitir requisições de diferentes origens (CORS)
// Isso é importante para que o frontend React (rodando em outra porta) possa se comunicar com o backend
app.use(cors());

// Middleware para parsear o corpo das requisições como JSON
app.use(express.json());

// Middleware para servir imagens estáticas
// O diretório 'uploads' será onde as imagens dos formulários serão salvas
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Conexão com o MongoDB
// Substitua process.env.MONGO_URI pela sua string de conexão do MongoDB
// Ex: 'mongodb://localhost:27017/fioealma' para MongoDB local
// Ex: 'mongodb+srv://<username>:<password>@<cluster-name>.mongodb.net/<database-name>?retryWrites=true&w=majority' para MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Conectado ao MongoDB!'))
  .catch(err => console.error('Erro de conexão ao MongoDB:', err));

// Rotas da API
app.use('/api/products', productRoutes); // Rotas para operações de produtos
app.use('/api/contacts', contactRoutes); // Rotas para formulários de contato
app.use('/api/creator-applications', creatorApplicationRoutes); // Rotas para formulários "Faça Parte"
app.use('/api/auth', authRoutes); // Rotas para autenticação de usuários (login/registro)

// Rota de teste simples para verificar se o servidor está funcionando
app.get('/', (req, res) => {
  res.send('API do Ateliê Fio & Alma funcionando!');
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});




