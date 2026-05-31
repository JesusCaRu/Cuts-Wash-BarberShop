import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Service, Stylist } from '@/lib/utils';
import { Check, Calendar as CalendarIcon, Clock, User, Scissors, LogIn } from 'lucide-react';
import { format, addDays, startOfToday } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAuth } from '@/context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Booking() {
  const { user, loginGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState(1);
  const [services, setServices] = useState<Service[]>([]);
  const [stylists, setStylists] = useState<Stylist[]>([]);
  
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedStylist, setSelectedStylist] = useState<Stylist | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [clientInfo, setClientInfo] = useState({ name: '', email: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [isLoadingServices, setIsLoadingServices] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [appointments, setAppointments] = useState<any[]>([]);

  useEffect(() => {
    // Fetch availability
    fetch('/api/calendar/availability')
      .then(res => res.json())
      .then(data => {
        setAppointments(data.appointments || []);
      })
      .catch(err => console.error('Error fetching availability:', err));
  }, []);

  useEffect(() => {
    // Check if we navigated here with a pre-selected date from the calendar
    if (location.state && location.state.selectedDate) {
      setSelectedDate(new Date(location.state.selectedDate));
    }
  }, [location.state]);

  useEffect(() => {
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Tiempo de espera agotado')), 10000)
    );

    Promise.all([
      Promise.race([
        fetch('/api/services').then(res => {
          if (!res.ok) throw new Error('Error al cargar servicios');
          return res.json();
        }),
        timeoutPromise
      ]),
      Promise.race([
        fetch('/api/stylists').then(res => {
          if (!res.ok) throw new Error('Error al cargar estilistas');
          return res.json();
        }),
        timeoutPromise
      ])
    ])
    .then(([servicesData, stylistsData]) => {
      setServices(Array.isArray(servicesData) ? (servicesData as Service[]) : []);
      setStylists(Array.isArray(stylistsData) ? (stylistsData as Stylist[]) : []);
    })
    .catch(err => {
      console.error(err);
      setLoadError('No se pudieron cargar los servicios. Por favor, verifica tu conexión e intenta recargar.');
    })
    .finally(() => setIsLoadingServices(false));
  }, []);

  useEffect(() => {
    if (user) {
      setClientInfo({ name: user.name, email: user.email });
    }
  }, [user]);

  const dates = Array.from({ length: 14 }).map((_, i) => addDays(startOfToday(), i));
  const timeSlots = ['09:00', '10:00', '11:00', '12:00', '13:00', '15:00', '16:00', '17:00', '18:00', '19:00'];

  const isSlotAvailable = (time: string) => {
    if (!selectedDate || !selectedStylist) return true;
    
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const now = new Date();
    const todayStr = format(now, 'yyyy-MM-dd');
    
    // 1. Check if already booked
    const isBooked = appointments.some(app => 
      app.date === dateStr && 
      app.time === time && 
      app.stylist_id === selectedStylist.id
    );
    if (isBooked) return false;

    // 2. Check if in the past (if today)
    if (dateStr === todayStr) {
      const [hour, minute] = time.split(':').map(Number);
      const slotTime = new Date(now);
      slotTime.setHours(hour, minute, 0, 0);
      if (slotTime < now) return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService || !selectedStylist || !selectedDate || !selectedTime) return;

    setIsSubmitting(true);
    setSubmitError('');
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_name: clientInfo.name,
          client_email: clientInfo.email,
          service_id: selectedService.id,
          stylist_id: selectedStylist.id,
          date: format(selectedDate, 'yyyy-MM-dd'),
          time: selectedTime
        })
      });
      
      let data;
      try {
        data = await res.json();
      } catch (e) {
        console.error('Error parsing response:', e);
        data = { error: 'Error de comunicación con el servidor' };
      }

      if (res.ok) {
        setIsSuccess(true);
      } else {
        setSubmitError(data.error || 'Error al procesar la reserva. Por favor intenta de nuevo.');
      }
    } catch (error) {
      console.error(error);
      setSubmitError('Error de conexión. Por favor verifica tu internet.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen pt-32 pb-12 px-4 flex items-center justify-center bg-salon-50">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-12 rounded-3xl shadow-xl text-center max-w-lg w-full"
        >
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check size={40} />
          </div>
          <h2 className="font-serif text-3xl mb-4 text-salon-900">¡Reserva Confirmada!</h2>
          <p className="text-salon-600 mb-8">
            Gracias {clientInfo.name}, te esperamos el {selectedDate && format(selectedDate, 'd MMMM', { locale: es })} a las {selectedTime}.
            Hemos enviado un correo de confirmación a {clientInfo.email}.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => navigate('/')}
              className="bg-salon-900 text-white px-8 py-3 rounded-full font-medium hover:bg-salon-800 transition-colors"
            >
              Volver al Inicio
            </button>
            {user && (
              <button 
                onClick={() => navigate('/profile')}
                className="bg-white border border-salon-200 text-salon-900 px-8 py-3 rounded-full font-medium hover:bg-salon-50 transition-colors"
              >
                Ver Mis Citas
              </button>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-24 px-4 bg-salon-50">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12 text-center">
          <h1 className="font-serif text-4xl md:text-5xl mb-4 text-salon-900">Reserva tu Cita</h1>
          <p className="text-salon-600">Sigue los pasos para agendar tu próxima visita.</p>
          
          {!user && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 inline-block"
            >
              <button 
                onClick={loginGoogle}
                className="flex items-center gap-2 bg-white text-salon-800 px-6 py-2 rounded-full shadow-sm border border-salon-200 hover:bg-salon-50 transition-colors text-sm font-medium"
              >
                <LogIn size={16} /> Inicia sesión para agilizar tu reserva
              </button>
            </motion.div>
          )}
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-12">
          <div className="flex items-center space-x-4">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-medium transition-colors ${
                  step >= s ? 'bg-salon-900 text-white' : 'bg-salon-200 text-salon-500'
                }`}>
                  {s}
                </div>
                {s < 4 && <div className={`w-12 h-0.5 mx-2 ${step > s ? 'bg-salon-900' : 'bg-salon-200'}`} />}
              </div>
            ))}
          </div>
        </div>

        {isLoadingServices && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-salon-900 mx-auto mb-4"></div>
            <p className="text-salon-600">Cargando opciones disponibles...</p>
          </div>
        )}

        {loadError && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center mb-8">
            {loadError}
          </div>
        )}

        {!isLoadingServices && !loadError && (
          <div className="bg-white rounded-3xl shadow-sm border border-salon-100 p-6 md:p-10 min-h-[500px]">
          {step === 1 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <h2 className="font-serif text-2xl mb-8 flex items-center gap-3">
                <Scissors className="text-salon-500" /> Selecciona un Servicio
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {services.map((service) => (
                  <button
                    key={service.id}
                    onClick={() => { setSelectedService(service); setStep(2); }}
                    className="text-left p-6 rounded-2xl border border-salon-100 hover:border-salon-400 hover:bg-salon-50 transition-all group"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-serif text-xl font-medium text-salon-900">{service.name}</h3>
                      <span className="font-mono text-salon-600">{service.price}€</span>
                    </div>
                    <p className="text-salon-500 text-sm mb-4">{service.description}</p>
                    <div className="flex items-center text-xs font-medium text-salon-400 uppercase tracking-wider">
                      <Clock size={14} className="mr-1" /> {service.duration} min
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <h2 className="font-serif text-2xl mb-8 flex items-center gap-3">
                <User className="text-salon-500" /> Elige tu Estilista
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stylists.map((stylist) => (
                  <button
                    key={stylist.id}
                    onClick={() => { setSelectedStylist(stylist); setStep(3); }}
                    className="text-left p-4 rounded-2xl border border-salon-100 hover:border-salon-400 hover:bg-salon-50 transition-all"
                  >
                    <img 
                      src={stylist.image} 
                      alt={stylist.name} 
                      className="w-full h-48 object-cover rounded-xl mb-4 grayscale group-hover:grayscale-0 transition-all"
                    />
                    <h3 className="font-serif text-lg font-medium text-salon-900 mb-1">{stylist.name}</h3>
                    <p className="text-salon-500 text-sm line-clamp-2">{stylist.bio}</p>
                  </button>
                ))}
              </div>
              <button onClick={() => setStep(1)} className="mt-8 text-salon-500 hover:text-salon-900 text-sm underline">
                Atrás
              </button>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <h2 className="font-serif text-2xl mb-8 flex items-center gap-3">
                <CalendarIcon className="text-salon-500" /> Fecha y Hora
              </h2>
              
              <div className="mb-8">
                <h3 className="text-sm font-medium text-salon-500 uppercase tracking-wider mb-4">Día</h3>
                <div className="flex space-x-4 overflow-x-auto pb-4">
                  {dates.map((date, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedDate(date)}
                      className={`flex-shrink-0 w-20 h-24 rounded-xl flex flex-col items-center justify-center border transition-all ${
                        selectedDate?.toDateString() === date.toDateString()
                          ? 'bg-salon-900 text-white border-salon-900'
                          : 'bg-white border-salon-200 hover:border-salon-400'
                      }`}
                    >
                      <span className="text-xs uppercase mb-1">{format(date, 'EEE', { locale: es })}</span>
                      <span className="text-2xl font-serif">{format(date, 'd')}</span>
                    </button>
                  ))}
                </div>
              </div>

              {selectedDate && (
                <div className="mb-8">
                  <h3 className="text-sm font-medium text-salon-500 uppercase tracking-wider mb-4">Hora</h3>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                    {timeSlots.map((time) => {
                      const available = isSlotAvailable(time);
                      return (
                        <button
                          key={time}
                          disabled={!available}
                          onClick={() => setSelectedTime(time)}
                          className={`py-2 px-4 rounded-lg text-sm font-medium border transition-all ${
                            selectedTime === time
                              ? 'bg-salon-900 text-white border-salon-900'
                              : available 
                                ? 'bg-white border-salon-200 hover:border-salon-400'
                                : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          {time}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center mt-8">
                <button onClick={() => setStep(2)} className="text-salon-500 hover:text-salon-900 text-sm underline">
                  Atrás
                </button>
                <button 
                  disabled={!selectedDate || !selectedTime}
                  onClick={() => setStep(4)}
                  className="bg-salon-900 text-white px-8 py-3 rounded-full font-medium hover:bg-salon-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continuar
                </button>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <h2 className="font-serif text-2xl mb-8">Confirmar Datos</h2>
              
              {submitError && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center mb-6">
                  {submitError}
                </div>
              )}

              <div className="bg-salon-50 p-6 rounded-2xl mb-8 space-y-4">
                <div className="flex justify-between border-b border-salon-200 pb-2">
                  <span className="text-salon-600">Servicio</span>
                  <span className="font-medium text-salon-900">{selectedService?.name}</span>
                </div>
                <div className="flex justify-between border-b border-salon-200 pb-2">
                  <span className="text-salon-600">Estilista</span>
                  <span className="font-medium text-salon-900">{selectedStylist?.name}</span>
                </div>
                <div className="flex justify-between border-b border-salon-200 pb-2">
                  <span className="text-salon-600">Fecha</span>
                  <span className="font-medium text-salon-900">
                    {selectedDate && format(selectedDate, 'd MMMM yyyy', { locale: es })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-salon-600">Hora</span>
                  <span className="font-medium text-salon-900">{selectedTime}</span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-salon-700 mb-2">Nombre Completo</label>
                  <input
                    required
                    type="text"
                    value={clientInfo.name}
                    onChange={(e) => setClientInfo({ ...clientInfo, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-salon-200 focus:outline-none focus:ring-2 focus:ring-salon-400 bg-white"
                    placeholder="Tu nombre"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-salon-700 mb-2">Email</label>
                  <input
                    required
                    type="email"
                    value={clientInfo.email}
                    onChange={(e) => setClientInfo({ ...clientInfo, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-salon-200 focus:outline-none focus:ring-2 focus:ring-salon-400 bg-white"
                    placeholder="tu@email.com"
                  />
                </div>

                <div className="flex justify-between items-center pt-4">
                  <button type="button" onClick={() => setStep(3)} className="text-salon-500 hover:text-salon-900 text-sm underline">
                    Atrás
                  </button>
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-salon-900 text-white px-10 py-4 rounded-full font-medium hover:bg-salon-800 transition-colors disabled:opacity-70"
                  >
                    {isSubmitting ? 'Confirmando...' : 'Confirmar Reserva'}
                  </button>
                </div>
              </form>
            </motion.div>
          )}
          </div>
        )}
      </div>
    </div>
  );
}
