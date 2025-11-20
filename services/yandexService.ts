import { YandexDiskResource, APP_CONFIG } from '../types';

const API_BASE = 'https://cloud-api.yandex.net/v1/disk/resources';

const getHeaders = () => ({
  'Authorization': `OAuth ${APP_CONFIG.token}`,
  'Content-Type': 'application/json',
});

export const fetchModerationQueue = async (): Promise<YandexDiskResource[]> => {
  const fullPath = `${APP_CONFIG.rootPath}/${APP_CONFIG.moderatorFolder}`;
  const encodedPath = encodeURIComponent(fullPath);
  
  // Limit 100 files, sort by created date desc
  // Request XXL preview for high quality images
  const url = `${API_BASE}?path=${encodedPath}&limit=100&sort=-created&preview_size=XXL`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: getHeaders(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch files: ${response.status} ${errorText}`);
  }

  const data: YandexDiskResource = await response.json();
  
  // Return only files, ignore subdirectories in the moderation folder
  return data._embedded?.items.filter(item => item.type === 'file') || [];
};

// Fetch a pre-signed, temporary download URL that works in <video> and <img> tags without headers
export const getDownloadUrl = async (path: string): Promise<string> => {
    const encodedPath = encodeURIComponent(path);
    const url = `${API_BASE}/download?path=${encodedPath}`;
    
    const response = await fetch(url, {
        method: 'GET',
        headers: getHeaders(),
    });

    if (!response.ok) {
        throw new Error(`Failed to get download link: ${response.status}`);
    }

    const data = await response.json();
    return data.href;
};

export const moveFile = async (filePath: string, destinationPath: string): Promise<void> => {
  const params = new URLSearchParams({
    from: filePath,
    path: destinationPath,
    overwrite: 'false', // Don't overwrite, maybe throw error or handle duplicates if needed
  });

  const url = `${API_BASE}/move?${params.toString()}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: getHeaders(),
  });

  if (response.status === 201 || response.status === 202) {
    return; // Success
  }

  const errorText = await response.text();
  throw new Error(`Failed to move file: ${response.status} ${errorText}`);
};

export const deleteFile = async (filePath: string): Promise<void> => {
  const params = new URLSearchParams({
    path: filePath,
    permanently: 'false', // Send to trash bin for safety
  });

  const url = `${API_BASE}?${params.toString()}`;

  const response = await fetch(url, {
    method: 'DELETE',
    headers: getHeaders(),
  });

  if (response.status === 202 || response.status === 204) {
    return;
  }

  const errorText = await response.text();
  throw new Error(`Failed to delete file: ${response.status} ${errorText}`);
};