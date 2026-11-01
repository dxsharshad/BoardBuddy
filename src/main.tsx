import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { registerSW } from 'virtual:pwa-register';
import App from './App';
import { StoreProvider } from './lib/store';
import './index.css';
import { applyFx, readNoFx } from './lib/fx';
import { startUsageTracking } from './lib/useUsage';

registerSW({ immediate: true });
applyFx(readNoFx());
startUsageTracking();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <StoreProvider>
      <HashRouter>
        <App />
      </HashRouter>
    </StoreProvider>
  </React.StrictMode>,
);
