import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Middleware для защиты роутов
export const protect = async (req, res, next) => {
  let token;

  // Проверка наличия токена в заголовке Authorization
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Извлечение токена
      token = req.headers.authorization.split(' ')[1];
      
      // Проверка и декодирование токена
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Поиск пользователя по ID
      req.user = await User.findById(decoded.id).select('-password');

      // Если пользователь не найден
      if (!req.user) {
        return res.status(404).json({ message: 'Пользователь не найден' });
      }

      // Переход к следующему middleware или роуту
      next();
    } catch (error) {
      // Обработка ошибки, если токен некорректный или истекший
      console.error(error);
      return res.status(401).json({ message: 'Не авторизован: некорректный токен' });
    }
  } else {
    // Ответ, если токен отсутствует
    return res.status(401).json({ message: 'Нет токена, доступ запрещен' });
  }
};