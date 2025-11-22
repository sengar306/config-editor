import { Component } from '@angular/core';
import { DiffConfig } from './diff-editor/diff-editor.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  diffConfig: DiffConfig = {
  oldText: `title: Config
a=111
name: vivek`,

  newText: `title: Config
a=1
b=2
name: vivek kumar`,

  showLineNumbers: true,

  colors: {
    deleteBg: "#ffe0e0",
    insertBg: "#e3ffe8",
    updateBg: "#fff2a8",
    equalBg: "transparent",

    wordDelBg: "#ffd5d5",
    wordDelColor: "#990000",

    wordInsBg: "#c8ffd0",
    wordInsColor: "#006600"
  }
};

}
