import React, { useState, useRef, useEffect } from 'react';
import { Dish, DishVideo } from '../../types';
import { Camera, Upload, Play, Square, RefreshCw, X, Check, Video, AlertCircle } from 'lucide-react';

interface DishVideoRecorderModalProps {
  dish: Dish;
  onSaveVideo: (dishId: string, video: DishVideo | undefined) => void;
  onClose: () => void;
}

export const DishVideoRecorderModal: React.FC<DishVideoRecorderModalProps> = ({
  dish,
  onSaveVideo,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'record' | 'upload'>('record');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [cameraError, setCameraError] = useState<string | null>(null);
  
  // Recorded or uploaded preview
  const [previewUrl, setPreviewUrl] = useState<string | null>(dish.video?.videoUrl || null);
  const [previewThumbnail, setPreviewThumbnail] = useState<string | null>(dish.video?.thumbnailUrl || null);
  const [duration, setDuration] = useState<number>(dish.video?.durationSeconds || 0);

  const videoLiveRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);

  // Initialize camera for recording
  const startCamera = async () => {
    try {
      setCameraError(null);
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      }

      // Try environment (rear) camera first, fallback to user camera
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false, // Menu video presentation usually silent or ambient
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      mediaStreamRef.current = stream;

      if (videoLiveRef.current) {
        videoLiveRef.current.srcObject = stream;
        videoLiveRef.current.play().catch(() => {});
      }
    } catch (err: any) {
      console.warn('Camera access error:', err);
      setCameraError(
        'No se pudo acceder a la cámara trasera. Asegúrate de permitir permisos de cámara o utiliza la pestaña de "Subir Archivo".'
      );
    }
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    if (timerRef.current) clearInterval(timerRef.current);
  };

  useEffect(() => {
    if (activeTab === 'record') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [activeTab]);

  const handleStartRecording = () => {
    if (!mediaStreamRef.current) return;
    recordedChunksRef.current = [];
    setRecordingSeconds(0);

    try {
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : 'video/webm';

      const recorder = new MediaRecorder(mediaStreamRef.current, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);

        // Generate thumbnail
        generateThumbnailFromVideo(url, (thumb) => {
          setPreviewThumbnail(thumb);
        });
      };

      recorder.start(500); // 500ms chunks
      setIsRecording(true);

      // Countdown / limit to 10 seconds recommended
      let elapsed = 0;
      timerRef.current = setInterval(() => {
        elapsed += 1;
        setRecordingSeconds(elapsed);
        if (elapsed >= 10) {
          handleStopRecording();
        }
      }, 1000);
    } catch (err: any) {
      console.error('Error starting MediaRecorder:', err);
      setCameraError('Error al iniciar la grabación con MediaRecorder.');
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setDuration(recordingSeconds || 5);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  // Generate thumbnail from first frame using canvas
  const generateThumbnailFromVideo = (videoUrl: string, callback: (thumbUrl: string) => void) => {
    const tempVideo = document.createElement('video');
    tempVideo.src = videoUrl;
    tempVideo.crossOrigin = 'anonymous';
    tempVideo.currentTime = 0.5;
    tempVideo.muted = true;
    tempVideo.playsInline = true;

    tempVideo.onloadeddata = () => {
      tempVideo.currentTime = 0.5;
    };

    tempVideo.onseeked = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = tempVideo.videoWidth || 640;
        canvas.height = tempVideo.videoHeight || 360;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(tempVideo, 0, 0, canvas.width, canvas.height);
          const thumb = canvas.toDataURL('image/jpeg', 0.8);
          callback(thumb);
        }
      } catch (e) {
        console.warn('Could not generate canvas thumbnail', e);
        callback(dish.photo?.url || '');
      }
    };
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    // Read duration and thumbnail
    const tempVideo = document.createElement('video');
    tempVideo.src = url;
    tempVideo.preload = 'metadata';
    tempVideo.onloadedmetadata = () => {
      setDuration(Math.round(tempVideo.duration) || 6);
    };

    generateThumbnailFromVideo(url, (thumb) => {
      setPreviewThumbnail(thumb);
    });
  };

  const handleConfirmSave = () => {
    if (!previewUrl) return;

    const newVideo: DishVideo = {
      id: `vid_${Date.now()}`,
      dishId: dish.id, // Asociado estrictamente mediante dishId
      videoUrl: previewUrl,
      thumbnailUrl: previewThumbnail || dish.photo?.url || '',
      durationSeconds: duration || 8,
      mimeType: 'video/mp4',
      recordedAt: new Date().toISOString(),
    };

    onSaveVideo(dish.id, newVideo);
    onClose();
  };

  const handleDeleteVideo = () => {
    onSaveVideo(dish.id, undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Video className="w-5 h-5" />
            </span>
            <div>
              <span className="text-[11px] font-bold tracking-wider text-amber-400 uppercase">
                Video Real del Plato
              </span>
              <h3 className="text-base font-bold text-white truncate max-w-[280px]">
                {dish.name}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs: Grabar con Cámara vs Subir Archivo */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 p-1.5">
          <button
            onClick={() => setActiveTab('record')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'record'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>Grabar con Cámara (5–10s)</span>
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'upload'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Subir Video (MP4 / WebM / MOV)</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-5 space-y-4">
          {activeTab === 'record' ? (
            <div className="space-y-4">
              {cameraError ? (
                <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-800/40 text-rose-300 text-xs flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">{cameraError}</p>
                    <p className="mt-1 text-slate-400">
                      Puedes subir un video ya grabado en la pestaña "Subir Video".
                    </p>
                  </div>
                </div>
              ) : (
                <div className="relative aspect-video bg-black rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center">
                  {/* Live viewfinder */}
                  <video
                    ref={videoLiveRef}
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />

                  {/* Recording indicator & timer overlay */}
                  {isRecording && (
                    <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-600/90 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                      <span className="w-2.5 h-2.5 rounded-full bg-white"></span>
                      <span>GRABANDO: 00:0{recordingSeconds}s / 10s</span>
                    </div>
                  )}

                  {/* Guidance frame */}
                  <div className="absolute inset-8 border border-white/20 rounded-2xl pointer-events-none flex items-center justify-center">
                    <span className="text-[11px] text-white/50 bg-black/40 px-2 py-0.5 rounded">
                      Enfoca el plato y gira suavemente
                    </span>
                  </div>
                </div>
              )}

              {/* Record action buttons */}
              <div className="flex items-center justify-center gap-4">
                {!isRecording ? (
                  <button
                    onClick={handleStartRecording}
                    className="px-6 py-3 rounded-full bg-red-600 hover:bg-red-500 text-white font-bold text-sm flex items-center gap-2.5 shadow-lg shadow-red-600/30 transition-all active:scale-95 cursor-pointer"
                  >
                    <span className="w-3.5 h-3.5 rounded-full bg-white"></span>
                    <span>Comenzar Grabación (Max 10s)</span>
                  </button>
                ) : (
                  <button
                    onClick={handleStopRecording}
                    className="px-6 py-3 rounded-full bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm flex items-center gap-2.5 border border-slate-700 shadow-lg cursor-pointer animate-pulse"
                  >
                    <Square className="w-4 h-4 fill-current text-red-500" />
                    <span>Detener y Previsualizar</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Upload File Tab */
            <div className="space-y-4">
              <label className="border-2 border-dashed border-slate-700 hover:border-amber-500/60 rounded-3xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-slate-950/40">
                <Upload className="w-10 h-10 text-amber-400 mb-2" />
                <span className="text-sm font-bold text-white">
                  Selecciona un video del plato
                </span>
                <span className="text-xs text-slate-400 mt-1">
                  Formatos aceptados: MP4, WebM, QuickTime MOV (Max 50MB)
                </span>
                <span className="text-[11px] text-amber-400/80 mt-2 font-medium">
                  Recomendado: 5 a 10 segundos mostrando la presentación real
                </span>
                <input
                  type="file"
                  accept="video/mp4,video/webm,video/quicktime,video/mov"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </label>
            </div>
          )}

          {/* Current / Recorded Preview section */}
          {previewUrl && (
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300">
                  Previsualización del video asignado:
                </span>
                <span className="text-amber-400 font-mono">
                  {duration ? `~${duration} seg` : 'Video listo'}
                </span>
              </div>
              <div className="aspect-video bg-black rounded-xl overflow-hidden max-h-48 flex items-center justify-center">
                <video
                  src={previewUrl}
                  controls
                  playsInline
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3">
          {dish.video ? (
            <button
              onClick={handleDeleteVideo}
              className="px-4 py-2.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/40 text-xs font-bold transition-colors cursor-pointer"
            >
              Eliminar Video
            </button>
          ) : (
            <div></div>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirmSave}
              disabled={!previewUrl}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Guardar Video del Plato</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
