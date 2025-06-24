const express = require('express');
const router = express.Router();
const Product = require('../models/Product'); // Importa o modelo de Produto

// Rota para obter todos os produtos
router.get('/', async (req, res) => {
  try {
    const products = await Product.find({}); // Encontra todos os produtos no banco de dados
    res.json(products); // Retorna os produtos como JSON
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro do servidor ao buscar produtos' });
  }
});

// Rota para obter um produto por ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id); // Encontra um produto pelo ID
    if (!product) {
      return res.status(404).json({ message: 'Produto não encontrado' }); // Retorna 404 se não encontrar
    }
    res.json(product); // Retorna o produto encontrado
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro do servidor ao buscar produto' });
  }
});

// Rota para adicionar um novo produto (apenas para exemplo de como criar dados)
// Em um sistema real, esta rota seria protegida e acessível apenas por administradores
router.post('/', async (req, res) => {
  try {
    const newProduct = new Product(req.body); // Cria uma nova instância de Produto com os dados do corpo da requisição
    const savedProduct = await newProduct.save(); // Salva o novo produto no banco de dados
    res.status(201).json(savedProduct); // Retorna o produto salvo com status 201 (Created)
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Erro ao criar produto', error: err.message }); // Retorna 400 se houver erro de validação
  }
});

// Rota para atualizar um produto existente (apenas para exemplo)
router.put('/:id', async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true }); // Encontra e atualiza, retorna o documento atualizado
    if (!updatedProduct) {
      return res.status(404).json({ message: 'Produto não encontrado para atualização' });
    }
    res.json(updatedProduct);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Erro ao atualizar produto', error: err.message });
  }
});

// Rota para deletar um produto (apenas para exemplo)
router.delete('/:id', async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id); // Encontra e deleta
    if (!deletedProduct) {
      return res.status(404).json({ message: 'Produto não encontrado para exclusão' });
    }
    res.json({ message: 'Produto deletado com sucesso' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao deletar produto', error: err.message });
  }
});

module.exports = router;
