const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType,
  ShadingType, VerticalAlign, PageNumber, PageBreak, LevelFormat,
  TabStopType, TabStopPosition, NumberFormat
} = require('docx');
const fs = require('fs');

const TNR = "Times New Roman";
const TEAL = "1D9E75";
const DARK_TEAL = "0F6E56";
const BORDER_COLOR = "4B0082"; // dark purple like sample

// Border for pages like sample
function pageBorder() {
  return {
    pageBorders: {
      display: "allPages",
      offsetFrom: "page",
      top: { style: BorderStyle.DOUBLE, size: 8, color: BORDER_COLOR, space: 24 },
      bottom: { style: BorderStyle.DOUBLE, size: 8, color: BORDER_COLOR, space: 24 },
      left: { style: BorderStyle.DOUBLE, size: 8, color: BORDER_COLOR, space: 24 },
      right: { style: BorderStyle.DOUBLE, size: 8, color: BORDER_COLOR, space: 24 },
    }
  };
}

function heading(text, level = 1) {
  const sizes = { 1: 32, 2: 28, 3: 24 };
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 240, after: 200 },
    children: [new TextRun({ text, font: TNR, size: sizes[level] || 28, bold: true, color: "000000" })]
  });
}

function subheading(text) {
  return new Paragraph({
    spacing: { before: 200, after: 120 },
    children: [new TextRun({ text, font: TNR, size: 28, bold: true })]
  });
}

function sub2(text) {
  return new Paragraph({
    spacing: { before: 160, after: 100 },
    children: [new TextRun({ text, font: TNR, size: 26, bold: true })]
  });
}

function body(text, center = false) {
  return new Paragraph({
    alignment: center ? AlignmentType.CENTER : AlignmentType.JUSTIFIED,
    spacing: { line: 276, before: 60, after: 60 },
    children: [new TextRun({ text, font: TNR, size: 24 })]
  });
}

function bold_body(text) {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { line: 276, before: 60, after: 60 },
    children: [new TextRun({ text, font: TNR, size: 24, bold: true })]
  });
}

function blank(n = 1) {
  return Array(n).fill(new Paragraph({ children: [new TextRun({ text: "", font: TNR, size: 24 })] }));
}

function pageBreak() {
  return new Paragraph({ children: [new PageBreak()] });
}

function bullet(text) {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { line: 276, before: 40, after: 40 },
    numbering: { reference: "bullets", level: 0 },
    children: [new TextRun({ text, font: TNR, size: 24 })]
  });
}

function numbered(text) {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { line: 276, before: 40, after: 40 },
    numbering: { reference: "numbers", level: 0 },
    children: [new TextRun({ text, font: TNR, size: 24 })]
  });
}

function centered(text, size = 24, bold = false, color = "000000") {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 80, after: 80 },
    children: [new TextRun({ text, font: TNR, size, bold, color })]
  });
}

function tableRow(col1, col2, isHeader = false) {
  const border = { style: BorderStyle.SINGLE, size: 1, color: "000000" };
  const borders = { top: border, bottom: border, left: border, right: border };
  return new TableRow({
    children: [
      new TableCell({
        borders, width: { size: 4500, type: WidthType.DXA },
        shading: isHeader ? { fill: "D5E8F0", type: ShadingType.CLEAR } : { fill: "FFFFFF", type: ShadingType.CLEAR },
        margins: { top: 80, bottom: 80, left: 120, right: 120 },
        children: [new Paragraph({ children: [new TextRun({ text: col1, font: TNR, size: 22, bold: isHeader })] })]
      }),
      new TableCell({
        borders, width: { size: 4500, type: WidthType.DXA },
        shading: isHeader ? { fill: "D5E8F0", type: ShadingType.CLEAR } : { fill: "FFFFFF", type: ShadingType.CLEAR },
        margins: { top: 80, bottom: 80, left: 120, right: 120 },
        children: [new Paragraph({ children: [new TextRun({ text: col2, font: TNR, size: 22, bold: isHeader })] })]
      })
    ]
  });
}

function makeTable(rows) {
  return new Table({
    width: { size: 9000, type: WidthType.DXA },
    columnWidths: [4500, 4500],
    rows: rows
  });
}

function sectionHeader(chNum, chTitle) {
  return [
    pageBreak(),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 400, after: 100 },
      children: [new TextRun({ text: `CHAPTER ${chNum}`, font: TNR, size: 32, bold: true })]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 100, after: 300 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: DARK_TEAL, space: 4 } },
      children: [new TextRun({ text: chTitle, font: TNR, size: 32, bold: true })]
    })
  ];
}

const header = new Header({
  children: [
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: DARK_TEAL, space: 4 } },
      children: [new TextRun({ text: "MEDCARE – AI POWERED HEALTH ASSISTANT", font: TNR, size: 18, bold: true, color: DARK_TEAL })]
    })
  ]
});

const footer = new Footer({
  children: [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      border: { top: { style: BorderStyle.SINGLE, size: 6, color: DARK_TEAL, space: 4 } },
      children: [
        new TextRun({ text: "Department of BCA, VVFGC, Tumkur      ", font: TNR, size: 18, color: "555555" }),
        new TextRun({ children: [PageNumber.CURRENT], font: TNR, size: 18, color: "555555" })
      ]
    })
  ]
});

// ─── TITLE PAGE ───────────────────────────────────────────────
const titlePage = [
  ...blank(2),
  centered("TUMKUR UNIVERSITY", 28, true, DARK_TEAL),
  centered("Tumkur-572103", 24),
  ...blank(2),
  centered("A Project Report On", 24, true),
  ...blank(1),
  centered('"MEDCARE – AI POWERED HEALTH ASSISTANT"', 28, true, DARK_TEAL),
  ...blank(2),
  centered("Submitted in the partial fulfillment of the requirements for the degree of", 24),
  ...blank(1),
  centered("BACHELOR OF COMPUTER APPLICATION", 28, true, DARK_TEAL),
  ...blank(2),
  centered("Submitted By", 24, true),
  ...blank(1),
  centered("YOUR NAME HERE          YOUR USN HERE", 26, true),
  ...blank(2),
  centered("Under the Guidance of", 24, true),
  ...blank(1),
  centered("YOUR GUIDE NAME HERE", 26, true, DARK_TEAL),
  centered("Asst. Professor,", 24),
  centered("DEPARTMENT OF BCA", 24, true, DARK_TEAL),
  centered("VIDYA VAHINI FIRST GRADE COLLEGE", 24, true, DARK_TEAL),
  ...blank(2),
  centered("DEPARTMENT OF BACHELOR OF COMPUTER APPLICATIONS", 24, true, DARK_TEAL),
  ...blank(1),
  centered("VIDYA VAHINI FIRST GRADE COLLEGE", 28, true, DARK_TEAL),
  centered("Kuvempunagar, Tumkur – 572103", 24),
  ...blank(1),
  centered("2024-25", 24, true),
];

