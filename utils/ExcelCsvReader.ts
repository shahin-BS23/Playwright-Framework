import fs from "fs";
import path from "path";
import * as XLSX from "xlsx";
import { parse } from "csv-parse/sync";
import { stringify } from "csv-stringify/sync";

export default class ExcelCsvReader {
  private filePath: string;
  private extension: string;
  private workbook?: XLSX.WorkBook;
  private csvData?: string[][];

  constructor(filePath: string) {
    this.filePath = filePath;
    this.extension = path.extname(filePath).toLowerCase();

    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    if (this.extension === ".xlsx") {
      this.workbook = XLSX.readFile(filePath);
    } else if (this.extension === ".csv") {
      const content = fs.readFileSync(filePath, "utf-8");
      this.csvData = parse(content, { skip_empty_lines: true });
    } else {
      throw new Error("Unsupported file type. Only .xlsx and .csv are supported.");
    }
  }

  /** Get sheet or CSV data */
  private getSheet(sheetName?: string): XLSX.WorkSheet | string[][] {
    if (this.extension === ".xlsx") {
      const sheet = this.workbook!.Sheets[sheetName || this.workbook!.SheetNames[0]];
      if (!sheet) throw new Error(`Sheet not found: ${sheetName}`);
      return sheet;
    } else {
      return this.csvData!;
    }
  }

  /** Save back to file */
  private save(sheetName?: string): void {
    if (this.extension === ".xlsx") {
      XLSX.writeFile(this.workbook!, this.filePath);
    } else {
      const csvString = stringify(this.csvData!);
      fs.writeFileSync(this.filePath, csvString, "utf-8");
    }
  }

  /** Get number of rows */
  async getRowCount(sheetName?: string): Promise<number> {
    if (this.extension === ".xlsx") {
      const sheet = this.getSheet(sheetName) as XLSX.WorkSheet;
      const range = XLSX.utils.decode_range(sheet["!ref"]!);
      return range.e.r + 1;
    } else {
      return this.csvData!.length;
    }
  }

  /** Get number of columns */
  async getColumnCount(sheetName?: string): Promise<number> {
    if (this.extension === ".xlsx") {
      const sheet = this.getSheet(sheetName) as XLSX.WorkSheet;
      const range = XLSX.utils.decode_range(sheet["!ref"]!);
      return range.e.c + 1;
    } else {
      return this.csvData![0]?.length || 0;
    }
  }

  /** Get cell value by col name and row number (1-based) */
  async getCellData(colName: string, rowNum: number, sheetName?: string): Promise<string> {
    if (this.extension === ".xlsx") {
      const sheet = this.getSheet(sheetName) as XLSX.WorkSheet;
      const json = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { defval: "" });
      const row = json[rowNum - 2]; // skip header row
      return row?.[colName] ?? "";
    } else {
      const headers = this.csvData![0];
      const colIndex = headers.indexOf(colName);
      if (colIndex === -1) throw new Error(`Column not found: ${colName}`);
      return this.csvData![rowNum - 1]?.[colIndex] ?? "";
    }
  }

  /** Set cell data by col name and row number (1-based) */
  async setCellData(colName: string, rowNum: number, value: string, sheetName?: string): Promise<void> {
    if (this.extension === ".xlsx") {
      const sheet = this.getSheet(sheetName) as XLSX.WorkSheet;
      const json = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { defval: "" });
      if (!json[rowNum - 2]) json[rowNum - 2] = {};
      json[rowNum - 2][colName] = value;
      const newSheet = XLSX.utils.json_to_sheet(json, { skipHeader: false });
      this.workbook!.Sheets[sheetName || this.workbook!.SheetNames[0]] = newSheet;
    } else {
      const headers = this.csvData![0];
      const colIndex = headers.indexOf(colName);
      if (colIndex === -1) throw new Error(`Column not found: ${colName}`);
      if (!this.csvData![rowNum - 1]) {
        this.csvData![rowNum - 1] = new Array(headers.length).fill("");
      }
      this.csvData![rowNum - 1][colIndex] = value;
    }
    this.save(sheetName);
  }

  /** Add new column */
  async addColumn(colName: string, sheetName?: string): Promise<void> {
    if (this.extension === ".xlsx") {
      const sheet = this.getSheet(sheetName) as XLSX.WorkSheet;
      const json = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { defval: "" });
      json.forEach((row) => (row[colName] = ""));
      const newSheet = XLSX.utils.json_to_sheet(json, { skipHeader: false });
      this.workbook!.Sheets[sheetName || this.workbook!.SheetNames[0]] = newSheet;
    } else {
      const headers = this.csvData![0];
      if (headers.includes(colName)) throw new Error(`Column exists: ${colName}`);
      headers.push(colName);
      for (let i = 1; i < this.csvData!.length; i++) {
        this.csvData![i].push("");
      }
    }
    this.save(sheetName);
  }

  /** Add new row */
  async addRow(rowData: Record<string, string>, sheetName?: string): Promise<void> {
    if (this.extension === ".xlsx") {
      const sheet = this.getSheet(sheetName) as XLSX.WorkSheet;
      const json = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { defval: "" });
      json.push(rowData);
      const newSheet = XLSX.utils.json_to_sheet(json, { skipHeader: false });
      this.workbook!.Sheets[sheetName || this.workbook!.SheetNames[0]] = newSheet;
    } else {
      const headers = this.csvData![0];
      const newRow = headers.map((h) => rowData[h] || "");
      this.csvData!.push(newRow);
    }
    this.save(sheetName);
  }

  /** Get all data as array of objects */
  async getAllData(sheetName?: string): Promise<Record<string, string>[]> {
    if (this.extension === ".xlsx") {
      const sheet = this.getSheet(sheetName) as XLSX.WorkSheet;
      return XLSX.utils.sheet_to_json<Record<string, string>>(sheet, { defval: "" });
    } else {
      const [headers, ...rows] = this.csvData!;
      return rows.map((row) =>
        headers.reduce((obj, key, i) => {
          obj[key] = row[i];
          return obj;
        }, {} as Record<string, string>)
      );
    }
  }
}