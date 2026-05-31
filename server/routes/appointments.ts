import { Router } from 'express';
import { supabase } from '../utils/supabase.js';
import { AuthRequest, isAdmin } from '../middleware/auth.js';
import { sendTelegramNotification } from '../utils/telegram.js';
import { getWeekNumber } from '../utils/date.js';

const router = Router();

router.get('/', async (req: AuthRequest, res) => {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    let query = supabase
      .from('appointments')
      .select(`
        *,
        services (name),
        stylists (name)
      `)
      .order('date', { ascending: false })
      .order('time', { ascending: true });

    if (req.user.role !== 'admin') {
      query = query.or(`user_id.eq.${req.user.id},client_email.eq.${req.user.email}`);
    }

    const { data: appointments, error } = await query;
    if (error) throw error;

    const formatted = appointments.map((a: any) => ({
      ...a,
      service_name: a.services?.name,
      stylist_name: a.stylists?.name
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

router.post('/', async (req: AuthRequest, res) => {
  const { client_name, client_email, service_id, stylist_id, date, time } = req.body;
  const userId = req.user ? req.user.id : null;

  try {
    if (userId) {
      const { data: userExists } = await supabase
        .from('users')
        .select('id')
        .eq('id', userId)
        .maybeSingle();
        
      if (!userExists) {
        res.clearCookie('token', { httpOnly: true, secure: true, sameSite: 'none' });
        res.status(401).json({ error: 'Sesión inválida. Por favor inicia sesión de nuevo.' });
        return;
      }
    }

    const targetWeek = getWeekNumber(new Date(date));
    
    let existingQuery = supabase
      .from('appointments')
      .select('date')
      .neq('status', 'cancelled');
      
    if (userId) {
      existingQuery = existingQuery.or(`user_id.eq.${userId},client_email.eq.${client_email}`);
    } else {
      existingQuery = existingQuery.eq('client_email', client_email);
    }
    
    const { data: existingBookings, error: fetchError } = await existingQuery;
    if (fetchError) throw fetchError;

    const hasBookingThisWeek = existingBookings?.some((b: any) => getWeekNumber(new Date(b.date)) === targetWeek);

    if (hasBookingThisWeek) {
      res.status(400).json({ 
        error: 'Solo se permite una reserva por semana. Ya tienes una cita agendada para esta semana.' 
      });
      return;
    }

    const { data: overlappingAppt, error: overlapError } = await supabase
      .from('appointments')
      .select('id')
      .eq('stylist_id', stylist_id)
      .eq('date', date)
      .eq('time', time)
      .neq('status', 'cancelled')
      .maybeSingle();

    if (overlapError) throw overlapError;

    if (overlappingAppt) {
      res.status(400).json({
        error: 'Este estilista ya tiene una cita reservada a esta hora. Por favor, selecciona otra hora u otro estilista.'
      });
      return;
    }

    const now = new Date();
    const appointmentDateTime = new Date(`${date}T${time}`);

    if (appointmentDateTime < now) {
      res.status(400).json({ error: 'No puedes reservar una cita en el pasado.' });
      return;
    }

    const { data: newAppt, error } = await supabase
      .from('appointments')
      .insert([{ user_id: userId, client_name, client_email, service_id, stylist_id, date, time }])
      .select()
      .single();
      
    if (error) throw error;

    try {
      const { data: apptDetails } = await supabase
        .from('appointments')
        .select(`
          *,
          services (name),
          stylists (name)
        `)
        .eq('id', newAppt.id)
        .single();

      if (apptDetails) {
        const msg = `<b>📅 Nueva Reserva</b>\n\n` +
          `<b>Cliente:</b> ${apptDetails.client_name}\n` +
          `<b>Email:</b> ${apptDetails.client_email}\n` +
          `<b>Servicio:</b> ${apptDetails.services?.name}\n` +
          `<b>Estilista:</b> ${apptDetails.stylists?.name}\n` +
          `<b>Fecha:</b> ${apptDetails.date}\n` +
          `<b>Hora:</b> ${apptDetails.time}\n` +
          `<b>ID:</b> #${apptDetails.id}`;
        
        await sendTelegramNotification(msg);
      }
    } catch (tgErr) {
      console.error('Error sending Telegram notification:', tgErr);
    }

    res.json({ id: newAppt.id, success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to book appointment' });
  }
});

router.delete('/:id', async (req: AuthRequest, res) => {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    let query = supabase
      .from('appointments')
      .update({ status: 'cancelled' })
      .eq('id', req.params.id);
      
    if (req.user.role !== 'admin') {
      query = query.or(`user_id.eq.${req.user.id},client_email.eq.${req.user.email}`);
    }
    
    const { data, error } = await query.select();
    if (error) throw error;
    
    if (!data || data.length === 0) {
      res.status(403).json({ error: 'No se pudo cancelar la cita. Verifica que te pertenezca.' });
      return;
    }

    try {
      const appt = data[0];
      const { data: apptDetails } = await supabase
        .from('appointments')
        .select(`
          *,
          services (name),
          stylists (name)
        `)
        .eq('id', appt.id)
        .single();

      if (apptDetails) {
        const msg = `<b>❌ Reserva Cancelada</b>\n\n` +
          `<b>Cliente:</b> ${apptDetails.client_name}\n` +
          `<b>Servicio:</b> ${apptDetails.services?.name}\n` +
          `<b>Fecha:</b> ${apptDetails.date}\n` +
          `<b>Hora:</b> ${apptDetails.time}\n` +
          `<b>ID:</b> #${apptDetails.id}`;
        
        await sendTelegramNotification(msg);
      }
    } catch (tgErr) {
      console.error('Error sending Telegram notification:', tgErr);
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error interno al cancelar la cita' });
  }
});

// Admin Route
router.put('/:id', isAdmin, async (req, res) => {
  const { date, time, status, service_id, stylist_id } = req.body;
  try {
    const { data: appointment, error } = await supabase
      .from('appointments')
      .update({ date, time, status, service_id, stylist_id })
      .eq('id', req.params.id)
      .select()
      .single();
    if (error) throw error;

    try {
      const { data: apptDetails } = await supabase
        .from('appointments')
        .select(`
          *,
          services (name),
          stylists (name)
        `)
        .eq('id', appointment.id)
        .single();

      if (apptDetails) {
        const msg = `<b>✏️ Reserva Modificada (Admin)</b>\n\n` +
          `<b>Cliente:</b> ${apptDetails.client_name}\n` +
          `<b>Servicio:</b> ${apptDetails.services?.name}\n` +
          `<b>Estilista:</b> ${apptDetails.stylists?.name}\n` +
          `<b>Fecha:</b> ${apptDetails.date}\n` +
          `<b>Hora:</b> ${apptDetails.time}\n` +
          `<b>Estado:</b> ${apptDetails.status}\n` +
          `<b>ID:</b> #${apptDetails.id}`;
        
        await sendTelegramNotification(msg);
      }
    } catch (tgErr) {
      console.error('Error sending Telegram notification:', tgErr);
    }

    res.json(appointment);
  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(500).json({ error: 'Failed to update appointment' });
  }
});

export default router;