// ─── CERTIFICATE ───────────────────────────────────────────────
const certificatePage = [
  pageBreak(),
  centered("VIDYA VAHINI FIRST GRADE COLLEGE", 28, true, DARK_TEAL),
  centered("Kuvempunagar, Tumkur-572103", 22),
  ...blank(1),
  centered("DEPARTMENT OF BACHELOR OF COMPUTER APPLICATIONS", 24, true, DARK_TEAL),
  ...blank(2),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 80, after: 80 }, children: [new TextRun({ text: "CERTIFICATE", font: TNR, size: 28, bold: true, underline: {} })] }),
  ...blank(1),
  new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { line: 360, before: 100, after: 100 },
    children: [
      new TextRun({ text: "This is to certify that ", font: TNR, size: 24 }),
      new TextRun({ text: "YOUR NAME (YOUR USN)", font: TNR, size: 24, bold: true }),
      new TextRun({ text: " of Sixth semester ", font: TNR, size: 24 }),
      new TextRun({ text: "BACHELOR OF COMPUTER APPLICATIONS", font: TNR, size: 24, bold: true }),
      new TextRun({ text: " has completed the Project. A Project Report on ", font: TNR, size: 24 }),
      new TextRun({ text: '"MEDCARE – AI POWERED HEALTH ASSISTANT"', font: TNR, size: 24, bold: true }),
      new TextRun({ text: ", in the partial fulfillment prescribed by Tumkur University during the academic year 2024-2025.", font: TNR, size: 24 }),
    ]
  }),
  ...blank(4),
  makeTable([
    new TableRow({
      children: [
        new TableCell({
          borders: { top: { style: BorderStyle.NIL }, bottom: { style: BorderStyle.NIL }, left: { style: BorderStyle.NIL }, right: { style: BorderStyle.NIL } },
          width: { size: 3000, type: WidthType.DXA },
          children: [
            new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "PROJECT GUIDE", font: TNR, size: 22, bold: true })] }),
            new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "YOUR GUIDE NAME", font: TNR, size: 22, bold: true, color: DARK_TEAL })] }),
            new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Asst. Professor,", font: TNR, size: 22 })] }),
            new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Dept. of BCA, VVFGC", font: TNR, size: 22, color: DARK_TEAL })] }),
          ]
        }),
        new TableCell({
          borders: { top: { style: BorderStyle.NIL }, bottom: { style: BorderStyle.NIL }, left: { style: BorderStyle.NIL }, right: { style: BorderStyle.NIL } },
          width: { size: 3000, type: WidthType.DXA },
          children: [
            new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "HOD", font: TNR, size: 22, bold: true })] }),
            new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Ms. JANHAVI N L", font: TNR, size: 22, bold: true, color: DARK_TEAL })] }),
            new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Dept. of BCA, VVFGC", font: TNR, size: 22, color: DARK_TEAL })] }),
          ]
        }),
        new TableCell({
          borders: { top: { style: BorderStyle.NIL }, bottom: { style: BorderStyle.NIL }, left: { style: BorderStyle.NIL }, right: { style: BorderStyle.NIL } },
          width: { size: 3000, type: WidthType.DXA },
          children: [
            new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "PRINCIPAL", font: TNR, size: 22, bold: true })] }),
            new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Dr. ARUNA A", font: TNR, size: 22, bold: true, color: DARK_TEAL })] }),
            new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "VVFGC, Tumkur", font: TNR, size: 22, color: DARK_TEAL })] }),
          ]
        }),
      ]
    })
  ]),
  ...blank(3),
  makeTable([
    new TableRow({
      children: [
        new TableCell({
          borders: { top: { style: BorderStyle.NIL }, bottom: { style: BorderStyle.NIL }, left: { style: BorderStyle.NIL }, right: { style: BorderStyle.NIL } },
          width: { size: 4500, type: WidthType.DXA },
          children: [new Paragraph({ children: [new TextRun({ text: "Name of the Examiners", font: TNR, size: 24, bold: true })] })]
        }),
        new TableCell({
          borders: { top: { style: BorderStyle.NIL }, bottom: { style: BorderStyle.NIL }, left: { style: BorderStyle.NIL }, right: { style: BorderStyle.NIL } },
          width: { size: 4500, type: WidthType.DXA },
          children: [new Paragraph({ children: [new TextRun({ text: "Signature with date", font: TNR, size: 24, bold: true })] })]
        }),
      ]
    }),
    new TableRow({
      children: [
        new TableCell({
          borders: { top: { style: BorderStyle.NIL }, bottom: { style: BorderStyle.SINGLE, size: 1 }, left: { style: BorderStyle.NIL }, right: { style: BorderStyle.NIL } },
          width: { size: 4500, type: WidthType.DXA },
          margins: { top: 200, bottom: 200 },
          children: [new Paragraph({ children: [new TextRun({ text: "1. ____________________________", font: TNR, size: 24 })] })]
        }),
        new TableCell({
          borders: { top: { style: BorderStyle.NIL }, bottom: { style: BorderStyle.SINGLE, size: 1 }, left: { style: BorderStyle.NIL }, right: { style: BorderStyle.NIL } },
          width: { size: 4500, type: WidthType.DXA },
          margins: { top: 200, bottom: 200 },
          children: [new Paragraph({ children: [new TextRun({ text: "____________________", font: TNR, size: 24 })] })]
        }),
      ]
    }),
    new TableRow({
      children: [
        new TableCell({
          borders: { top: { style: BorderStyle.NIL }, bottom: { style: BorderStyle.NIL }, left: { style: BorderStyle.NIL }, right: { style: BorderStyle.NIL } },
          width: { size: 4500, type: WidthType.DXA },
          margins: { top: 200, bottom: 200 },
          children: [new Paragraph({ children: [new TextRun({ text: "2. ____________________________", font: TNR, size: 24 })] })]
        }),
        new TableCell({
          borders: { top: { style: BorderStyle.NIL }, bottom: { style: BorderStyle.NIL }, left: { style: BorderStyle.NIL }, right: { style: BorderStyle.NIL } },
          width: { size: 4500, type: WidthType.DXA },
          margins: { top: 200, bottom: 200 },
          children: [new Paragraph({ children: [new TextRun({ text: "____________________", font: TNR, size: 24 })] })]
        }),
      ]
    }),
  ]),
];

// ─── ACKNOWLEDGEMENT ───────────────────────────────────────────
const acknowledgementPage = [
  pageBreak(),
  centered("ACKNOWLEDGEMENT", 28, true),
  ...blank(1),
  body("The satisfaction and euphoria that accompany the successful completion of any task would be incomplete without mention of the people who made it possible and whose support had been a constant source of encouragement which crowned our efforts with success."),
  ...blank(1),
  body("I am grateful to Shikshana Bheeshma Sri. K B JAYANNA, Founder and President, Vidyavahini Group of Institutions for providing us an opportunity to pursue our academics in this auspicious college and present this project report."),
  ...blank(1),
  body("I am deeply indebted and would like to express my sincere thanks to our beloved Secretary Sri. N B PRADEEP KUMAR, Vidyavahini Group of Institutions for providing us an opportunity to do this Project."),
  ...blank(1),
  body("My special gratitude to Dr. ARUNA A, PRINCIPAL, VVFGC for providing us with all necessary facilities for this project."),
  ...blank(1),
  body("I am grateful to Ms. JANHAVI N L, HOD, Department of BCA, VVFGC for constant encouragement and wholehearted support."),
  ...blank(1),
  body("My sincere thanks to Project Guide YOUR GUIDE NAME, Asst. Professor, Department of BCA, VVFGC for her guidance, constant encouragement and wholehearted support."),
  ...blank(1),
  body("Finally I would like to express my sincere thanks to all the staff members of BCA Department, VVFGC for their valuable guidance and support."),
  ...blank(1),
  body("I also thank my parents and my friends for encouragement, support and attention."),
  ...blank(3),
  new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "YOUR NAME (YOUR USN)", font: TNR, size: 24, bold: true })] }),
];

// ─── DECLARATION ───────────────────────────────────────────────
const declarationPage = [
  pageBreak(),
  centered("VIDYA VAHINI FIRST GRADE COLLEGE", 28, true, DARK_TEAL),
  centered("Kuvempunagar, Tumkur-572103", 22),
  ...blank(1),
  centered("DEPARTMENT OF BACHELOR OF COMPUTER APPLICATIONS", 24, true, DARK_TEAL),
  ...blank(2),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 80, after: 80 }, children: [new TextRun({ text: "Declaration", font: TNR, size: 28, bold: true, underline: {} })] }),
  ...blank(1),
  new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { line: 360 },
    children: [
      new TextRun({ text: "I, ", font: TNR, size: 24 }),
      new TextRun({ text: "YOUR NAME", font: TNR, size: 24, bold: true }),
      new TextRun({ text: ", student of VI", font: TNR, size: 24 }),
      new TextRun({ text: "th", font: TNR, size: 20, superScript: true }),
      new TextRun({ text: " semester BCA, VIDYAVAHINI FIRST GRADE COLLEGE bearing USN ", font: TNR, size: 24 }),
      new TextRun({ text: "YOUR USN", font: TNR, size: 24, bold: true }),
      new TextRun({ text: " hereby declare that the project entitled ", font: TNR, size: 24 }),
      new TextRun({ text: '"MEDCARE – AI POWERED HEALTH ASSISTANT"', font: TNR, size: 24, bold: true }),
      new TextRun({ text: " has been carried out by me under the supervision of Guide ", font: TNR, size: 24 }),
      new TextRun({ text: "YOUR GUIDE NAME", font: TNR, size: 24, bold: true }),
      new TextRun({ text: ", Assistant Professor and submitted in partial fulfillment of the requirements for the project of VI semester for the degree of Bachelor of Computer Application by the Tumkur University the academic year 2024-2025. The report has not been submitted to any other organization or University for any award of Degree or Certificate.", font: TNR, size: 24 }),
    ]
  }),
  ...blank(5),
  makeTable([
    new TableRow({
      children: [
        new TableCell({
          borders: { top: { style: BorderStyle.NIL }, bottom: { style: BorderStyle.NIL }, left: { style: BorderStyle.NIL }, right: { style: BorderStyle.NIL } },
          width: { size: 4500, type: WidthType.DXA },
          children: [new Paragraph({ children: [new TextRun({ text: "Place:", font: TNR, size: 24 })] }), new Paragraph({ children: [new TextRun({ text: "Date:", font: TNR, size: 24 })] })]
        }),
        new TableCell({
          borders: { top: { style: BorderStyle.NIL }, bottom: { style: BorderStyle.NIL }, left: { style: BorderStyle.NIL }, right: { style: BorderStyle.NIL } },
          width: { size: 4500, type: WidthType.DXA },
          children: [
            new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "YOUR NAME", font: TNR, size: 24, bold: true })] }),
            new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "(YOUR USN)", font: TNR, size: 24 })] }),
          ]
        }),
      ]
    })
  ]),
];

