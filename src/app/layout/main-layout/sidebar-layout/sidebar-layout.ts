import { Component, inject, output, signal } from '@angular/core';
import { AuthStore } from '../../../core/auth/auth.store';
import { DrawerModule } from 'primeng/drawer';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-sidebar-layout',
  standalone: true,
  imports: [DrawerModule, ButtonModule, MenuModule],
  templateUrl: './sidebar-layout.html',
  styleUrl: './sidebar-layout.scss',
})
export class SidebarLayout {
  public readonly authStore = inject(AuthStore);
  public visible = signal(true);
  public isOpen = output<void>();

  public menuOptions: MenuItem[] | undefined = [
    {
      label: 'Options',
      items: [
        {
          label: 'Refresh',
          icon: 'pi pi-refresh',
        },
        {
          label: 'Export',
          icon: 'pi pi-upload',
        },
      ],
    },
  ];

  close(): void {
    this.visible.set(false);
  }
}
