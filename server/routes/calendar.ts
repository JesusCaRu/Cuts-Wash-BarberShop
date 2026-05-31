import { Router } from 'express';
import { supabase } from '../utils/supabase.js';

const router = Router();

router.get('/availability', async (req, res) => {
  try {
    const { data: appointments, error: apptError } = await supabase
      .from('appointments')
      .select('date, time, stylist_id')
      .neq('status', 'cancelled');

    if (apptError) throw apptError;

    const { data: stylists, error: stylError } = await supabase
      .from('stylists')
      .select('id');

    if (stylError) throw stylError;

    res.json({
      appointments: appointments || [],
      stylistCount: stylists?.length || 1
    });
  } catch (error) {
    console.error('Error fetching calendar availability:', error);
    res.status(500).json({ error: 'Failed to fetch availability' });
  }
});

export default router;
