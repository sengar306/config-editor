import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ConfigEditorComponent } from './config-editor/config-editor.component';
import { DiffEditorComponent } from './diff-editor/diff-editor.component';

@NgModule({
  declarations: [
    AppComponent,
    ConfigEditorComponent,
    DiffEditorComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
