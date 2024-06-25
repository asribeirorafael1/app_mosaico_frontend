import { AccountService } from './account.service';
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private router: Router,
    private accountService: AccountService
  ){}

  canActivate( route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (this.accountService.isUserLoggedIn()){
      return true;
    }else{
      this.router.navigate(['login']);
      return false;
    }
  }
}
