import User from '../models/User.js';
import jwt from 'jsonwebtoken';

// Регистрация пользователя
export const registerUser = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'Пользователь уже существует' });

    const user = await User.create({ username, email, password });
    const token = generateToken(user._id);

    res.status(201).json({ token, user });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Аутентификация пользователя
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Неверные учетные данные' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Неверные учетные данные' });

    const token = generateToken(user._id);
    res.status(200).json({ token, user });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Генерация JWT токена
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};