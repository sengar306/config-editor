import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  ViewEncapsulation
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

export interface DiffConfig {
  oldText: string;
  newText: string;

  showLineNumbers?: boolean;

  colors?: {
    deleteBg?: string;
    insertBg?: string;
    updateBg?: string;
    equalBg?: string;

    wordDelBg?: string;
    wordDelColor?: string;
    wordInsBg?: string;
    wordInsColor?: string;
  };
}

interface DiffRow {
  left: {
    lineNo: number | null;
    text: SafeHtml | string | null;
    type: string;
  };
  right: {
    lineNo: number | null;
    text: SafeHtml | string | null;
    type: string;
  };
}

@Component({
  selector: 'diff-editor',
  templateUrl: './diff-editor.component.html',
  styleUrls: ['./diff-editor.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class DiffEditorComponent implements OnChanges {

  @Input() config!: DiffConfig;

  diffRows: DiffRow[] = [];
  showLineNumbers = true;

  constructor(private sanitizer: DomSanitizer) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['config']) {
      this.applyConfig();
    }
  }

  applyConfig() {
    this.showLineNumbers = this.config.showLineNumbers ?? true;

    this.injectDynamicColors(this.config.colors);
    this.generateDiff();
  }

  injectDynamicColors(colors?: any) {
    const c = colors ?? {};

    const css = `
      .diff-editor .equal  { background: ${c.equalBg ?? 'transparent'}; }
      .diff-editor .delete { background: ${c.deleteBg ?? '#ffe5e5'}; }
      .diff-editor .insert { background: ${c.insertBg ?? '#e5ffe5'}; }
      .diff-editor .update { background: ${c.updateBg ?? '#fff6bf'}; }

      .word-del {
        background: ${c.wordDelBg ?? '#c6dbff'};
        color: ${c.wordDelColor ?? '#003a8c'};
        padding: 0 3px;
        border-radius: 3px;
      }

      .word-ins {
        background: ${c.wordInsBg ?? '#99bdff'};
        color: ${c.wordInsColor ?? '#002e73'};
        padding: 0 3px;
        border-radius: 3px;
      }
    `;

    const style = document.createElement('style');
    style.innerHTML = css;
    document.head.appendChild(style);
  }

  generateDiff() {
    const oldLines = this.config.oldText.split("\n");
    const newLines = this.config.newText.split("\n");

    const ops = this.computeLcs(oldLines, newLines);
    this.diffRows = this.convertOpsToRows(ops, oldLines, newLines);
  }

  computeLcs(a: string[], b: string[]) {
    const m = a.length, n = b.length;
    const dp: number[][] =
      Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

    for (let i = m - 1; i >= 0; i--) {
      for (let j = n - 1; j >= 0; j--) {
        dp[i][j] = a[i] === b[j]
          ? dp[i+1][j+1] + 1
          : Math.max(dp[i+1][j], dp[i][j+1]);
      }
    }

    const ops: any[] = [];
    let i = 0, j = 0;

    while (i < m && j < n) {
      if (a[i] === b[j]) {
        ops.push({ type: 'equal', aIndex: i, bIndex: j });
        i++; j++;
      } else if (dp[i + 1][j] >= dp[i][j + 1]) {
        ops.push({ type: 'delete', aIndex: i });
        i++;
      } else {
        ops.push({ type: 'insert', bIndex: j });
        j++;
      }
    }

    while (i < m) ops.push({ type: 'delete', aIndex: i++ });
    while (j < n) ops.push({ type: 'insert', bIndex: j++ });

    return ops;
  }

  inlineWordDiff(oldLine: string, newLine: string) {
    const a = oldLine.split(/(\s+)/);
    const b = newLine.split(/(\s+)/);

    const m = a.length, n = b.length;
    const dp = Array.from({ length: m+1 }, () => Array(n+1).fill(0));

    for (let i=m-1; i>=0; i--) {
      for (let j=n-1; j>=0; j--) {
        dp[i][j] = a[i] === b[j]
          ? dp[i+1][j+1] + 1
          : Math.max(dp[i+1][j], dp[i][j+1]);
      }
    }

    let i=0, j=0;
    let L="", R="";

    while (i<m && j<n) {
      if (a[i] === b[j]) {
        L+=a[i]; R+=b[j];
        i++; j++;
      } else if (dp[i+1][j] >= dp[i][j+1]) {
        L += `<span class='word-del'>${a[i++]}</span>`;
      } else {
        R += `<span class='word-ins'>${b[j++]}</span>`;
      }
    }
    while (i<m) L += `<span class='word-del'>${a[i++]}</span>`;
    while (j<n) R += `<span class='word-ins'>${b[j++]}</span>`;

    return {
      left: this.sanitizer.bypassSecurityTrustHtml(L),
      right: this.sanitizer.bypassSecurityTrustHtml(R)
    };
  }

  convertOpsToRows(ops: any[], oldLines: string[], newLines: string[]) {
    const rows: DiffRow[] = [];
    let oldNo = 1, newNo = 1;
    let i=0;

    while (i < ops.length) {
      const op = ops[i];

      // EQUAL
      if (op.type === "equal") {
        rows.push({
          left:  { lineNo: this.showLineNumbers ? oldNo++ : null, text: oldLines[op.aIndex], type: "equal" },
          right: { lineNo: this.showLineNumbers ? newNo++ : null, text: newLines[op.bIndex], type: "equal" }
        });
        i++;
        continue;
      }

      // INSERT block
      if (op.type === "insert") {
        while (i < ops.length && ops[i].type === "insert") {
          const ins = ops[i];
          rows.push({
            left:  { lineNo: null, text: null, type: "insert" },
            right: { lineNo: this.showLineNumbers ? newNo++ : null, text: newLines[ins.bIndex], type: "insert" }
          });
          i++;
        }
        continue;
      }

      // DELETE + possible insert
      if (op.type === "delete") {
        const delOps: any[] = [];
        const insOps: any[] = [];

        while (i < ops.length && ops[i].type === "delete") delOps.push(ops[i++]);
        while (i < ops.length && ops[i].type === "insert") insOps.push(ops[i++]);

        const min = Math.min(delOps.length, insOps.length);

        // UPDATE part
        for (let k=0; k<min; k++) {
          const oldLine = oldLines[delOps[k].aIndex];
          const newLine = newLines[insOps[k].bIndex];
          const { left, right } = this.inlineWordDiff(oldLine, newLine);

          rows.push({
            left:  { lineNo: this.showLineNumbers ? oldNo++ : null, text: left, type: "update" },
            right: { lineNo: this.showLineNumbers ? newNo++ : null, text: right, type: "update" }
          });
        }

        // extra deletes
        for (let k=min; k<delOps.length; k++) {
          rows.push({
            left:  { lineNo: this.showLineNumbers ? oldNo++ : null, text: oldLines[delOps[k].aIndex], type: "delete" },
            right: { lineNo: null, text: null, type: "delete" }
          });
        }

        // extra inserts
        for (let k=min; k<insOps.length; k++) {
          rows.push({
            left:  { lineNo: null, text: null, type: "insert" },
            right: { lineNo: this.showLineNumbers ? newNo++ : null, text: newLines[insOps[k].bIndex], type: "insert" }
          });
        }
      }
    }
    return rows;
  }
}
