import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Upload, Wand2, Scissors, Image as ImageIcon, Loader2 } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

export default function VirtualTryOn() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [hairstylePrompt, setHairstylePrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setResultImage(null); // Reset result when new image is uploaded
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!imageFile || !hairstylePrompt) {
      setError('Por favor sube una foto y describe el peinado que deseas.');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.readAsDataURL(imageFile);
      
      reader.onload = async () => {
        try {
          const base64String = (reader.result as string).split(',')[1];
          const mimeType = imageFile.type;

          // Initialize Gemini AI
          const ai = new GoogleGenAI({ 
            apiKey: process.env.GEMINI_API_KEY as string
          });

          const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
              parts: [
                {
                  inlineData: {
                    data: base64String,
                    mimeType: mimeType,
                  },
                },
                {
                  text: `Change the person's hairstyle to: ${hairstylePrompt}. Keep the face and identity exactly the same, only change the hair. Make it look highly realistic and professional.`,
                },
              ],
            },
          });

          let foundImage = false;
          for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) {
              const base64EncodeString = part.inlineData.data;
              const imageUrl = `data:image/png;base64,${base64EncodeString}`;
              setResultImage(imageUrl);
              foundImage = true;
              break;
            }
          }

          if (!foundImage) {
            setError('No se pudo generar la imagen. Intenta con otra descripción.');
          }
        } catch (err: any) {
          console.error('Error generating image:', err);
          setError(err.message || 'Ocurrió un error al generar la imagen.');
        } finally {
          setIsGenerating(false);
        }
      };
      
      reader.onerror = () => {
        setError('Error al leer la imagen.');
        setIsGenerating(false);
      };
      
    } catch (err: any) {
      console.error('Error in handleGenerate:', err);
      setError('Ocurrió un error inesperado.');
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-24 px-4 bg-salon-50">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="font-serif text-4xl md:text-5xl mb-4 text-salon-900">Probador Virtual</h1>
          <p className="text-salon-600 max-w-2xl mx-auto">
            Descubre cómo te quedaría ese corte de pelo antes de hacértelo. Sube una foto tuya, describe el estilo que buscas y nuestra Inteligencia Artificial hará la magia.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Input */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white p-8 rounded-3xl shadow-sm border border-salon-100 flex flex-col"
          >
            <h2 className="font-serif text-2xl mb-6 text-salon-900 flex items-center gap-2">
              <Upload className="text-salon-500" /> 1. Sube tu foto
            </h2>
            
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors flex-grow flex flex-col items-center justify-center min-h-[300px]
                ${selectedImage ? 'border-salon-300 bg-salon-50' : 'border-salon-200 hover:border-salon-400 hover:bg-salon-50'}`}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageUpload} 
                accept="image/*" 
                className="hidden" 
              />
              
              {selectedImage ? (
                <div className="relative w-full h-full flex items-center justify-center">
                  <img 
                    src={selectedImage} 
                    alt="Tu foto" 
                    className="max-h-[300px] object-contain rounded-xl shadow-sm"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                    <p className="text-white font-medium flex items-center gap-2">
                      <ImageIcon size={20} /> Cambiar foto
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center text-salon-500">
                  <Upload size={48} className="mb-4 text-salon-300" />
                  <p className="font-medium text-salon-700 mb-1">Haz clic para subir tu foto</p>
                  <p className="text-sm">Formatos: JPG, PNG (Max 5MB)</p>
                  <p className="text-xs mt-4 text-salon-400 max-w-[250px]">
                    Para mejores resultados, usa una foto frontal, bien iluminada y con el pelo recogido.
                  </p>
                </div>
              )}
            </div>

            <div className="mt-8">
              <h2 className="font-serif text-2xl mb-4 text-salon-900 flex items-center gap-2">
                <Scissors className="text-salon-500" /> 2. ¿Qué estilo quieres?
              </h2>
              <textarea
                value={hairstylePrompt}
                onChange={(e) => setHairstylePrompt(e.target.value)}
                placeholder="Ej: Corte bob corto con flequillo, pelo rubio platino, estilo mullet moderno..."
                className="w-full px-4 py-3 rounded-xl border border-salon-200 focus:outline-none focus:ring-2 focus:ring-salon-400 bg-white resize-none h-28"
              />
            </div>

            {error && (
              <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-xl text-sm">
                {error}
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={isGenerating || !selectedImage || !hairstylePrompt}
              className="mt-6 w-full bg-salon-900 text-white py-4 rounded-xl font-medium hover:bg-salon-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="animate-spin" size={20} /> Generando magia...
                </>
              ) : (
                <>
                  <Wand2 size={20} /> Ver Resultado
                </>
              )}
            </button>
          </motion.div>

          {/* Right Column: Result */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white p-8 rounded-3xl shadow-sm border border-salon-100 flex flex-col items-center justify-center min-h-[500px]"
          >
            {isGenerating ? (
              <div className="flex flex-col items-center text-salon-500">
                <div className="relative w-24 h-24 mb-6">
                  <div className="absolute inset-0 border-4 border-salon-100 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-salon-900 rounded-full border-t-transparent animate-spin"></div>
                  <Wand2 className="absolute inset-0 m-auto text-salon-900" size={32} />
                </div>
                <h3 className="font-serif text-xl text-salon-900 mb-2">Creando tu nuevo look...</h3>
                <p className="text-center max-w-xs">Nuestra IA está analizando tu rostro y aplicando el estilo solicitado. Esto puede tardar unos segundos.</p>
              </div>
            ) : resultImage ? (
              <div className="w-full h-full flex flex-col">
                <h2 className="font-serif text-2xl mb-6 text-salon-900 text-center">Tu Nuevo Look</h2>
                <div className="flex-grow flex items-center justify-center bg-salon-50 rounded-2xl overflow-hidden p-4">
                  <img 
                    src={resultImage} 
                    alt="Resultado del peinado" 
                    className="max-w-full max-h-[500px] object-contain rounded-xl shadow-md"
                  />
                </div>
                <div className="mt-6 flex justify-center gap-4">
                  <a 
                    href={resultImage} 
                    download="mi-nuevo-look.png"
                    className="bg-salon-900 text-white px-6 py-3 rounded-full font-medium hover:bg-salon-800 transition-colors"
                  >
                    Descargar Foto
                  </a>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center text-salon-400 text-center">
                <div className="w-24 h-24 bg-salon-50 rounded-full flex items-center justify-center mb-6">
                  <ImageIcon size={40} className="text-salon-300" />
                </div>
                <h3 className="font-serif text-xl text-salon-900 mb-2">El resultado aparecerá aquí</h3>
                <p className="max-w-xs">Sube tu foto y describe el peinado que deseas para ver cómo te quedaría.</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
