import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Определение схемы пользователя
const userSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: [true, 'Имя пользователя обязательно'],
    trim: true // удаление лишних пробелов
  },
  email: { 
    type: String, 
    required: [true, 'Email обязателен'], 
    unique: true,
    match: [/^\S+@\S+\.\S+$/, 'Пожалуйста, введите корректный email'] // проверка на валидность email
  },
  password: { 
    type: String, 
    required: [true, 'Пароль обязателен'],
    minlength: [6, 'Пароль должен быть не менее 6 символов'] // минимальная длина пароля
  },
  balance: { 
    type: Number, 
    default: 1000,
    min: [0, 'Баланс не может быть отрицательным'] // защита от отрицательных значений
  }
}, { versionKey: false });

// Шифрование пароля перед сохранением
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next(); // если пароль не изменён, пропускаем
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Метод для сравнения паролей
userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// Экспорт модели пользователя
const User = mongoose.model('User', userSchema);

export default User;