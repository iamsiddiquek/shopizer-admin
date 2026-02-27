import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'ngx-inventory-creation',
    templateUrl: './inventory-creation.component.html',
    styleUrls: ['./inventory-creation.component.scss'],
    standalone: false
})
export class InventoryCreationComponent implements OnInit {
  inventory = {};

  constructor() {
  }

  ngOnInit() {
  }

}
