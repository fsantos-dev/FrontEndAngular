import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderLayout } from './header-layout/header-layout';
import { SidebarLayout } from './sidebar-layout/sidebar-layout';
import { SessionExpirationDialog } from '../../shared/components/session-expiration-dialog/session-expiration-dialog';
import { SessionExpiratedDialog } from '../../shared/components/session-expirated-dialog/session-expirated-dialog';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, HeaderLayout, SidebarLayout, SessionExpirationDialog, SessionExpiratedDialog],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss',
})
export class MainLayout {
  
  public readonly isSidebarOpen = signal(true);

  toggleSidebar(): void {
    this.isSidebarOpen.update((value) => !value);
  }

  
}
