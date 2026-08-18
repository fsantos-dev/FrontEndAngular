import { HttpInterceptorFn } from '@angular/common/http';

export const ngrokInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.startsWith('https://curvature-unblessed-elm.ngrok-free.dev')) {
    return next(
      req.clone({
        setHeaders: {
          'ngrok-skip-browser-warning': 'true'
        }
      })
    );
  }

  return next(req);
};