import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, InputTextModule, ButtonModule, MessageModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  email = signal('');
  password = signal('');
  loading = signal(false);
  error = signal<string | null>(null);

  constructor(
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  async submit(): Promise<void> {
    const email = this.email().trim();
    const password = this.password();
    if (!email || !password) return;

    this.loading.set(true);
    this.error.set(null);
    try {
      await this.auth.login(email, password);
      const returnUrl =
        this.route.snapshot.queryParamMap.get('returnUrl') ?? '/';
      this.router.navigateByUrl(returnUrl);
    } catch (err) {
      console.error('Login failed:', err);
      this.error.set('Неверный email или пароль');
    } finally {
      this.loading.set(false);
    }
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.submit();
    }
  } 
}