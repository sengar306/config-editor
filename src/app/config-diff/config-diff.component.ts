import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-config-diff',
  templateUrl: './config-diff.component.html',
  styleUrls: ['./config-diff.component.css']
})
export class ConfigDiffComponent implements OnInit {
  sections: any=[]
  rules:any[]=[]
  intendedconfig: any[]=[]
  actual: any[]=[]
  matched: any=[]
  selectedSection: any;
ngOnInit(): void {
    this.findSection(this.feature)

}
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
checkRulesInSections() { 
  this.actual = this.actualText.split("\n");
  let selectedSection: any = null;
  this.sections = this.sections.map((section: any) => {  
  const matchedRules: string[] = [];
  this.rules.forEach(rule => {
  const found = section.block.toLowerCase().trim().includes(rule.toLowerCase().trim());
      if (found) {
        matchedRules.push(rule);
        selectedSection = section;
        console.log(selectedSection)
      }
    });

    return {
      ...section,
      matchedRules,
      hasRule: matchedRules.length > 0
    };
  });

  if (!selectedSection) {
    console.warn("No section found");
    return;
  }

  this.selectedSection = selectedSection;
console.log(selectedSection)
  const intendedLines = this.intendedText.split("\n");
  const totalLines = this.actual.length;

  const topBlank    = Array(selectedSection.start - 1).fill("");
  const bottomBlank = Array(totalLines - selectedSection.end).fill("");

  // not using rule index
  this.intendedconfig = [
    ...topBlank,
    ...intendedLines,
    ...bottomBlank
  ];

  console.log("SELECTED:", selectedSection);
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

   
}
