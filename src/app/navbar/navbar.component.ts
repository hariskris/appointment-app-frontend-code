import { Component, OnInit } from '@angular/core';
import { AuthService } from '../_services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  errorMessage = "";

  constructor(public auth:AuthService,private router: Router) { }

  ngOnInit(): void {
  }

  logout(){
      //remove token
      this.auth.removeToken();
      this.auth.canAccess();
  }

  deleteAccount() {
    if (confirm('Are you sure you want to delete your account?')) {
      this.auth.deleteAccount()
        .subscribe({
          next: data => {
            // Account deletion successful
            console.log('Account deleted successfully.');
            // Call logout to handle the logout process
            this.logout();
          },
          error: data => {
            console.error('Error during account deletion:', data.error);
            this.errorMessage = data.error.message || 'Unknown error occurred';
          }
        }).add(() => {
          console.log('Account deletion process completed!');
        });
    }
  }
}