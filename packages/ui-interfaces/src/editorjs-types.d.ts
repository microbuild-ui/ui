/**
 * Type declarations for EditorJS packages without TypeScript support
 */

declare module '@editorjs/checklist' {
  import { BlockTool } from '@editorjs/editorjs';
  
  interface ChecklistData {
    items: Array<{
      text: string;
      checked: boolean;
    }>;
  }

  interface ChecklistConfig {
    placeholder?: string;
  }

  export default class Checklist implements BlockTool {
    static get toolbox(): { icon: string; title: string };
    constructor({ data, config, api }: { data?: ChecklistData; config?: ChecklistConfig; api: unknown });
    render(): HTMLElement;
    save(block: HTMLElement): ChecklistData;
    validate(data: ChecklistData): boolean;
  }
}