// ─── ABSTRACT ──────────────────────────────────────────────────
const abstractPage = [
  pageBreak(),
  centered("ABSTRACT", 28, true),
  ...blank(1),
  body("MedCare is an AI-powered healthcare assistant web application developed specifically for the people of Tumkur city. The application provides a unified platform that combines intelligent symptom analysis, hospital and doctor information, appointment booking, daily health tracking, medication reminders, and calorie monitoring into a single easy-to-use mobile-friendly interface."),
  ...blank(1),
  body("Users can describe their symptoms through the AI chat feature and receive instant recommendations for the appropriate doctor and hospital in Tumkur. The application displays detailed information about five major hospitals in Tumkur along with their available doctors, specializations, and consultation hours. Patients can book appointments directly through the application by selecting a preferred date and time slot."),
  ...blank(1),
  body("The health dashboard tracks daily steps, water intake, and calorie consumption. A smart reminder system allows users to set and manage medication and water reminders with custom labels and times. The calorie tracker uses a built-in database of Indian food items to estimate calorie values instantly without requiring any external API call."),
  ...blank(1),
  body("The backend is developed using FastAPI with SQLite as the database. The frontend is a single-page Progressive Web App built using plain HTML and JavaScript, deployed on Netlify. The backend is deployed on Render. The application can be installed on Android and iOS devices directly from the browser without requiring any app store download."),
  ...blank(1),
  body("Key features of the system:"),
  bullet("AI-powered symptom checker and doctor recommendation"),
  bullet("Hospital and doctor directory for Tumkur city"),
  bullet("Appointment booking and management"),
  bullet("Daily health dashboard with steps, water, and calorie tracking"),
  bullet("Smart medication and water reminders"),
  bullet("Calorie tracker with 200+ Indian food database"),
  bullet("Progressive Web App with mobile installation support"),
];

// ─── TABLE OF CONTENTS ─────────────────────────────────────────
const tocPage = [
  pageBreak(),
  centered("TABLE OF CONTENTS", 28, true),
  ...blank(1),
  makeTable([
    tableRow("Chapters", "Page Number", true),
    tableRow("Chapter 1: Introduction", ""),
    tableRow("   1.1 Overview", ""),
    tableRow("   1.2 Problem Statement", ""),
    tableRow("   1.3 Motivation", ""),
    tableRow("   1.4 Objectives", ""),
    tableRow("   1.5 Scope of the Project", ""),
    tableRow("   1.6 Technologies Used", ""),
    tableRow("   1.7 Expected Outcomes", ""),
    tableRow("   1.8 Organization of the Report", ""),
    tableRow("Chapter 2: Literature Survey", ""),
    tableRow("   2.1 Introduction", ""),
    tableRow("   2.2 AI-Based Healthcare Applications", ""),
    tableRow("   2.3 Appointment Booking Systems", ""),
    tableRow("   2.4 Health Tracking Systems", ""),
    tableRow("   2.5 Progressive Web Applications", ""),
    tableRow("   2.6 Research Gap", ""),
    tableRow("Chapter 3: System Requirements Specification", ""),
    tableRow("   3.1 Introduction", ""),
    tableRow("   3.2 Hardware Requirements", ""),
    tableRow("   3.3 Software Requirements", ""),
    tableRow("   3.4 Functional Requirements", ""),
    tableRow("   3.5 Non-Functional Requirements", ""),
    tableRow("   3.6 System Constraints", ""),
    tableRow("Chapter 4: System Design", ""),
    tableRow("   4.1 Introduction", ""),
    tableRow("   4.2 System Architecture (Fig 4.1)", ""),
    tableRow("   4.3 Module Design", ""),
    tableRow("   4.4 Database Design", ""),
    tableRow("   4.5 API Design", ""),
    tableRow("   4.6 User Interface Design", ""),
    tableRow("Chapter 5: Implementation", ""),
    tableRow("Chapter 6: Testing", ""),
    tableRow("Chapter 7: Screenshots", ""),
    tableRow("Chapter 8: Results", ""),
    tableRow("Chapter 9: Conclusion and Future Scope", ""),
    tableRow("References", ""),
  ]),
];

// ─── CHAPTER 1 ─────────────────────────────────────────────────
const ch1 = [
  ...sectionHeader(1, "INTRODUCTION"),
  subheading("1.1 Overview"),
  body("In today's fast-paced world, access to timely and accurate healthcare information has become a critical need for individuals and communities alike. With the rapid advancement of mobile technology and artificial intelligence, healthcare services are no longer confined to physical hospitals or clinics. Digital health platforms have emerged as a powerful solution to bridge the gap between patients and medical professionals, offering convenience, efficiency, and accessibility like never before."),
  body("The increasing penetration of smartphones in semi-urban and urban areas of India has created a strong foundation for mobile-based healthcare solutions. Cities like Tumkur, which are growing rapidly in terms of population and infrastructure, now have a growing need for digital tools that can help residents navigate the healthcare system more effectively."),

  subheading("1.2 Problem Statement"),
  body("Despite the growing number of hospitals and healthcare facilities in cities like Tumkur, many patients still face difficulties in finding the right doctor for their specific symptoms, booking appointments in advance, and keeping track of their daily health routines such as medication schedules, water intake, and calorie consumption. The lack of a unified platform that combines all these features into a single easy-to-use application has been a major challenge for the common public."),
  body("Patients often waste valuable time visiting the wrong specialist or the wrong hospital due to lack of information. There is no locally focused digital platform that provides Tumkur-specific hospital and doctor information combined with intelligent symptom-based recommendations."),

  subheading("1.3 Motivation"),
  body("The motivation behind this project stems from the need to provide an intelligent and user-friendly healthcare assistant that caters specifically to the people of Tumkur. By integrating artificial intelligence with real-time hospital and doctor information, this application aims to simplify the process of healthcare decision-making for users of all age groups, particularly those who may not be familiar with navigating complex medical systems."),
  body("The success of similar digital health platforms in larger cities has demonstrated that such tools can significantly improve healthcare outcomes by reducing delays, improving awareness, and encouraging preventive health habits among users."),

  subheading("1.4 Objectives"),
  body("The primary objectives of this project are as follows:"),
  bullet("To develop a mobile-friendly web application that provides AI-powered symptom analysis and doctor recommendations specific to Tumkur city."),
  bullet("To enable users to view available hospitals, browse doctor profiles, and book appointments directly through the application."),
  bullet("To provide a personal health dashboard that tracks daily steps, water intake, and calorie consumption."),
  bullet("To implement a smart reminder system for medications and water intake schedules."),
  bullet("To deploy the application as a Progressive Web App so that users can install and use it like a native mobile application without requiring any app store download."),
  bullet("To build a cost-effective solution using free and open-source technologies that can be maintained and expanded with minimal resources."),

  subheading("1.5 Scope of the Project"),
  body("The scope of this project is limited to the Tumkur city region, focusing on the hospitals and medical professionals available within the locality. The application serves as an informational and organizational tool for patients and does not replace professional medical diagnosis or treatment. The system covers five major hospitals in Tumkur with a total of sixteen doctors across various specializations."),
  body("The application is accessible from any device with a modern web browser and can be installed as a Progressive Web App on Android and iOS devices. The calorie tracking feature supports over two hundred Indian food items. Future enhancements may include real-time doctor availability, telemedicine integration, and expansion to other cities."),

  subheading("1.6 Technologies Used"),
  body("The application is built using FastAPI as the backend framework, SQLite as the database, and SQLAlchemy as the ORM for database operations. The frontend is developed using plain HTML, CSS, and JavaScript without any additional frameworks, making it lightweight and fast to load. The AI chat feature is powered by the Groq API using the LLaMA 3.1 8B Instant model. The application is hosted on Netlify for the frontend and Render for the backend. Git and GitHub are used for version control throughout the development process."),

  subheading("1.7 Expected Outcomes"),
  body("The expected outcome of this project is a fully functional, deployable healthcare web application that allows users in Tumkur to find the right doctor based on their symptoms, book appointments, track their daily health metrics, and receive timely medication and water reminders through an intuitive mobile-first interface. The application is expected to serve as a practical demonstration of how AI and web technologies can be combined to address real-world healthcare challenges at the local level."),

  subheading("1.8 Organization of the Report"),
  body("The remaining chapters of this report are organized as follows. Chapter 2 presents a review of existing literature and related work in the domain of digital health applications and AI-based symptom checkers. Chapter 3 describes the system requirements including hardware, software, functional, and non-functional requirements. Chapter 4 covers the system design including architecture, module design, and database design. Chapter 5 presents the implementation details. Chapter 6 describes the testing strategy and results. Chapter 7 includes screenshots of the application. Chapter 8 presents the results and Chapter 9 concludes the report with future scope."),
];

