import express from 'express';
import Joi from 'joi';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import Bet from '../models/bet.model.js';
import User from '../models/user.model.js';

const router = express.Router();

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

/**
 * @swagger
 * /api/betting/balance:
 *   get:
 *     summary: Get user's current balance
 *     tags: [Betting]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User balance retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 balance:
 *                   type: number
 *                   description: Current user balance
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Server error
 */
router.get('/balance', authMiddleware, async (req, res) => {
  try {
    let user = await User.findOne({ userId: req.userId });
    
    if (!user) {
      user = new User({ userId: req.userId });
      await user.save();
    }
    
    res.json({ balance: user.balance });
  } catch (err) {
    console.error('Error fetching balance:', err.message);
    res.status(500).json({ 
      error: 'Failed to fetch balance',
      details: err.message 
    });
  }
});

/**
 * @swagger
 * /api/betting/place:
 *   post:
 *     summary: Place a new bet
 *     tags: [Betting]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - matchId
 *               - amount
 *               - selectedTeam
 *               - sport
 *             properties:
 *               matchId:
 *                 type: string
 *                 description: ID of the match to bet on
 *               amount:
 *                 type: number
 *                 minimum: 1
 *                 description: Amount to bet
 *               selectedTeam:
 *                 type: string
 *                 description: Team selected for the bet
 *               sport:
 *                 type: string
 *                 description: Sport key (e.g., soccer_epl, basketball_nba)
 *     responses:
 *       201:
 *         description: Bet placed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 bet:
 *                   type: object
 *                   properties:
 *                     matchId:
 *                       type: string
 *                     amount:
 *                       type: number
 *                     odds:
 *                       type: number
 *                     selectedTeam:
 *                       type: string
 *                     potentialWinnings:
 *                       type: number
 *                     status:
 *                       type: string
 *                       enum: [pending, won, lost]
 *                 newBalance:
 *                   type: number
 *       400:
 *         description: Invalid input or insufficient balance
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Match not found
 *       500:
 *         description: Server error
 */
router.post('/place', authMiddleware, async (req, res) => {
  const schema = Joi.object({
    matchId: Joi.string().required(),
    amount: Joi.number().required().min(1),
    selectedTeam: Joi.string().required(),
    sport: Joi.string().required()
  });

  try {
    const { error } = schema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { matchId, amount, selectedTeam, sport } = req.body;

    // Récupérer les informations du match depuis l'API des cotes
    const matchResponse = await axios.get(`${req.app.locals.ODDS_API_BASE_URL}/sports/${sport}/events/${matchId}/odds`, {
      params: {
        apiKey: process.env.ODDS_API_KEY,
        regions: 'us',
        markets: 'h2h'
      }
    });

    if (!matchResponse.data) {
      return res.status(404).json({ error: 'Match not found' });
    }

    const match = matchResponse.data;
    const odds = match.bookmakers[0].markets[0].outcomes.find(
      outcome => outcome.name === selectedTeam
    )?.price;

    if (!odds) {
      return res.status(400).json({ error: 'Invalid selected team or odds not available' });
    }

    const matchData = {
      homeTeam: match.home_team,
      awayTeam: match.away_team,
      startTime: new Date(match.commence_time),
      sport: match.sport_key
    };

    let user = await User.findOne({ userId: req.userId });
    if (!user) {
      user = new User({ userId: req.userId });
      await user.save();
    }

    if (user.balance < amount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    const bet = new Bet({
      userId: req.userId,
      matchId,
      amount,
      odds,
      selectedTeam,
      potentialWinnings: amount * odds,
      matchData
    });

    await bet.save();
    
    user.balance -= amount;
    await user.save();

    res.status(201).json({ 
      bet,
      newBalance: user.balance
    });

  } catch (err) {
    console.error('Error placing bet:', err.message);
    res.status(500).json({ 
      error: 'Failed to place bet',
      details: err.message
    });
  }
});

/**
 * @swagger
 * /api/betting/finish/{betId}:
 *   post:
 *     summary: Finish a pending bet and determine if it's won or lost
 *     tags: [Betting]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: betId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the bet to finish
 *     responses:
 *       200:
 *         description: Bet finished successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 bet:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       enum: [won, lost]
 *                     winnings:
 *                       type: number
 *                 newBalance:
 *                   type: number
 *       400:
 *         description: Invalid bet ID or bet already finished
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Bet not found
 *       500:
 *         description: Server error
 */
router.post('/finish/:betId', authMiddleware, async (req, res) => {
  try {
    const bet = await Bet.findOne({ 
      _id: req.params.betId,
      userId: req.userId,
      status: 'pending'
    });

    if (!bet) {
      return res.status(404).json({ 
        error: 'Bet not found or already finished' 
      });
    }

    const user = await User.findOne({ userId: req.userId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const winProbability = (1 / bet.odds) * 100;
    const randomNumber = Math.random() * 100;
    
    let winnings = 0;
    if (randomNumber <= winProbability) {
      bet.status = 'won';
      winnings = bet.potentialWinnings;
      user.balance += winnings;
    } else {
      bet.status = 'lost';
    }

    await bet.save();
    await user.save();

    res.json({
      bet: {
        status: bet.status,
        winnings
      },
      newBalance: user.balance
    });

  } catch (err) {
    console.error('Error finishing bet:', err.message);
    res.status(500).json({ 
      error: 'Failed to finish bet',
      details: err.message
    });
  }
});

/**
 * @swagger
 * /api/betting/history:
 *   get:
 *     summary: Get user's betting history
 *     tags: [Betting]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, won, lost]
 *         description: Filter bets by status
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of bets per page
 *     responses:
 *       200:
 *         description: Betting history retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 bets:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       matchId:
 *                         type: string
 *                       amount:
 *                         type: number
 *                       odds:
 *                         type: number
 *                       selectedTeam:
 *                         type: string
 *                       status:
 *                         type: string
 *                         enum: [pending, won, lost]
 *                       potentialWinnings:
 *                         type: number
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: number
 *                     page:
 *                       type: number
 *                     pages:
 *                       type: number
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = { userId: req.userId };
    
    if (status) {
      query.status = status;
    }

    const bets = await Bet.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Bet.countDocuments(query);

    res.json({
      bets,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error('Error fetching history:', err.message);
    res.status(500).json({ 
      error: 'Failed to fetch betting history',
      details: err.message
    });
  }
});

export default router;