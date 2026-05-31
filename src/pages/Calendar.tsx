import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  addDays, 
  isBefore, 
  startOfDay,
  parseISO
} from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Info, X, Clock } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface AvailabilityData {
  appointments: { date: string; time: string; stylist_id: number }[];
  stylistCount: number;
}

export default function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [availability, setAvailability] = useState<AvailabilityData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal state
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const navigate = useNavigate();

  // Assuming working hours are 10:00 to 19:00 (9 slots per stylist per day)
  const SLOTS_PER_STYLIST = 9;
  const TIME_SLOTS = ['09:00', '10:00', '11:00', '12:00', '13:00', '15:00', '16:00', '17:00', '18:00', '19:00'];

  useEffect(() => {
    fetchAvailability();
  }, []);

  const fetchAvailability = async () => {
    try {
      const res = await fetch('/api/calendar/availability');
      if (res.ok) {
        const data = await res.json();
        setAvailability(data);
      }
    } catch (error) {
      console.error('Error fetching availability:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const handleDayClick = (day: Date, isPast: boolean, isSunday: boolean, isFull: boolean) => {
    if (!isPast && !isSunday && !isFull) {
      setSelectedDay(day);
    }
  };

  const renderHeader = () => {
    return (
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-serif text-3xl text-salon-900 capitalize flex items-center gap-3">
          <CalendarIcon className="text-salon-500" />
          {format(currentDate, 'MMMM yyyy', { locale: es })}
        </h2>
        <div className="flex gap-2">
          <button 
            onClick={prevMonth}
            className="p-2 rounded-full hover:bg-salon-100 text-salon-600 transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <button 
            onClick={nextMonth}
            className="p-2 rounded-full hover:bg-salon-100 text-salon-600 transition-colors"
          >
            <ChevronRight size={24} />
          </button>
        </div>
      </div>
    );
  };

  const renderDays = () => {
    const days = [];
    const startDate = startOfWeek(currentDate, { weekStartsOn: 1 }); // Start on Monday

    for (let i = 0; i < 7; i++) {
      days.push(
        <div key={i} className="text-center font-medium text-salon-500 text-sm py-2 uppercase tracking-wider">
          {format(addDays(startDate, i), 'EEEE', { locale: es }).substring(0, 3)}
        </div>
      );
    }
    return <div className="grid grid-cols-7 mb-2">{days}</div>;
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
    const today = startOfDay(new Date());

    const maxCapacityPerDay = (availability?.stylistCount || 1) * SLOTS_PER_STYLIST;

    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = '';

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, 'd');
        const cloneDay = day;
        const dateString = format(day, 'yyyy-MM-dd');
        
        // Count appointments for this day
        const dayAppointments = availability?.appointments.filter(a => a.date === dateString) || [];
        const bookedCount = dayAppointments.length;
        
        const isPast = isBefore(day, today);
        const isSunday = day.getDay() === 0;
        
        // Determine status
        let statusText = 'Disponible';
        let statusColor = 'bg-green-100 text-green-700';
        let isFull = false;

        if (isPast) {
          statusText = 'Pasado';
          statusColor = 'bg-gray-100 text-gray-400';
        } else if (isSunday) {
          statusText = 'Cerrado';
          statusColor = 'bg-gray-100 text-gray-500';
        } else if (bookedCount >= maxCapacityPerDay) {
          statusText = 'Completo';
          statusColor = 'bg-red-100 text-red-700';
          isFull = true;
        } else if (bookedCount > maxCapacityPerDay * 0.7) {
          statusText = 'Casi Lleno';
          statusColor = 'bg-orange-100 text-orange-700';
        } else if (bookedCount > 0) {
          statusText = 'Parcial';
          statusColor = 'bg-blue-100 text-blue-700';
        }

        days.push(
          <div 
            key={day.toString()} 
            onClick={() => handleDayClick(cloneDay, isPast, isSunday, isFull)}
            className={`min-h-[100px] p-2 border border-salon-100 transition-all ${
              !isSameMonth(day, monthStart) ? 'bg-salon-50/50 text-salon-300' : 'bg-white'
            } ${isSameDay(day, today) ? 'ring-2 ring-salon-900 ring-inset' : ''} 
            ${!isPast && !isSunday && !isFull ? 'hover:bg-salon-50 cursor-pointer' : ''}`}
          >
            <div className="flex justify-between items-start mb-2">
              <span className={`font-medium ${isSameDay(day, today) ? 'text-salon-900 font-bold' : 'text-salon-700'}`}>
                {formattedDate}
              </span>
            </div>
            
            <div className="flex flex-col gap-1 mt-2">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md text-center ${statusColor}`}>
                {statusText}
              </span>
              
              {!isPast && !isSunday && bookedCount > 0 && (
                <span className="text-[10px] text-salon-500 text-center mt-1">
                  {bookedCount} reserva{bookedCount !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="grid grid-cols-7" key={day.toString()}>
          {days}
        </div>
      );
      days = [];
    }
    return <div className="border-l border-t border-salon-100 rounded-xl overflow-hidden">{rows}</div>;
  };

  const renderModal = () => {
    if (!selectedDay || !availability) return null;

    const dateString = format(selectedDay, 'yyyy-MM-dd');
    const dayAppointments = availability.appointments.filter(a => a.date === dateString);
    const stylistCount = availability.stylistCount || 1;

    // Calculate available slots
    const now = new Date();
    const todayStr = format(now, 'yyyy-MM-dd');

    const availableSlots = TIME_SLOTS.map(time => {
      // Count how many appointments are at this time
      const bookedAtTime = dayAppointments.filter(a => a.time === time).length;
      
      // Basic availability based on stylist count
      let isAvailable = bookedAtTime < stylistCount;
      
      // 1. Check if in the past (if today)
      if (dateString === todayStr) {
        const [hour, minute] = time.split(':').map(Number);
        const slotTime = new Date(now);
        slotTime.setHours(hour, minute, 0, 0);
        if (slotTime < now) isAvailable = false;
      }

      return { time, isAvailable, remaining: stylistCount - bookedAtTime, booked: bookedAtTime };
    });

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedDay(null)}>
        <motion.div 
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.95 }} 
          animate={{ opacity: 1, scale: 1 }} 
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-3xl p-6 max-w-md w-full shadow-xl"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-serif text-2xl text-salon-900 capitalize">
              {format(selectedDay, 'EEEE d MMMM', { locale: es })}
            </h3>
            <button onClick={() => setSelectedDay(null)} className="text-salon-400 hover:text-salon-900 transition-colors">
              <X size={24} />
            </button>
          </div>

          <div className="mb-6">
            <p className="text-salon-600 mb-4">Horas disponibles para este día:</p>
            <div className="grid grid-cols-3 gap-3">
              {availableSlots.map((slot) => {
                let statusClass = 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100';
                if (!slot.isAvailable) {
                  statusClass = 'bg-red-50 border-red-200 text-red-700 opacity-70';
                } else if (slot.booked > 0) {
                  statusClass = 'bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100';
                }

                return (
                  <div 
                    key={slot.time}
                    className={`py-2 px-2 rounded-xl text-center font-medium border flex flex-col items-center justify-center transition-colors ${statusClass}`}
                  >
                    <span className={`text-sm ${!slot.isAvailable ? 'line-through' : ''}`}>{slot.time}</span>
                    {slot.booked > 0 && slot.isAvailable && (
                      <span className="text-[10px] opacity-80 mt-0.5">Quedan {slot.remaining}</span>
                    )}
                    {!slot.isAvailable && (
                      <span className="text-[10px] opacity-80 mt-0.5">Completo</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button 
              onClick={() => setSelectedDay(null)}
              className="px-6 py-2.5 rounded-full font-medium text-salon-600 hover:bg-salon-50 transition-colors"
            >
              Cerrar
            </button>
            <button 
              onClick={() => {
                // Navigate to booking page with the selected date in state
                navigate('/book', { state: { selectedDate: selectedDay } });
              }}
              className="bg-salon-900 text-white px-6 py-2.5 rounded-full font-medium hover:bg-salon-800 transition-colors flex items-center gap-2"
            >
              <Clock size={16} /> Reservar este día
            </button>
          </div>
        </motion.div>
      </div>
    );
  };

  if (isLoading) {
    return <div className="min-h-screen pt-32 flex justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-salon-900"></div></div>;
  }

  return (
    <div className="min-h-screen pt-32 pb-24 px-4 bg-salon-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-serif text-4xl md:text-5xl text-salon-900 mb-4"
          >
            Calendario de Disponibilidad
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-salon-600 max-w-2xl mx-auto"
          >
            Consulta la disponibilidad de nuestro salón en tiempo real. Haz clic en un día disponible para ver las horas libres.
          </motion.p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-salon-100"
        >
          {renderHeader()}
          {renderDays()}
          {renderCells()}
          
          <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-4 bg-salon-50 p-4 rounded-2xl">
            <div className="flex items-center gap-2 text-sm text-salon-600">
              <Info size={16} className="text-salon-500" />
              <span>Los domingos permanecemos cerrados.</span>
            </div>
            <Link 
              to="/book" 
              className="bg-salon-900 text-white px-6 py-2.5 rounded-full font-medium hover:bg-salon-800 transition-colors"
            >
              Ir a Reservas
            </Link>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {selectedDay && renderModal()}
      </AnimatePresence>
    </div>
  );
}
