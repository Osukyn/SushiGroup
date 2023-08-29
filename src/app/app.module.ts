import { NgDompurifySanitizer } from "@tinkoff/ng-dompurify";
import { TuiRootModule, TuiDialogModule, TuiAlertModule, TuiButtonModule, TuiLoaderModule, TuiModeModule, TuiThemeNightModule, TuiGroupModule, TuiTextfieldControllerModule, TUI_SANITIZER } from "@taiga-ui/core";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { HelloComponent } from './hello/hello.component';
import { SushiListComponent } from './sushi-list/sushi-list.component';
import {
  TuiAccordionModule, TuiBadgeModule,
  TuiCarouselModule, TuiInputNumberModule,
  TuiIslandModule,
  TuiMarkerIconModule,
  TuiPaginationModule
} from "@taiga-ui/kit";
import {HttpClientModule} from "@angular/common/http";
import {TuiMoneyModule} from "@taiga-ui/addon-commerce";
import {of} from "rxjs";
import {TUI_LANGUAGE, TUI_FRENCH_LANGUAGE} from "@taiga-ui/i18n";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {TuiTabBarModule} from "@taiga-ui/addon-mobile";

@NgModule({
  declarations: [
    AppComponent,
    HelloComponent,
    SushiListComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    TuiRootModule,
    TuiDialogModule,
    TuiAlertModule,
    AppRoutingModule,
    TuiIslandModule,
    TuiAccordionModule,
    HttpClientModule,
    TuiButtonModule,
    TuiCarouselModule,
    TuiMoneyModule,
    TuiLoaderModule,
    TuiMarkerIconModule,
    TuiPaginationModule,
    TuiBadgeModule,
    TuiThemeNightModule,
    TuiModeModule,
    TuiGroupModule,
    TuiInputNumberModule,
    ReactiveFormsModule,
    TuiTextfieldControllerModule,
    FormsModule,
    TuiTabBarModule,
  ],
  providers: [
    {
      provide: TUI_LANGUAGE,
      useValue: of(TUI_FRENCH_LANGUAGE),
    },
      {provide: TUI_SANITIZER, useClass: NgDompurifySanitizer}
],
  bootstrap: [AppComponent]
})
export class AppModule { }
