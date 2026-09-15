/**
 * Global error logger for capturing and logging unhandled errors
 */

export function initErrorLogger(): void {
  // Handle uncaught global errors
  window.addEventListener('error', (event) => {
    console.error('[Global Error]', event.message, event.filename, event.lineno, event.colno, event.error);
  });

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    console.error('[Unhandled Promise Rejection]', event.reason);
  });

  console.log('[ErrorLogger] Global error logging initialized');
}
