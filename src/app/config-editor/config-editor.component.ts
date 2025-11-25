import { Component } from '@angular/core';

type DiffType = 'equal' | 'insert' | 'delete' | 'update';

interface DiffRow {
  left: { lineNo: number | null; text: string | null; type: DiffType };
  right: { lineNo: number | null; text: string | null; type: DiffType };
}

@Component({
  selector: 'app-config-editor',
  templateUrl: './config-editor.component.html',
  styleUrls: ['./config-editor.component.css']
})
export class ConfigEditorComponent {

  oldText: string = '';
  newText: string = '';
  diffRows: DiffRow[] = [];

  /* ---------------- FILE SELECT ---------------- */
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

  /* ---------------- GENERATE DIFF ---------------- */
  generateDiff() {
    if (!this.oldText || !this.newText) return;

    const oldLines = this.oldText.replace(/\r\n/g, '\n').split('\n');
    const newLines = this.newText.replace(/\r\n/g, '\n').split('\n');

    const ops = this.computeLcsDiff(oldLines, newLines);
    this.diffRows = this.convertOpsToRows(ops, oldLines, newLines);
  }

  /* ---------------- MAIN LCS DIFF ---------------- */
  computeLcsDiff(a: string[], b: string[]) {
    const m = a.length, n = b.length;

    const dp = Array.from({ length: m + 1 }, () =>
      Array(n + 1).fill(0)
    );

    // build DP
    for (let i = m - 1; i >= 0; i--) {
      for (let j = n - 1; j >= 0; j--) {
        if (a[i] === b[j]) dp[i][j] = dp[i + 1][j + 1] + 1;
        else dp[i][j] = Math.max(dp[i + 1][j], dp[i][j + 1]);
      }
    }

    const ops: any[] = [];
    let i = 0, j = 0;

    // backtrack
  // backtrack
while (i < m && j < n) {

  // ------------------ EQUAL ------------------
  if (a[i] === b[j]) {
    ops.push({ type: "equal", aIndex: i, bIndex: j });
    i++; j++;
    continue;
  }

  // ------------------ UPDATE ------------------
// ------------------ UPDATE BLOCK ------------------
if (
  dp[i + 1][j + 1] >= dp[i + 1][j] &&
  dp[i + 1][j + 1] >= dp[i][j + 1]
) {

  // ⭐ check next right line similarity
  if (j + 1 < n && this.wordSimilarity(a[i], b[j + 1]) > 0.0) {

    // 👉 current right line is shifted down → INSERT
    ops.push({
      type: "insert",
      aIndex: -1,
      bIndex: j
    });

    j++;       // only move right pointer
    continue;  // do NOT update here
  }

  // 👉 Normal update
  ops.push({
    type: "update",
    aIndex: i,
    bIndex: j
  });

  i++;
  j++;
  continue;
}


  // ------------------ SHIFT RULE (correct position) ------------------
  // If left line exists on next line of right, treat as INSERT
  if (j + 1 < n && a[i] === b[j + 1]) {
    ops.push({
      type: "insert",
      aIndex: -1,
      bIndex: j
    });
    j++;
    continue;
  }

  // ------------------ DELETE ------------------
  if (dp[i + 1][j] >= dp[i][j + 1]) {
    ops.push({ type: "delete", aIndex: i, bIndex: -1 });
    i++;
    continue;
  }

  // ------------------ INSERT ------------------
  ops.push({ type: "insert", aIndex: -1, bIndex: j });
  j++;
}


    // remaining left
    while (i < m) {
      ops.push({ type: "delete", aIndex: i++, bIndex: -1 });
    }

    // remaining right
    while (j < n) {
      ops.push({ type: "insert", aIndex: -1, bIndex: j++ });
    }

    return ops;
  }
wordSimilarity(a: string, b: string): number {
  const wa = a.trim().split(/\s+/);
  const wb = b.trim().split(/\s+/);

  const m = wa.length, n = wb.length;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  // LCS WORD DP
  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      if (wa[i] === wb[j]) dp[i][j] = dp[i + 1][j + 1] + 1;
      else dp[i][j] = Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }

  const lcs = dp[0][0];   // matched words count
  const sim = lcs / Math.max(m, n);

  return sim;
}

  /* ---------------- INLINE WORD DIFF ---------------- */
  inlineDiff(oldLine: string, newLine: string) {
    const a = oldLine.split(/(\s+)/);
    const b = newLine.split(/(\s+)/);

    const m = a.length, n = b.length;
    const dp = Array.from({ length: m + 1 }, () =>
      Array(n + 1).fill(0)
    );

    // LCS DP for words
    for (let i = m - 1; i >= 0; i--) {
      for (let j = n - 1; j >= 0; j--) {
        if (a[i] === b[j]) dp[i][j] = dp[i + 1][j + 1] + 1;
        else dp[i][j] = Math.max(dp[i + 1][j], dp[i][j + 1]);
      }
    }

    let i = 0, j = 0;
    let leftHtml = "", rightHtml = "";

    while (i < m && j < n) {
      if (a[i] === b[j]) {
        leftHtml += a[i];
        rightHtml += b[j];
        i++; j++;
      }
      else if (dp[i + 1][j] >= dp[i][j + 1]) {
        leftHtml += `<span class="word-del">${a[i]}</span>`;
        i++;
      }
      else {
        rightHtml += `<span class="word-ins">${b[j]}</span>`;
        j++;
      }
    }

    while (i < m) leftHtml += `<span class="word-del">${a[i++]}</span>`;
    while (j < n) rightHtml += `<span class="word-ins">${b[j++]}</span>`;

    return { leftHtml, rightHtml };
  }

  /* ---------------- CONVERT OPS TO FINAL TABLE ---------------- */
  convertOpsToRows(
    ops: any[],
    oldLines: string[],
    newLines: string[]
  ): DiffRow[] {

    const rows: DiffRow[] = [];
    let oldNo = 1, newNo = 1;

    for (const op of ops) {

      // --------- EQUAL ---------
      if (op.type === "equal") {
        rows.push({
          left:  { lineNo: oldNo++, text: oldLines[op.aIndex], type: "equal" },
          right: { lineNo: newNo++, text: newLines[op.bIndex], type: "equal" }
        });
        continue;
      }

      // --------- UPDATE ---------
      if (op.type === "update") {
        const { leftHtml, rightHtml } =
          this.inlineDiff(oldLines[op.aIndex], newLines[op.bIndex]);

        rows.push({
          left:  { lineNo: oldNo++, text: leftHtml,  type: "update" },
          right: { lineNo: newNo++, text: rightHtml, type: "update" }
        });
        continue;
      }

      // --------- DELETE ---------
      if (op.type === "delete") {
        rows.push({
          left:  { lineNo: oldNo++, text: oldLines[op.aIndex], type: "delete" },
          right: { lineNo: null, text: null, type: "delete" }
        });
        continue;
      }

      // --------- INSERT ---------
      if (op.type === "insert") {
        rows.push({
          left:  { lineNo: null, text: null, type: "insert" },
          right: { lineNo: newNo++, text: newLines[op.bIndex], type: "insert" }
        });
        continue;
      }
    }

    return rows;
  }
}
