import { ResonanceApp } from './app/ResonanceApp';

// Bootstrap Resonance Application on DOM Ready
window.addEventListener('DOMContentLoaded', () => {
  const app = new ResonanceApp();
  app.start();
});
