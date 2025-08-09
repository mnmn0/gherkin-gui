import {
  GherkinAST,
  GherkinFeature,
  GherkinScenario,
  GherkinStep,
  GherkinBackground,
  GherkinExamples,
  ValidationResult,
} from '../types';
import { validateGherkinSyntax } from '../utils/validation';

export class GherkinParser {
  private lines: string[] = [];

  private currentLine = 0;

  private indentLevel = 0;

  parse(content: string): GherkinAST {
    this.lines = content.split('\n').map((line) => line.replace(/\r$/, ''));
    this.currentLine = 0;

    const feature = this.parseFeature();
    const comments = this.extractComments(content);

    return {
      feature,
      comments,
    };
  }

  validate(content: string): ValidationResult {
    return validateGherkinSyntax(content);
  }

  private parseFeature(): GherkinFeature {
    const feature: Partial<GherkinFeature> = {
      scenarios: [],
      tags: [],
    };

    while (this.currentLine < this.lines.length) {
      const line = this.getCurrentLine().trim();

      if (line.startsWith('@')) {
        feature.tags = [...(feature.tags || []), ...this.parseTags()];
      } else if (line.startsWith('Feature:')) {
        feature.name = line.substring(8).trim();
        feature.description = this.parseDescription();
      } else if (line.startsWith('Background:')) {
        feature.background = this.parseBackground();
      } else if (line.startsWith('Scenario:')) {
        feature.scenarios!.push(this.parseScenario());
      } else if (line.startsWith('Scenario Outline:')) {
        feature.scenarios!.push(this.parseScenarioOutline());
      } else {
        this.nextLine();
      }
    }

    if (!feature.name) {
      throw new Error('Feature must have a name');
    }

    return feature as GherkinFeature;
  }

  private parseDescription(): string {
    const description: string[] = [];
    this.nextLine();

    while (this.currentLine < this.lines.length) {
      const line = this.getCurrentLine().trim();

      if (this.isKeyword(line)) {
        break;
      }

      if (line.length > 0) {
        description.push(line);
      }

      this.nextLine();
    }

    return description.join('\n').trim();
  }

  private parseBackground(): GherkinBackground {
    this.nextLine();
    const steps = this.parseSteps();

    return { steps };
  }

  private parseScenario(): GherkinScenario {
    const line = this.getCurrentLine().trim();
    const name = line.substring(9).trim();

    this.nextLine();
    const steps = this.parseSteps();
    const tags = this.extractScenarioTags();

    return {
      name,
      steps,
      tags,
    };
  }

  private parseScenarioOutline(): GherkinScenario {
    const line = this.getCurrentLine().trim();
    const name = line.substring(17).trim();

    this.nextLine();
    const steps = this.parseSteps();
    const examples = this.parseExamples();
    const tags = this.extractScenarioTags();

    return {
      name,
      steps,
      tags,
      examples,
    };
  }

  private parseSteps(): GherkinStep[] {
    const steps: GherkinStep[] = [];

    while (this.currentLine < this.lines.length) {
      const line = this.getCurrentLine().trim();

      if (this.isStepKeyword(line)) {
        steps.push(this.parseStep());
      } else if (this.isKeyword(line) || line.startsWith('Examples:')) {
        break;
      } else {
        this.nextLine();
      }
    }

    return steps;
  }

  private parseStep(): GherkinStep {
    const line = this.getCurrentLine().trim();
    const parts = line.split(' ');
    const keyword = parts[0] as GherkinStep['keyword'];
    const text = parts.slice(1).join(' ');

    this.nextLine();

    const step: GherkinStep = {
      keyword,
      text,
    };

    const docString = this.parseDocString();
    if (docString) {
      step.docString = docString;
    }

    const dataTable = this.parseDataTable();
    if (dataTable.length > 0) {
      step.dataTable = dataTable;
    }

    return step;
  }

  private parseDocString(): string | undefined {
    if (this.currentLine >= this.lines.length) {
      return undefined;
    }

    const line = this.getCurrentLine().trim();
    if (!line.startsWith('"""') && !line.startsWith("'''")) {
      return undefined;
    }

    const delimiter = line.startsWith('"""') ? '"""' : "'''";
    const docLines: string[] = [];

    this.nextLine();

    while (this.currentLine < this.lines.length) {
      const currentLine = this.getCurrentLine();

      if (currentLine.trim() === delimiter) {
        this.nextLine();
        break;
      }

      docLines.push(currentLine);
      this.nextLine();
    }

    return docLines.join('\n');
  }

