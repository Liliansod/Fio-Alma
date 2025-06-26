const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true, // Garante que o email seja salvo em minúsculas
    match: [/^\S+@\S+\.\S+$/, 'Por favor, use um endereço de e-mail válido.']
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['criador', 'admin'],
    default: 'criador'
  },
  approved: {
    type: Boolean,
    default: false
  },
  isFirstLogin: { // Flag para controlar se é o primeiro login e exigir troca de senha
    type: Boolean,
    default: true
  },
  resetPasswordToken: String, // Campo para armazenar o token de redefinição de senha
  resetPasswordExpires: Date, // Campo para armazenar a data de expiração do token
  dataRegistro: {
    type: Date,
    default: Date.now
  }
});

// Middleware para hash de senha antes de salvar
userSchema.pre('save', async function(next) {
  // Hash da senha SOMENTE se o campo 'password' foi modificado (novo usuário ou senha alterada)
  // Ou se o usuário está sendo criado, `isNew` será true
  if (!this.isModified('password')) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
