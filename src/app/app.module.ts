import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ConfigEditorComponent } from './config-editor/config-editor.component';
// import { MyLibModule } from 'ary';
import { DiffEditorModule } from 'diff-library';
import { EdiotrComponent } from './ediotr/ediotr.component';
import { FormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    AppComponent,
    ConfigEditorComponent,
    EdiotrComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    DiffEditorModule,
    FormsModule
   

    
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
