import Game from '../models/Game.js';
import User from '../models/User.js';

const redNumbers = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]);
const blackNumbers = new Set([2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35]);

export const playRoulette = async (req, res) => {
  const { betAmount, betType, betValue } = req.body; // Тип ставки и значение
  const userId = req.user.id;

  try {
    const user = await User.findById(userId);
    if (!user || user.balance < betAmount) {
      return res.status(400).json({ message: 'Недостаточно средств' });
    }

    // Выпадение случайного числа от 0 до 36 (0 – "зеро")
    const rolledNumber = Math.floor(Math.random() * 37); // Выпадение числа
    const isRed = redNumbers.has(rolledNumber);
    const isBlack = blackNumbers.has(rolledNumber);
    const isEven = rolledNumber % 2 === 0 && rolledNumber !== 0;

    let winAmount = 0;
    let win = false;
    
    // Обработка логики выигрыша в зависимости от типа ставки
    switch (betType) {
      case 'number':
        if (betValue === rolledNumber) {
          win = true;
          winAmount = betAmount * 35; // Выплата 35 к 1 при ставке на конкретное число
        }
        break;
      case 'color':
        if (
          (betValue === 'red' && isRed) ||
          (betValue === 'black' && isBlack)
        ) {
          win = true;
          winAmount = betAmount * 2; // Выплата 2 к 1 при ставке на цвет
        }
        break;
      case 'evenOdd':
        if (
          (betValue === 'even' && isEven) ||
          (betValue === 'odd' && !isEven && rolledNumber !== 0)
        ) {
          win = true;
          winAmount = betAmount * 2; // Выплата 2 к 1 при ставке на чет/нечет
        }
        break;
      default:
        return res.status(400).json({ message: 'Некорректный тип ставки' });
    }

    // Обновляем баланс
    user.balance = user.balance - betAmount + winAmount;
    await user.save();

    // Сохраняем результат игры
    const game = await Game.create({
      user: userId,
      betAmount,
      outcome: win ? 'win' : 'lose',
      winAmount,
      rolledNumber, // Добавляем выпавшее число в запись игры
      betType, // Тип ставки (например, число, цвет, чет/нечет)
      betValue, // Значение ставки (например, число или цвет)
    });

    res.json({
      message: win ? `Вы выиграли! Выпало число ${rolledNumber}` : `Вы проиграли. Выпало число ${rolledNumber}`,
      rolledNumber,
      newBalance: user.balance,
    });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};