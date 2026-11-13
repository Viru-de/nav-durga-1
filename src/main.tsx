import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

declare global {
  interface Window {
    gm_authFailure?: () => void;
    __ndGmpQuotaExceeded?: boolean;
  }
}

const triggerGmpQuotaNotice = () => {
  window.__ndGmpQuotaExceeded = true;
  window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
};

window.gm_authFailure = () => {
  triggerGmpQuotaNotice();
};

const origConsoleError = console.error;
console.error = (...args: unknown[]) => {
  const joined = args.map((a) => String(a ?? '')).join(' ');
  if (
    joined.includes('OverQuotaMapError') ||
    joined.includes('OverQuota') ||
    joined.includes('RefererNotAllowedMapError') ||
    joined.includes('ApiNotActivatedMapError')
  ) {
    triggerGmpQuotaNotice();
  }
  origConsoleError.apply(console, args);
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
