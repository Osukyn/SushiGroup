// loader.service.ts
import {EventEmitter, Inject, Injectable} from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {SwUpdate} from "@angular/service-worker";
import {TuiDialogService} from "@taiga-ui/core";

@Injectable({
  providedIn: 'root'
})
export class LoaderService {
  private _isLoading = new BehaviorSubject<boolean>(false);
  public readonly isLoading$ = this._isLoading.asObservable();
  public loaded = false;
  public dataResolved = false;

  constructor(private update: SwUpdate, @Inject(TuiDialogService) private readonly dialogs: TuiDialogService) {
    this.updateClient();
    if (this.update.isEnabled) {
      this.update.checkForUpdate().then(() => console.log('Checking for update'));
      setInterval(() => this.update.checkForUpdate().then(() => console.log('Checking for update')), 1000 * 15);
    }
  }

  show() {
    this._isLoading.next(true);
    this.loaded = false;
  }

  hide() {
    this.loaded = true;
    this._isLoading.next(false);
  }

  showUpdateDialog(): void {
    this.dialogs
      .open(
        'Une nouvelle version est disponible. Installation en cours... ',
        {label: 'Mise à jour disponible', size: 's', closeable: false, dismissible: false},
      )
      .subscribe();
    setTimeout(() => this.update.activateUpdate().then(() => document.location.reload()), 5000);
  }

  updateClient() {
    if (!this.update.isEnabled) {
      console.log('Not enabled');
      return;
    }
    this.update.versionUpdates.subscribe(event => {
      console.log('Event type', event.type);
      if (event.type === "VERSION_DETECTED") this.showUpdateDialog();
    });
  }
}
