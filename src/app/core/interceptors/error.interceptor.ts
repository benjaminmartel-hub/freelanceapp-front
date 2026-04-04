import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse) {
        console.error('[HTTP ERROR]', {
          method: req.method,
          url: req.urlWithParams,
          status: error.status,
          message: error.message
        }, error);
      } else {
        console.error('Une erreur inattendue est survenue.', error);
      }

      return throwError(() => error);
    })
  );
};
