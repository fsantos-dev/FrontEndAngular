import { Injectable, signal } from '@angular/core';
import { fromEvent, merge, Subject, timer } from 'rxjs';
import { filter, startWith, switchMap, takeUntil, throttleTime } from 'rxjs/operators';

import { INACTIVITY_CONFIG } from './inactivity.config';

@Injectable({
  providedIn: 'root'
})
export class InactivityService {

  readonly showWarning = signal(false);
  readonly isInactive = signal(false);
  readonly remainingSeconds = signal(0);

  private readonly stop$ = new Subject<void>();
  private readonly countdownReset$ = new Subject<void>();
  private readonly restart$ = new Subject<void>(); // fuerza reinicio manual (botón "Continuar")

  private readonly activity$ = merge(
    fromEvent(window, 'mousemove'),
    fromEvent(window, 'mousedown'),
    fromEvent(window, 'keydown'),
    fromEvent(window, 'scroll'),
    fromEvent(window, 'touchstart'),
    fromEvent(window, 'click')
  ).pipe(
    throttleTime(1000),
    // clave: mientras el warning o el estado inactivo estén activos,
    // la actividad NO cuenta para reiniciar nada
    filter(() => !this.showWarning() && !this.isInactive())
  );

  private running = false;

  start(): void {
    if (this.running) {
      return;
    }

    this.running = true;

    merge(this.activity$, this.restart$)
      .pipe(
        startWith(null),                        // arranca el timer inicial sin esperar actividad
        switchMap(() => this.createIdleTimer()), // cada actividad "válida" reinicia el idle timer
        takeUntil(this.stop$)
      )
      .subscribe(() => {
        this.showWarning.set(true);
        this.startWarningCountdown();
      });
  }

  stop(): void {
    this.running = false;
    this.stop$.next();
    this.resetState();
  }

  /** Llamado desde el botón "Continuar sesión" */
  reset(): void {
    if (!this.running) {
      return;
    }
    this.resetState();
    this.restart$.next(); // reinicia el idle timer YA, sin esperar al próximo mousemove
  }

  private resetState(): void {
    this.showWarning.set(false);
    this.isInactive.set(false);
    this.remainingSeconds.set(0);
    this.countdownReset$.next();
  }

  private createIdleTimer() {
    return timer(
      INACTIVITY_CONFIG.idleTimeout - INACTIVITY_CONFIG.warningTime
    );
  }

  private startWarningCountdown(): void {
    const totalSeconds = INACTIVITY_CONFIG.warningTime / 1000;
    this.remainingSeconds.set(totalSeconds);

    timer(0, 1000)
      .pipe(
        takeUntil(this.stop$),
        takeUntil(this.countdownReset$)
      )
      .subscribe(seconds => {
        const remaining = totalSeconds - seconds;
        this.remainingSeconds.set(Math.max(remaining, 0));

        if (remaining <= 0) {
          this.isInactive.set(true);
          this.showWarning.set(false);
        }
      });
  }
}