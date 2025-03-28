
/// <reference types="vite/client" />

interface Window {
  SpeechRecognition: new () => SpeechRecognition;
  webkitSpeechRecognition: new () => SpeechRecognition;
  activateDashboardTab?: (tabName: string) => boolean;
  handleTranslateVoiceCommand?: (command: string) => boolean;
  env?: {
    GOOGLE_TRANSLATE_API_KEY?: string;
    [key: string]: string | undefined;
  };
  deferredPrompt?: BeforeInstallPromptEvent;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onerror: (event: any) => void;
  onend: () => void;
  onresult: (event: any) => void;
}

// PWA related types
interface BeforeInstallPromptEvent extends Event {
  platforms: string[];
  userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

// Add service worker registration types
interface ServiceWorkerRegistration {
  pushManager: PushManager;
  update(): void;
  unregister(): Promise<boolean>;
  showNotification(title: string, options?: NotificationOptions): Promise<void>;
  installing: ServiceWorker | null;
  waiting: ServiceWorker | null;
  active: ServiceWorker | null;
  addEventListener(type: string, listener: EventListener): void;
}

// ServiceWorker type
interface ServiceWorker extends EventTarget {
  scriptURL: string;
  state: 'installing' | 'installed' | 'activating' | 'activated' | 'redundant';
  postMessage(message: any): void;
  addEventListener(type: string, listener: EventListener): void;
}
