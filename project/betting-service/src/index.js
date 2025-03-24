import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import bettingRoutes from './routes/betting.routes.js';
import oddsRoutes from './routes/odds.routes.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3002;

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Bet Rav Betting API',
      version: '1.0.0',
      description: 'Betting service for Bet Rav platform',
    },
    servers: [
      {
        url: `http://localhost:${port}`,
      },
    ],
  },
  apis: ['./src/routes/*.js'],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);

// Middleware
app.use(cors());
app.use(express.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Configuration de l'URL de base de l'API des cotes
app.locals.ODDS_API_BASE_URL = 'https://api.the-odds-api.com/v4';

// Routes
app.use('/api/betting', bettingRoutes);
app.use('/api/odds', oddsRoutes);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

app.listen(port, () => {
  console.log(`Betting service running on port ${port}`);
});

export default app;