import React, { useState, useEffect, useCallback } from 'react';
import { APP_CONFIG, YandexDiskResource } from './types';
import { fetchModerationQueue, moveFile, deleteFile } from './services/yandexService';
import FileCard from './components/FileCard';
import MediaViewer from './components/MediaViewer';
import LoginPage from './components/LoginPage';

const POLL_INTERVAL = 15000; // 15 seconds

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);
  
  const [files, setFiles] = useState<YandexDiskResource[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [processingFiles, setProcessingFiles] = useState<Set<string>>(new Set());
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [viewingFile, setViewingFile] = useState<YandexDiskResource | null>(null);

  // Auth Check
  useEffect(() => {
    const auth = sessionStorage.getItem('is_authenticated');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
    setHasCheckedAuth(true);
  }, []);

  const handleLogin = () => {
    sessionStorage.setItem('is_authenticated', 'true');
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('is_authenticated');
    setIsAuthenticated(false);
    setFiles([]); // Clear sensitive data from state
  };

  const loadFiles = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const fetchedFiles = await fetchModerationQueue();
      setFiles(fetchedFiles);
      setLastUpdated(new Date());
    } catch (err: any) {
      console.error("Load error:", err);
      // Improve error message for common CORS issue
      if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
         setError("Ошибка сети или CORS. Если вы запускаете это локально, API Яндекса может блокировать запрос.");
      } else {
         setError(err.message || "Ошибка при загрузке файлов");
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  // Initial load and polling - only if authenticated
  useEffect(() => {
    if (!isAuthenticated) return;

    loadFiles();
    const intervalId = setInterval(() => loadFiles(true), POLL_INTERVAL);
    return () => clearInterval(intervalId);
  }, [loadFiles, isAuthenticated]);

  const handleApprove = async (file: YandexDiskResource, destination: 'screen1' | 'screen2') => {
    const targetFolder = destination === 'screen1' ? APP_CONFIG.screen1Folder : APP_CONFIG.screen2Folder;
    const destPath = `${APP_CONFIG.rootPath}/${targetFolder}/${file.name}`;
    
    try {
      setProcessingFiles(prev => new Set(prev).add(file.path));
      await moveFile(file.path, destPath);
      // Remove from local state immediately for snappy UI
      setFiles(prev => prev.filter(f => f.path !== file.path));
      // If we were viewing this file, close the viewer
      if (viewingFile?.path === file.path) {
          setViewingFile(null);
      }
    } catch (err: any) {
      alert(`Ошибка при перемещении: ${err.message}`);
    } finally {
      setProcessingFiles(prev => {
        const next = new Set(prev);
        next.delete(file.path);
        return next;
      });
    }
  };

  const handleReject = async (file: YandexDiskResource) => {
    try {
      setProcessingFiles(prev => new Set(prev).add(file.path));
      await deleteFile(file.path);
      setFiles(prev => prev.filter(f => f.path !== file.path));
      // If we were viewing this file, close the viewer
      if (viewingFile?.path === file.path) {
          setViewingFile(null);
      }
    } catch (err: any) {
        alert(`Ошибка при удалении: ${err.message}`);
    } finally {
        setProcessingFiles(prev => {
            const next = new Set(prev);
            next.delete(file.path);
            return next;
        });
    }
  };

  if (!hasCheckedAuth) return null;

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-blue-500/30">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-tr from-blue-600 to-blue-500 p-2 rounded-lg shadow-lg shadow-blue-500/20">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                  <h1 className="text-xl font-bold text-white leading-none">Стоя Модератор</h1>
              </div>
            </div>
            <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                    <p className="text-xs text-slate-400">Последнее обновление</p>
                    <p className="text-sm font-mono text-slate-300">{lastUpdated.toLocaleTimeString()}</p>
                </div>
                
                <button 
                    onClick={() => loadFiles(false)}
                    className="p-2 rounded-full hover:bg-slate-800 transition-colors text-slate-400 hover:text-white"
                    title="Обновить"
                >
                    <svg className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.28l2.03-2.03C7.6 5.66 9.68 4.6 12 4.6c4.08 0 7.4 3.32 7.4 7.4s-3.32 7.4-7.4 7.4C9.3 19.4 6.9 18.2 5.4 16.4" />
                    </svg>
                </button>

                <div className="h-6 w-px bg-slate-700 mx-1"></div>

                <button 
                    onClick={handleLogout}
                    className="p-2 rounded-full hover:bg-slate-800 transition-colors text-slate-400 hover:text-red-400"
                    title="Выйти"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {error && (
          <div className="mb-8 bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3">
             <svg className="w-6 h-6 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
             </svg>
             <div>
                 <h3 className="text-red-200 font-medium">Ошибка подключения</h3>
                 <p className="text-red-400 text-sm mt-1">{error}</p>
             </div>
          </div>
        )}

        {!loading && !error && files.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                <div className="w-24 h-24 bg-slate-800/50 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
                    </svg>
                </div>
                <p className="text-lg font-medium">Папка пуста</p>
                <p className="text-sm">Новые файлы появятся здесь автоматически</p>
            </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {files.map((file) => (
            <FileCard 
                key={file.path} 
                file={file}
                onApprove={handleApprove}
                onReject={handleReject}
                onView={setViewingFile}
                isProcessing={processingFiles.has(file.path)}
            />
          ))}
        </div>
      </main>

      {/* Full Screen Viewer */}
      {viewingFile && (
        <MediaViewer 
            file={viewingFile} 
            onClose={() => setViewingFile(null)} 
        />
      )}
    </div>
  );
}