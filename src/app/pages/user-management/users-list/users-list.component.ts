import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { TranslateService } from '@ngx-translate/core';
import { NbDialogService } from '@nebular/theme';
import { ToastrService } from 'ngx-toastr';

import { StoreService } from '../../store-management/services/store.service';
import { StorageService } from '../../shared/services/storage.service';
import { UserService } from '../../shared/services/user.service';
import { SecurityService } from '../../shared/services/security.service';
import { ShowcaseDialogComponent } from '../../shared/components/showcase-dialog/showcase-dialog.component';

@Component({
  selector: 'ngx-users-list',
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.scss'],
  standalone: false,
})
export class UsersListComponent implements OnInit {
  loadingList = false;
  isSuperadmin = false;
  canManageUsers = false;
  creationSuccessMessage = '';

  // paginator
  perPage = 15;
  currentPage = 1;
  totalCount = 0;
  totalPages = 1;

  // server params
  params: any = this.loadParams();

  stores = [];
  users: any[] = [];

  constructor(
    private userService: UserService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private translate: TranslateService,
    private storageService: StorageService,
    private securityService: SecurityService,
    private dialogService: NbDialogService,
    private storeService: StoreService,
    private toastr: ToastrService,
  ) {}

  loadParams() {
    return {
      lang: this.storageService.getLanguage(),
      store: this.storageService.getMerchant(),
      count: this.perPage,
      page: 0,
      emailAddress: '',
    };
  }

  ngOnInit() {
    this.isSuperadmin = this.securityService.isSuperAdmin();
    this.canManageUsers = this.securityService.isAnAdmin();

    const params = this.activatedRoute.snapshot.queryParams || {};
    if (params.store) {
      this.params.store = params.store;
    }
    if (params.createdEmail) {
      this.params.emailAddress = params.createdEmail;
    }

    this.getList();

    if (params.created === '1') {
      const message = params.message || this.translate.instant('USER_FORM.USER_CREATED');
      this.creationSuccessMessage = message;
      this.toastr.success(message);
      setTimeout(() => {
        this.creationSuccessMessage = '';
      }, 8000);
      this.clearFeedbackQueryParams(params);
    }

    this.storeService.getListOfStores({ start: 0 })
      .subscribe(res => {
        this.stores = (res && res.data ? res.data : []).map((store) => ({
          value: store.code,
          label: store.code,
        }));
      });
  }

  getList() {
    this.params.page = this.currentPage - 1;
    this.loadingList = true;

    this.userService.getUsersList(this.storageService.getMerchant(), this.params)
      .subscribe({
        next: (res) => {
          const usersData = res && Array.isArray(res.data) ? res.data : [];
          this.users = usersData.map((user) => ({
            ...user,
            name: user.firstName + ' ' + user.lastName,
          }));

          this.totalCount = res && typeof res.recordsTotal === 'number' ? res.recordsTotal : this.users.length;
          this.totalPages = res && typeof res.totalPages === 'number' ? res.totalPages : 1;

          this.loadingList = false;
        },
        error: (error) => {
          console.error('[UsersList] Failed to load users', error);
          this.loadingList = false;
          this.toastr.error(this.resolveErrorMessage(error));
        }
      });
  }

  choseStore(event) {
    const selectedStore = this.resolveStoreCode(event);
    if (!selectedStore) {
      return;
    }
    this.params.store = selectedStore;
    this.currentPage = 1;
    this.getList();
  }

  openDetails(user: any) {
    if (!this.canManageUsers) {
      return;
    }
    this.router.navigate(['pages/user-management/user/', user.id]);
  }

  toggleUserStatus(user: any) {
    const currentUserId = parseInt(this.storageService.getUserId(), 10);

    if (user.id === currentUserId) {
      this.dialogService.open(ShowcaseDialogComponent, {
        context: {
          title: '',
          text: '',
          actionText: this.translate.instant('USER_FORM.CANT_UPDATE_YOUR_PROFILE'),
        },
      });
      return;
    }

    const request = {
      ...user,
      active: !user.active,
    };

    this.userService.updateUserEnabled(request)
      .subscribe({
        next: () => {
          user.active = request.active;
          this.toastr.success(this.translate.instant('USER.AVAILABILITY'));
        },
        error: (error) => {
          this.toastr.error(this.resolveErrorMessage(error));
        },
      });
  }

  changePage(event) {
    switch (event.action) {
      case 'onPage': {
        this.currentPage = event.data;
        break;
      }
      case 'onPrev': {
        this.currentPage--;
        break;
      }
      case 'onNext': {
        this.currentPage++;
        break;
      }
      case 'onLast': {
        this.currentPage = this.totalPages;
        break;
      }
      case 'onFirst': {
        this.currentPage = 1;
        break;
      }
    }

    this.getList();
  }

  private resolveStoreCode(event: any): string {
    if (!event) {
      return '';
    }
    if (typeof event === 'string') {
      return event;
    }
    if (event.item) {
      return event.item;
    }
    if (event.code) {
      return event.code;
    }
    if (event.value) {
      return event.value;
    }

    return '';
  }

  private clearFeedbackQueryParams(params: any) {
    const nextParams = {
      ...params,
    };
    delete nextParams.created;
    delete nextParams.message;
    delete nextParams.createdEmail;

    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: nextParams,
      replaceUrl: true,
    });
  }

  private resolveErrorMessage(error: any): string {
    return (
      (error && error.error && error.error.message)
      || (error && error.message)
      || this.translate.instant('COMMON.SYSTEM_ERROR')
    );
  }
}
