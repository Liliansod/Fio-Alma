const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact'); // Importa o modelo de Contato

// Rota para criar um novo contato (formulário "Gostou?")
router.post('/', async (req, res) => {
  try {
    const newContact = new Contact(req.body); // Cria uma nova instância de Contato
    const savedContact = await newContact.save(); // Salva no banco de dados
    res.status(201).json(savedContact); // Retorna o contato salvo
  } catch (err) {
    console.error('Erro ao salvar contato:', err);
    res.status(400).json({ message: 'Erro ao enviar contato', error: err.message });
  }
});

// Rota para obter todos os contatos (para gerenciamento no backend, por exemplo)
// Esta rota precisaria de autenticação e autorização em um projeto real
router.get('/', async (req, res) => {
  try {
    const contacts = await Contact.find({});
    res.json(contacts);
  } catch (err) {
    console.error('Erro ao buscar contatos:', err);
    res.status(500).json({ message: 'Erro do servidor ao buscar contatos' });
  }
});

module.exports = router;
