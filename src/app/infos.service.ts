import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable, retry} from "rxjs";
import {Categorie} from "./model/categorie.model";
import {environment} from "../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class InfosService {
  constructor(private http: HttpClient) { }

  apiURL = environment.baseUrl + environment.restPort;

  getMenu(): Observable<Categorie[]> {
    return this.http.get<Categorie[]>(this.apiURL + '/api/menu');
  }

  getLastOrder(email: string): Observable<any> {
    return this.http.get<any>(this.apiURL + '/api/getLastOrder?email=' + email);
  }
}
