import React, { useState, useEffect } from 'react';

interface ProtectedImageProps {
  fileUrl?: string;
  alt: string;
  className?: string;
}

const ProtectedImage: React.FC<ProtectedImageProps> = ({ fileUrl, alt, className }) => {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
      setError(false);
      setLoading(true);
  }, [fileUrl]);

  if (!fileUrl || error) {
    return (
      <div className={`bg-slate-800 flex flex-col items-center justify-center p-4 ${className}`}>
        <span className="text-4xl mb-2">📄</span>
        <span className="text-xs text-slate-400 text-center">No Preview</span>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
       {loading && (
         <div className="absolute inset-0 bg-slate-800 animate-pulse flex items-center justify-center z-10">
            <svg className="w-6 h-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
         </div>
       )}
       <img 
         src={fileUrl} 
         alt={alt} 
         className={`w-full h-full object-cover transition-opacity duration-300 ${loading ? 'opacity-0' : 'opacity-100'}`}
         onLoad={() => setLoading(false)}
         onError={() => {
           console.warn("Image failed to load:", fileUrl);
           setLoading(false);
           setError(true);
         }} 
       />
    </div>
  );
};

export default ProtectedImage;
