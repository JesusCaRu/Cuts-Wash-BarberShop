import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Star, Scissors, Clock, Play, Quote, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';

const faqs = [
  {
    question: '¿Cómo puedo reservar y cancelar una cita?',
    answer: 'Puedes reservar fácilmente online a través de nuestra sección "Reservar Cita". Para cancelaciones o reprogramaciones, te pedimos que nos avises con al menos 24 horas de antelación.'
  },
  {
    question: '¿Qué pasa si llego tarde a mi cita?',
    answer: 'Entendemos que pueden surgir imprevistos, por lo que ofrecemos un margen de cortesía de 10 minutos. Después de ese tiempo, es posible que necesitemos acortar o reprogramar el servicio para no afectar a otros clientes.'
  },
  {
    question: '¿Qué tipo de productos utilizan?',
    answer: 'Utilizamos exclusivamente productos premium, orgánicos y libres de crueldad animal, seleccionados específicamente para proteger la salud de tu cabello natural y teñido.'
  },
  {
    question: '¿Ofrecen asesoramiento de imagen?',
    answer: '¡Por supuesto! Todos nuestros servicios incluyen una consulta inicial donde nuestros expertos evaluarán tus facciones, tipo de cabello y estilo de vida para recomendarte el mejor look.'
  }
];

