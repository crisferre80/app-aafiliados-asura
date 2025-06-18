import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initMercadoPago } from '@mercadopago/sdk-react';

initMercadoPago('APP_USR-7a7af73e-7f2d-4507-9ff3-5b04d437eee4');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
