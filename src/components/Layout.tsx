import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Scissors, Menu, X, LogIn, LogOut, User as UserIcon } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <nav className="fixed w-full z-50 bg-salon-50/80 backdrop-blur-md border-b border-salon-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <Link to="/" className="flex items-center space-x-3">
            <img
              src="/images/logo.png"
              alt="Cuts & Wash Logo"
              className="w-32 h-32 object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                document.getElementById('fallback-logo')!.style.display = 'flex';
              }}
            />
            <div id="fallback-logo" className="hidden w-10 h-10 bg-salon-900 rounded-full items-center justify-center text-salon-50">
              <Scissors size={20} />
            </div>
            <span className="font-serif text-2xl font-semibold tracking-tight">Cuts & Wash</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-salon-800 hover:text-salon-600 transition-colors font-medium">Inicio</Link>
            <Link to="/services" className="text-salon-800 hover:text-salon-600 transition-colors font-medium">Servicios</Link>
            <Link to="/virtual-try-on" className="text-salon-800 hover:text-salon-600 transition-colors font-medium">Probador Virtual</Link>
            <Link to="/calendar" className="text-salon-800 hover:text-salon-600 transition-colors font-medium">Calendario</Link>
            <Link to="/book" className="bg-salon-900 text-salon-50 px-6 py-2.5 rounded-full hover:bg-salon-800 transition-colors font-medium text-sm tracking-wide">
              Reservar Cita
            </Link>

            {user ? (
              <div className="relative group">
                <button className="flex items-center space-x-2 text-salon-800 hover:text-salon-600 transition-colors">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full border border-salon-200" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-salon-200 flex items-center justify-center">
                      <UserIcon size={16} />
                    </div>
                  )}
                  <span className="font-medium text-sm">
                    {user.name ? user.name.split(' ')[0] : 'Usuario'}
                  </span>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-salon-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform origin-top-right">
                  <div className="py-1">
                    {user.role === 'admin' && (
                      <Link to="/admin" className="block px-4 py-2 text-sm text-salon-700 hover:bg-salon-50">
                        Panel Admin
                      </Link>
                    )}
                    <Link to="/profile" className="block px-4 py-2 text-sm text-salon-700 hover:bg-salon-50">
                      Mis Citas
                    </Link>
                    <button onClick={logout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center">
                      <LogOut size={14} className="mr-2" /> Cerrar Sesión
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Link to="/login" className="text-salon-600 hover:text-salon-900 transition-colors flex items-center gap-2">
                <LogIn size={20} /> <span className="text-sm font-medium">Entrar</span>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-salon-900 p-2">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="md:hidden bg-salon-50 border-b border-salon-200"
        >
          <div className="px-4 pt-2 pb-6 space-y-2">
            <Link to="/" onClick={() => setIsOpen(false)} className="block px-3 py-3 text-salon-800 font-medium hover:bg-salon-100 rounded-lg">Inicio</Link>
            <Link to="/services" onClick={() => setIsOpen(false)} className="block px-3 py-3 text-salon-800 font-medium hover:bg-salon-100 rounded-lg">Servicios</Link>
            <Link to="/virtual-try-on" onClick={() => setIsOpen(false)} className="block px-3 py-3 text-salon-800 font-medium hover:bg-salon-100 rounded-lg">Probador Virtual</Link>
            <Link to="/calendar" onClick={() => setIsOpen(false)} className="block px-3 py-3 text-salon-800 font-medium hover:bg-salon-100 rounded-lg">Calendario</Link>
            <Link to="/book" onClick={() => setIsOpen(false)} className="block px-3 py-3 text-salon-900 font-bold hover:bg-salon-100 rounded-lg">Reservar Cita</Link>

            {user ? (
              <>
                {user.role === 'admin' && (
                  <Link to="/admin" onClick={() => setIsOpen(false)} className="block px-3 py-3 text-salon-800 font-medium hover:bg-salon-100 rounded-lg">Panel Admin</Link>
                )}
                <Link to="/profile" onClick={() => setIsOpen(false)} className="block px-3 py-3 text-salon-800 font-medium hover:bg-salon-100 rounded-lg">Mis Citas</Link>
                <button onClick={() => { logout(); setIsOpen(false); }} className="w-full text-left px-3 py-3 text-red-600 font-medium hover:bg-red-50 rounded-lg">Cerrar Sesión</button>
              </>
            ) : (
              <Link to="/login" onClick={() => setIsOpen(false)} className="block w-full text-left px-3 py-3 text-salon-600 font-medium hover:bg-salon-100 rounded-lg">Iniciar Sesión</Link>
            )}
          </div>
        </motion.div>
      )}
    </nav>
  );
}

export function Footer() {
  return (
    <footer className="bg-salon-950 text-salon-100 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <img
                src="/images/logo.png"
                alt="Cuts & Wash Logo"
                className="w-32 h-32 object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  document.getElementById('footer-fallback-logo')!.style.display = 'flex';
                }}
              />
              <div id="footer-fallback-logo" className="hidden w-8 h-8 bg-salon-100 rounded-full items-center justify-center text-salon-950">
                <Scissors size={16} />
              </div>
              <span className="font-serif text-xl font-semibold">Cuts & Wash</span>
            </div>
            <p className="text-salon-300 leading-relaxed">
              Elevando el arte del estilismo. Tu belleza es nuestra pasión y compromiso.
            </p>
          </div>
          <div>
            <h3 className="font-serif text-lg mb-6 text-white">Horario</h3>
            <ul className="space-y-3 text-salon-300">
              <li className="flex justify-between"><span>Lunes - Viernes</span> <span>9:00 - 20:00</span></li>
              <li className="flex justify-between"><span>Sábado</span> <span>10:00 - 18:00</span></li>
              <li className="flex justify-between"><span>Domingo</span> <span>Cerrado</span></li>
            </ul>
          </div>
          <div>
            <h3 className="font-serif text-lg mb-6 text-white">Contacto</h3>
            <ul className="space-y-3 text-salon-300">
              <li>Calle Principal 123, Madrid</li>
              <li>+34 912 345 678</li>
              <li>hola@cutsandwash.com</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-salon-800 mt-16 pt-8 text-center text-salon-400 text-sm">
          © 2024 Cuts & Wash BarberShop. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}