  private parseDataTable(): string[][] {
    const table: string[][] = [];

    while (this.currentLine < this.lines.length) {
      const line = this.getCurrentLine().trim();

      if (!line.startsWith('|')) {
        break;
      }

      const row = line
        .split('|')
        .slice(1, -1)
        .map((cell) => cell.trim());

      table.push(row);
      this.nextLine();
    }

    return table;
  }

  private parseExamples(): GherkinExamples | undefined {
    while (this.currentLine < this.lines.length) {
      const line = this.getCurrentLine().trim();

      if (line.startsWith('Examples:')) {
        this.nextLine();
        const table = this.parseDataTable();

        if (table.length > 0) {
          return {
            headers: table[0],
            rows: table.slice(1),
          };
        }
        break;
      } else if (this.isKeyword(line)) {
        break;
      } else {
        this.nextLine();
      }
    }

    return undefined;
  }

  private parseTags(): string[] {
    const tags: string[] = [];

    while (this.currentLine < this.lines.length) {
      const line = this.getCurrentLine().trim();

      if (!line.startsWith('@')) {
        break;
      }

      const lineTags = line.split(/\s+/).filter((tag) => tag.startsWith('@'));
      tags.push(...lineTags);
      this.nextLine();
    }

    return tags;
  }

  private extractScenarioTags(): string[] {
    const tags: string[] = [];
    let lineIndex = this.currentLine - 1;

    while (lineIndex >= 0) {
      const line = this.lines[lineIndex].trim();

      if (line.startsWith('@')) {
        const lineTags = line.split(/\s+/).filter((tag) => tag.startsWith('@'));
        tags.unshift(...lineTags);
        lineIndex--;
      } else if (line.length === 0 || line.startsWith('#')) {
        lineIndex--;
      } else {
        break;
      }
    }

    return tags;
  }

  private extractComments(content: string): string[] {
    const comments: string[] = [];
    const lines = content.split('\n');

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('#')) {
        comments.push(trimmed);
      }
    }

    return comments;
  }

  private isKeyword(line: string): boolean {
    const keywords = [
      'Feature:',
      'Background:',
      'Scenario:',
      'Scenario Outline:',
      'Examples:',
      'Rule:',
      'Example:',
    ];

    return keywords.some((keyword) => line.startsWith(keyword));
  }

  private isStepKeyword(line: string): boolean {
    const stepKeywords = ['Given', 'When', 'Then', 'And', 'But'];
    return stepKeywords.some((keyword) => line.startsWith(`${keyword} `));
  }

  private getCurrentLine(): string {
    return this.lines[this.currentLine] || '';
  }

  private nextLine(): void {
    this.currentLine++;
  }

  formatGherkin(ast: GherkinAST): string {
    const lines: string[] = [];

    if (ast.feature.tags.length > 0) {
      lines.push(ast.feature.tags.join(' '));
    }

    lines.push(`Feature: ${ast.feature.name}`);

    if (ast.feature.description) {
      lines.push('');
      const descLines = ast.feature.description.split('\n');
      lines.push(...descLines.map((line) => `  ${line}`));
    }

    if (ast.feature.background) {
      lines.push('');
      lines.push('  Background:');
      ast.feature.background.steps.forEach((step) => {
        lines.push(`    ${step.keyword} ${step.text}`);
        if (step.docString) {
          lines.push('      """');
          lines.push(
            ...step.docString.split('\n').map((line) => `      ${line}`),
          );
          lines.push('      """');
        }
        if (step.dataTable) {
          step.dataTable.forEach((row) => {
            lines.push(`      | ${row.join(' | ')} |`);
          });
        }
      });
    }

    ast.feature.scenarios.forEach((scenario) => {
      lines.push('');

      if (scenario.tags.length > 0) {
        lines.push(`  ${scenario.tags.join(' ')}`);
      }

      const scenarioType = scenario.examples ? 'Scenario Outline' : 'Scenario';
      lines.push(`  ${scenarioType}: ${scenario.name}`);

      scenario.steps.forEach((step) => {
        lines.push(`    ${step.keyword} ${step.text}`);

        if (step.docString) {
          lines.push('      """');
          lines.push(
            ...step.docString.split('\n').map((line) => `      ${line}`),
          );
          lines.push('      """');
        }

        if (step.dataTable) {
          step.dataTable.forEach((row) => {
            lines.push(`      | ${row.join(' | ')} |`);
          });
        }
      });

      if (scenario.examples) {
        lines.push('');
        lines.push('    Examples:');
        lines.push(`      | ${scenario.examples.headers.join(' | ')} |`);
        scenario.examples.rows.forEach((row) => {
          lines.push(`      | ${row.join(' | ')} |`);
        });
      }
    });

    if (ast.comments.length > 0) {
      lines.push('');
      lines.push(...ast.comments);
    }

    return lines.join('\n');
  }
}
