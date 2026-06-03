function parseCSVLine(text) {
  const result = [];
  let insideQuote = false;
  let entry = "";

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (char === '"') {
      insideQuote = !insideQuote;
    } else if (char === ',' && !insideQuote) {
      result.push(entry.trim());
      entry = "";
    } else {
      entry += char;
    }
  }
  result.push(entry.trim());
  return result;
}

// Directly processes text strings (useful for copy-pasted fields)
export function processRawCSVText(text) {
  const lines = text.split(/\r?\n/).filter(line => line.trim() !== "");

  if (lines.length < 2) {
    throw new Error("The payload is empty or missing data rows.");
  }

  const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase().replace(/["']/g, ""));
  
  const requiredHeaders = [
    "school", "subject", "question_text", 
    "option_a", "option_b", "option_c", "option_d", 
    "correct_option"
  ];

  const missing = requiredHeaders.filter(req => !headers.includes(req));
  if (missing.length > 0) {
    throw new Error(`Missing required columns: ${missing.join(", ")}`);
  }

  const parsedQuestions = [];

  for (let i = 1; i < lines.length; i++) {
    const rawRow = parseCSVLine(lines[i]);
    if (rawRow.length === 1 && rawRow[0] === "") continue;

    const rowData = {};
    headers.forEach((header, index) => {
      let value = rawRow[index] || "";
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.substring(1, value.length - 1);
      }
      rowData[header] = value;
    });

    const rowNumber = i + 1;

    if (!rowData["school"] || !rowData["subject"] || !rowData["question_text"]) {
      throw new Error(`Row ${rowNumber}: 'school', 'subject', and 'question_text' cannot be blank.`);
    }

    if (!rowData["option_a"] || !rowData["option_b"] || !rowData["option_c"] || !rowData["option_d"]) {
      throw new Error(`Row ${rowNumber}: All options (A-D) must be filled.`);
    }

    const correctOpt = rowData["correct_option"]?.trim().toUpperCase();
    if (!["A", "B", "C", "D"].includes(correctOpt)) {
      throw new Error(`Row ${rowNumber}: Invalid correct_option "${correctOpt}". Must be A, B, C, or D.`);
    }

    let yearVal = null;
    if (rowData["year"] && !isNaN(parseInt(rowData["year"], 10))) {
      yearVal = parseInt(rowData["year"], 10);
    }

    let isFreeVal = false;
    if (rowData["is_free"]) {
      isFreeVal = rowData["is_free"].toString().trim().toLowerCase() === "true";
    }

    parsedQuestions.push({
      school: rowData["school"].trim(),
      subject: rowData["subject"].trim(),
      year: yearVal,
      is_free: isFreeVal,
      question_text: rowData["question_text"].trim(),
      option_a: rowData["option_a"].trim(),
      option_b: rowData["option_b"].trim(),
      option_c: rowData["option_c"].trim(),
      option_d: rowData["option_d"].trim(),
      correct_option: correctOpt,
      explanation: rowData["explanation"] ? rowData["explanation"].trim() : null
    });
  }

  return parsedQuestions;
}

// Kept intact for file inputs
export function parseQuestionsCSV(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const result = processRawCSVText(e.target.result);
        resolve(result);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file asset."));
    reader.readAsText(file);
  });
}