function FAQItem({ question, answer }: { question: string, answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-salon-200">
      <button
        className="w-full py-6 flex justify-between items-center text-left focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-lg font-medium text-salon-900 pr-4">{question}</span>
        <ChevronDown
          className={`text-salon-400 transition-transform duration-300 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}
          size={20}
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <p className="pb-6 text-salon-600 leading-relaxed">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section with Video Background */}
      <section className="relative h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
            poster="/images/barberia.png"
          >
            <source src="https://cdn.coverr.co/videos/coverr-hair-cutting-in-a-salon-5244/1080p.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/50" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-2xl"
          >
            <h1 className="font-serif text-5xl md:text-7xl font-medium leading-tight mb-6">
              Tu estilo,<br />
              <span className="italic text-salon-200">nuestra obra maestra.</span>
            </h1>
            <p className="text-lg md:text-xl text-salon-100 mb-10 leading-relaxed max-w-lg">
              Experimenta el lujo de un cuidado capilar personalizado en un ambiente diseñado para tu relajación y belleza.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/book"
                className="bg-white text-salon-950 px-8 py-4 rounded-full font-medium text-lg hover:bg-salon-100 transition-colors inline-flex items-center justify-center"
              >
                Reservar Cita <ArrowRight className="ml-2" size={20} />
              </Link>
              <Link
                to="/virtual-try-on"
                className="bg-transparent border border-white text-white px-8 py-4 rounded-full font-medium text-lg hover:bg-white/10 transition-colors inline-flex items-center justify-center"
              >
                Probador Virtual
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-salon-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { icon: Scissors, title: "Expertos Estilistas", desc: "Nuestro equipo está formado por profesionales galardonados con años de experiencia en las últimas tendencias." },
              { icon: Star, title: "Productos Premium", desc: "Solo utilizamos las mejores marcas del mercado para garantizar la salud y el brillo de tu cabello." },
              { icon: Clock, title: "Atención Personalizada", desc: "Nos tomamos el tiempo necesario para entender tus facciones y crear tu look ideal sin prisas." }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="text-center p-8 bg-white rounded-3xl shadow-sm border border-salon-100 hover:shadow-md transition-shadow"
              >
                <div className="w-16 h-16 bg-salon-100 rounded-full flex items-center justify-center mx-auto mb-6 text-salon-800">
                  <feature.icon size={32} />
                </div>
                <h3 className="font-serif text-2xl mb-4 text-salon-900">{feature.title}</h3>
                <p className="text-salon-600 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Video Showcase Section */}
      <section className="py-24 bg-salon-950 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <h2 className="font-serif text-4xl md:text-5xl leading-tight">
                El arte de la <span className="italic text-salon-300">transformación</span>
              </h2>
              <p className="text-salon-200 text-lg leading-relaxed">
                Cada corte es una escultura, cada color es una pintura. En Cuts & Wash no solo cortamos el pelo, diseñamos la mejor versión de ti mismo con técnicas de vanguardia y una pasión inigualable por el detalle.
              </p>
              <div className="flex items-center gap-6 pt-4">
                <div className="flex -space-x-4">
                  <img className="w-12 h-12 rounded-full border-2 border-salon-950 object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80" alt="Client" />
                  <img className="w-12 h-12 rounded-full border-2 border-salon-950 object-cover" src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=100&q=80" alt="Client" />
                  <img className="w-12 h-12 rounded-full border-2 border-salon-950 object-cover" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80" alt="Client" />
                </div>
                <p className="text-sm text-salon-300 font-medium">
                  Más de <strong className="text-white text-lg">2,000</strong><br />clientes felices
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative rounded-3xl overflow-hidden aspect-[4/5] md:aspect-video lg:aspect-[4/5] shadow-2xl"
            >
              <video
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              >
                <source src="https://videos.pexels.com/video-files/3997934/3997934-uhd_2560_1440_25fps.mp4" type="video/mp4" />
              </video>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
                    <Play className="text-white fill-white" size={20} />
                  </div>
                  <span className="text-white font-medium tracking-wide uppercase text-sm">Ver nuestro proceso</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Image Grid */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="grid grid-cols-2 gap-4 order-2 md:order-1">
              <img
                src="/images/barberia1.png"
                className="rounded-3xl w-full h-72 object-cover translate-y-8 shadow-lg"
                alt="Salon detail"
              />
              <img
                src="/images/barberia2.png"
                className="rounded-3xl w-full h-72 object-cover shadow-lg"
                alt="Haircut"
              />
            </div>
            <div className="space-y-8 pl-0 md:pl-12 order-1 md:order-2">
              <h2 className="font-serif text-4xl md:text-5xl text-salon-900 leading-tight">
                Un espacio diseñado para tu <span className="italic text-salon-600">bienestar</span>
              </h2>
              <p className="text-salon-600 text-lg leading-relaxed">
                En Cuts & Wash, creemos que la visita a la barbería debe ser una experiencia transformadora. Nuestro salón combina diseño moderno con comodidad absoluta para que te relajes desde el momento en que cruzas la puerta.
              </p>
              <ul className="space-y-5">
                {[
                  'Asesoramiento de imagen personalizado',
                  'Tratamientos spa capilar relajantes',
                  'Zona de relax con café de especialidad',
                  'Productos orgánicos y cruelty-free'
                ].map((item, i) => (
                  <li key={i} className="flex items-center text-salon-800 font-medium text-lg">
                    <div className="w-2 h-2 bg-salon-400 rounded-full mr-4" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-salon-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl md:text-5xl text-salon-900 mb-4">Lo que dicen de nosotros</h2>
            <p className="text-salon-600 text-lg">Historias reales de clientes que confiaron en nuestro equipo.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: "Laura Gómez", text: "El mejor corte que me han hecho en años. Entendieron perfectamente lo que quería y el trato fue inmejorable.", role: "Cliente habitual" },
              { name: "Carlos Ruiz", text: "Un ambiente súper relajante y profesional. El asesoramiento de imagen me ayudó a encontrar un estilo que realmente me favorece.", role: "Nuevo cliente" },
              { name: "Marta Silva", text: "Me encanta que usen productos de tan alta calidad. Mi pelo nunca ha estado tan sano y brillante. ¡Totalmente recomendado!", role: "Cliente habitual" }
            ].map((testimonial, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="bg-white p-8 rounded-3xl shadow-sm relative"
              >
                <Quote className="absolute top-6 right-6 text-salon-100" size={48} />
                <div className="flex gap-1 mb-6">
                  {[1, 2, 3, 4, 5].map(star => <Star key={star} size={16} className="fill-salon-400 text-salon-400" />)}
                </div>
                <p className="text-salon-700 mb-6 relative z-10 italic">"{testimonial.text}"</p>
                <div>
                  <h4 className="font-serif font-medium text-salon-900 text-lg">{testimonial.name}</h4>
                  <p className="text-sm text-salon-500">{testimonial.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-white border-t border-salon-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl md:text-5xl text-salon-900 mb-4">Preguntas Frecuentes</h2>
            <p className="text-salon-600 text-lg">Resolvemos tus dudas principales para que tu visita sea perfecta.</p>
          </div>
          <div className="space-y-2">
            {faqs.map((faq, index) => (
              <FAQItem key={index} question={faq.question} answer={faq.answer} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-salon-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-serif text-4xl md:text-6xl text-salon-900 mb-6 leading-tight">
            ¿Listo para tu <span className="italic text-salon-500">cambio de look?</span>
          </h2>
          <p className="text-xl text-salon-600 mb-10 max-w-2xl mx-auto">
            Reserva tu cita hoy mismo y déjanos cuidar de ti. O si no estás seguro, prueba nuestro probador virtual con IA.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/book"
              className="bg-salon-900 text-white px-10 py-4 rounded-full font-medium text-lg hover:bg-salon-800 transition-colors inline-flex items-center justify-center"
            >
              Reservar Cita <ArrowRight className="ml-2" size={20} />
            </Link>
            <Link
              to="/virtual-try-on"
              className="bg-salon-50 border border-salon-200 text-salon-900 px-10 py-4 rounded-full font-medium text-lg hover:bg-salon-100 transition-colors inline-flex items-center justify-center"
            >
              Probar IA Virtual
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
