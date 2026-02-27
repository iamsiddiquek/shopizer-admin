import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'ngx-category-creation',
    templateUrl: './category-creation.component.html',
    styleUrls: ['./category-creation.component.scss'],
    standalone: false
})
export class CategoryCreationComponent implements OnInit {
  category = {};

  constructor() {
  }

  ngOnInit() {
  }

}
