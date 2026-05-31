import { Router } from 'express';
import { supabase } from '../utils/supabase.js';
import { isAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { data: stylists, error } = await supabase.from('stylists').select('*');
    if (error) throw error;
    res.json(stylists);
  } catch (error) {
    console.error('Error fetching stylists:', error);
    res.status(500).json({ error: 'Failed to fetch stylists' });
  }
});

// Admin Routes
router.post('/', isAdmin, async (req, res) => {
  const { name, bio, image } = req.body;
  try {
    const { data: stylist, error } = await supabase
      .from('stylists')
      .insert([{ name, bio, image }])
      .select()
      .single();
    if (error) throw error;
    res.json(stylist);
  } catch (error) {
    console.error('Error creating stylist:', error);
    res.status(500).json({ error: 'Failed to create stylist' });
  }
});

router.put('/:id', isAdmin, async (req, res) => {
  const { name, bio, image } = req.body;
  try {
    const { data: stylist, error } = await supabase
      .from('stylists')
      .update({ name, bio, image })
      .eq('id', req.params.id)
      .select()
      .single();
    if (error) throw error;
    res.json(stylist);
  } catch (error) {
    console.error('Error updating stylist:', error);
    res.status(500).json({ error: 'Failed to update stylist' });
  }
});

router.delete('/:id', isAdmin, async (req, res) => {
  try {
    await supabase.from('appointments').delete().eq('stylist_id', req.params.id);
    const { error } = await supabase.from('stylists').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting stylist:', error);
    res.status(500).json({ error: 'Failed to delete stylist' });
  }
});

export default router;
