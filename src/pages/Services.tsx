import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Service } from '@/lib/utils';
import { Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    fetch('/api/services')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setServices(data);
        } else {
          console.error('Invalid services data:', data);
          setServices([]);
        }
      })
      .catch(err => {
        console.error('Error fetching services:', err);
        setServices([]);
      });
  }, []);

  return (
    <div className="min-h-screen pt-32 pb-24 px-4 bg-salon-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="font-serif text-5xl text-salon-900 mb-6">Nuestros Servicios</h1>
          <p className="text-salon-600 max-w-2xl mx-auto text-lg">
            Descubre nuestra gama de tratamientos exclusivos diseñados para realzar tu belleza natural.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-salon-100 group"
            >
              <div className="h-64 overflow-hidden">
                <img 
                  src={service.image} 
                  alt={service.name} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="p-8">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-serif text-2xl font-medium text-salon-900">{service.name}</h3>
                  <span className="font-mono text-lg text-salon-600">{service.price}€</span>
                </div>
                <p className="text-salon-500 mb-6 leading-relaxed">{service.description}</p>
                <div className="flex justify-between items-center">
                  <div className="flex items-center text-sm font-medium text-salon-400 uppercase tracking-wider">
                    <Clock size={16} className="mr-2" /> {service.duration} min
                  </div>
                  <Link 
                    to="/book" 
                    className="text-salon-900 font-medium hover:text-salon-600 transition-colors underline decoration-salon-300 underline-offset-4"
                  >
                    Reservar
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
