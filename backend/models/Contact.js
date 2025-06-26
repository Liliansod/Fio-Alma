const mongoose = require('mongoose');

// Define o schema para o modelo de Contato (formulário "Gostou?")
const contactSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true, // Converte para minúsculas
    match: [/^\S+@\S+\.\S+$/, 'Por favor, use um endereço de e-mail válido.'] // Validação de formato de e-mail
  },
  telefone: {
    type: String,
    trim: true,
    default: '' // Pode ser opcional
  },
  mensagem: {
    type: String,
    required: true
  },
  productId: { // Adiciona o ID do produto relacionado, se houver
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product', // Referencia o modelo 'Product'
    default: null
  },
  productName: { // Adiciona o nome do produto para facilitar a visualização
    type: String,
    default: ''
  },
  dataEnvio: {
    type: Date,
    default: Date.now
  }
});

const Contact = mongoose.model('Contact', contactSchema);

module.exports = Contact;
