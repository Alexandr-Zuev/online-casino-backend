import mongoose from 'mongoose';

const gameSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  betAmount: { type: Number, required: true },
  outcome: { type: String, required: true },
  winAmount: { type: Number, required: true },
});

const Game = mongoose.model('Game', gameSchema);

export default Game;