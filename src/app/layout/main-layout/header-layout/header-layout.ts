import { Component, inject, output } from '@angular/core';
import { AuthStore } from '../../../core/auth/auth.store';
import { ButtonModule } from 'primeng/button';
import { getSplitPart } from '../../../shared/utils/split-part';

@Component({
  selector: 'app-header-layout',
  standalone: true,
  imports: [ButtonModule],
  templateUrl: './header-layout.html',
  styleUrl: './header-layout.scss',
})
export class HeaderLayout {
  public readonly authStore = inject(AuthStore);
  isOpen = output<void>();

  get userName(): string {
    const user = this.authStore.user();
    return getSplitPart(user?.fullName, ' ', 0) ?? getSplitPart(user?.email, '@', 0) ?? 'Usuario';
  }
}
