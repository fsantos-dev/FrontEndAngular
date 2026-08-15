import { Component, inject } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { InactivityService } from '../../../core/inactivity/inactivity.service';
import { ButtonModule } from 'primeng/button';
import { AuthStore } from '../../../core/auth/auth.store';

@Component({
  selector: 'app-session-expirated-dialog',
  standalone: true,
  imports: [DialogModule, ButtonModule],
  templateUrl: './session-expirated-dialog.html',
  styleUrl: './session-expirated-dialog.scss',
})
export class SessionExpiratedDialog {
  public authStore = inject(AuthStore);
  public readonly inactivityService = inject(InactivityService);

  onSessionExpired(): void {
    this.authStore.logout();
  }
}
