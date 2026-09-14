import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const token = localStorage.getItem('authToken');

  const requisicao = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(requisicao).pipe(
    catchError((erro: HttpErrorResponse) => {
      if (erro.status === 401 || erro.status === 403) {
        encerrarSessao(router);
      }

      return throwError(() => erro);
    })
  );
};

function encerrarSessao(router: Router): void {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
  localStorage.removeItem('unidade');
  router.navigate(['/login']);
}
