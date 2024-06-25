import { AccountService } from './../shared/account.service';
import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  login = {
    username: '',
    senha: ''
  }

  constructor(
    private accountService: AccountService,
    private router: Router
  ) { }

  loading = false;

  ngOnInit(): void {
  }

  async onSubmit() {
    try {
      this.loading = true;
      const result = await this.accountService.login(this.login);
      setTimeout(() => {
        this.loading = false;
        this.router.navigate(['']);
      }, 2000);
    } catch (error) {
      setTimeout(() => {
        this.loading = false;
      }, 2000)
    }
  }

}
