const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
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
  isFirstLogin: { // NOVA FLAG: Para controlar se é o primeiro login e exigir troca de senha
    type: Boolean,
    default: true
  },
  dataRegistro: {
    type: Date,
    default: Date.now
  }
});

userSchema.pre('save', async function(next) {
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
