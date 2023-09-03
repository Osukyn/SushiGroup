import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable, retry} from "rxjs";
import {Categorie} from "./model/categorie.model";

@Injectable({
  providedIn: 'root'
})
export class InfosService {

  constructor(private http: HttpClient) { }

  apiURL = 'http://localhost:3000';

  getMenu(): Observable<Categorie[]> {
    return this.http.get<Categorie[]>(this.apiURL+ '/api/menu');
  }
}
