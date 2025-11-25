import {
  Component,
  ElementRef,
  Input,
  OnInit,
  ViewChild,
  AfterViewInit,
  ViewChildren,
  QueryList
} from '@angular/core';

@Component({
  selector: 'app-ediotr',
  templateUrl: './ediotr.component.html',
  styleUrls: ['./ediotr.component.css']
})
export class EdiotrComponent implements OnInit, AfterViewInit {


  constructor() {}

  @Input() content: string = '';

  /** Split content lines */
  lines: string[] = [];

  /** ViewChild references */
  @ViewChild('lineNumbers') lineNumbersRef!: ElementRef;
  @ViewChild('overlay') overlayRef!: ElementRef;
  @ViewChild('codeLayer') codeLayerRef!: ElementRef;

  /** Highlighted lines (lineNumber : color) */
  highlightLines: { [key: number]: string } = {
    2: '#ffcccc',   // red delete
    7: '#d4edda',   // green insert
    10: '#fff3cd',  // yellow change
    15: '#d4edda',
    18: '#d4edda'
  };

  /** Which highlighted blocks are expanded */
  expandedBlocks: Set<number> = new Set();

  ngOnInit(): void {
    this.updateLines();
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.scrollSync(), 80);
  }

  /** Split text into lines */
  updateLines() {
    this.lines = this.content ? this.content.split('\n') : [];
  }

  /** Find next highlighted line to detect collapse region end */
  nextHighlight(current: number): number | null {
    const all = Object.keys(this.highlightLines)
      .map(Number)
      .sort((a, b) => a - b);

    for (let x of all) {
      if (x > current) return x;
    }

    return null;
  }
 onLineEdit(event: any, index: number) {
  this.lines[index] = event.target.innerText;
  this.content = this.lines.join("\n");
}
onUserEdit(event: any, index: number) {
  this.lines[index] = event.target.innerText;
  this.content = this.lines.join("\n");
}

  /** Should a line be visible? */
  isLineVisible(i: number): boolean {
    const lineNo = i + 1;
     const firstHighlight = Object.keys(this.highlightLines)
  .map(Number)        // convert to numbers
  .sort((a, b) => a - b)[0]; // smallest highlight line

if (firstHighlight > lineNo) {
  return true;
}
    if (this.highlightLines[lineNo]) return true;

    /** Check inside expanded block */
    console.log(this.expandedBlocks)
    for (let hl of this.expandedBlocks) {
      let next = this.nextHighlight(hl);

      // current line is between hl and next highlight → show
      if (lineNo > hl && (next === null || lineNo < next)) return true;
    }

    /** Otherwise hidden */
    return false;
  }

  /** Expand/Collapse highlight block */
  toggleBlock(lineNo: number) {
    if (this.expandedBlocks.has(lineNo)) {
      this.expandedBlocks.delete(lineNo);
    } else {
      this.expandedBlocks.add(lineNo);
    }
  }

  /** Scroll sync all three layers */
  scrollSync() {
    const scrollTop = this.codeLayerRef.nativeElement.scrollTop;

    this.lineNumbersRef.nativeElement.scrollTop = scrollTop;
    this.overlayRef.nativeElement.scrollTop = scrollTop;
  }
  @ViewChildren('editLine') editLineRefs!: QueryList<ElementRef>;
onFullEdit(event: any) {
  this.content = event.target.innerText;
  this.lines = this.content.split("\n");
}


}
  



