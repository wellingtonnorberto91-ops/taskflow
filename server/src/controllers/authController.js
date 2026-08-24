import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import { db, seedUserDefaultCategories } from '../config/database.js';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_taskflow_production_or_dev_2026';
const JWT_EXPIRES_IN = '7d';

export async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Por favor, preencha todos os campos obrigatórios (nome, e-mail e senha).'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'A senha deve conter no mínimo 6 caracteres.'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Verifica se o e-mail já está cadastrado
    const existingUser = await db.execute({
      sql: 'SELECT id FROM users WHERE email = ?',
      args: [normalizedEmail]
    });

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Já existe uma conta cadastrada com este e-mail.'
      });
    }

    // Criptografa a senha
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const userId = randomUUID();

    // Insere o novo usuário
    await db.execute({
      sql: 'INSERT INTO users (id, name, email, password_hash) VALUES (?, ?, ?, ?)',
      args: [userId, name.trim(), normalizedEmail, passwordHash]
    });

    // Cria as categorias padrão para o novo usuário
    await seedUserDefaultCategories(userId);

    // Gera o token JWT
    const token = jwt.sign(
      { id: userId, email: normalizedEmail, name: name.trim() },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.status(201).json({
      success: true,
      message: 'Conta criada com sucesso!',
      user: {
        id: userId,
        name: name.trim(),
        email: normalizedEmail
      },
      token
    });
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Por favor, forneça o e-mail e a senha.'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const result = await db.execute({
      sql: 'SELECT id, name, email, password_hash FROM users WHERE email = ?',
      args: [normalizedEmail]
    });

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas. Verifique seu e-mail e senha.'
      });
    }

    const user = result.rows[0];

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas. Verifique seu e-mail e senha.'
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({
      success: true,
      message: 'Login realizado com sucesso!',
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      },
      token
    });
  } catch (error) {
    next(error);
  }
}

export async function getMe(req, res, next) {
  try {
    const userId = req.user.id;

    const result = await db.execute({
      sql: 'SELECT id, name, email, created_at FROM users WHERE id = ?',
      args: [userId]
    });

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado.'
      });
    }

    res.json({
      success: true,
      user: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
}
