import { Component, inject } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { InactivityService } from '../../../core/inactivity/inactivity.service';
import { ButtonModule } from 'primeng/button';
import { AuthStore } from '../../../core/auth/auth.store';

@Component({
  selector: 'app-session-expiration-dialog',
  standalone: true,
  imports: [DialogModule, ButtonModule],
  templateUrl: './session-expiration-dialog.html',
  styleUrl: './session-expiration-dialog.scss',
})
export class SessionExpirationDialog {
  public authStore = inject(AuthStore);
  public readonly inactivityService = inject(InactivityService);

  continueSession(): void {
    this.inactivityService.reset();
  }
}
