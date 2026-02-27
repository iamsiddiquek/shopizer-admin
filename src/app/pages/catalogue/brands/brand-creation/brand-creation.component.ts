import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'ngx-brand-creation',
    templateUrl: './brand-creation.component.html',
    styleUrls: ['./brand-creation.component.scss'],
    standalone: false
})
export class BrandCreationComponent implements OnInit {
  brand = {};

  constructor() {
  }

  ngOnInit() {
  }

}
