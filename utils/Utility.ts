import { Page } from '@playwright/test';
import { promises as fs } from 'fs';
import ENV from './env';

export default class Utility {
    public async navigateToBaseUrl(page: Page): Promise<void> {
        const baseUrl = ENV.BASE_URL;
        if (!baseUrl) {
            throw new Error('BASE_URL is not defined. Ensure env/<env>.env is loaded via global setup.');
        }
        await page.goto(baseUrl);
    }

    public async readJsonFile<T = unknown>(filePath: string): Promise<T> {
        const fileContents = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(fileContents) as T;
    }

    public async writeJsonFile(filePath: string, data: unknown, prettySpaces: number = 2): Promise<void> {
        const jsonString = JSON.stringify(data, null, prettySpaces);
        await fs.writeFile(filePath, jsonString, 'utf-8');
    }

    public async updateJsonPath(filePath: string, jsonPath: string, newValue: unknown, prettySpaces: number = 2): Promise<void> {
        const data = await this.readJsonFile<any>(filePath);
        const segments = this.parseJsonPath(jsonPath);
        if (segments.length === 0) return;

        let cursor: any = data;
        for (let i = 0; i < segments.length - 1; i++) {
            const key = segments[i];
            const nextIsIndex = typeof segments[i + 1] === 'number';

            if (typeof key === 'number') {
                if (!Array.isArray(cursor)) {
                    throw new Error(`Path segment '${key}' expects an array at segment ${i} in '${jsonPath}'.`);
                }
                if (cursor[key] === undefined) {
                    cursor[key] = nextIsIndex ? [] : {};
                }
                cursor = cursor[key];
            } else {
                if (cursor[key] === undefined) {
                    cursor[key] = nextIsIndex ? [] : {};
                }
                cursor = cursor[key];
            }
        }

        const last = segments[segments.length - 1];
        if (typeof last === 'number') {
            if (!Array.isArray(cursor)) {
                throw new Error(`Path segment '${last}' expects an array at final segment in '${jsonPath}'.`);
            }
            cursor[last] = newValue;
        } else {
            cursor[last] = newValue;
        }

        await this.writeJsonFile(filePath, data, prettySpaces);
    }

    private parseJsonPath(pathExpr: string): Array<string | number> {
        // Supports simple dot/bracket notation like: a.b[0].c[1]
        // Trims leading '$.' if present
        const expr = pathExpr.trim().replace(/^\$\.?/, '');
        if (!expr) return [];

        const segments: Array<string | number> = [];
        let token = '';
        for (let i = 0; i < expr.length; i++) {
            const ch = expr[i];
            if (ch === '.') {
                if (token) {
                    segments.push(token);
                    token = '';
                }
            } else if (ch === '[') {
                if (token) {
                    segments.push(token);
                    token = '';
                }
                let j = i + 1;
                let idx = '';
                while (j < expr.length && expr[j] !== ']') {
                    idx += expr[j];
                    j++;
                }
                if (expr[j] !== ']') {
                    throw new Error(`Unclosed bracket in jsonPath: '${pathExpr}'`);
                }
                const num = Number(idx.trim());
                if (!Number.isFinite(num)) {
                    throw new Error(`Non-numeric array index '${idx}' in jsonPath: '${pathExpr}'`);
                }
                segments.push(num);
                i = j; // skip to ']'
            } else {
                token += ch;
            }
        }
        if (token) segments.push(token);
        return segments;
    }
}
