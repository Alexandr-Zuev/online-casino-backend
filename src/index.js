import mongoose from 'mongoose';
import express from 'express';
import dotenv from 'dotenv';
import userRoutes from './routes/userRoutes.js';
import gameRoutes from './routes/gameRoutes.js';
import { protect as authMiddleware } from './middleware/authMiddleware.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());

// Маршруты авторизации
app.use('/', userRoutes);
app.post('/signout', (req, res) => {
  localStorage.removeItem('jwt').send({ message: 'Пользователь вышел' }); // Выход из системы
});

// Подключение к MongoDB
mongoose.connect(process.env.MONGO_URI || '')
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Роуты
app.use(authMiddleware);
app.use('/', gameRoutes);
// Запуск сервера
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});