/**
 * Template rendering utility for M2A display values.
 *
 * Replaces `{{field}}` and `{{nested.field.path}}` placeholders in a template
 * string with values resolved from an item data object. Mirrors the core
 * behaviour of Directus's `render-template` Vue component but returns a plain
 * string (no component rendering).
 *
 * Features:
 * - Nested dot-path access (e.g. `{{author.name}}`)
 * - Array index access (e.g. `{{tags.0.label}}`)
 * - Missing value fallback (empty string by default)
 * - Cleans up any remaining `{{…}}` placeholders after resolution
 */

const TEMPLATE_REGEX = /{{(.*?)}}/g;

/**
 * Safely resolve a dot-separated path against an object.
 *
 * @example
 *   getByPath({ a: { b: 'hello' } }, 'a.b') // 'hello'
 *   getByPath({ a: null }, 'a.b')            // undefined
 */
export function getByPath(obj: unknown, path: string): unknown {
    if (obj == null) return undefined;

    const parts = path.split('.');
    let current: unknown = obj;

    for (const part of parts) {
        if (current == null) return undefined;

        if (typeof current === 'object') {
            current = (current as Record<string, unknown>)[part];
        } else {
            return undefined;
        }
    }

    return current;
}

export interface RenderTemplateOptions {
    /** String to use when a placeholder cannot be resolved. Defaults to `''`. */
    fallback?: string;
    /** When `true`, unresolved `{{…}}` placeholders are kept as-is instead of
     *  being replaced with the fallback string. */
    keepUnresolved?: boolean;
}

/**
 * Render a mustache-style template string against an item data object.
 *
 * @param template - Template string, e.g. `"{{title}} by {{author.name}}"`
 * @param data     - The data object to resolve placeholders from.
 * @param options  - Optional rendering behaviour overrides.
 * @returns The rendered string with all placeholders replaced.
 *
 * @example
 *   renderTemplate('{{title}} by {{author.name}}', {
 *       title: 'Hello',
 *       author: { name: 'World' },
 *   });
 *   // → 'Hello by World'
 *
 *   renderTemplate('{{missing}}', {}, { fallback: '–' });
 *   // → '–'
 */
export function renderTemplate(
    template: string,
    data: Record<string, unknown> | unknown,
    options: RenderTemplateOptions = {},
): string {
    const { fallback = '', keepUnresolved = false } = options;

    if (!template) return '';
    if (data == null || typeof data !== 'object') return template;

    return template.replace(TEMPLATE_REGEX, (match, fieldKey: string) => {
        const trimmedKey = fieldKey.trim();
        const value = getByPath(data, trimmedKey);

        if (value === undefined || value === null) {
            return keepUnresolved ? match : fallback;
        }

        if (typeof value === 'object') {
            // For objects/arrays, stringify to avoid "[object Object]"
            try {
                return JSON.stringify(value);
            } catch {
                return fallback;
            }
        }

        return String(value);
    });
}