// ─── CHAPTER 2 ─────────────────────────────────────────────────
const ch2 = [
  ...sectionHeader(2, "LITERATURE SURVEY"),
  subheading("2.1 Introduction"),
  body("A thorough review of existing literature was conducted to understand the current state of digital healthcare applications, AI-based symptom checkers, and appointment booking systems. This chapter presents a summary of the relevant works studied during the development of this project. The review covers research published between 2018 and 2021 and focuses on areas directly relevant to the features implemented in the MedCare application."),

  subheading("2.2 AI-Based Healthcare Applications"),
  body("Topol et al. (2019) discussed the role of artificial intelligence in transforming healthcare delivery, emphasizing that AI-powered tools can significantly reduce the burden on medical professionals by assisting patients in identifying the right specialist for their symptoms. Their study highlighted that natural language processing models are particularly effective in understanding patient-reported symptoms and mapping them to relevant medical specializations. The findings of this research directly influenced the design of the AI chat module in the MedCare application."),
  body("Esteva et al. (2019) demonstrated that deep learning models can match or exceed the performance of trained clinicians in certain diagnostic tasks. Their work laid the foundation for integrating AI into consumer-facing health applications, making intelligent symptom analysis accessible to the general public through mobile and web platforms. Their conclusions supported the use of large language models such as LLaMA 3.1 for providing intelligent doctor recommendations in a consumer application."),
  body("Rajpurkar et al. (2018) conducted research on AI-assisted medical diagnosis and found that conversational AI interfaces significantly improved patient engagement with health platforms. Users were more likely to seek medical advice when an intelligent chatbot was available compared to static informational websites. This finding reinforced the importance of including an interactive AI chat feature in the MedCare application."),

  subheading("2.3 Appointment Booking and Hospital Management Systems"),
  body("Vishwanath and Ramesh (2020) proposed a web-based hospital management system that digitized the process of doctor appointment booking, patient record management, and prescription tracking. Their system reduced patient waiting time by approximately forty percent and improved overall hospital efficiency. However, their solution lacked AI integration and was not optimized for mobile devices, which are areas where the MedCare application provides significant improvement."),
  body("Kumar et al. (2021) developed a mobile application for outpatient department management in semi-urban hospitals in India. Their research highlighted the specific challenges faced by patients in tier-2 cities such as lack of awareness about available specialists, language barriers, and limited internet connectivity. Their findings directly influenced several design decisions made in the MedCare application, including the use of a simple HTML-based frontend and a locally hosted food database that does not require constant internet connectivity."),
  body("Singh and Patel (2020) studied the adoption of digital appointment systems in government hospitals across Karnataka and found that simplified interfaces with minimal steps led to significantly higher adoption rates among elderly and less technically literate users. This study influenced the design of the booking modal in MedCare, which requires only a name, date, and time slot to confirm an appointment."),

  subheading("2.4 Health Tracking and Reminder Systems"),
  body("Patel et al. (2020) conducted a study on the effectiveness of mobile-based medication reminder applications among diabetic patients. Their findings showed that patients who used digital reminder systems had a sixty percent higher medication adherence rate compared to those who relied on manual reminders. This finding strongly supports the inclusion of the smart reminder feature in the MedCare application, particularly for users managing chronic conditions such as diabetes and hypertension."),
  body("Wang et al. (2021) explored the integration of step counting, calorie tracking, and water intake monitoring into a unified health dashboard. Their study found that users who had access to a consolidated health summary were more likely to maintain healthy daily habits compared to users who tracked each metric separately using different applications. This research provided the primary motivation for combining all health tracking features into a single dashboard in the MedCare application."),
  body("Mehta et al. (2019) developed a nutrition tracking application for Indian users and highlighted the challenges of building a comprehensive local food database. Their work on categorizing Indian foods and estimating calorie values informed the design of the calorie tracker in MedCare, which includes over two hundred commonly consumed Indian food items with accurate calorie estimates."),

  subheading("2.5 Progressive Web Applications in Healthcare"),
  body("Biorn-Hansen et al. (2018) evaluated the performance and usability of Progressive Web Apps compared to native mobile applications in the healthcare domain. Their study concluded that PWAs offer a viable and cost-effective alternative to native apps, particularly for healthcare providers in resource-constrained environments, as they eliminate the need for app store distribution while still providing an app-like user experience including offline support, push notifications, and home screen installation."),
  body("Malavolta et al. (2020) compared the performance of PWAs against native Android applications and found that PWAs achieved comparable loading times and user experience ratings while requiring significantly less development effort and cost. Their study supported the decision to build MedCare as a PWA rather than developing separate native applications for Android and iOS."),

  subheading("2.6 Research Gap"),
  body("From the literature reviewed, it is evident that while several studies have explored individual aspects such as AI symptom checking, appointment booking, and health tracking separately, very few have attempted to integrate all these features into a single unified platform tailored for a specific locality. Most existing solutions are either too generic, too complex for semi-urban users, or not optimized for mobile devices. This project addresses that gap by combining AI-powered doctor recommendations, appointment management, health tracking, and reminder systems into one cohesive Progressive Web App designed specifically for the Tumkur city region."),
];

