import { Injectable } from '@angular/core';

import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { roles } from '../models/access-roles';
import { CrudService } from './crud.service';

@Injectable({
  providedIn: 'root'
})

export class UserService {
  userIdString = 'userId';
  roles = this.buildEmptyRoles();

  constructor(
    private crudService: CrudService
  ) {
  }

  getUser(id: any): Observable<any> {
    return this.crudService.get(`/v1/private/users/` + id);
  }

  getUserProfile(): Observable<any> {
    return this.crudService.get(`/v1/private/user/profile`);
  }

  checkIfUserExist(body): Observable<any> {
    return this.crudService.post(`/v1/private/user/unique`, body);
  }

  getMerchant(storeCode?): Observable<any> {
    return this.crudService.get(`/v1/store/${storeCode}`);
  }

  updateUserEnabled(user): Observable<any> {
    return this.crudService.patch(`/v1/private/user/${user.id}/enabled`, user);
  }

  // check roles for access to order page
  checkForAccess(array = []) {
    this.resetRoles();

    const roleNames = Array.from(
      new Set((array || []).map((elem) => elem && elem.name).filter(Boolean))
    );

    this.roles.canAccessToOrder = roleNames.some((name) => roles.some((role) => role.name === name));

    roleNames.forEach((roleName) => {
      switch (roleName) {
        case 'SUPERADMIN':
          this.roles.isSuperadmin = true;
          break;
        case 'ADMIN':
          this.roles.isAdmin = true;
          break;
        case 'ADMIN_CATALOGUE':
          this.roles.isAdminCatalogue = true;
          break;
        case 'ADMIN_STORE':
          this.roles.isAdminStore = true;
          break;
        case 'ADMIN_ORDER':
          this.roles.isAdminOrder = true;
          break;
        case 'ADMIN_CONTENT':
          this.roles.isAdminContent = true;
          break;
        case 'CUSTOMER':
          this.roles.isCustomer = true;
          break;
        case 'ADMIN_RETAIL':
        case 'ADMIN_RETAILER':
          this.roles.isAdminRetail = true;
          break;
      }
    });
  }

  hydrateRoles(array = []) {
    this.checkForAccess(array);
    localStorage.setItem('roles', JSON.stringify(this.roles));
  }

  resetRoles() {
    this.roles = this.buildEmptyRoles();
  }

  getUsersList(store, params): Observable<any> {
    const requestParams = {
      ...params,
      store: params && params.store ? params.store : store,
    };

    return this.crudService.get(`/v1/private/users`, requestParams).pipe(
      map((res: any) => this.normalizeApiResponse(res, 'Users loaded successfully', [])),
      catchError((error) => throwError(() => error)),
    );
  }

  createUser(user: any, store: any): Observable<any> {
    const params = {
      store
    };

    return this.crudService.post(`/v1/private/user/`, user, { params, observe: 'response' }).pipe(
      map((response: any) => {
        const body = response && response.body;
        const normalized = this.normalizeApiResponse(
          body,
          'User created successfully',
          body || null,
        );

        return {
          ...normalized,
          httpStatus: response && response.status,
        };
      }),
      catchError((error) => throwError(() => error)),
    );
  }

  updateUser(id: any, user: any, store: any): Observable<any> {
    const params = {
      store
    };
    return this.crudService.put(`/v1/private/user/${id}`, user, { params });
  }

  deleteUser(id: any, store: any): Observable<any> {
    const params = {
      store
    };
    return this.crudService.delete(`/v1/private/user/${id}`, { params });
  }

  updatePassword(id: any, passwords: any): Observable<any> {
    return this.crudService.patch(`/v1/private/user/${id}/password`, passwords);
  }

  getUserId(): string {
    return localStorage.getItem(this.userIdString);
  }

  saveUserId(id: string) {
    localStorage.setItem(this.userIdString, id);
  }

  destroyUserId() {
    localStorage.removeItem(this.userIdString);
  }

  private buildEmptyRoles() {
    return {
      canAccessToOrder: false,
      isSuperadmin: false,
      isAdmin: false,
      isAdminCatalogue: false,
      isAdminStore: false,
      isAdminOrder: false,
      isAdminContent: false,
      isCustomer: false,
      isAdminRetail: false,
    };
  }

  private normalizeApiResponse(body: any, defaultMessage: string, defaultData: any) {
    if (Array.isArray(body)) {
      return {
        status: 'success',
        message: defaultMessage,
        data: body,
        recordsTotal: body.length,
        totalPages: 1,
      };
    }

    return {
      status: body && body.status ? body.status : 'success',
      message: body && body.message ? body.message : defaultMessage,
      data: body && body.data !== undefined ? body.data : defaultData,
      recordsTotal: body && typeof body.recordsTotal === 'number' ? body.recordsTotal : undefined,
      totalPages: body && typeof body.totalPages === 'number' ? body.totalPages : undefined,
    };
  }

}
