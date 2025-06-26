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
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 5000; // Define a porta do servidor, padrão 5000

// Middleware para permitir requisições de diferentes origens (CORS)
app.use(cors());

// Middleware para parsear o corpo das requisições como JSON
app.use(express.json());

// Middleware para servir imagens estáticas
const uploadsPath = path.join(__dirname, 'uploads');
console.log(`[DEBUG] Servindo arquivos estáticos de: ${uploadsPath}`); // NOVO LOG AQUI!
app.use('/uploads', express.static(uploadsPath));

// Conexão com o MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Conectado ao MongoDB!'))
  .catch(err => console.error('Erro de conexão ao MongoDB:', err));

// Rotas da API
app.use('/api/products', productRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/creator-applications', creatorApplicationRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

// Rota de teste simples para verificar se o servidor está funcionando
app.get('/', (req, res) => {
  res.send('API do Ateliê Fio & Alma funcionando!');
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
