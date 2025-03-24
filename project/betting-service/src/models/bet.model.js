import mongoose from 'mongoose';

const betSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  matchId: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 1,
  },
  odds: {
    type: Number,
    required: true,
  },
  selectedTeam: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'won', 'lost'],
    default: 'pending',
  },
  potentialWinnings: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  matchData: {
    homeTeam: String,
    awayTeam: String,
    startTime: Date,
    sport: String,
  },
});

const Bet = mongoose.model('Bet', betSchema);

export default Bet;