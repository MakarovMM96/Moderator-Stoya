import React, { useEffect, useState } from 'react';
import { YandexDiskResource } from '../types';
import { getDownloadUrl } from '../services/yandexService';

interface MediaViewerProps {
  file: YandexDiskResource;
  onClose: () => void;
}

const MediaViewer: React.FC<MediaViewerProps> = ({ file, onClose }) => {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isVideo = file.mime_type?.startsWith('video/');

  useEffect(() => {
    let mounted = true;
    const fetchUrl = async () => {
      try {
        const link = await getDownloadUrl(file.path);
        if (mounted) {
          setUrl(link);
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError("Не удалось загрузить файл");
          setLoading(false);
        }
      }
    };

    fetchUrl();

    return () => {
      mounted = false;
    };
  }, [file]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div 
        className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-sm flex flex-col items-center justify-center p-4 animate-in fade-in duration-200" 
        onClick={onClose}
    >
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors z-10"
      >
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div 
        className="relative w-full h-full flex items-center justify-center max-w-7xl mx-auto" 
        onClick={e => e.stopPropagation()}
      >
        {loading && (
          <div className="flex flex-col items-center gap-3">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
              <p className="text-slate-400 animate-pulse">Загрузка оригинала...</p>
          </div>
        )}
        
        {error && (
           <div className="text-red-200 bg-red-900/40 p-6 rounded-xl border border-red-500/30 text-center max-w-md">
             <svg className="w-12 h-12 mx-auto text-red-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
             </svg>
             <p className="font-medium text-lg">Ошибка</p>
             <p className="text-sm opacity-80 mt-1">{error}</p>
           </div>
        )}

        {!loading && !error && url && (
           isVideo ? (
             <video 
               src={url} 
               controls 
               autoPlay 
               className="max-w-full max-h-full rounded-lg shadow-2xl ring-1 ring-white/10 bg-black"
               playsInline
             />
           ) : (
             <img 
               src={url} 
               alt={file.name} 
               className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
             />
           )
        )}
      </div>
      
      <div className="absolute bottom-6 left-0 right-0 text-center pointer-events-none px-4">
          <p className="text-slate-200 text-sm font-medium bg-black/50 inline-block px-4 py-2 rounded-full backdrop-blur-md border border-white/10 truncate max-w-full">
            {file.name}
          </p>
      </div>
    </div>
  );
};

export default MediaViewer;