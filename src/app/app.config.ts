import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { providePrimeNG } from 'primeng/config';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import Aura from '@primeuix/themes/aura';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { httpLoggerInterceptor } from './core/interceptors/http-logger.interceptor';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ngrokInterceptor } from './core/interceptors/ngrok.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    MessageService,
    ConfirmationService,
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor, httpLoggerInterceptor, ngrokInterceptor])),
    providePrimeNG({
      theme: {
        preset: Aura,
      },
    }),
  ],
};

// "node_modules/tailwindcss-primeui/v4/index.css",
