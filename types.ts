export interface YandexDiskResource {
  public_key?: string;
  _embedded?: {
    items: YandexDiskResource[];
    path: string;
    total: number;
  };
  name: string;
  created: string;
  custom_properties?: Record<string, any>;
  public_url?: string;
  origin_path?: string;
  modified: string;
  path: string;
  md5?: string;
  type: 'dir' | 'file';
  mime_type?: string;
  size?: number;
  preview?: string; // URL to preview
  file?: string; // Download URL
}

export interface AppConfig {
  token: string;
  rootPath: string; // /Приложения/Стоя/Мой проект
  moderatorFolder: string; // Модератор
  screen1Folder: string; // Экран 1
  screen2Folder: string; // Экран 2
}

export const APP_CONFIG: AppConfig = {
  token: "y0__xDfr5p5GO7dOyCuxPqgFdk1y0sSrcoV8UU-iJfbeZ5Axa2v",
  rootPath: "/Приложения/Стоя/Мой проект",
  moderatorFolder: "Модератор",
  screen1Folder: "Экран 1",
  screen2Folder: "Экран 2",
};