// loader.service.ts
import {EventEmitter, Injectable} from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {
  private _isLoading = new BehaviorSubject<boolean>(false);
  public readonly isLoading$ = this._isLoading.asObservable();
  public loaded = false;
  public dataResolved = false;

  show() {
    this._isLoading.next(true);
    this.loaded = false;
  }

  hide() {
    this.loaded = true;
    this._isLoading.next(false);
  }
}
