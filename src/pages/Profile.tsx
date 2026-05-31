import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'motion/react';
import { Calendar, Clock, Scissors, User, X, Plus, Settings, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import ConfirmationModal from '@/components/ConfirmationModal';

interface Appointment {
  id: number;
  client_name: string;
  client_email: string;
  service_name: string;
  stylist_name: string;
  date: string;
  time: string;
  status: string;
}

export default function Profile() {
  const { user, isLoading: authLoading, updateUser } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'appointments' | 'settings'>('appointments');
  
  // Settings State
  const [editName, setEditName] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [language, setLanguage] = useState(localStorage.getItem('language') || 'es');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<number | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isCancelledExpanded, setIsCancelledExpanded] = useState(false);

  useEffect(() => {
    if (user) {
      fetchAppointments();
      setEditName(user.name || '');
      setEditAvatar(user.avatar || '');
    } else if (!authLoading) {
      setIsLoading(false);
    }
  }, [user, authLoading]);

  const fetchAppointments = async () => {
    try {
      const res = await fetch('/api/appointments');
      if (res.ok) {
        const data = await res.json();
        setAppointments(data);
      } else {
        setError('No se pudieron cargar las citas.');
      }
    } catch (err) {
      console.error(err);
      setError('Error de conexión.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelClick = (id: number) => {
    setSelectedAppointmentId(id);
    setIsModalOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!selectedAppointmentId) return;
    
    setIsCancelling(true);
    try {
      const res = await fetch(`/api/appointments/${selectedAppointmentId}`, {
        method: 'DELETE',
      });
      
      if (res.ok) {
        setAppointments(appointments.map(a => 
          a.id === selectedAppointmentId ? { ...a, status: 'cancelled' } : a
        ));
        setIsModalOpen(false);
      } else {
        const data = await res.json();
        alert(data.error || 'No se pudo cancelar la cita.');
      }
    } catch (err) {
      alert('Error al cancelar la cita.');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setProfileMessage(null);

    try {
      localStorage.setItem('language', language);

      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName, avatar: editAvatar }),
      });

      if (res.ok) {
        const updatedUser = await res.json();
        updateUser(updatedUser);
        setProfileMessage({ text: 'Perfil actualizado correctamente', type: 'success' });
      } else {
        const data = await res.json();
        setProfileMessage({ text: data.error || 'Error al actualizar el perfil', type: 'error' });
      }
    } catch (err) {
      setProfileMessage({ text: 'Error de conexión', type: 'error' });
    } finally {
      setIsSavingProfile(false);
      setTimeout(() => setProfileMessage(null), 3000);
    }
  };

  if (authLoading) {
    return <div className="min-h-screen pt-32 flex justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-salon-900"></div></div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen pt-32 px-4 text-center">
        <h1 className="text-2xl font-serif mb-4">Acceso Restringido</h1>
        <p className="text-salon-600 mb-8">Por favor inicia sesión para ver tu perfil.</p>
        <Link to="/login" className="bg-salon-900 text-white px-6 py-2 rounded-full">Iniciar Sesión</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-24 px-4 bg-salon-50">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8 bg-white p-8 rounded-3xl shadow-sm border border-salon-100">
          <div className="relative">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-salon-200 flex items-center justify-center text-salon-500 shadow-md">
                <User size={40} />
              </div>
            )}
          </div>
          <div className="text-center md:text-left flex-1">
            <h1 className="font-serif text-3xl text-salon-900 mb-1">{user.name}</h1>
            <p className="text-salon-600 mb-4">{user.email}</p>
            <div className="flex bg-salon-50 rounded-xl p-1 w-fit mx-auto md:mx-0 border border-salon-100">
              <button
                onClick={() => setActiveTab('appointments')}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors ${activeTab === 'appointments' ? 'bg-white text-salon-900 shadow-sm' : 'text-salon-600 hover:bg-salon-100'}`}
              >
                <Calendar size={16} /> Mis Citas
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors ${activeTab === 'settings' ? 'bg-white text-salon-900 shadow-sm' : 'text-salon-600 hover:bg-salon-100'}`}
              >
                <Settings size={16} /> Configuración
              </button>
            </div>
          </div>
        </div>

        {activeTab === 'appointments' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-serif text-2xl flex items-center gap-2">
                <Calendar className="text-salon-500" /> Mis Citas
              </h2>
              <Link to="/book" className="flex items-center gap-2 bg-salon-900 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-salon-800 transition-colors">
                <Plus size={16} /> Nueva Reserva
              </Link>
            </div>

            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-salon-900 mx-auto mb-4"></div>
                <p className="text-salon-600">Cargando citas...</p>
              </div>
            ) : error ? (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center">
                {error}
              </div>
            ) : appointments.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl shadow-sm border border-salon-100 text-center">
                <p className="text-salon-500 mb-6">No tienes citas programadas.</p>
                <Link to="/book" className="bg-salon-900 text-white px-6 py-2 rounded-full hover:bg-salon-800 transition-colors">
                  Reservar una Cita
                </Link>
              </div>
            ) : (
              <div className="space-y-10">
                {(() => {
                  const now = new Date();
                  
                  // Sort all appointments by date and time ascending for easier processing
                  const sortedAppointments = [...appointments].sort((a, b) => {
                    const dateA = new Date(`${a.date}T${a.time}`);
                    const dateB = new Date(`${b.date}T${b.time}`);
                    return dateA.getTime() - dateB.getTime();
                  });

                  const activeAppointments = sortedAppointments.filter(a => a.status !== 'cancelled');
                  const cancelledAppointments = sortedAppointments.filter(a => a.status === 'cancelled');
                  
                  // Separate upcoming and past active appointments
                  const upcomingAppointments = activeAppointments.filter(a => new Date(`${a.date}T${a.time}`) >= now);
                  const pastAppointments = activeAppointments.filter(a => new Date(`${a.date}T${a.time}`) < now);
                  
                  return (
                    <>
                      {/* Highlight Next Appointment */}
                      {upcomingAppointments.length > 0 && (
                        <section>
                          <h3 className="text-sm font-bold text-salon-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-salon-900 animate-pulse"></div>
                            Tu Próxima Cita
                          </h3>
                          <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-salon-900 text-white rounded-[2.5rem] p-8 md:p-10 shadow-xl shadow-salon-900/20 relative overflow-hidden group"
                          >
                            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
                              <Scissors size={180} />
                            </div>
                            
                            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                              <div className="space-y-4">
                                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold uppercase tracking-wider">
                                  <Check size={14} className="text-green-400" />
                                  Confirmada
                                </div>
                                <h4 className="font-serif text-4xl md:text-5xl leading-tight">
                                  {upcomingAppointments[0].service_name}
                                </h4>
                                <p className="text-salon-200 flex items-center gap-2 text-lg">
                                  <User size={20} className="text-salon-400" />
                                  con {upcomingAppointments[0].stylist_name}
                                </p>
                              </div>

                              <div className="flex flex-wrap gap-4">
                                <div className="bg-white/10 backdrop-blur-md border border-white/10 p-5 rounded-3xl min-w-[140px]">
                                  <Calendar size={20} className="text-salon-400 mb-2" />
                                  <div className="text-2xl font-bold">
                                    {format(new Date(upcomingAppointments[0].date), 'd MMM', { locale: es })}
                                  </div>
                                  <div className="text-xs text-salon-300 uppercase tracking-tighter">
                                    {format(new Date(upcomingAppointments[0].date), 'EEEE', { locale: es })}
                                  </div>
                                </div>
                                <div className="bg-white/10 backdrop-blur-md border border-white/10 p-5 rounded-3xl min-w-[140px]">
                                  <Clock size={20} className="text-salon-400 mb-2" />
                                  <div className="text-2xl font-bold">
                                    {upcomingAppointments[0].time}
                                  </div>
                                  <div className="text-xs text-salon-300 uppercase tracking-tighter">
                                    Hora Local
                                  </div>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        </section>
                      )}

                      {/* Other Upcoming Appointments Grid */}
                      {upcomingAppointments.length > 1 && (
                        <section>
                          <h3 className="text-sm font-bold text-salon-400 uppercase tracking-widest mb-6">
                            Otras Citas Programadas
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {upcomingAppointments.slice(1).map((appointment) => (
                              <motion.div 
                                key={appointment.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-white overflow-hidden rounded-3xl shadow-sm border border-salon-100 flex flex-col transition-all hover:shadow-md group"
                              >
                                <div className="p-6 flex-1">
                                  <div className="flex justify-between items-start mb-4">
                                    <div className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-green-100 text-green-700">
                                      Confirmada
                                    </div>
                                    <button 
                                      onClick={() => handleCancelClick(appointment.id)}
                                      className="text-salon-300 hover:text-red-500 transition-colors p-1"
                                      title="Cancelar cita"
                                    >
                                      <X size={18} />
                                    </button>
                                  </div>

                                  <h3 className="font-serif text-xl text-salon-900 mb-1 flex items-center gap-2">
                                    <Scissors size={18} className="text-salon-400" />
                                    {appointment.service_name}
                                  </h3>
                                  
                                  <p className="text-salon-500 text-xs mb-6 flex items-center gap-1.5">
                                    <User size={12} /> {appointment.stylist_name}
                                  </p>

                                  <div className="flex items-center justify-between text-salon-900">
                                    <div className="flex items-center gap-2">
                                      <Calendar size={14} className="text-salon-400" />
                                      <span className="text-sm font-medium">
                                        {format(new Date(appointment.date), 'd MMM', { locale: es })}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Clock size={14} className="text-salon-400" />
                                      <span className="text-sm font-medium">
                                        {appointment.time}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="bg-salon-50/50 px-6 py-3 border-t border-salon-50 flex justify-between items-center">
                                  <span className="text-[10px] font-mono text-salon-400 uppercase tracking-widest">#{appointment.id.toString().padStart(4, '0')}</span>
                                  <div className="flex gap-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                                    <span className="text-[10px] text-salon-600 font-medium">Próximamente</span>
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </section>
                      )}

                      {/* Past Appointments Section */}
                      {pastAppointments.length > 0 && (
                        <section>
                          <h3 className="text-sm font-bold text-salon-400 uppercase tracking-widest mb-6">
                            Historial de Citas
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[...pastAppointments].reverse().map((appointment) => (
                              <motion.div 
                                key={appointment.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-white/70 overflow-hidden rounded-3xl shadow-sm border border-salon-100 flex flex-col transition-all hover:shadow-md group grayscale-[0.3]"
                              >
                                <div className="p-6 flex-1">
                                  <div className="flex justify-between items-start mb-4">
                                    <div className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-salon-100 text-salon-600">
                                      Completada
                                    </div>
                                  </div>

                                  <h3 className="font-serif text-xl text-salon-900 mb-1 flex items-center gap-2">
                                    <Scissors size={18} className="text-salon-400" />
                                    {appointment.service_name}
                                  </h3>
                                  
                                  <p className="text-salon-500 text-xs mb-6 flex items-center gap-1.5">
                                    <User size={12} /> {appointment.stylist_name}
                                  </p>

                                  <div className="flex items-center justify-between text-salon-900 opacity-70">
                                    <div className="flex items-center gap-2">
                                      <Calendar size={14} className="text-salon-400" />
                                      <span className="text-sm font-medium">
                                        {format(new Date(appointment.date), 'd MMM', { locale: es })}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Clock size={14} className="text-salon-400" />
                                      <span className="text-sm font-medium">
                                        {appointment.time}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="bg-salon-50/50 px-6 py-3 border-t border-salon-50 flex justify-between items-center">
                                  <span className="text-[10px] font-mono text-salon-400 uppercase tracking-widest">#{appointment.id.toString().padStart(4, '0')}</span>
                                  <div className="flex gap-1">
                                    <Check size={12} className="text-salon-400" />
                                    <span className="text-[10px] text-salon-600 font-medium">Finalizada</span>
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </section>
                      )}

                      {/* Cancelled Appointments Collapsible */}
                      {cancelledAppointments.length > 0 && (
                        <section className="pt-4">
                          <button 
                            onClick={() => setIsCancelledExpanded(!isCancelledExpanded)}
                            className="w-full flex items-center justify-between p-4 bg-white rounded-2xl border border-salon-100 hover:bg-salon-50 transition-colors group"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-500">
                                <X size={18} />
                              </div>
                              <span className="font-medium text-salon-900">Citas Canceladas ({cancelledAppointments.length})</span>
                            </div>
                            {isCancelledExpanded ? <ChevronUp className="text-salon-400" /> : <ChevronDown className="text-salon-400" />}
                          </button>

                          {isCancelledExpanded && (
                            <motion.div 
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                            >
                              {cancelledAppointments.map((appointment) => (
                                <div 
                                  key={appointment.id}
                                  className="bg-white/50 overflow-hidden rounded-3xl border border-salon-100 flex flex-col opacity-75 grayscale-[0.5]"
                                >
                                  <div className="p-6 flex-1">
                                    <div className="flex justify-between items-start mb-4">
                                      <div className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-700">
                                        Cancelada
                                      </div>
                                    </div>

                                    <h3 className="font-serif text-lg text-salon-900 mb-1 flex items-center gap-2">
                                      <Scissors size={16} className="text-salon-400" />
                                      {appointment.service_name}
                                    </h3>
                                    
                                    <p className="text-salon-500 text-xs mb-4 flex items-center gap-1.5">
                                      <User size={12} /> {appointment.stylist_name}
                                    </p>

                                    <div className="flex items-center justify-between text-salon-900 opacity-60">
                                      <div className="flex items-center gap-2">
                                        <Calendar size={14} className="text-salon-400" />
                                        <span className="text-xs font-medium">
                                          {format(new Date(appointment.date), 'd MMM', { locale: es })}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Clock size={14} className="text-salon-400" />
                                        <span className="text-xs font-medium">
                                          {appointment.time}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="bg-salon-50/30 px-6 py-3 border-t border-salon-50 flex justify-between items-center">
                                    <span className="text-[10px] font-mono text-salon-400 uppercase tracking-widest">#{appointment.id.toString().padStart(4, '0')}</span>
                                    <span className="text-[10px] text-red-400 font-medium italic">Anulada</span>
                                  </div>
                                </div>
                              ))}
                            </motion.div>
                          )}
                        </section>
                      )}
                    </>
                  );
                })()}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'settings' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-8 rounded-3xl shadow-sm border border-salon-100">
            <h2 className="font-serif text-2xl mb-6 flex items-center gap-2">
              <Settings className="text-salon-500" /> Configuración del Perfil
            </h2>
            
            {profileMessage && (
              <div className={`mb-6 p-4 rounded-xl flex items-center gap-2 ${profileMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {profileMessage.type === 'success' ? <Check size={20} /> : <X size={20} />}
                {profileMessage.text}
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-6 max-w-md">
              <div>
                <label className="block text-sm font-medium text-salon-700 mb-2">Nombre Completo</label>
                <input 
                  type="text" 
                  value={editName} 
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-salon-200 focus:ring-2 focus:ring-salon-900 outline-none transition-shadow"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-salon-700 mb-2">Email (No editable)</label>
                <input 
                  type="email" 
                  value={user.email} 
                  disabled
                  className="w-full px-4 py-3 rounded-xl border border-salon-100 bg-salon-50 text-salon-500 outline-none cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-salon-700 mb-2">URL de la Foto de Perfil</label>
                <input 
                  type="url" 
                  value={editAvatar} 
                  onChange={(e) => setEditAvatar(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-salon-200 focus:ring-2 focus:ring-salon-900 outline-none transition-shadow"
                  placeholder="https://ejemplo.com/foto.jpg"
                />
                <p className="text-xs text-salon-500 mt-2">Pega el enlace a una imagen para actualizar tu foto de perfil.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-salon-700 mb-2">Idioma</label>
                <select 
                  value={language} 
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-salon-200 focus:ring-2 focus:ring-salon-900 outline-none transition-shadow bg-white"
                >
                  <option value="es">Español</option>
                  <option value="en">English</option>
                  <option value="fr">Français</option>
                </select>
              </div>

              <button 
                type="submit" 
                disabled={isSavingProfile}
                className="w-full bg-salon-900 text-white py-3 rounded-xl font-medium hover:bg-salon-800 transition-colors disabled:opacity-70 flex justify-center items-center"
              >
                {isSavingProfile ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  'Guardar Cambios'
                )}
              </button>
            </form>
          </motion.div>
        )}

      </div>

      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmCancel}
        title="Cancelar Cita"
        message="¿Estás seguro de que deseas cancelar esta cita? Esta acción no se puede deshacer."
        isLoading={isCancelling}
      />
    </div>
  );
}
