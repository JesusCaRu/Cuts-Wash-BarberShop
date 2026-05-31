import { Router } from 'express';
import { supabase } from '../utils/supabase.js';
import { isAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { data: services, error } = await supabase.from('services').select('*');
    if (error) throw error;
    res.json(services);
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ error: 'Failed to fetch services' });
  }
});

// Admin Routes
router.post('/', isAdmin, async (req, res) => {
  const { name, description, price, duration, image } = req.body;
  try {
    const { data: service, error } = await supabase
      .from('services')
      .insert([{ name, description, price, duration, image }])
      .select()
      .single();
    if (error) throw error;
    res.json(service);
  } catch (error) {
    console.error('Error creating service:', error);
    res.status(500).json({ error: 'Failed to create service' });
  }
});

router.put('/:id', isAdmin, async (req, res) => {
  const { name, description, price, duration, image } = req.body;
  try {
    const { data: service, error } = await supabase
      .from('services')
      .update({ name, description, price, duration, image })
      .eq('id', req.params.id)
      .select()
      .single();
    if (error) throw error;
    res.json(service);
  } catch (error) {
    console.error('Error updating service:', error);
    res.status(500).json({ error: 'Failed to update service' });
  }
});

router.delete('/:id', isAdmin, async (req, res) => {
  try {
    await supabase.from('appointments').delete().eq('service_id', req.params.id);
    const { error } = await supabase.from('services').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting service:', error);
    res.status(500).json({ error: 'Failed to delete service' });
  }
});

export default router;
