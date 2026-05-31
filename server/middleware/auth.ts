import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { supabase } from '../utils/supabase.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

export interface AuthRequest extends Request {
  user?: any;
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.cookies?.token;
  if (!token) return next();

  jwt.verify(token, JWT_SECRET, async (err: any, decoded: any) => {
    if (err) {
      res.clearCookie('token', { httpOnly: true, secure: true, sameSite: 'none' });
      return next();
    }

    try {
      const { data: user } = await supabase
        .from('users')
        .select('id, email, role, name, avatar')
        .eq('id', decoded.id)
        .maybeSingle();

      if (user) {
        req.user = user;
      } else {
        res.clearCookie('token', { httpOnly: true, secure: true, sameSite: 'none' });
      }
    } catch (error) {
      console.error('Auth middleware DB error:', error);
    }
    next();
  });
};

export const isAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({ error: 'Acceso denegado. Se requiere rol de administrador.' });
    return;
  }
  next();
};
