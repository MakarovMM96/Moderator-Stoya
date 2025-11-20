import React, { useMemo } from 'react';
import { YandexDiskResource } from '../types';
import ProtectedImage from './ProtectedImage';

interface FileCardProps {
  file: YandexDiskResource;
  onApprove: (file: YandexDiskResource, destination: 'screen1' | 'screen2') => void;
  onReject: (file: YandexDiskResource) => void;
  onView: (file: YandexDiskResource) => void;
  isProcessing: boolean;
}

const FileCard: React.FC<FileCardProps> = ({ file, onApprove, onReject, onView, isProcessing }) => {
  // Determine destination based on filename
  const destination = useMemo(() => {
    if (file.name.includes('_Э1')) return 'screen1';
    if (file.name.includes('_Э2')) return 'screen2';
    return null;
  }, [file.name]);

  const getDestinationLabel = (dest: string | null) => {
    if (dest === 'screen1') return 'Экран 1';
    if (dest === 'screen2') return 'Экран 2';
    return 'Нет тега';
  };

  const isVideo = file.mime_type?.startsWith('video/');
  const previewUrl = file.preview;

  return (
    <div className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700 shadow-lg flex flex-col h-full transition-all hover:shadow-blue-900/20 hover:border-slate-600">
      {/* Media Preview Area - Clickable */}
      <div 
        className="relative h-48 w-full bg-slate-900 group cursor-pointer overflow-hidden"
        onClick={() => onView(file)}
      >
        <ProtectedImage 
            fileUrl={previewUrl} 
            alt={file.name} 
            className="w-full h-full transform group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Video Indicator Overlay */}
        {isVideo && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                <div className="bg-white/20 backdrop-blur-sm p-3 rounded-full border border-white/50 shadow-lg group-hover:scale-110 transition-transform group-hover:bg-blue-500 group-hover:border-blue-400">
                    <svg className="w-8 h-8 text-white fill-current" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                    </svg>
                </div>
            </div>
        )}

        {/* Image Hover Overlay */}
        {!isVideo && (
             <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/30 transition-opacity backdrop-blur-[2px]">
                <div className="bg-black/50 p-2 rounded-full text-white">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                    </svg>
                </div>
             </div>
        )}

        {/* Extension Badge */}
        <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold text-slate-300 tracking-wider uppercase border border-white/10 shadow-sm">
          {file.name.split('.').pop() || 'FILE'}
        </div>
      </div>
      
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
            <h3 className="text-slate-200 font-medium text-sm break-all line-clamp-2 mb-2" title={file.name}>
                {file.name}
            </h3>
            <div className="flex justify-between items-center">
                <p className="text-slate-400 text-xs">
                    {new Date(file.created).toLocaleDateString()} {new Date(file.created).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </p>
            </div>
            <div className="mt-3">
                 {destination ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-blue-500/10 text-blue-300 border border-blue-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                        Dest: {getDestinationLabel(destination)}
                    </span>
                 ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-yellow-500/10 text-yellow-300 border border-yellow-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-yellow-400"></span>
                        Нет тега (_Э1/_Э2)
                    </span>
                 )}
            </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-6">
            <button
                onClick={(e) => { e.stopPropagation(); onReject(file); }}
                disabled={isProcessing}
                className="flex items-center justify-center gap-2 py-2 px-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/30 rounded-lg transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Удалить
            </button>
            <button
                onClick={(e) => { e.stopPropagation(); destination && onApprove(file, destination); }}
                disabled={isProcessing || !destination}
                className={`flex items-center justify-center gap-2 py-2 px-4 rounded-lg transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed border ${
                    destination 
                    ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300 border-emerald-500/30' 
                    : 'bg-slate-700 text-slate-500 border-slate-600 cursor-not-allowed'
                }`}
            >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Принять
            </button>
        </div>
      </div>
    </div>
  );
};

export default FileCard;