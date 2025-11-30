import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ConfigEditorComponent } from './config-editor/config-editor.component';
// import { MyLibModule } from 'ary';
import { DiffEditorModule } from 'diff-library';
import { EdiotrComponent } from './ediotr/ediotr.component';
import { FormsModule } from '@angular/forms';
import { EditorComponent } from './editor/editor.component';


@NgModule({
  declarations: [
    AppComponent,
    ConfigEditorComponent,
    EdiotrComponent,
    EditorComponent,
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
