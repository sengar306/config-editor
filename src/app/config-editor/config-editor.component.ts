import { Component, OnInit, ViewEncapsulation } from '@angular/core';
type DiffType = 'equal' | 'insert' | 'delete' | 'update';

interface DiffRow {
  left: { lineNo: number | null; text: string | null; type: DiffType };
  right: { lineNo: number | null; text: string | null; type: DiffType };
}
@Component({
  selector: 'app-config-editor',
  templateUrl: './config-editor.component.html',
  styleUrls: ['./config-editor.component.css'],
    
})
export class ConfigEditorComponent {

  constructor() { }

    oldText: string = '';
  newText: string = '';

  diffRows: DiffRow[] = [];

  /* FILE SELECTION HANDLERS */
  onOldFileSelect(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      this.oldText = reader.result as string;
      this.generateDiff();
    };
    reader.readAsText(file);
  }

  onNewFileSelect(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      this.newText = reader.result as string;
      this.generateDiff();
    };
    reader.readAsText(file);
  }

  generateDiff() {
    if (!this.oldText || !this.newText) return;

    const oldLines = this.oldText.replace(/\r\n/g, '\n').split('\n');
    const newLines = this.newText.replace(/\r\n/g, '\n').split('\n');

    const ops = this.computeLcsDiff(oldLines, newLines);
    this.diffRows = this.convertOpsToRows(ops, oldLines, newLines);
  }

  /* LCS LINE DIFF */
  computeLcsDiff(a: string[], b: string[]) {
    const m = a.length, n = b.length;
    const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

    for (let i = m - 1; i >= 0; i--) {
      for (let j = n - 1; j >= 0; j--) {
        if (a[i] === b[j]) dp[i][j] = dp[i + 1][j + 1] + 1;
        else dp[i][j] = Math.max(dp[i + 1][j], dp[i][j + 1]);
      }
    }

    const ops: any[] = [];
    let i = 0, j = 0;

    while (i < m && j < n) {
      if (a[i] === b[j]) {
        ops.push({ type: 'equal', aIndex: i, bIndex: j });
        i++; j++;
      } else if (dp[i + 1][j] >= dp[i][j + 1]) {
        ops.push({ type: 'delete', aIndex: i, bIndex: -1 });
        i++;
      } else {
        ops.push({ type: 'insert', aIndex: -1, bIndex: j });
        j++;
      }
    }

    while (i < m) ops.push({ type: 'delete', aIndex: i++, bIndex: -1 });
    while (j < n) ops.push({ type: 'insert', aIndex: -1, bIndex: j++ });
console.log(ops)
    return ops;
  }

  /* INLINE WORD DIFF (BLUE WORD HIGHLIGHT) */
  // inlineDiff(oldLine: string, newLine: string) {
  //   const a = oldLine.split("");
  //   const b = newLine.split("");

  //   const m = a.length, n = b.length;
  //   const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  //   for (let i = m - 1; i >= 0; i--) {
  //     for (let j = n - 1; j >= 0; j--) {
  //       if (a[i] === b[j]) dp[i][j] = dp[i + 1][j + 1] + 1;
  //       else dp[i][j] = Math.max(dp[i + 1][j], dp[i][j + 1]);
  //     }
  //   }

  //   let i = 0, j = 0;
  //   let leftHtml = "", rightHtml = "";

  //   while (i < m && j < n) {
  //     if (a[i] === b[j]) {
  //       leftHtml += a[i];
  //       rightHtml += b[j];
  //       i++; j++;
  //     } else if (dp[i + 1][j] >= dp[i][j + 1]) {
  //       leftHtml += `<span class="del">${a[i]}</span>`;
  //       i++;
  //     } else {
  //       rightHtml += `<span class="ins">${b[j]}</span>`;
  //       j++;
  //     }
  //   }

  //   while (i < m) leftHtml += `<span class="del">${a[i++]}</span>`;
  //   while (j < n) rightHtml += `<span class="ins">${b[j++]}</span>`;

  //   return { leftHtml, rightHtml };
  // }
  inlineDiff(oldLine: string, newLine: string) {
  const a = oldLine.split(/(\s+)/);   // split words + keep spaces
  const b = newLine.split(/(\s+)/);

  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  // LCS DP table (word-level)
  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      if (a[i] === b[j]) dp[i][j] = dp[i + 1][j + 1] + 1;
      else dp[i][j] = Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }

  // backtrack word-level diff
  let i = 0, j = 0;
  let leftHtml = "", rightHtml = "";

  while (i < m && j < n) {
    if (a[i] === b[j]) {
      leftHtml += a[i];
      rightHtml += b[j];
      i++; j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      leftHtml += `<span class="word-del">${a[i]}</span>`;
      i++;
    } else {
      rightHtml += `<span class="word-ins">${b[j]}</span>`;
      j++;
    }
  }

  while (i < m) leftHtml += `<span class="word-del">${a[i++]}</span>`;
  while (j < n) rightHtml += `<span class="word-ins">${b[j++]}</span>`;

  return { leftHtml, rightHtml };
}


  /* CONVERT OPS TO ROWS */
