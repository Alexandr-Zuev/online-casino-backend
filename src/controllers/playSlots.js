import Game from '../models/Game.js';
import User from '../models/User.js';

// Символы для игрового автомата
const symbols = ['🍒', '🍋', '🍊', '🍇', '🔔', '⭐', '💎'];

// Эмулируем кручение слотов
const spinSlots = () => {
  return [
    symbols[Math.floor(Math.random() * symbols.length)], // Барабан 1
    symbols[Math.floor(Math.random() * symbols.length)], // Барабан 2
    symbols[Math.floor(Math.random() * symbols.length)], // Барабан 3
  ];
};

// Логика для определения множителя выигрыша
const getMultiplier = (slots) => {
  // Если все три символа одинаковы
  if (slots[0] === slots[1] && slots[1] === slots[2]) {
    return 3; // Множитель 3x для всех одинаковых символов
  }
  // Если два символа одинаковы
  if (slots[0] === slots[1] || slots[1] === slots[2] || slots[0] === slots[2]) {
    return 2; // Множитель 2x для двух одинаковых символов
  }
  return 0; // Нет выигрыша
};

// Контроллер игры в слоты
export const playSlots = async (req, res) => {
  const { betAmount } = req.body;
  const userId = req.user.id;

  try {
    // Поиск пользователя
    const user = await User.findById(userId);
    if (!user || user.balance < betAmount) {
      return res.status(400).json({ message: 'Недостаточно средств для игры' });
    }

    // Запуск игры: кручение слотов
    const slots = spinSlots();

    // Определение множителя на основе выпавшей комбинации
    const multiplier = getMultiplier(slots);
    const winAmount = betAmount * multiplier; // Выигрыш рассчитывается по множителю

    // Обновляем баланс пользователя
    user.balance = user.balance - betAmount + winAmount;
    await user.save();

    // Сохраняем результат игры
    await Game.create({
      user: userId,
      betAmount,
      outcome: multiplier > 0 ? 'win' : 'lose', // Исход игры (победа или поражение)
      winAmount,
      gameType: 'slots',  // Тип игры
      result: slots.join(' | '), // Записываем выпавшую комбинацию
    });

    // Ответ клиенту с результатом игры
    res.json({
      message: multiplier > 0 ? `Вы выиграли ${winAmount}!` : 'Вы проиграли!',
      slots,
      winAmount,
      newBalance: user.balance,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка сервера, попробуйте позже' });
  }
};