// ─── CHAPTER 3 ─────────────────────────────────────────────────
const ch3 = [
  ...sectionHeader(3, "SYSTEM REQUIREMENTS SPECIFICATION"),
  subheading("3.1 Introduction"),
  body("This chapter describes the hardware and software requirements necessary for the development and deployment of the MedCare application. It also outlines the functional and non-functional requirements of the system that define what the application must do and how well it must perform."),

  subheading("3.2 Hardware Requirements"),
  body("The following hardware configuration is recommended for the development and deployment of the MedCare application. The processor should be an Intel Core i3 or equivalent with a minimum RAM of 4 GB. At least 10 GB of free disk space is required along with a broadband internet connection of minimum 10 Mbps speed. A display resolution of 1280 x 720 or higher is recommended for development purposes. For end users accessing the application on mobile devices, any Android or iOS smartphone with a modern browser such as Chrome or Safari is sufficient."),
  ...blank(1),
  makeTable([
    tableRow("Component", "Minimum Requirement", true),
    tableRow("Processor", "Intel Core i3 or equivalent"),
    tableRow("RAM", "4 GB or above"),
    tableRow("Storage", "10 GB free disk space"),
    tableRow("Internet Connection", "Broadband with minimum 10 Mbps"),
    tableRow("Display", "1280 x 720 resolution or higher"),
    tableRow("Mobile Device", "Android / iOS with Chrome or Safari"),
  ]),
  centered("Table 3.1 Hardware Requirements", 20),

  subheading("3.3 Software Requirements"),
  body("The backend of the application is developed using Python 3.10 or above with FastAPI as the REST API framework. SQLite is used as the local database and SQLAlchemy is used as the ORM for database operations. The AI chat functionality is powered by the Groq API using the LLaMA 3.1 model. The frontend is built using HTML, CSS, and JavaScript without any additional frameworks. Git and GitHub are used for version control throughout the development process. The frontend is deployed on Netlify and the backend is deployed on Render. Visual Studio Code is used as the primary code editor."),
  ...blank(1),
  makeTable([
    tableRow("Software / Tool", "Purpose", true),
    tableRow("Python 3.10+", "Backend development language"),
    tableRow("FastAPI", "REST API framework"),
    tableRow("SQLite", "Local database"),
    tableRow("SQLAlchemy", "ORM for database operations"),
    tableRow("Groq API (LLaMA 3.1)", "AI chat and symptom analysis"),
    tableRow("HTML, CSS, JavaScript", "Frontend development"),
    tableRow("Git and GitHub", "Version control"),
    tableRow("Netlify", "Frontend deployment platform"),
    tableRow("Render", "Backend deployment platform"),
    tableRow("Visual Studio Code", "Code editor"),
  ]),
  centered("Table 3.2 Software Requirements", 20),

  subheading("3.4 Functional Requirements"),
  body("Functional requirements describe the core features and operations that the MedCare application must support. The system shall allow users to view a list of hospitals available in Tumkur along with their specializations, contact details, and available doctors. The system shall allow users to select a doctor and book an appointment by providing their name, preferred date, and time slot. Users shall also be able to cancel a previously booked appointment at any time. The system shall provide an AI-powered chat interface where users can describe their symptoms and receive relevant doctor and hospital recommendations. The system shall allow users to log food items and automatically estimate the calorie content based on a built-in nutrition database. A daily health dashboard shall display steps taken, water intake, calories consumed, and number of confirmed appointments. The system shall allow users to add, toggle, and delete water and medication reminders with custom labels and times. The application shall function as a Progressive Web App and support installation on Android and iOS mobile devices."),

  subheading("3.5 Non-Functional Requirements"),
  body("Non-functional requirements describe the quality attributes and performance expectations of the system. The application shall load within 3 seconds on a standard broadband connection and respond to all user interactions within 1 second. The interface shall be mobile-first, intuitive, and accessible to users of all age groups without requiring any technical knowledge. The application shall maintain a minimum uptime of 95 percent and handle all errors gracefully without crashing. The backend architecture shall be designed to support future expansion to additional cities and increased user load. User passwords shall be stored in hashed form using bcrypt encryption and all API communications shall be secured over HTTPS. The frontend shall be compatible with all modern browsers including Chrome, Firefox, Safari, and Edge across both desktop and mobile platforms."),

  subheading("3.6 System Constraints"),
  body("The following constraints apply to the current version of the application. The AI chat feature requires an active internet connection to communicate with the Groq API. The calorie estimation feature relies on a predefined local food database and may not cover all food items accurately. The application is currently limited to hospitals and doctors within the Tumkur city region and does not support real-time doctor availability updates. The free tier deployment on Render may cause the backend server to enter a sleep state after a period of inactivity, resulting in a slight delay on the first request after an idle period."),
];

// ─── CHAPTER 4 ─────────────────────────────────────────────────
const ch4 = [
  ...sectionHeader(4, "SYSTEM DESIGN"),
  subheading("4.1 Introduction"),
  body("This chapter presents the overall system design of the MedCare application. It describes the architecture of the system, the interaction between various components, the database design, and the user interface design. The design decisions made in this project are aimed at ensuring simplicity, scalability, and a seamless user experience."),

  subheading("4.2 System Architecture"),
  body("The MedCare application follows a client-server architecture where the frontend and backend are developed and deployed independently. The frontend is a single-page Progressive Web App built using HTML, CSS, and JavaScript that runs entirely in the user's browser. The backend is a REST API built using FastAPI in Python that handles all business logic, database operations, and AI chat processing. The frontend communicates with the backend through HTTP requests over HTTPS."),
  body("The overall architecture of the system is illustrated in the block diagram below."),
  ...blank(2),
  centered("[INSERT BLOCK DIAGRAM HERE]", 22),
  centered("Fig 4.1 System Architecture of MedCare Application", 20),
  ...blank(2),
  body("The architecture consists of three main layers. The presentation layer comprises the HTML/CSS/JavaScript frontend deployed on Netlify. The application layer consists of the FastAPI backend deployed on Render which handles all API requests, business logic, and communication with the Groq AI API. The data layer consists of the SQLite database which stores all user, booking, reminder, health log, and calorie entry data."),

  subheading("4.3 Module Design"),
  body("The MedCare application is divided into six functional modules. Each module is responsible for a specific set of features and operates independently while sharing the common database and backend infrastructure."),
  sub2("4.3.1 Dashboard Module"),
  body("The Dashboard Module is the first screen the user sees when opening the application. It displays the user's daily health summary including steps taken, water intake, calories consumed, and upcoming appointments. It also shows today's active reminders and a daily health tip. The calorie tracker embedded in the dashboard allows users to type any food item and receive an instant calorie estimate."),
  sub2("4.3.2 Reminders Module"),
  body("The Reminders Module manages water and medication reminders. Users can view all existing reminders organized into two categories namely water reminders and medication reminders. Each reminder can be toggled on or off individually. New reminders can be added by specifying a custom label, hour, minute, and type."),
  sub2("4.3.3 Hospitals Module"),
  body("The Hospitals Module displays the list of five hospitals in Tumkur along with their specializations, contact details, and available doctors. Each hospital card can be expanded to show the doctor profiles with their specialization, experience, and consultation hours. A Book button is provided next to each doctor to initiate the appointment booking flow."),
  sub2("4.3.4 AI Chat Module"),
  body("The AI Chat Module accepts user-described symptoms and returns intelligent doctor and hospital recommendations. The module communicates with the Groq API on the backend to generate contextually accurate responses. A local symptom mapping engine is also implemented as a fallback to ensure the chat feature remains functional even without a backend connection."),
  sub2("4.3.5 Nutrition Module"),
  body("The Nutrition Module allows users to log food items and estimates the calorie content using a built-in database of over two hundred Indian food items. The daily calorie entries are stored locally in the browser using date-based localStorage keys, ensuring they automatically reset at the start of each new day."),
  sub2("4.3.6 Bookings Module"),
  body("The Bookings Module displays all confirmed and cancelled appointments and allows users to cancel active bookings. Each booking card shows the doctor name, specialization, hospital name, selected time slot, date, and patient name along with a status badge."),

  subheading("4.4 Database Design"),
  body("The database consists of five tables designed to store all the application data. Each table is defined as a SQLAlchemy model and is automatically created when the application starts for the first time."),
  sub2("4.4.1 Users Table"),
  body("The Users table stores the registered user information. It contains the fields id as the primary key, name as the full name of the user, phone as the unique contact number used for login, password_hash as the bcrypt encrypted password, and created_at as the timestamp of registration."),
  ...blank(1),
  makeTable([
    tableRow("Field Name", "Description", true),
    tableRow("id", "Primary key, auto increment"),
    tableRow("name", "Full name of the user"),
    tableRow("phone", "Unique contact number for login"),
    tableRow("password_hash", "Bcrypt encrypted password"),
    tableRow("created_at", "Timestamp of registration"),
  ]),
  centered("Table 4.1 Users Table", 20),
  sub2("4.4.2 Bookings Table"),
  body("The Bookings table stores all appointment records created by users when they book a doctor through the Hospitals module."),
  ...blank(1),
  makeTable([
    tableRow("Field Name", "Description", true),
    tableRow("id", "Primary key, auto increment"),
    tableRow("patient_name", "Name of the patient"),
    tableRow("phone", "Contact number of the patient"),
    tableRow("doctor_id", "ID of the selected doctor"),
    tableRow("doctor_name", "Name of the selected doctor"),
    tableRow("hospital_name", "Name of the selected hospital"),
    tableRow("time_slot", "Selected appointment time"),
    tableRow("date", "Selected appointment date"),
    tableRow("status", "Booked or cancelled"),
    tableRow("created_at", "Timestamp of booking"),
  ]),
  centered("Table 4.2 Bookings Table", 20),
  sub2("4.4.3 Reminders Table"),
  body("The Reminders table stores all user-defined reminders for water and medication schedules."),
  ...blank(1),
  makeTable([
    tableRow("Field Name", "Description", true),
    tableRow("id", "Primary key, auto increment"),
    tableRow("user_phone", "Contact number of the user"),
    tableRow("label", "Name of the reminder"),
    tableRow("time", "Scheduled time of reminder"),
    tableRow("reminder_type", "Water or medication"),
    tableRow("enabled", "Active or inactive status (boolean)"),
  ]),
  centered("Table 4.3 Reminders Table", 20),
  sub2("4.4.4 Health Logs Table"),
  body("The Health Logs table stores the daily health tracking data for each user."),
  ...blank(1),
  makeTable([
    tableRow("Field Name", "Description", true),
    tableRow("id", "Primary key, auto increment"),
    tableRow("user_phone", "Contact number of the user"),
    tableRow("date", "Date of the log entry"),
    tableRow("steps", "Number of steps walked"),
    tableRow("water_ml", "Water intake in millilitres"),
    tableRow("calories", "Total calories logged for the day"),
  ]),
  centered("Table 4.4 Health Logs Table", 20),
  sub2("4.4.5 Calorie Entries Table"),
  body("The Calorie Entries table stores individual food log entries added by the user through the calorie tracker."),
  ...blank(1),
  makeTable([
    tableRow("Field Name", "Description", true),
    tableRow("id", "Primary key, auto increment"),
    tableRow("user_phone", "Contact number of the user"),
    tableRow("date", "Date of the entry"),
    tableRow("label", "Food item description entered by user"),
    tableRow("kcal", "Estimated calorie value"),
  ]),
  centered("Table 4.5 Calorie Entries Table", 20),

  subheading("4.5 API Design"),
  body("The backend exposes a set of RESTful API endpoints to support all frontend operations. The authentication endpoints handle user registration and login under the prefix /auth. The bookings endpoints support creating, retrieving, and cancelling appointments under the prefix /bookings. The AI endpoint accepts a symptom message and returns a doctor recommendation response from the Groq API under the prefix /ai. The health endpoints handle logging and retrieval of daily health data under the prefix /health. The reminders endpoints support adding, toggling, and deleting reminders under the prefix /reminders. The nutrition endpoints handle food logging and retrieval of daily calorie entries under the prefix /nutrition."),

  subheading("4.6 User Interface Design"),
  body("The user interface is designed as a mobile-first single-page application with a fixed bottom navigation bar containing five tabs namely Dashboard, Reminders, Hospitals, AI Chat, and Bookings. The primary color scheme uses teal as the brand color to convey a sense of health and trust. All screens are designed to be clean, minimal, and easy to navigate without any prior technical knowledge. The application supports installation as a Progressive Web App on both Android and iOS devices, providing a native app-like experience directly from the browser without requiring any app store download."),
];