convertOpsToRows(ops: any[], oldLines: string[], newLines: string[]): DiffRow[] {
  const rows: DiffRow[] = [];
  let oldNo = 1;
  let newNo = 1;
  let i = 0;

  while (i < ops.length) {
    const op = ops[i];

    // ----------------------------------------------------
    //  EQUAL BLOCK
    // ----------------------------------------------------
    if (op.type === 'equal') {
      rows.push({
        left:  { lineNo: oldNo++, text: oldLines[op.aIndex], type: 'equal' },
        right: { lineNo: newNo++, text: newLines[op.bIndex], type: 'equal' }
      });
      i++;
      continue;
    }

    // ----------------------------------------------------
    //  INSERT-ONLY BLOCK
    // ----------------------------------------------------
    if (op.type === 'insert') {
      while (i < ops.length && ops[i].type === 'insert') {
        const ins = ops[i];
        rows.push({
          left:  { lineNo: null, text: null, type: 'insert' },
          right: { lineNo: newNo++, text: newLines[ins.bIndex], type: 'insert' }
        });
        i++;
      }
      continue;
    }

    // ----------------------------------------------------
    //  DELETE BLOCK + possible INSERT block → UPDATE?
    // ----------------------------------------------------
    if (op.type === 'delete') {

      // collect deletes
      const delOps = [];
      while (i < ops.length && ops[i].type === 'delete') {
        delOps.push(ops[i]);
        i++;
      }

      // collect inserts
      const insOps = [];
      while (i < ops.length && ops[i].type === 'insert') {
        insOps.push(ops[i]);
        i++;
      }

      const delCount = delOps.length;
      const insCount = insOps.length;

      // ----------------------------------------------
      // CASE A: both DELETE and INSERT exist
      // → PARTIAL UPDATE (pair min of both)
      // ----------------------------------------------
      if (delCount > 0 && insCount > 0) {

        const minCount = Math.min(delCount, insCount);

        // --- UPDATED PAIRS (word-level diff) ---
        for (let k = 0; k < minCount; k++) {
          const oldLine = oldLines[delOps[k].aIndex];
          const newLine = newLines[insOps[k].bIndex];

          const { leftHtml, rightHtml } = this.inlineDiff(oldLine, newLine);

          rows.push({
            left:  { lineNo: oldNo++, text: leftHtml, type: 'update' },
            right: { lineNo: newNo++, text: rightHtml, type: 'update' }
          });
        }

        // --- leftover deletes ---
        for (let k = minCount; k < delCount; k++) {
          rows.push({
            left:  { lineNo: oldNo++, text: oldLines[delOps[k].aIndex], type: 'delete' },
            right: { lineNo: null, text: null, type: 'delete' }
          });
        }

        // --- leftover inserts ---
        for (let k = minCount; k < insCount; k++) {
          rows.push({
            left:  { lineNo: null, text: null, type: 'insert' },
            right: { lineNo: newNo++, text: newLines[insOps[k].bIndex], type: 'insert' }
          });
        }

        continue;
      }

      // ----------------------------------------------
      // CASE B: Only deletes (no inserts)
      // ----------------------------------------------
      if (delCount > 0 && insCount === 0) {
        for (let d of delOps) {
          rows.push({
            left:  { lineNo: oldNo++, text: oldLines[d.aIndex], type: 'delete' },
            right: { lineNo: null, text: null, type: 'delete' }
          });
        }
        continue;
      }

      // ----------------------------------------------
      // CASE C: Only inserts (should not happen here)
      // but we handle for safety
      // ----------------------------------------------
      if (insCount > 0 && delCount === 0) {
        for (let ins of insOps) {
          rows.push({
            left:  { lineNo: null, text: null, type: 'insert' },
            right: { lineNo: newNo++, text: newLines[ins.bIndex], type: 'insert' }
          });
        }
        continue;
      }
    }

    // fallback to avoid infinite loop
    i++;
  }
console.log(rows)
  return rows;
}




}
