import express from 'express';
import axios from 'axios';

const router = express.Router();
const ODDS_API_BASE_URL = 'https://api.the-odds-api.com/v4';

/**
 * @swagger
 * /api/odds/sports:
 *   get:
 *     summary: Get available sports
 *     tags: [Odds]
 *     responses:
 *       200:
 *         description: List of available sports
 */
router.get('/sports', async (req, res) => {
  try {
    const response = await axios.get(`${ODDS_API_BASE_URL}/sports`, {
      params: {
        apiKey: process.env.ODDS_API_KEY,
      },
    });
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch sports' });
  }
});

/**
 * @swagger
 * /api/odds/matches/{sport}:
 *   get:
 *     summary: Get matches for a specific sport
 *     tags: [Odds]
 *     parameters:
 *       - in: path
 *         name: sport
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of matches with odds
 */
router.get('/matches/:sport', async (req, res) => {
  try {
    const response = await axios.get(`${ODDS_API_BASE_URL}/sports/${req.params.sport}/odds`, {
      params: {
        apiKey: process.env.ODDS_API_KEY,
        regions: 'us',
        markets: 'h2h',
      },
    });
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch matches' });
  }
});

/**
 * @swagger
 * /api/odds/scores/{sport}:
 *   get:
 *     summary: Get scores for a specific sport
 *     tags: [Odds]
 *     parameters:
 *       - in: path
 *         name: sport
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: daysFrom
 *         schema:
 *           type: integer
 *         description: Number of days to look back
 *     responses:
 *       200:
 *         description: List of match scores
 */
router.get('/scores/:sport', async (req, res) => {
  try {
    const response = await axios.get(`${ODDS_API_BASE_URL}/sports/${req.params.sport}/scores`, {
      params: {
        apiKey: process.env.ODDS_API_KEY,
        daysFrom: req.query.daysFrom || 1,
      },
    });
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch scores' });
  }
});

export default router;