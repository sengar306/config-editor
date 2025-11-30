import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-overlay-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.css']
})
export class EditorComponent {
  @Input() text: string = `
  asasf
  asfasdf
  asdf
  sad
  fsa
  f
  sa`;   
  @Output() selectedTextemit =new EventEmitter<any>()                 
  @Input() highlightWords: any[] = [];        
  @Output() textChange = new EventEmitter<string>(); 
  rawText: string = "";
  lines: any[] = [];
  lineNumbers: number[] = [];

  constructor(private sanitizer: DomSanitizer) {}

  ngOnChanges() {
    this.rawText = this.text;      // whenever text changes
    this.applyHighlight();
  }

  /** Main highlight logic */
applyHighlight() {
  const splitLines = this.rawText.split("\n");

  this.lines = splitLines.map(line => {
   if (line.trim() === "") {
      return this.sanitizer.bypassSecurityTrustHtml("&nbsp;");
    }
    this.highlightWords.forEach((word: any) => {
      
      if (!word.text.trim()) return;

      // Create regex
      const reg = new RegExp(`(${word.text})`, "gi");

      // -------------------------------
      // BACKGROUND HIGHLIGHT
      // -------------------------------
      if (word.background) {
        line = line.replace(
          reg,
          `<span style="background:${word.background}; color:${word.color}">$1</span>`
        );
      }
      // -------------------------------
      // NORMAL HIGHLIGHT
      // -------------------------------
      else {
        line = line.replace(
          reg,
          `<span style="color:${word.color}">$1</span>`
        );
      }
    });

    return this.sanitizer.bypassSecurityTrustHtml(line);
  });

  this.lineNumbers = splitLines.map((_, i) => i + 1);
}
onKeyUp(event: any) {
  this.rawText = event.target.value.replace(/\r\n/g, "\n");
  this.applyHighlight();
  this.textChange.emit(this.rawText);
}

  /** Textarea input -> update parent */
  onInput(event: any) {
    this.rawText = event.target.value.replace(/\r\n/g, "\n");
    this.textChange.emit(this.rawText);
    this.applyHighlight();
  }
  /** Scroll sync */
  // syncScroll(event: any) {
  //   const bg = document.querySelector('.code-background') as HTMLElement;
  //   const ln = document.querySelector('.line-numbers') as HTMLElement;

  //   bg.scrollTop = event.target.scrollTop;
  //   ln.scrollTop = event.target.scrollTop;
  // }
  syncScroll(event: any) {
  const scrollTop = event.target.scrollTop;
  const scrollLeft = event.target.scrollLeft;

  const editor = document.querySelector('.editor-wrapper') as HTMLElement;
  editor.scrollTop = scrollTop;
  editor.scrollLeft = scrollLeft;
}
onSelection(event: any) {
  const textarea = event.target;

  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;

  const selectedText = textarea.value.substring(start, end);

  console.log("Selected Text:", selectedText);
  console.log("Start:", start);
  console.log("End:", end);
  this.selectedTextemit.emit(selectedText)
}


}
