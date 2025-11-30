import { Component } from '@angular/core';
import { DiffConfig } from 'diff-library';
// import { DiffConfig } from './diff-editor/diff-editor.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  leftText:any
  rightText:any
  configData: string = `hostname R1-NEW


interface GigabitEthernet0/1
 description WAN Interface Updated
 ip address 10.10.10.1 255.255.255.252
 no shutdown                  
 interface GigabitEthernet0/0
 description LAN Interface
 ip address 192.168.1.1 255.255.255.0
 no shutdown
`;

oldText: string = `hostname R1-OLD
interface GigabitEthernet0/0
 description LAN Interface
 ip address 192.168.1.1 255.255.255.0
 no shutdown

interface GigabitEthernet0/1
 description WAN Interface
 ip address 10.10.10.1 255.255.255.252
 shutdown
`;

selectedLeft = "";
selectedRight = "";

leftHighlights:any = [];
rightHighlights:any = [{text:'no',background:'green'}];

onLeftEditorChange(updated: string) {
  this.configData = updated;
}

onRightEditorChange(updated: string) {
  console.log("chaneg text")
  this.oldText = updated;
}

onLeftSelection(text: string) {
  this.selectedLeft = text.trim();
}

onRightSelection(text: string) {
  this.selectedRight = text.trim();
}

// test() {

//   if (!this.selectedLeft) return;

//   const selected = this.selectedLeft.trim();
//   const iface =this.searchInterface ; // same interface name or text

//   console.log("Searching section for:", iface);

//   // ---------------------------
//   // STEP 1 → extract SECTION from old config
//   // ---------------------------
//   const oldLines = this.oldText.split("\n");
//   let capturing = false;
//   let section = "";

//   oldLines.forEach(line => {

//     // Start when interface name found
//     if (line.includes(iface)) {
//       capturing = true;
//     }

//     if (capturing) {

//       // If line is special character single-line → STOP
//       if (/^[!#;%]$/.test(line.trim())) {  
//         capturing = false;
//         return;
//       }

//       section += line + "\n";
//     }
//   });

//   console.log("Extracted Section:", section);

//   if (!section.trim()) {
//     console.log("No section found");
//     return;
//   }

//   // ---------------------------
//   // STEP 2 → highlight this SECTION on right editor
//   // ---------------------------
//   this.rightHighlights = [
//     {
//       text: section.trim(),
//       color: "white",
//       background: "green"
//     }
//   ];

//   // ---------------------------
//   // STEP 3 → Find LOOK FOR block inside RIGHT config
//   // ---------------------------
//   const lookForRegex = /Look for\s*\((.*?)\)/i;
//   const lookForMatch = this.configData.match(lookForRegex);

//   if (lookForMatch) {

//     const lookForWord = lookForMatch[1].trim();
//     console.log("Look For Found:", lookForWord);

//     // ---------------------------
//     // Highlight both LEFT & RIGHT the same "Look for" match
//     // ---------------------------
//     this.leftHighlights.push({
//       text: "Look for (" + lookForWord,
//       color: "white",
//       background: "green"
//     });

//     this.rightHighlights.push({
//       text: lookForWord,
//       color: "white",
//       background: "green"
//     });
//   }

// }
test() {

  if (!this.selectedLeft) return;

  const selected = this.selectedLeft.trim();

  // Find Look For(x)
  const lookForRegex = /Look for\s*\((.*?)\)/i;
  const lookMatch = this.configData.match(lookForRegex);
  const lookWord = lookMatch ? lookMatch[1].trim() : selected;

  console.log("LOOK FOR VALUE:", lookWord);

  // ------------------------------
  // EXTRACT RIGHT CONFIG SECTION
  // ------------------------------
  const sectionRegex = new RegExp(
    `^interface[\\s\\S]*?${this.escapeRegExp(selected)}[\\s\\S]*?(?=^!|^interface|$)`,
    "gim"
  );

  const matches = [...this.oldText.matchAll(sectionRegex)];
  const section = matches.length ? matches[0][0].trim() : "";

  if (!section) {
    console.log("NO INTERFACE SECTION FOUND");
    return;
  }

  console.log("Extracted RIGHT SECTION:", section);

  // ------------------------------
  // CHECK X INSIDE SECTION
  // ------------------------------
  const contains = new RegExp(this.escapeRegExp(lookWord), "i").test(section);

  if (contains) {
    // Match found → highlight GREEN
    this.leftHighlights = [
      { text: `Look for (${lookWord})`, color: "white", background: "green" }
    ];

    this.rightHighlights = [
      { text: lookWord, color: "white", background: "green" },
      { text: section, color: "white", background: "green" }
    ];

    return;
  }

  // ------------------------------
  // IF NOT FOUND → INSERT DUMMY LINES BOTH SIDES
  // ------------------------------

  const dummyLeft = `! MISSING IN RIGHT : ${lookWord}`;
  const dummyRight = `! MISSING IN LEFT : ${lookWord}`;

  // Add below Look For line in LEFT
  this.configData = this.configData.replace(
    `Look for (${lookWord})`,
    `Look for (${lookWord})\n${dummyLeft}`
  );

  // Add bottom of the matched section in RIGHT
  const updatedRightSection = section + `\n${dummyRight}`;

  // Replace original section in oldText
  this.oldText = this.oldText.replace(section, updatedRightSection);

  // Highlight both dummy lines
  this.leftHighlights = [
    { text: dummyLeft, color: "white", background: "red" }
  ];

  this.rightHighlights = [
    { text: dummyRight, color: "white", background: "red" }
  ];

  console.log("Dummy lines added and highlighted RED.");
}

/** util for safe regex */
 escapeRegExp(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** small util to escape regex special chars for safe searching */


applyLookFor() {
  if (!this.selectedLeft?.trim()) return;

  const val = this.selectedLeft.trim();

  // Add Look For in LEFT side
  const lookForBlock = `Look for (${val})`;

  this.configData = this.configData.replace(val, lookForBlock);

  // LEFT highlight
  this.leftHighlights = [
    { text: "Look for", color: "green", background: "" }
  ];

  console.log("Look For Applied:", lookForBlock);
}

searchInterface:any

}
