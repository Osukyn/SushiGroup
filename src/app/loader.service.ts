// loader.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {
  public isLoading = new BehaviorSubject<boolean>(false);
  public loaded = false;

  show() {
    this.isLoading.next(true);
    this.loaded = false;
  }

  hide() {
    this.loaded = true;
    this.isLoading.next(false);
  }
}
