import { HttpInterceptorFn } from '@angular/common/http';
import { tap } from 'rxjs';

// Log chaque appel HTTP et affiche leur durée d'execution
export const loggingInterceptor: HttpInterceptorFn = (req, next) => {
  const startedAt = performance.now();

  return next(req).pipe(
    tap({
      finalize: () => {
        const duration = Math.round(performance.now() - startedAt);
        console.debug(`[HTTP] ${req.method} ${req.urlWithParams} (${duration}ms)`);
      }
    })
  );
};
