const mongoose = require('mongoose');

// Define o schema para o modelo de Produto
const productSchema = new mongoose.Schema({
  titulo: {
    type: String,
    required: true,
    trim: true // Remove espaços em branco do início e fim
  },
  descricao: {
    type: String,
    required: true
  },
  criador: {
    type: String,
    required: true
  },
  imagens: [{ // Array de strings para URLs das imagens
    type: String,
    required: true
  }],
  // Poderíamos adicionar campos como 'preco', 'categoria', 'dataCriacao' etc.
  dataCriacao: {
    type: Date,
    default: Date.now // Define a data de criação padrão como a data atual
  }
});

// Cria o modelo 'Product' a partir do schema
const Product = mongoose.model('Product', productSchema);

module.exports = Product; // Exporta o modelo para ser usado em outras partes da aplicação
