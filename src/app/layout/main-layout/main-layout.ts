import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderLayout } from './header-layout/header-layout';
import { SidebarLayout } from './sidebar-layout/sidebar-layout';

@Component({
    selector: 'app-main-layout',
    standalone: true,
    imports:[RouterOutlet, HeaderLayout, SidebarLayout],
    templateUrl: './main-layout.html',
    styleUrl: './main-layout.scss',
})
export class MainLayout {
    public isSidebarOpen = signal(true);

    toggleSidebar(): void{
        this.isSidebarOpen.update(value => !value);
    }
}