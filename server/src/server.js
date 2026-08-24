import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDatabase } from './config/database.js';
import routes from './routes/index.js';
import { notFoundHandler, errorHandler } from './middlewares/errorMiddleware.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares globais
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));
app.use(express.json());

// Rotas da API
app.use('/api', routes);

// Tratamento de 404 e Erros Globais
app.use(notFoundHandler);
app.use(errorHandler);

// Inicialização do Servidor e Banco de Dados
async function startServer() {
  try {
    await initDatabase();
    app.listen(PORT, () => {
      console.log(`🚀 TaskFlow Backend rodando em http://localhost:${PORT}`);
      console.log(`📡 Endpoints disponíveis em http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('❌ Falha fatal ao iniciar o servidor:', error);
    process.exit(1);
  }
}

startServer();
