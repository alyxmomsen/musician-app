import { Component, inject } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, ConfirmDialogModule, ToastModule, ButtonModule],
  template: `
    @if (auth.isAuthenticated()) {
      <header class="app-header">
        <span class="user-name">{{ auth.user()?.displayName }}</span>
        <p-button
          label="Выйти"
          icon="pi pi-sign-out"
          [text]="true"
          size="small"
          (onClick)="logout()"
        />
      </header>
    }
    <router-outlet />
    <p-confirmdialog />
    <p-toast />
  `,
  styles: [`
    .app-header {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      background: #fff;
      border-bottom: 1px solid #e3e3e8;

      .user-name {
        font-size: 0.9rem;
        color: #555;
      }
    }
  `],
})
export class AppComponent {
  auth = inject(AuthService);
  private router = inject(Router);

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
