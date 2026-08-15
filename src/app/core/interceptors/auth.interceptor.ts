import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { TokenService } from '../auth/token.service';

const publicUrls = ['/api/auth/login', '/api/auth/register'];

// Rutas que son públicas SOLO en GET (ej: listar/ver categorías sin login)
const publicGetUrls = ['/api/categories'];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(TokenService);

  const isAlwaysPublic = publicUrls.some((url) => req.url.includes(url));
  const isPublicGet = req.method === 'GET' && publicGetUrls.some((url) => req.url.includes(url));

  if (isAlwaysPublic || isPublicGet) {
    return next(req);
  }

  const token = tokenService.get();

  if (!token) {
    return next(req);
  }

  return next(
    req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    }),
  );
};
