import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase } from '../utils/supabase.js';
import { AuthRequest } from '../middleware/auth.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@cutsandwash.com';

router.post('/register', async (req, res) => {
  const { name, email, password, phone } = req.body;
  
  try {
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (existingUser) {
      res.status(400).json({ error: 'El email ya está registrado' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const role = email === ADMIN_EMAIL ? 'admin' : 'client';
    
    const { data: user, error } = await supabase
      .from('users')
      .insert([{ name, email, password: hashedPassword, role, phone }])
      .select()
      .single();
      
    if (error) throw error;
    
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
    
    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role }, success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  console.log(`Login attempt for: ${email}`);

  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (error) throw error;

    if (!user) {
      console.log('User not found');
      res.status(400).json({ error: 'Credenciales inválidas' });
      return;
    }

    if (!user.password) {
      console.log('User has no password (Google auth)');
      res.status(400).json({ error: 'Esta cuenta usa inicio de sesión con Google' });
      return;
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      console.log('Invalid password');
      res.status(400).json({ error: 'Credenciales inválidas' });
      return;
    }

    console.log(`Login successful for: ${email}`);
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '7d' });

    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role, avatar: user.avatar }, success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});

router.get('/google/url', (req, res) => {
  const redirectUri = (req.query.redirectUri as string) || `${process.env.APP_URL}/auth/callback`;
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID || '',
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'email profile openid',
    access_type: 'offline',
    prompt: 'consent',
  });
  res.json({ url: `https://accounts.google.com/o/oauth2/v2/auth?${params}` });
});

router.post('/google/callback', async (req, res) => {
  const { code, redirectUri: reqRedirectUri } = req.body;
  const redirectUri = reqRedirectUri || `${process.env.APP_URL}/auth/callback`;

  try {
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    const tokens = await tokenResponse.json();
    if (!tokens.access_token) throw new Error('Failed to get access token');

    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    const googleUser = await userResponse.json();

    let { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('email', googleUser.email)
      .maybeSingle();
    
    if (!user) {
      const role = googleUser.email === ADMIN_EMAIL ? 'admin' : 'client';
      const { data: newUser, error } = await supabase
        .from('users')
        .insert([{ email: googleUser.email, name: googleUser.name, google_id: googleUser.id, avatar: googleUser.picture, role }])
        .select()
        .single();
        
      if (error) throw error;
      user = newUser;
    } else {
      await supabase
        .from('users')
        .update({ avatar: googleUser.picture })
        .eq('id', user.id);
      user.avatar = googleUser.picture;
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '7d' });

    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({ user, success: true });
  } catch (error) {
    console.error('Auth Error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: true,
    sameSite: 'none'
  });
  res.json({ success: true });
});

router.get('/me', async (req: AuthRequest, res) => {
  if (req.user) {
    const { data: user } = await supabase
      .from('users')
      .select('id, email, name, role, avatar')
      .eq('id', req.user.id)
      .maybeSingle();
    
    if (!user) {
      res.clearCookie('token', {
        httpOnly: true,
        secure: true,
        sameSite: 'none'
      });
      res.json({ user: null });
      return;
    }
    
    res.json({ user });
  } else {
    res.json({ user: null });
  }
});

export default router;
