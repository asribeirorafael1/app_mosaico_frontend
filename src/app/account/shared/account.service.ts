import { environment } from './../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import jwt_decode from 'jwt-decode'

@Injectable({
  providedIn: 'root'
})
export class AccountService {

  constructor(
    private toastrService: ToastrService,
    private http: HttpClient
  ) { }

  async login(user: any) {
    const result = await this.http.post<any>(`${environment.api}/auth/login`, user).toPromise();
    if(result && result.Response.token){
      window.localStorage.setItem('token', result.Response.token);
      return true;
    }
    else{
      this.toastrService.error('Verifique o acesso ou entre em contato com o administrador ', 'Login ou senha inválido!', {
        timeOut: 3000
      });
      return false;
    }

  }

  getAuthorizationToken(){
    const token = window.localStorage.getItem('token');
    return token;
  }

  getTokenExpirationDate(token: string) {
    const decoded: any = jwt_decode(token);

    if(decoded.exp === undefined) {
      return undefined;
    }

    const date = new Date(0);
    date.setUTCSeconds(decoded.exp);
    return date;
  }

  isTokenExpired(token?: string): boolean {
    if(!token)
      return true;

    const date = this.getTokenExpirationDate(token);
    if(date === undefined)
      return false;

    return !(date?.valueOf() > new Date().valueOf());
  }

  isUserLoggedIn() {
    const token = this.getAuthorizationToken();
    if(!token){
      return false;
    }else if(this.isTokenExpired(token)) {
      return false;
    }

    return true;
  }

}
