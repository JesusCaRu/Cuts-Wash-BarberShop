import { Router } from 'express';
import { supabase } from '../utils/supabase.js';
import { isAdmin, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Profile Routes
router.put('/profile', async (req: AuthRequest, res) => {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  const { name, avatar } = req.body;
  try {
    const { data: user, error } = await supabase
      .from('users')
      .update({ name, avatar })
      .eq('id', req.user.id)
      .select('id, email, name, role, avatar')
      .single();
    if (error) throw error;
    res.json(user);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Admin Routes for Users
router.get('/', isAdmin, async (req, res) => {
  try {
    const { data: users, error } = await supabase.from('users').select('id, email, name, role, created_at, avatar').order('created_at', { ascending: false });
    if (error) throw error;
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

router.put('/:id', isAdmin, async (req, res) => {
  const { role, name, email } = req.body;
  try {
    const { data: user, error } = await supabase
      .from('users')
      .update({ role, name, email })
      .eq('id', req.params.id)
      .select()
      .single();
    if (error) throw error;
    res.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

router.delete('/:id', isAdmin, async (req, res) => {
  try {
    await supabase.from('appointments').delete().eq('user_id', req.params.id);
    const { error } = await supabase.from('users').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

export default router;
