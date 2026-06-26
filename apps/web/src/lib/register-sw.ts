export function registerSW(): void {
  if (typeof window === 'undefined') return;
  if (!('serviceWorker' in navigator)) return;

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('SW registrado:', registration.scope);
      })
      .catch((err) => {
        console.log('SW falhou:', err);
      });
  });
}
