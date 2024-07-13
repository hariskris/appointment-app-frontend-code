import { Component } from '@angular/core';
import { AuthService } from '../_services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {

  formdata = { name: "", email: "", password: "" };
  submit = false;
  errorMessage = "";
  loading = false;

  constructor(private authService: AuthService, private router: Router) { }

  onSubmit() {
    this.loading = true;
    this.authService.register(this.formdata.name, this.formdata.email, this.formdata.password)
      .subscribe({
        next: (data: any) => {
          // Handle successful registration, e.g., redirect to login page
          console.log('Registration successful:', data);
          // Optionally, you can navigate to the login page
          this.router.navigate(['/login']);
        },
        error: (error: any) => {
          console.error('Registration error:', error.error);
          this.errorMessage = error.error.message || 'Unknown error occurred';
        },
        complete: () => {
          this.loading = false;
        }
      });
  }
}