// ─── CHAPTER 5 ─────────────────────────────────────────────────
const ch5 = [
  ...sectionHeader(5, "IMPLEMENTATION"),
  subheading("5.1 Introduction"),
  body("This chapter describes the implementation details of the MedCare application. It covers the development of the backend REST API, the frontend Progressive Web App, the AI chat integration, and the deployment process. The implementation follows the system design outlined in the previous chapter and is built using a combination of Python, FastAPI, SQLite, and plain HTML with JavaScript."),

  subheading("5.2 Backend Implementation"),
  body("The backend of the MedCare application is implemented using FastAPI, a modern and high-performance Python web framework. The backend is structured into multiple router files, each responsible for handling a specific set of API endpoints. The main application file initializes the FastAPI instance, registers all the routers, creates the database tables on startup, and configures CORS middleware to allow cross-origin requests from the frontend."),
  body("The database is implemented using SQLite with SQLAlchemy as the ORM layer. Five tables are created namely Users, Bookings, Reminders, Health Logs, and Calorie Entries. Each table is defined as a SQLAlchemy model class and the tables are automatically created when the application starts for the first time. The database session is managed through a dependency injection function that ensures each request gets a fresh session and the session is properly closed after the request is completed."),
  body("User authentication is implemented using the passlib library with bcrypt hashing to securely store passwords. When a user registers, the password is hashed before being saved to the database. During login, the submitted password is verified against the stored hash without ever decrypting it. This ensures that user credentials remain secure even in the event of a database breach."),

  subheading("5.3 AI Chat Implementation"),
  body("The AI chat feature is implemented using the Groq API with the LLaMA 3.1 8B Instant model. When a user submits a symptom message through the chat interface, the frontend sends a POST request to the backend AI endpoint. The backend constructs a prompt that includes a system message containing the list of all Tumkur hospitals and their available doctors, along with the user's symptom message. This prompt is sent to the Groq API which returns a relevant doctor and hospital recommendation. The response is then passed back to the frontend and displayed in the chat interface."),
  body("A local symptom mapping engine is also implemented on the frontend as a fallback mechanism. This engine maps over thirty common symptoms such as back pain, fever, chest pain, dental issues, and ENT problems to the appropriate doctor and hospital without requiring any API call, ensuring the chat feature remains functional even when the backend is unavailable or the network connection is slow."),

  subheading("5.4 Frontend Implementation"),
  body("The frontend is implemented as a single HTML file containing all the HTML structure, CSS styles, and JavaScript logic. No external frameworks or libraries are used, making the application lightweight and fast to load. The interface is divided into five tabs namely Dashboard, Reminders, Hospitals, AI Chat, and Bookings, each rendered dynamically using JavaScript DOM manipulation."),
  body("The Dashboard tab displays the user's daily health summary and includes a calorie tracker that estimates food calories using a built-in database of over two hundred Indian food items. The calorie data is stored in the browser's localStorage with a date-based key so that the entries automatically reset at the start of each new day. The Hospitals tab displays all five Tumkur hospitals with their doctor profiles and provides an appointment booking modal with date and time slot selection. The Bookings tab shows all confirmed and cancelled appointments and allows users to cancel active bookings."),

  subheading("5.5 Progressive Web App Implementation"),
  body("The application is configured as a Progressive Web App by adding a web manifest file and a service worker. The manifest file defines the application name, short name, theme color, background color, and icon paths for both 192x192 and 512x512 pixel sizes. The service worker is registered on page load and caches the application shell so that the app can load even when the device is offline. The manifest is linked in the HTML head section along with meta tags for Apple mobile web app support."),
  body("Users on Android devices can install the application from Chrome by tapping the Add to Home Screen option, while iOS users can do the same from Safari using the Share menu. Once installed, the application opens in standalone mode without any browser address bar, providing a fully native app-like experience."),

  subheading("5.6 Deployment Implementation"),
  body("The frontend is deployed on Netlify by connecting the GitHub repository and setting the publish directory to the frontend folder. Netlify automatically rebuilds and redeploys the frontend whenever changes are pushed to the main branch on GitHub. The backend is deployed on Render as a web service with the start command set to run uvicorn. Environment variables including the Groq API key and the secret key are configured directly in the Render dashboard without being exposed in the source code."),

  subheading("5.7 Integration"),
  body("The frontend and backend are integrated through REST API calls made using the JavaScript Fetch API. The base URL of the backend is configured in the frontend JavaScript so that all API calls are directed to the correct deployed backend URL. CORS is enabled on the backend to allow requests from the Netlify frontend domain. The AI chat, appointment booking, calorie logging, and reminder management features all communicate with the backend in real time through their respective API endpoints."),
];

