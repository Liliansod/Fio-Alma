const mongoose = require('mongoose');

// Define o schema para o modelo de Aplicação de Criador (formulário "Faça Parte")
const creatorApplicationSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: true,
    trim: true
  },
  telefone: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true, // Garante que o email seja salvo em minúsculas
    match: [/^\S+@\S+\.\S+$/, 'Por favor, use um endereço de e-mail válido.']
  },
  mensagem: {
    type: String,
    required: true
  },
  imagemUrl: { // URL da imagem enviada (após upload para o servidor)
    type: String,
    default: null
  },
  dataEnvio: {
    type: Date,
    default: Date.now
  },
  status: { // Para gerenciar o status da aplicação (ex: pendente, aprovado, rejeitado)
    type: String,
    enum: ['pendente', 'aprovado', 'rejeitado'],
    default: 'pendente'
  }
});

const CreatorApplication = mongoose.model('CreatorApplication', creatorApplicationSchema);

module.exports = CreatorApplication;
