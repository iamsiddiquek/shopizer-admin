import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { TokenService } from './token.service';
import { CrudService } from '../../shared/services/crud.service';
import { UserService } from '../../shared/services/user.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isLoggingOut = false;
  private logoutFallbackTimer: any;

  constructor(
    private tokenService: TokenService,
    private crudService: CrudService,
    private userService: UserService,
    private router: Router,
  ) {
  }

  login(username: string, password: string): Observable<any> {
    return this.crudService.post('/v1/private/login', { username, password });
  }

  logout() {
    if (this.isLoggingOut) {
      return;
    }

    this.isLoggingOut = true;
    console.info('[AuthService] Logging out user and clearing session');
    const token = this.tokenService.getToken();

    this.logoutFallbackTimer = setTimeout(() => {
      this.finalizeLogout();
    }, 2000);

    if (!token) {
      this.finalizeLogout();
      return;
    }

    this.crudService.post('/v1/private/logout', {}).subscribe({
      next: () => {
        console.info('[AuthService] Backend logout recorded');
      },
      error: (error) => {
        console.warn('[AuthService] Backend logout failed, proceeding with local logout', error);
        this.finalizeLogout();
      },
      complete: () => {
        this.finalizeLogout();
      },
    });
  }

  refresh(): Observable<any> {
    return this.crudService.get('/v1/auth/refresh');
  }

  forgot(username: string, returnUrl: string): Observable<any> {
    return this.crudService.post('/v1/user/password/reset/request', { username, returnUrl });
  }
  validateResetToken(token): Observable<any> {
    return this.crudService.get('/v1/user/DEFAULT/reset/' + token);
  }
  resetPassword(token, param): Observable<any> {
    return this.crudService.post('/v1/user/DEFAULT/password/' + token, param);
  }
  checkIfStoreExist(code): Observable<any> {
    const params = {
      code,
    };
    return this.crudService.get(`/v1/store/unique`, params);
  }
  register(param): Observable<any> {
    return this.crudService.post('/v1/store/signup', param)
  }

  private finalizeLogout() {
    if (this.logoutFallbackTimer) {
      clearTimeout(this.logoutFallbackTimer);
      this.logoutFallbackTimer = null;
    }

    this.tokenService.destroyToken();
    this.userService.destroyUserId();
    this.userService.resetRoles();
    localStorage.removeItem('roles');
    localStorage.removeItem('merchant');
    this.router.navigateByUrl('/auth/login');
    this.isLoggingOut = false;
  }

}