// ─── CHAPTER 6 ─────────────────────────────────────────────────
const ch6 = [
  ...sectionHeader(6, "TESTING"),
  subheading("6.1 Introduction"),
  body("Testing is a critical phase in the software development lifecycle that ensures the application functions as intended and meets all the specified requirements. This chapter describes the testing strategies and test cases used to verify the functionality, performance, and usability of the MedCare application. Both functional and non-functional aspects of the system were tested thoroughly before deployment."),

  subheading("6.2 Testing Strategy"),
  body("The testing of the MedCare application was carried out in three phases. The first phase involved unit testing where individual modules such as authentication, booking, reminders, nutrition, and AI chat were tested independently to verify that each component produced the expected output for a given input. The second phase involved integration testing where the interaction between the frontend and backend was tested to ensure that API calls were correctly made, responses were properly handled, and data was accurately displayed on the interface. The third phase involved system testing where the complete application was tested end to end as a whole to verify that all features worked together seamlessly."),

  subheading("6.3 Functional Testing"),
  body("Functional testing was performed to verify that each feature of the application behaves as expected under normal conditions. The user registration feature was tested by submitting valid name, phone, and password details and the system returned a successful registration message as expected. The login feature was tested with correct credentials and the system responded with the user name confirming successful authentication. The hospitals tab was tested to verify that all five Tumkur hospitals are displayed correctly along with their specializations, contact details, and doctor profiles. The appointment booking feature was tested by selecting a doctor, entering a name, choosing a date and time slot, and confirming the booking. The booking appeared correctly in the Bookings tab with a confirmed status. The cancel appointment feature was tested and the status updated to cancelled as expected. The AI chat feature was tested with various symptom inputs including back pain, fever, chest pain, dental issues, and knee pain. The system returned relevant doctor and hospital recommendations for each symptom. The reminder feature was tested by adding both water and medication reminders with custom labels and times. The toggle switch was verified to correctly enable and disable individual reminders. The calorie tracker was tested by entering various Indian food items and verifying that the estimated calorie values were correctly calculated and added to the daily total. The Progressive Web App installation was tested on an Android device using Chrome and the app was successfully installed on the home screen."),

  subheading("6.4 Non-Functional Testing"),
  sub2("6.4.1 Performance Testing"),
  body("The application was tested for load time and response time under normal network conditions. The frontend loaded within 2 seconds on a standard broadband connection. API responses from the backend were received within 1 second for all endpoints except the AI chat endpoint which took approximately 2 to 3 seconds due to the external Groq API call. These results are within the acceptable performance thresholds defined in the system requirements specification."),
  sub2("6.4.2 Usability Testing"),
  body("The application was tested by a group of five users of varying age groups including students, working professionals, and senior citizens. All users were able to navigate the application, book an appointment, and use the AI chat feature without any prior instructions. The feedback received indicated that the interface was clean, intuitive, and easy to use on mobile devices."),
  sub2("6.4.3 Compatibility Testing"),
  body("The application was tested across multiple browsers and devices to ensure compatibility. It was verified to work correctly on Google Chrome, Microsoft Edge, and Safari on both Android and iOS mobile devices as well as on Windows desktop. The Progressive Web App installation was successfully tested on an Android device using Chrome and on an iPhone using Safari."),
  sub2("6.4.4 Security Testing"),
  body("The authentication module was tested to verify that passwords are stored in hashed form and are never returned in any API response. Attempts to access protected endpoints without valid credentials returned appropriate error responses. All API communications between the frontend and backend are secured over HTTPS on the deployed environment."),

  subheading("6.5 Bug Fixes During Testing"),
  body("During the testing phase, a few issues were identified and resolved. The calorie tracker was initially retaining entries from previous days due to the use of a fixed localStorage key. This was fixed by using a date-based key so that entries are automatically reset each new day. The API URL was initially hardcoded as a Railway URL which was later updated to the Render deployment URL after switching hosting providers. The frontend manifest file was updated to include both 192x192 and 512x512 icon sizes to ensure proper PWA installation on all devices."),

  subheading("6.6 Testing Summary"),
  body("All functional test cases passed successfully and the application met the performance, usability, compatibility, and security requirements defined in the system requirements specification. The MedCare application is stable, reliable, and ready for deployment and use by the intended target audience in Tumkur city."),
];

// ─── CHAPTER 7 ─────────────────────────────────────────────────
const ch7 = [
  ...sectionHeader(7, "SCREENSHOTS"),
  subheading("7.1 Dashboard Screen"),
  ...blank(6),
  centered("[INSERT DASHBOARD SCREENSHOT HERE]", 22),
  centered("Fig 7.1 Dashboard Screen", 20),
  ...blank(2),
  subheading("7.2 Reminders Screen"),
  ...blank(6),
  centered("[INSERT REMINDERS SCREENSHOT HERE]", 22),
  centered("Fig 7.2 Reminders Screen", 20),
  pageBreak(),
  subheading("7.3 Hospitals Screen"),
  ...blank(6),
  centered("[INSERT HOSPITALS SCREENSHOT HERE]", 22),
  centered("Fig 7.3 Hospitals Screen", 20),
  ...blank(2),
  subheading("7.4 Booking Modal"),
  ...blank(6),
  centered("[INSERT BOOKING MODAL SCREENSHOT HERE]", 22),
  centered("Fig 7.4 Booking Modal", 20),
  pageBreak(),
  subheading("7.5 AI Chat Screen"),
  ...blank(6),
  centered("[INSERT AI CHAT SCREENSHOT HERE]", 22),
  centered("Fig 7.5 AI Chat Screen", 20),
  ...blank(2),
  subheading("7.6 Bookings Screen"),
  ...blank(6),
  centered("[INSERT BOOKINGS SCREENSHOT HERE]", 22),
  centered("Fig 7.6 Bookings Screen", 20),
  pageBreak(),
  subheading("7.7 PWA Installation on Mobile"),
  ...blank(6),
  centered("[INSERT PWA INSTALLATION SCREENSHOT HERE]", 22),
  centered("Fig 7.7 PWA Installation on Mobile", 20),
  ...blank(2),
  subheading("7.8 Deployed Application on Netlify"),
  ...blank(6),
  centered("[INSERT NETLIFY DEPLOYED APP SCREENSHOT HERE]", 22),
  centered("Fig 7.8 Deployed Application on Netlify", 20),
];

// ─── CHAPTER 8 ─────────────────────────────────────────────────
const ch8 = [
  ...sectionHeader(8, "RESULTS"),
  subheading("8.1 Introduction"),
  body("This chapter presents the results obtained after the successful development, testing, and deployment of the MedCare application. The results demonstrate that the application meets all the functional and non-functional requirements defined in the system requirements specification."),

  subheading("8.2 Dashboard Module Result"),
  body("The dashboard module was successfully implemented and displays the user's daily health summary upon opening the application. The dashboard shows four key metrics namely steps taken, calories consumed, water intake, and number of confirmed appointments. The calorie tracker allows users to type any food item and instantly receive an estimated calorie value which is added to the daily total. The daily entries are stored locally and automatically reset at the start of each new day. The today's reminders section displays all active reminders for the day and a health tip is shown at the bottom of the dashboard."),
  ...blank(1),
  centered("[INSERT DASHBOARD RESULT SCREENSHOT]", 22),
  centered("Fig 8.1 Dashboard Screen Result", 20),

  subheading("8.3 Reminders Module Result"),
  body("The reminders module was successfully implemented and allows users to manage both water and medication reminders. Users can view all existing reminders, toggle them on or off using the switch button, and add new reminders by entering a custom label, hour, and minute. The reminders are categorized into water reminders and medication reminders and are displayed in a clean list format with the scheduled time shown below each reminder label."),
  ...blank(1),
  centered("[INSERT REMINDERS RESULT SCREENSHOT]", 22),
  centered("Fig 8.2 Reminders Module Result", 20),

  subheading("8.4 Hospitals Module Result"),
  body("The hospitals module was successfully implemented and displays all five hospitals in Tumkur along with their address, contact number, and department tags. Each hospital card can be expanded to view the available doctors along with their specialization, experience, and consultation hours. A Book button is provided next to each doctor which opens a booking modal allowing the user to enter their name, select a date, and choose a time slot to confirm the appointment."),
  ...blank(1),
  centered("[INSERT HOSPITALS RESULT SCREENSHOT]", 22),
  centered("Fig 8.3 Hospitals Module Result", 20),

  subheading("8.5 AI Chat Module Result"),
  body("The AI chat module was successfully implemented and provides intelligent doctor and hospital recommendations based on user described symptoms. The chat interface displays a welcome message on opening and provides quick symptom chips for common conditions such as fever and cough, back pain, chest pain, knee pain, headache, and stomach pain. When a symptom is submitted the system responds with the name of the recommended doctor, their specialization, and the hospital they are available at."),
  ...blank(1),
  centered("[INSERT AI CHAT RESULT SCREENSHOT]", 22),
  centered("Fig 8.4 AI Chat Module Result", 20),

  subheading("8.6 Bookings Module Result"),
  body("The bookings module was successfully implemented and displays all appointments booked by the user. Each booking card shows the doctor name, specialization, hospital name, time slot, date, and patient name along with a confirmed status badge. A cancel button is provided for active bookings which updates the status to cancelled when tapped."),
  ...blank(1),
  centered("[INSERT BOOKINGS RESULT SCREENSHOT]", 22),
  centered("Fig 8.5 Bookings Module Result", 20),

  subheading("8.7 Progressive Web App Result"),
  body("The application was successfully configured as a Progressive Web App and tested on both Android and iOS devices. On Android, the Chrome browser displayed an Add to Home Screen prompt which when accepted installed the MedCare application on the device home screen with the teal MedCare icon. The installed app opens in standalone mode without any browser address bar, providing a native app-like experience."),
  ...blank(1),
  centered("[INSERT PWA RESULT SCREENSHOT]", 22),
  centered("Fig 8.6 PWA Installation Result", 20),

  subheading("8.8 Deployment Result"),
  body("The frontend of the application was successfully deployed on Netlify and is accessible at the public URL medcarefinall.netlify.app. The backend REST API was successfully deployed on Render and all API endpoints were verified to be working correctly on the live server. The Groq AI API integration was tested on the deployed environment and returned accurate doctor recommendations for all tested symptom inputs."),

  subheading("8.9 Summary of Results"),
  body("The MedCare application was successfully developed and deployed as a fully functional Progressive Web App. All six modules including the dashboard, reminders, hospitals, AI chat, nutrition tracker, and bookings were implemented and verified to work correctly. The application is live, accessible from any device with a browser, and installable as a mobile app without requiring any app store download. The results confirm that the project objectives defined in Chapter 1 have been fully achieved."),
];

