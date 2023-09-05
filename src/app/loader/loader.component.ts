// loader.component.ts
import { Component } from '@angular/core';
import {LoaderService} from "../loader.service";

@Component({
  selector: 'app-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.css']
})
export class LoaderComponent {
  isLoading$ = this.loaderService.isLoading.asObservable();

  constructor(private loaderService: LoaderService) {}
}
