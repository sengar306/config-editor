import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-config-diff',
  templateUrl: './config-diff.component.html',
  styleUrls: ['./config-diff.component.css']
})
export class ConfigDiffComponent implements OnInit {
  sections: any=[]
  rules:any[]=['']
  intendedconfig: any[]=[]
  actual: any[]=[]
  matched: any=[]
  selectedSection: any;
rightHighlights: any[]=[]
leftsection: any;
ngOnInit(): void {
    this.findSection(this.feature)

}
constructor(private sanitizer: DomSanitizer) {}

  intendedText: string = "";
  actualText: string = "";
  feature: string = "acl";
  result: any[] = [];


findSection(word: string) {

  this.sections = [];

  const regex = new RegExp(
    `^\\s*${word}[\\s\\S]*?(?=^\\s*#)`,
    "gm"
  );

  let match: RegExpExecArray | null;

  while ((match = regex.exec(this.actualText)) !== null) {

    // 1️⃣ Start Line Number
    const startChar = match.index;
    const startLine = this.actualText
      .substring(0, startChar)
      .split("\n").length;

    // 2️⃣ End Line Number
    const endChar = startChar + match[0].length;
    const endLine = this.actualText
      .substring(0, endChar)
      .split("\n").length;

    // 3️⃣ Clean block lines
    let block = match[0]
    

    // 4️⃣ Save Result
    this.sections.push({
      start: startLine,
      end: endLine,
      block: block
    });

    console.log(
    this.sections
    );
    this.sections.forEach((item:any) => {
         if(item.block.split('\n')[0]==this.intendedText.split('\n')[0])
         { this.selectedSection=item.block
          console.log('selectes',item.block.split('\n')[0])
          console.log(item)
         }
      
    });
  }
  this.checkRulesInSections()
}

  compareNow() {
    if (!this.intendedText || !this.actualText || !this.feature) {
      alert("Paste configs first!");
      return;
    }

    const intendedSections = this.getSections(this.intendedText, this.feature);

    if (intendedSections.length === 0) {
      alert("No intended section found!");
      return;
    }

    const intendedRules = this.getRules(intendedSections[0]);

    const actualSections = this.getSections(this.actualText, this.feature);

    this.result = actualSections.map(section => {
      const actualRules = this.getRules(section);
      const found: string[] = [];
      const missing: string[] = [];
      intendedRules.forEach(rule => {
        if (actualRules.some(r => r.includes(rule))) {
          found.push(rule);
        } else {
          missing.push(rule);
        }
      });

      return {
        header: section.split("\n")[0],
        found,
        missing
      };
    });
  }


  // -----------------------------
  // SECTION EXTRACTOR
  // -----------------------------
  getSections(config: string, feature: string): string[] {
    const regex = new RegExp(
      `^${feature}[\\s\\S]*?(?=^#)`,
      "gm"
    );
    return config.match(regex) || [];
  }

  // -----------------------------
  // RULE EXTRACTOR
  // -----------------------------
  getRules(section: string): string[] {
    return section
      .split("\n")
      .map(x => x.trim())
      .filter(x => x.startsWith("rule"));
  }
  section:any
checkRulesInSections() { 
  console.log(this.rules)
   this.rules.forEach((item:any)=>{
    if(this.selectedSection.includes(item)){
      const rightstartIndex = this.selectedSection.indexOf(item);
      const rightedIndex = rightstartIndex + item.length;
      const leftStartndex=this.intendedText.indexOf(item);
      const leftendindex= leftStartndex + item.length;
      const leftLineNumber=this.getLineNumber(this.intendedText,leftStartndex)
      const rightLineNumber=this.getLineNumber(this.selectedSection,rightstartIndex)
     const diff = Math.abs(leftLineNumber - rightLineNumber);
          const leftText= this.intendedText.split('\n')
            const rightText=this.selectedSection.split('\n');
     if (leftLineNumber > rightLineNumber) {

  for (let i = 0; i < diff; i++) {
    leftText.splice(leftLineNumber - 1, 0, "");

  }
}

else if (rightLineNumber > leftLineNumber) {

  for (let i = 0; i < diff; i++) {
  rightText.splice(leftLineNumber - 1, 0, "");
 
  }
   
}

   this.leftsection=this.highlightSection(leftText,leftStartndex,leftendindex,'green')
     this.section=this.highlightSection(rightText,leftStartndex,leftendindex,'green')
    console.log(this.section)

      // this.leftsection=this.highlightSection(this.selectedSection,leftStartndex,leftendindex,'green')
      // this.section=this.highlightSection (this.,rightstartIndex,rightedIndex,'green')
      console.log(this.rightHighlights)
    }
   }) 
//   this.actual = this.actualText.split("\n");
//   let selectedSection: any = null;
//   this.sections = this.sections.map((section: any) => {  
//   const matchedRules: string[] = [];
//   this.rules.forEach(rule => {
//   const found = section.block.toLowerCase().trim().includes(rule.toLowerCase().trim());
//       if (found) {
//         matchedRules.push(rule);
//         selectedSection = section;
//         console.log(selectedSection)
//       }
//     });

//     return {
//       ...section,
//       matchedRules,
//       hasRule: matchedRules.length > 0
//     };
//   });

//   if (!selectedSection) {
//     console.warn("No section found");
//     return;
//   }

//   this.selectedSection = selectedSection;
// console.log(selectedSection)
//   const intendedLines = this.intendedText.split("\n");
//   const totalLines = this.actual.length;

//   const topBlank    = Array(selectedSection.start - 1).fill("");
//   const bottomBlank = Array(totalLines - selectedSection.end).fill("");

//   // not using rule index
//   this.intendedconfig = [
//     ...topBlank,
//     ...intendedLines,
//     ...bottomBlank
//   ];

//   console.log("SELECTED:", selectedSection);


}
highlightSection(
  section: any,
  start: number,
  end: number,
  color: string
) {
console.log(section)
  let result = "";
  let currentIndex = 0;

  section.forEach((line:any) => {
    const lineStart = currentIndex;
    const lineEnd = currentIndex + line.length;

    if (start < lineEnd && end > lineStart) {

      const localStart = Math.max(0, start - lineStart);
      const localEnd = Math.min(line.length, end - lineStart);

      result += `<div>` +
        line.substring(0, localStart) +
        `<span style="background:${color}; display:inline-block;">` +
        line.substring(localStart, localEnd) +
        `</span>` +
        line.substring(localEnd) +
        `</div>`;
    } else {
      result += `<div>${line}</div>`;
    }

    currentIndex += line.length + 1;
  });

  return this.sanitizer.bypassSecurityTrustHtml(result);
}



@ViewChild('leftPanel') leftPanel!: ElementRef;
@ViewChild('rightPanel') rightPanel!: ElementRef;

syncing = false;

syncScroll(side: 'left' | 'right') {
  if (this.syncing) return;

  this.syncing = true;

  if (side === 'left') {
    this.rightPanel.nativeElement.scrollTop = this.leftPanel.nativeElement.scrollTop;
  } else {
    this.leftPanel.nativeElement.scrollTop = this.rightPanel.nativeElement.scrollTop;
  }

  this.syncing = false;
}
onSelection(event: any) {
  const textarea = event.target;
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selected = textarea.value.substring(start, end);
  this.rules.push(selected)
  this.checkRulesInSections();
  
}

   getLineNumber(text: string, index: number): number {
  let line = 1;
  for (let i = 0; i < index; i++) {
    if (text[i] === '\n') {
      line++;
    }
  }
  return line;
}

}