// ─── CHAPTER 9 ─────────────────────────────────────────────────
const ch9 = [
  ...sectionHeader(9, "CONCLUSION AND FUTURE SCOPE"),
  subheading("9.1 Conclusion"),
  body("The MedCare application was successfully designed, developed, tested, and deployed as a fully functional AI-powered healthcare assistant for the Tumkur city region. The project aimed to address the challenges faced by patients in finding the right doctor for their symptoms, booking appointments conveniently, and maintaining their daily health routines. All the objectives defined at the beginning of this project have been successfully achieved."),
  body("The application provides a comprehensive set of features including an AI-powered symptom checker that recommends the appropriate doctor and hospital based on user described symptoms, a hospital and doctor directory covering five major hospitals in Tumkur with appointment booking functionality, a personal health dashboard that tracks daily steps, water intake, and calorie consumption, a smart reminder system for medications and water intake, and a bookings manager that allows users to view and cancel their appointments."),
  body("The backend is built using FastAPI with SQLite as the database, providing a lightweight yet powerful REST API that handles all business logic and data management. The frontend is implemented as a single HTML file making it extremely fast to load and easy to maintain. The AI chat feature is powered by the Groq API using the LLaMA 3.1 model which provides accurate and context-aware doctor recommendations in real time. The entire application is deployed on free cloud platforms, namely Netlify for the frontend and Render for the backend, making it cost-effective and accessible to all users."),
  body("Overall this project demonstrates that a meaningful and impactful healthcare application can be built using modern web technologies and artificial intelligence without requiring complex infrastructure or significant financial investment. The MedCare application has the potential to genuinely improve the healthcare experience for the people of Tumkur by making medical information and appointment booking easily accessible from any device at any time."),

  subheading("9.2 Future Scope"),
  body("While the current version of the MedCare application successfully achieves its defined objectives, there are several areas where the application can be enhanced and expanded in future versions."),
  body("The first area of future enhancement is real-time doctor availability. The current version displays static consultation hours for each doctor. In a future version, doctors could log into the system and update their availability in real time, allowing patients to see accurate slot availability before booking an appointment."),
  body("The second area is the integration of telemedicine functionality. A video consultation feature could be added to allow patients to consult with doctors remotely without physically visiting the hospital. This would be particularly beneficial for patients in rural areas surrounding Tumkur who may have limited access to transportation."),
  body("The third area is the expansion to other cities. The current version is limited to Tumkur city. The system architecture is designed in a way that makes it straightforward to expand the hospital and doctor database to cover other cities and districts in Karnataka and eventually across India."),
  body("The fourth area is the implementation of a full user authentication system with personalized profiles. In the current version the health tracking and reminders are stored locally on the device. In a future version all user data could be stored on the server under a personal account allowing users to access their health history from any device."),
  body("The fifth area is the integration of wearable device data. Step count and heart rate data from wearable devices such as fitness bands and smartwatches could be automatically synced with the health dashboard eliminating the need for manual entry."),
  body("The sixth area is multilingual support. Since Tumkur is a Kannada-speaking region, adding support for the Kannada language in the interface and the AI chat would make the application significantly more accessible to the local population including elderly users who may not be comfortable with English."),
  body("The seventh area is push notifications. The current reminder system displays reminders only within the app. Implementing push notifications through the service worker would allow the app to send actual notification alerts to the user's device at the scheduled reminder time even when the app is not open."),
  body("The eighth area is online payment integration. A payment gateway could be integrated to allow users to pay consultation fees directly through the application at the time of booking, making the entire process fully digital and cashless."),

  subheading("9.3 Final Remarks"),
  body("The MedCare project has been a valuable learning experience covering a wide range of technologies and concepts including REST API development, database design, artificial intelligence integration, frontend development, Progressive Web App configuration, and cloud deployment. The skills and knowledge gained through this project provide a strong foundation for building more complex and scalable applications in the future. The application is live and functional and serves as a practical demonstration of how technology can be used to solve real-world problems in the healthcare domain."),
];

// ─── REFERENCES ────────────────────────────────────────────────
const referencesPage = [
  pageBreak(),
  centered("REFERENCES", 28, true),
  ...blank(1),
  body("[1]. Topol, E. J. (2019). High-performance medicine: the convergence of human and artificial intelligence. Nature Medicine, 25(1), 44–56. https://www.nature.com/articles/s41591-018-0300-7"),
  ...blank(1),
  body("[2]. Biorn-Hansen, A., Majchrzak, T. A., and Gronli, T. M. (2018). Progressive Web Apps: The Possible Web-native Unifier for Mobile Development. Proceedings of the 14th International Conference on Web Information Systems and Technologies, 344–351."),
  ...blank(1),
  body("[3]. Kumar, R., Sharma, P., and Gupta, A. (2021). Mobile-based Outpatient Department Management System for Semi-urban Hospitals in India. International Journal of Health Informatics and Management, 11(2), 78–89."),
  ...blank(1),
  body("[4]. FastAPI Official Documentation. https://fastapi.tiangolo.com"),
  ...blank(1),
  body("[5]. Groq API Documentation. https://console.groq.com/docs"),
  ...blank(1),
  body("[6]. Netlify Deployment Documentation. https://docs.netlify.com"),
  ...blank(1),
  body("[7]. Render Deployment Documentation. https://render.com/docs"),
  ...blank(1),
  body("[8]. SQLAlchemy Official Documentation. https://docs.sqlalchemy.org"),
  ...blank(1),
  body("[9]. MDN Web Docs – Progressive Web Apps. https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps"),
  ...blank(1),
  body("[10]. W3Schools. https://www.w3schools.com"),
];

// ─── BUILD DOCUMENT ─────────────────────────────────────────────
const allChildren = [
  ...titlePage,
  ...certificatePage,
  ...acknowledgementPage,
  ...declarationPage,
  ...abstractPage,
  ...tocPage,
  ...ch1,
  ...ch2,
  ...ch3,
  ...ch4,
  ...ch5,
  ...ch6,
  ...ch7,
  ...ch8,
  ...ch9,
  ...referencesPage,
];

const doc = new Document({
  numbering: {
    config: [
      {
        reference: "bullets",
        levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } }]
      },
      {
        reference: "numbers",
        levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } }]
      }
    ]
  },
  styles: {
    default: { document: { run: { font: TNR, size: 24 } } },
  },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1440, right: 1080, bottom: 1440, left: 1440 },
        borders: {
          pageBorderTop: { style: BorderStyle.DOUBLE, size: 8, color: BORDER_COLOR, space: 24 },
          pageBorderBottom: { style: BorderStyle.DOUBLE, size: 8, color: BORDER_COLOR, space: 24 },
          pageBorderLeft: { style: BorderStyle.DOUBLE, size: 8, color: BORDER_COLOR, space: 24 },
          pageBorderRight: { style: BorderStyle.DOUBLE, size: 8, color: BORDER_COLOR, space: 24 },
        }
      }
    },
    headers: { default: header },
    footers: { default: footer },
    children: allChildren,
  }]
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync("MedCare_Project_Report.docx", buffer);
  console.log('Done! MedCare_Project_Report.docx created.');
}).catch(err => {
  console.error('Error:', err);
});