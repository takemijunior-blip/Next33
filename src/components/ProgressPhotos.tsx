import React, { useState, useRef, useEffect } from "react";
import { ProgressPhoto } from "../types";
import { Camera, RefreshCw, AlertTriangle, Image as ImageIcon, Trash2, Calendar, ZoomIn, Eye, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ProgressPhotosProps {
  photos: ProgressPhoto[];
  onAddPhoto: (dataUrl: string, note?: string) => void;
  onDeletePhoto: (id: string) => void;
  currentWeight: number;
}

export default function ProgressPhotos({
  photos,
  onAddPhoto,
  onDeletePhoto,
  currentWeight,
}: ProgressPhotosProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [comparisonBefore, setComparisonBefore] = useState<string | null>(null);
  const [comparisonAfter, setComparisonAfter] = useState<string | null>(null);
  const [showCompare, setShowCompare] = useState(false);
  const [zoomImg, setZoomImg] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Stop camera stream upon unmount or navigating away
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Set default comparison photos if available
  useEffect(() => {
    if (photos.length >= 2) {
      setComparisonBefore(photos[photos.length - 1].imageUrl); // oldest (last in array)
      setComparisonAfter(photos[0].imageUrl); // newest (first in array)
    }
  }, [photos]);

  const startCamera = async () => {
    setErrorMsg(null);
    setErrorType(null);
    setCapturedImage(null);
    
    // Stop any existing stream first
    if (stream) {
      stopCamera();
    }

    try {
      const constraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false, // only camera needed
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      setCameraActive(true);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play().catch(err => {
          console.error("Video play failed:", err);
        });
      }
    } catch (err: any) {
      console.error("Camera access failed:", err);
      // Log errors specifically
      const name = err.name || "";
      setErrorType(name);
      
      if (name === "NotAllowedError" || name === "PermissionDeniedError") {
        setErrorMsg("Permissão de câmera negada. Habilite o acesso para tirar fotos no app ou use o seletor de arquivos.");
      } else if (name === "NotFoundError" || name === "DevicesNotFoundError") {
        setErrorMsg("Câmera não encontrada. Certifique-se de que o dispositivo possui uma câmera funcional.");
      } else if (name === "NotReadableError" || name === "TrackStartError") {
        setErrorMsg("Câmera ocupada ou travada por outro aplicativo. Feche processos concorrentes e tente novamente.");
      } else {
        setErrorMsg(`Não foi possível acessar a câmera (${name || err.message}). Fazendo fallback para envio de arquivo.`);
      }
      
      // Fallback: trigger file upload trigger
      setCameraActive(false);
      triggerFileInputFallback();
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setCameraActive(false);
  };

  // Easily switch front/back camera
  const toggleFacingMode = async () => {
    const newMode = facingMode === "user" ? "environment" : "user";
    setFacingMode(newMode);
    
    // We must restart the camera stream with the new facingMode
    if (cameraActive) {
      setTimeout(() => {
        startCamera();
      }, 50);
    }
  };

  const triggerFileInputFallback = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setCapturedImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      if (context) {
        // Set match canvas size with actual video resolution
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // In user facing camera, mirror draw for consistency
        if (facingMode === "user") {
          context.translate(canvas.width, 0);
          context.scale(-1, 1);
        }

        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Turn back matrix defaults
        if (facingMode === "user") {
          context.setTransform(1, 0, 0, 1, 0, 0);
        }

        const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
        setCapturedImage(dataUrl);
        stopCamera();
      }
    }
  };

  const saveCapturedPhoto = () => {
    if (capturedImage) {
      const fullNote = `${noteText.trim() ? noteText + " | " : ""}Log de peso: ${currentWeight}kg`;
      onAddPhoto(capturedImage, fullNote);
      
      // Cleanup states
      setCapturedImage(null);
      setNoteText("");
    }
  };

  return (
    <div id="photos-view" className="space-y-6 max-w-lg mx-auto pb-6">
      {/* View Header */}
      <div className="text-center pt-2">
        <h2 className="text-2xl font-bold tracking-tight text-white mb-1 flex items-center justify-center gap-1.5 font-display">
          <Camera className="w-6 h-6 text-emerald-500" /> Diário de Evolução
        </h2>
        <p className="text-xs text-zinc-500">Documente sua e se surpreenda com as mudanças estéticas reais</p>
      </div>

      {/* Main Photographic Card */}
      <div className="bg-zinc-900/80 rounded-2xl p-5 border border-zinc-800/85 box-glow flex flex-col relative overflow-hidden">
        {/* Hidden Fallback Input, supporting live camera trigger on mobile files */}
        <input 
          id="photo-file-fallback"
          type="file" 
          accept="image/*" 
          capture="environment" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          className="hidden" 
        />

        {/* Hidden canvas for extraction rendering */}
        <canvas ref={canvasRef} className="hidden" />

        <AnimatePresence mode="wait">
          {/* STATE A: Camera stream ACTIVE */}
          {cameraActive ? (
            <motion.div 
              key="camera-stream"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {/* Screen Holder */}
              <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black border-2 border-emerald-500/80 shadow-[0_0_15px_rgba(34,197,94,0.15)]">
                <video 
                  ref={videoRef} 
                  playsInline 
                  muted 
                  className={`w-full h-full object-cover ${facingMode === "user" ? "scale-x-[-1]" : ""}`}
                />
                
                {/* Live indicators overlays */}
                <div className="absolute top-3 left-3 bg-red-500/80 text-[9px] font-mono font-bold tracking-widest text-white px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                  <span className="w-1.5 h-1.5 bg-white rounded-full"></span> REC LIVE
                </div>

                <div className="absolute bottom-3 right-3 bg-black/60 text-[10px] font-mono text-zinc-300 px-2 py-1 rounded">
                  {facingMode === "user" ? "Câmera Frontal" : "Câmera Traseira"}
                </div>
              </div>

              {/* Control Triggers Row */}
              <div className="flex gap-2.5">
                <button
                  id="btn-trigger-toggle-camera"
                  onClick={toggleFacingMode}
                  className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs py-3.5 rounded-xl flex items-center justify-center gap-1.5 flex-1 transition"
                  title="Trocar Câmera"
                >
                  <RefreshCw className="w-4 h-4 animate-spin-slow text-emerald-400" /> Alternar Lente
                </button>

                <button
                  id="btn-trigger-capture"
                  onClick={capturePhoto}
                  className="bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs py-3.5 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.3)] flex-grow flex items-center justify-center gap-1.5 transition"
                >
                  <Sparkles className="w-4 h-4 text-black animate-pulse" /> CAPTURAR FOTO
                </button>

                <button
                  onClick={stopCamera}
                  className="bg-zinc-950 text-zinc-400 hover:text-white text-xs px-4 rounded-xl border border-zinc-850 hover:bg-zinc-900 transition"
                >
                  Desligar
                </button>
              </div>
            </motion.div>
          ) 

          // STATE B: Preview captured photo before saving
          : capturedImage ? (
            <motion.div 
              key="photo-preview"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black border border-zinc-800">
                <img src={capturedImage} alt="Captured preview" className="w-full h-full object-cover" />
                <div className="absolute bottom-3 left-3 bg-zinc-950/80 px-2.5 py-1 rounded text-[10px] text-emerald-400 font-mono">
                  {currentWeight} kg logado
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">Nota de Progresso (opcional)</label>
                <input
                  type="text"
                  placeholder="Ex: Pós-treino de perna, jejum, etc."
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-805 text-xs rounded-xl p-3 text-white placeholder-zinc-700 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setCapturedImage(null)}
                  className="flex-1 bg-zinc-800 hover:bg-zinc-750 text-zinc-300 rounded-xl py-3 text-xs transition"
                >
                  Descartar Foto
                </button>
                <button
                  id="btn-save-progress-photo"
                  onClick={saveCapturedPhoto}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-xl py-3 text-xs transition"
                >
                  Salvar no Diário
                </button>
              </div>
            </motion.div>
          )

          // STATE C: Initial Launcher Trigger Screen
          : (
            <motion.div 
              key="photo-inactive"
              className="text-center py-8 flex flex-col items-center"
            >
              <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center text-emerald-400 mb-4 animate-pulse">
                <Camera className="w-8 h-8" />
              </div>
              <h3 className="text-white text-sm font-semibold mb-1">Registrar Progresso Físico</h3>
              <p className="text-xs text-zinc-500 max-w-xs mx-auto mb-5">
                Utilize a câmera nativa do seu celular ou faça upload de arquivos da galeria corporativa para ver sua transformação semanal.
              </p>

              {/* Big Start Buttons */}
              <div className="flex flex-col sm:flex-row gap-2.5 w-full">
                <button
                  id="btn-active-camera"
                  onClick={startCamera}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs py-3.5 px-4 rounded-xl flex items-center justify-center gap-1.5 shadow-[0_4px_12px_rgba(16,185,129,0.2)] transition"
                >
                  <Camera className="w-4 h-4" /> ABRIR CÂMERA DO CELULAR
                </button>

                <button
                  id="btn-upload-local-file"
                  onClick={triggerFileInputFallback}
                  className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs py-3.5 px-4 rounded-xl flex items-center justify-center gap-1.5 transition"
                >
                  <ImageIcon className="w-4 h-4 text-emerald-400" /> ENVIAR DA GALERIA
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Diagnostic camera permission warning panel, shown only if user triggered blocks */}
        {errorMsg && (
          <div className="mt-4 p-3.5 bg-red-950/40 border border-red-900/60 rounded-xl flex gap-2 w-full text-left">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-red-400">Problema Técnico de Câmera ({errorType})</p>
              <p className="text-[11px] text-zinc-400 mt-0.5">{errorMsg}</p>
            </div>
          </div>
        )}
      </div>

      {/* Before / After Progress Slider Comparison Block */}
      {photos.length >= 2 && (
        <div className="bg-zinc-900/80 rounded-2xl p-4 border border-zinc-800/80 box-glow text-left">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold tracking-wider text-zinc-450 uppercase flex items-center gap-1">
              <Eye className="w-4 h-4 text-emerald-500 animate-pulse" /> Comparação de Ator (Antes e Depois)
            </h3>
            <button
              onClick={() => setShowCompare(!showCompare)}
              className="text-[10px] font-mono bg-zinc-800 text-emerald-400 px-2 py-1 rounded hover:bg-zinc-700 transition"
            >
              {showCompare ? "Ocultar" : "Mostrar Slider"}
            </button>
          </div>

          {showCompare && (
            <div className="space-y-4">
              {/* Dropdowns to select before and after */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[9px] uppercase tracking-wider text-zinc-500 block mb-1">Antes (Mais antiga)</label>
                  <select
                    value={comparisonBefore || ""}
                    onChange={(e) => setComparisonBefore(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-870 text-xs p-2 rounded text-zinc-300 font-mono focus:outline-none"
                  >
                    {[...photos].reverse().map((photo, i) => (
                      <option key={photo.id} value={photo.imageUrl}>
                        Foto #{i+1} ({new Date(photo.timestamp).toLocaleDateString()})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[9px] uppercase tracking-wider text-zinc-500 block mb-1">Depois (Mais recente)</label>
                  <select
                    value={comparisonAfter || ""}
                    onChange={(e) => setComparisonAfter(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-870 text-xs p-2 rounded text-zinc-300 font-mono focus:outline-none"
                  >
                    {photos.map((photo, i) => (
                      <option key={photo.id} value={photo.imageUrl}>
                        Foto #{photos.length - i} ({new Date(photo.timestamp).toLocaleDateString()})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Side by side display format */}
              {comparisonBefore && comparisonAfter && (
                <div className="grid grid-cols-2 gap-2 mt-4">
                  <div className="relative aspect-square bg-zinc-950 rounded-xl overflow-hidden border border-zinc-800">
                    <img src={comparisonBefore} alt="Antes" className="w-full h-full object-cover" />
                    <span className="absolute top-2 left-2 bg-black/80 font-mono text-[9px] font-bold text-zinc-300 py-0.5 px-2 rounded">
                      ANTES
                    </span>
                  </div>

                  <div className="relative aspect-square bg-zinc-950 rounded-xl overflow-hidden border border-zinc-800">
                    <img src={comparisonAfter} alt="Depois" className="w-full h-full object-cover" />
                    <span className="absolute top-2 left-2 bg-emerald-500 font-mono text-[9px] font-bold text-black py-0.5 px-2 rounded">
                      DEPOIS
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Catalog Registry gallery list of progress photos */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold tracking-wider text-zinc-400 uppercase">
          Minha Linha do Tempo ({photos.length} fotos)
        </h3>

        {photos.length === 0 ? (
          <div className="text-center py-10 bg-zinc-900/40 border border-dashed border-zinc-850 rounded-2xl">
            <Camera className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
            <p className="text-xs text-zinc-500">Nenhuma foto adicionada ao diário de evolução.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {photos.map((photo, index) => {
              const formattedDate = new Date(photo.timestamp).toLocaleDateString([], {
                day: "2-digit",
                month: "2-digit",
                year: "2-digit"
              });
              return (
                <div 
                  key={photo.id} 
                  className="bg-zinc-900 border border-zinc-800/80 rounded-xl overflow-hidden shadow-md flex flex-col hover:border-emerald-500/35 transition group"
                >
                  <div className="relative aspect-video bg-black overflow-hidden cursor-zoom-in" onClick={() => setZoomImg(photo.imageUrl)}>
                    <img 
                      src={photo.imageUrl} 
                      alt={`Photo progress ${formattedDate}`} 
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
                    />
                    
                    {/* Floating timestamp marker overlay */}
                    <div className="absolute top-2 left-2 bg-zinc-950/80 px-2 py-0.5 rounded text-[9px] font-mono text-emerald-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {formattedDate}
                    </div>

                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <ZoomIn className="w-6 h-6 text-emerald-400" />
                    </div>
                  </div>

                  <div className="p-2.5 flex-grow flex flex-col justify-between">
                    <p className="text-[10px] text-zinc-400 italic line-clamp-2 mb-2">
                      {photo.note || "Evolução corporal registrada."}
                    </p>

                    <button
                      onClick={() => onDeletePhoto(photo.id)}
                      className="text-zinc-500 hover:text-rose-400 text-[10px] flex items-center gap-1 mt-1 font-semibold self-end transition"
                    >
                      <Trash2 className="w-3 h-3" /> Excluir
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Image zoom light box modal */}
      {zoomImg && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-50 cursor-zoom-out" onClick={() => setZoomImg(null)}>
          <div className="relative max-w-full max-h-[80vh] overflow-hidden">
            <img src={zoomImg} alt="Progress zoom" className="max-w-full max-h-[85vh] rounded-lg shadow-2xl border border-zinc-800" />
            <p className="text-center text-xs text-zinc-400 mt-3 font-mono">Toque em qualquer lugar para fechar</p>
          </div>
        </div>
      )}
    </div>
  );
}
