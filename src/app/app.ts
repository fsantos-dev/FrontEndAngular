import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ButtonModule],
  template: `
    <div class="flex justify-center items-center min-h-screen">
      <p-button label="Hola PrimeNG!" (onClick)="click()"><i class="pi pi-home"></i></p-button>
    </div>
    <div class="bg-red-500 text-white p-4">Tailwind funcionando</div>
    <div class="bg-primary text-primary-contrast p-4 rounded-lg">
      PrimeUI + Tailwind funcionando
    </div>
  `,
  styleUrl: './app.scss',
})
export class App {
  click() {
    alert('Funciona!');
  }
}
