import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Appointment, Service, Stylist } from '@/lib/utils';
import { Trash2, Calendar, Clock, LogIn, Users, Scissors, Edit2, Plus, X, Check, UserCircle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAuth } from '@/context/AuthContext';

type User = {
  id: number;
  email: string;
  name: string;
  role: string;
  created_at: string;
  avatar: string | null;
};

export default function Admin() {
  const { user, loginGoogle, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'appointments' | 'users' | 'services' | 'stylists'>('appointments');
  
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [stylists, setStylists] = useState<Stylist[]>([]);

  // Modals / Edit states
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isAddingService, setIsAddingService] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [editingStylist, setEditingStylist] = useState<Stylist | null>(null);
  const [isAddingStylist, setIsAddingStylist] = useState(false);

  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; title: string; message: string; onConfirm: () => void } | null>(null);
  // Toast Notification State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchAppointments();
      fetchUsers();
      fetchServices();
      fetchStylists();
    }
  }, [user]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchAppointments = () => fetch('/api/appointments').then(res => res.json()).then(data => setAppointments(Array.isArray(data) ? data : []));
  const fetchUsers = () => fetch('/api/users').then(res => res.json()).then(data => setUsers(Array.isArray(data) ? data : []));
  const fetchServices = () => fetch('/api/services').then(res => res.json()).then(data => setServices(Array.isArray(data) ? data : []));
  const fetchStylists = () => fetch('/api/stylists').then(res => res.json()).then(data => setStylists(Array.isArray(data) ? data : []));

  // --- Appointments ---
  const handleDeleteAppointment = (id: number) => {
    setConfirmModal({
      isOpen: true,
      title: 'Cancelar Cita',
      message: '¿Estás seguro de que quieres cancelar esta cita?',
      onConfirm: async () => {
        await fetch(`/api/appointments/${id}`, { method: 'DELETE' });
        fetchAppointments();
        showToast('Cita cancelada correctamente');
      }
    });
  };

  const handleUpdateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAppointment) return;
    await fetch(`/api/appointments/${editingAppointment.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editingAppointment)
    });
    setEditingAppointment(null);
    fetchAppointments();
    showToast('Cita actualizada correctamente');
  };

  // --- Users ---
  const handleDeleteUser = (id: number) => {
    setConfirmModal({
      isOpen: true,
      title: 'Eliminar Usuario',
      message: '¿Estás seguro de que quieres eliminar este usuario? Esta acción no se puede deshacer.',
      onConfirm: async () => {
        await fetch(`/api/users/${id}`, { method: 'DELETE' });
        fetchUsers();
        showToast('Usuario eliminado correctamente');
      }
    });
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    await fetch(`/api/users/${editingUser.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editingUser)
    });
    setEditingUser(null);
    fetchUsers();
    showToast('Usuario actualizado correctamente');
  };

  // --- Services ---
  const handleDeleteService = (id: number) => {
    setConfirmModal({
      isOpen: true,
      title: 'Eliminar Servicio',
      message: '¿Estás seguro de que quieres eliminar este servicio?',
      onConfirm: async () => {
        await fetch(`/api/services/${id}`, { method: 'DELETE' });
        fetchServices();
        showToast('Servicio eliminado correctamente');
      }
    });
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isAddingService && editingService) {
      await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingService)
      });
      showToast('Servicio creado correctamente');
    } else if (editingService) {
      await fetch(`/api/services/${editingService.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingService)
      });
      showToast('Servicio actualizado correctamente');
    }
    setEditingService(null);
    setIsAddingService(false);
    fetchServices();
  };

  // --- Stylists ---
  const handleDeleteStylist = (id: number) => {
    setConfirmModal({
      isOpen: true,
      title: 'Eliminar Estilista',
      message: '¿Estás seguro de que quieres eliminar este estilista?',
      onConfirm: async () => {
        await fetch(`/api/stylists/${id}`, { method: 'DELETE' });
        fetchStylists();
        showToast('Estilista eliminado correctamente');
      }
    });
  };

  const handleSaveStylist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isAddingStylist && editingStylist) {
      await fetch('/api/stylists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingStylist)
      });
      showToast('Estilista creado correctamente');
    } else if (editingStylist) {
      await fetch(`/api/stylists/${editingStylist.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingStylist)
      });
      showToast('Estilista actualizado correctamente');
    }
    setEditingStylist(null);
    setIsAddingStylist(false);
    fetchStylists();
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-salon-50">Cargando...</div>;
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-salon-50 px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-3xl shadow-lg max-w-md w-full text-center"
        >
          <h1 className="font-serif text-3xl mb-6 text-salon-900">Acceso Administrativo</h1>
          <p className="text-salon-600 mb-8">
            Esta área está restringida a administradores. Por favor, inicia sesión con una cuenta autorizada.
          </p>
          <button 
            onClick={loginGoogle}
            className="w-full bg-salon-900 text-white py-3 rounded-xl font-medium hover:bg-salon-800 transition-colors flex items-center justify-center gap-2"
          >
            <LogIn size={20} /> Iniciar Sesión con Google
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-salon-50 pt-32 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="font-serif text-4xl text-salon-900 mb-2">Panel de Control</h1>
            <p className="text-salon-600">Bienvenido, {user.name}. Gestiona el salón.</p>
          </div>
          <div className="flex bg-white rounded-xl p-1 shadow-sm border border-salon-100">
            <button
              onClick={() => setActiveTab('appointments')}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors ${activeTab === 'appointments' ? 'bg-salon-900 text-white' : 'text-salon-600 hover:bg-salon-50'}`}
            >
              <Calendar size={16} /> Citas
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors ${activeTab === 'users' ? 'bg-salon-900 text-white' : 'text-salon-600 hover:bg-salon-50'}`}
            >
              <Users size={16} /> Usuarios
            </button>
            <button
              onClick={() => setActiveTab('services')}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors ${activeTab === 'services' ? 'bg-salon-900 text-white' : 'text-salon-600 hover:bg-salon-50'}`}
            >
              <Scissors size={16} /> Servicios
            </button>
            <button
              onClick={() => setActiveTab('stylists')}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors ${activeTab === 'stylists' ? 'bg-salon-900 text-white' : 'text-salon-600 hover:bg-salon-50'}`}
            >
              <UserCircle size={16} /> Estilistas
            </button>
          </div>
        </div>

        {/* --- APPOINTMENTS TAB --- */}
        {activeTab === 'appointments' && (
          <div className="bg-white rounded-3xl shadow-sm border border-salon-100 overflow-hidden">
            <div className="p-6 border-b border-salon-100 bg-salon-50/50 flex justify-between items-center">
              <h2 className="font-medium text-salon-900 flex items-center gap-2">
                <Calendar className="text-salon-500" size={20} /> Próximas Citas
              </h2>
              <span className="bg-salon-200 text-salon-800 px-3 py-1 rounded-full text-xs font-bold">
                {appointments.length} Total
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-salon-50 text-salon-600 text-xs uppercase tracking-wider font-medium">
                  <tr>
                    <th className="px-6 py-4 text-left">Cliente</th>
                    <th className="px-6 py-4 text-left">Servicio</th>
                    <th className="px-6 py-4 text-left">Estilista</th>
                    <th className="px-6 py-4 text-left">Fecha y Hora</th>
                    <th className="px-6 py-4 text-left">Estado</th>
                    <th className="px-6 py-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-salon-100">
                  {appointments.length === 0 ? (
                    <tr><td colSpan={6} className="px-6 py-12 text-center text-salon-500">No hay citas programadas.</td></tr>
                  ) : (
                    appointments.map((apt) => (
                      <tr key={apt.id} className="hover:bg-salon-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-medium text-salon-900">{apt.client_name}</div>
                          <div className="text-xs text-salon-500">{apt.client_email}</div>
                        </td>
                        <td className="px-6 py-4 text-salon-800">{apt.service_name}</td>
                        <td className="px-6 py-4 text-salon-800">{apt.stylist_name}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center text-salon-800">
                            <Calendar size={14} className="mr-2 text-salon-400" />
                            {format(new Date(apt.date), 'd MMM yyyy', { locale: es })}
                          </div>
                          <div className="flex items-center text-salon-500 text-sm mt-1">
                            <Clock size={14} className="mr-2 text-salon-400" />
                            {apt.time}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            apt.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                            apt.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {apt.status === 'confirmed' ? 'Confirmada' : apt.status === 'cancelled' ? 'Cancelada' : 'Completada'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => setEditingAppointment(apt)} className="text-salon-500 hover:text-salon-900 p-2 hover:bg-salon-100 rounded-lg transition-colors mr-2" title="Editar Cita">
                            <Edit2 size={18} />
                          </button>
                          <button onClick={() => handleDeleteAppointment(apt.id)} className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-colors" title="Cancelar Cita">
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- USERS TAB --- */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-3xl shadow-sm border border-salon-100 overflow-hidden">
            <div className="p-6 border-b border-salon-100 bg-salon-50/50 flex justify-between items-center">
              <h2 className="font-medium text-salon-900 flex items-center gap-2">
                <Users className="text-salon-500" size={20} /> Usuarios Registrados
              </h2>
              <span className="bg-salon-200 text-salon-800 px-3 py-1 rounded-full text-xs font-bold">
                {users.length} Total
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-salon-50 text-salon-600 text-xs uppercase tracking-wider font-medium">
                  <tr>
                    <th className="px-6 py-4 text-left">Usuario</th>
                    <th className="px-6 py-4 text-left">Email</th>
                    <th className="px-6 py-4 text-left">Rol</th>
                    <th className="px-6 py-4 text-left">Registro</th>
                    <th className="px-6 py-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-salon-100">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-salon-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {u.avatar ? (
                            <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-full" referrerPolicy="no-referrer" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-salon-200 flex items-center justify-center text-salon-700 font-bold text-xs">{u.name.charAt(0)}</div>
                          )}
                          <span className="font-medium text-salon-900">{u.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-salon-600">{u.email}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${u.role === 'admin' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-700'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-salon-500 text-sm">
                        {format(new Date(u.created_at), 'd MMM yyyy', { locale: es })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => setEditingUser(u)} className="text-salon-500 hover:text-salon-900 p-2 hover:bg-salon-100 rounded-lg transition-colors mr-2" title="Editar Usuario">
                          <Edit2 size={18} />
                        </button>
                        <button onClick={() => handleDeleteUser(u.id)} className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar Usuario">
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- SERVICES TAB --- */}
        {activeTab === 'services' && (
          <div className="bg-white rounded-3xl shadow-sm border border-salon-100 overflow-hidden">
            <div className="p-6 border-b border-salon-100 bg-salon-50/50 flex justify-between items-center">
              <h2 className="font-medium text-salon-900 flex items-center gap-2">
                <Scissors className="text-salon-500" size={20} /> Servicios Ofrecidos
              </h2>
              <button 
                onClick={() => {
                  setEditingService({ id: 0, name: '', description: '', price: 0, duration: 30, image: '' });
                  setIsAddingService(true);
                }}
                className="bg-salon-900 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-salon-800 transition-colors flex items-center gap-2"
              >
                <Plus size={16} /> Añadir Servicio
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-salon-50 text-salon-600 text-xs uppercase tracking-wider font-medium">
                  <tr>
                    <th className="px-6 py-4 text-left">Servicio</th>
                    <th className="px-6 py-4 text-left">Precio</th>
                    <th className="px-6 py-4 text-left">Duración</th>
                    <th className="px-6 py-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-salon-100">
                  {services.map((s) => (
                    <tr key={s.id} className="hover:bg-salon-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-salon-900">{s.name}</div>
                        <div className="text-xs text-salon-500 truncate max-w-xs">{s.description}</div>
                      </td>
                      <td className="px-6 py-4 text-salon-800 font-medium">{s.price}€</td>
                      <td className="px-6 py-4 text-salon-600">{s.duration} min</td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => { setEditingService(s); setIsAddingService(false); }} className="text-salon-500 hover:text-salon-900 p-2 hover:bg-salon-100 rounded-lg transition-colors mr-2" title="Editar Servicio">
                          <Edit2 size={18} />
                        </button>
                        <button onClick={() => handleDeleteService(s.id)} className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar Servicio">
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- STYLISTS TAB --- */}
        {activeTab === 'stylists' && (
          <div className="bg-white rounded-3xl shadow-sm border border-salon-100 overflow-hidden">
            <div className="p-6 border-b border-salon-100 bg-salon-50/50 flex justify-between items-center">
              <h2 className="font-medium text-salon-900 flex items-center gap-2">
                <UserCircle className="text-salon-500" size={20} /> Estilistas
              </h2>
              <button 
                onClick={() => {
                  setEditingStylist({ id: 0, name: '', bio: '', image: '' });
                  setIsAddingStylist(true);
                }}
                className="bg-salon-900 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-salon-800 transition-colors flex items-center gap-2"
              >
                <Plus size={16} /> Añadir Estilista
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-salon-50 text-salon-600 text-xs uppercase tracking-wider font-medium">
                  <tr>
                    <th className="px-6 py-4 text-left">Estilista</th>
                    <th className="px-6 py-4 text-left">Biografía</th>
                    <th className="px-6 py-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-salon-100">
                  {stylists.map((s) => (
                    <tr key={s.id} className="hover:bg-salon-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {s.image ? (
                            <img src={s.image} alt={s.name} className="w-10 h-10 rounded-full object-cover" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-salon-200 flex items-center justify-center text-salon-700 font-bold">{s.name.charAt(0)}</div>
                          )}
                          <span className="font-medium text-salon-900">{s.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-salon-600 text-sm max-w-md truncate">{s.bio}</td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => { setEditingStylist(s); setIsAddingStylist(false); }} className="text-salon-500 hover:text-salon-900 p-2 hover:bg-salon-100 rounded-lg transition-colors mr-2" title="Editar Estilista">
                          <Edit2 size={18} />
                        </button>
                        <button onClick={() => handleDeleteStylist(s.id)} className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar Estilista">
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* --- MODALS --- */}
      
      {/* Confirmation Modal */}
      {confirmModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4" onClick={() => setConfirmModal(null)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-3xl p-6 max-w-sm w-full text-center" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-serif text-2xl text-salon-900 mb-2">{confirmModal.title}</h3>
            <p className="text-salon-600 mb-6">{confirmModal.message}</p>
            <div className="flex gap-3">
              <button 
                onClick={() => setConfirmModal(null)} 
                className="flex-1 px-4 py-2 rounded-xl border border-salon-200 text-salon-700 font-medium hover:bg-salon-50 transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={() => {
                  confirmModal.onConfirm();
                  setConfirmModal(null);
                }} 
                className="flex-1 px-4 py-2 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition-colors"
              >
                Confirmar
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setEditingUser(null)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-3xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-serif text-2xl text-salon-900">Editar Usuario</h3>
              <button onClick={() => setEditingUser(null)} className="text-salon-400 hover:text-salon-900"><X size={24} /></button>
            </div>
            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-salon-700 mb-1">Nombre</label>
                <input type="text" value={editingUser.name} onChange={e => setEditingUser({...editingUser, name: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-salon-200 focus:ring-2 focus:ring-salon-900 outline-none" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-salon-700 mb-1">Email</label>
                <input type="email" value={editingUser.email} onChange={e => setEditingUser({...editingUser, email: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-salon-200 focus:ring-2 focus:ring-salon-900 outline-none" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-salon-700 mb-1">Rol</label>
                <select value={editingUser.role} onChange={e => setEditingUser({...editingUser, role: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-salon-200 focus:ring-2 focus:ring-salon-900 outline-none">
                  <option value="client">Cliente</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
              <button type="submit" className="w-full bg-salon-900 text-white py-3 rounded-xl font-medium hover:bg-salon-800 transition-colors mt-6">
                Guardar Cambios
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* Edit/Add Service Modal */}
      {editingService && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => { setEditingService(null); setIsAddingService(false); }}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-3xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-serif text-2xl text-salon-900">{isAddingService ? 'Añadir Servicio' : 'Editar Servicio'}</h3>
              <button onClick={() => { setEditingService(null); setIsAddingService(false); }} className="text-salon-400 hover:text-salon-900"><X size={24} /></button>
            </div>
            <form onSubmit={handleSaveService} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-salon-700 mb-1">Nombre del Servicio</label>
                <input type="text" value={editingService.name} onChange={e => setEditingService({...editingService, name: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-salon-200 focus:ring-2 focus:ring-salon-900 outline-none" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-salon-700 mb-1">Descripción</label>
                <textarea value={editingService.description} onChange={e => setEditingService({...editingService, description: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-salon-200 focus:ring-2 focus:ring-salon-900 outline-none" rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-salon-700 mb-1">Precio (€)</label>
                  <input type="number" value={editingService.price} onChange={e => setEditingService({...editingService, price: Number(e.target.value)})} className="w-full px-4 py-2 rounded-xl border border-salon-200 focus:ring-2 focus:ring-salon-900 outline-none" required min="0" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-salon-700 mb-1">Duración (min)</label>
                  <input type="number" value={editingService.duration} onChange={e => setEditingService({...editingService, duration: Number(e.target.value)})} className="w-full px-4 py-2 rounded-xl border border-salon-200 focus:ring-2 focus:ring-salon-900 outline-none" required step="15" min="15" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-salon-700 mb-1">URL de la Imagen</label>
                <input type="url" value={editingService.image} onChange={e => setEditingService({...editingService, image: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-salon-200 focus:ring-2 focus:ring-salon-900 outline-none" placeholder="https://..." />
              </div>
              <button type="submit" className="w-full bg-salon-900 text-white py-3 rounded-xl font-medium hover:bg-salon-800 transition-colors mt-6">
                {isAddingService ? 'Crear Servicio' : 'Guardar Cambios'}
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* Edit Appointment Modal */}
      {editingAppointment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setEditingAppointment(null)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-3xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-serif text-2xl text-salon-900">Editar Cita</h3>
              <button onClick={() => setEditingAppointment(null)} className="text-salon-400 hover:text-salon-900"><X size={24} /></button>
            </div>
            <form onSubmit={handleUpdateAppointment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-salon-700 mb-1">Servicio</label>
                <select value={editingAppointment.service_id} onChange={e => setEditingAppointment({...editingAppointment, service_id: Number(e.target.value)})} className="w-full px-4 py-2 rounded-xl border border-salon-200 focus:ring-2 focus:ring-salon-900 outline-none">
                  {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-salon-700 mb-1">Estilista</label>
                <select value={editingAppointment.stylist_id} onChange={e => setEditingAppointment({...editingAppointment, stylist_id: Number(e.target.value)})} className="w-full px-4 py-2 rounded-xl border border-salon-200 focus:ring-2 focus:ring-salon-900 outline-none">
                  {stylists.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-salon-700 mb-1">Fecha</label>
                <input type="date" value={editingAppointment.date} onChange={e => setEditingAppointment({...editingAppointment, date: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-salon-200 focus:ring-2 focus:ring-salon-900 outline-none" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-salon-700 mb-1">Hora</label>
                <input type="time" value={editingAppointment.time} onChange={e => setEditingAppointment({...editingAppointment, time: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-salon-200 focus:ring-2 focus:ring-salon-900 outline-none" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-salon-700 mb-1">Estado</label>
                <select value={editingAppointment.status} onChange={e => setEditingAppointment({...editingAppointment, status: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-salon-200 focus:ring-2 focus:ring-salon-900 outline-none">
                  <option value="confirmed">Confirmada</option>
                  <option value="cancelled">Cancelada</option>
                  <option value="completed">Completada</option>
                </select>
              </div>
              <button type="submit" className="w-full bg-salon-900 text-white py-3 rounded-xl font-medium hover:bg-salon-800 transition-colors mt-6">
                Guardar Cambios
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* Edit/Add Stylist Modal */}
      {editingStylist && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => { setEditingStylist(null); setIsAddingStylist(false); }}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-3xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-serif text-2xl text-salon-900">{isAddingStylist ? 'Añadir Estilista' : 'Editar Estilista'}</h3>
              <button onClick={() => { setEditingStylist(null); setIsAddingStylist(false); }} className="text-salon-400 hover:text-salon-900"><X size={24} /></button>
            </div>
            <form onSubmit={handleSaveStylist} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-salon-700 mb-1">Nombre</label>
                <input type="text" value={editingStylist.name} onChange={e => setEditingStylist({...editingStylist, name: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-salon-200 focus:ring-2 focus:ring-salon-900 outline-none" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-salon-700 mb-1">Biografía</label>
                <textarea value={editingStylist.bio} onChange={e => setEditingStylist({...editingStylist, bio: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-salon-200 focus:ring-2 focus:ring-salon-900 outline-none" rows={3} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-salon-700 mb-1">URL de la Imagen</label>
                <input type="url" value={editingStylist.image} onChange={e => setEditingStylist({...editingStylist, image: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-salon-200 focus:ring-2 focus:ring-salon-900 outline-none" placeholder="https://..." />
              </div>
              <button type="submit" className="w-full bg-salon-900 text-white py-3 rounded-xl font-medium hover:bg-salon-800 transition-colors mt-6">
                {isAddingStylist ? 'Crear Estilista' : 'Guardar Cambios'}
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <motion.div 
          initial={{ opacity: 0, y: 50 }} 
          animate={{ opacity: 1, y: 0 }} 
          exit={{ opacity: 0, y: 50 }}
          className={`fixed bottom-6 right-6 px-6 py-3 rounded-xl shadow-lg flex items-center gap-3 z-[100] ${
            toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
          }`}
        >
          {toast.type === 'success' ? <Check size={20} /> : <X size={20} />}
          <span className="font-medium">{toast.message}</span>
        </motion.div>
      )}

    </div>
  );
}
