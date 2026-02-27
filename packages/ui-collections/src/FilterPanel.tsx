/**
 * FilterPanel Component
 *
 * A field-type-aware filter builder for collection queries.
 * Inspired by DaaS's system-filter interface.
 *
 * Produces DaaS-compatible filter objects ({ _and: [...] })
 * that can be passed to CollectionList's `filter` prop or
 * used directly with ItemsService.readByQuery().
 *
 * @package @buildpad/ui-collections
 */

"use client";

import React, { useState, useCallback, useMemo } from 'react';
import {
    Group,
    Stack,
    Button,
    Text,
    Select,
    TextInput,
    NumberInput,
    ActionIcon,
    Paper,
    Menu,
    Badge,
    Collapse,
    Switch,
} from '@mantine/core';
import {
    IconFilter,
    IconPlus,
    IconTrash,
    IconChevronDown,
    IconChevronUp,
    IconX,
} from '@tabler/icons-react';
import type { Field } from '@buildpad/types';

// ============================================================================
// Types
// ============================================================================

/** A single filter rule */
export interface FilterRule {
    id: string;
    field: string;
    operator: string;
    value: unknown;
}

/** A filter group (AND / OR) */
export interface FilterGroup {
    id: string;
    logical: '_and' | '_or';
    rules: (FilterRule | FilterGroup)[];
}

export interface FilterPanelProps {
    /** Available fields to filter on */
    fields: Field[];
    /** Current filter value (DaaS-style JSON) */
    value?: Record<string, unknown> | null;
    /** Called when filter changes */
    onChange?: (filter: Record<string, unknown> | null) => void;
    /** Display mode: 'panel' shows bordered container, 'inline' is flat */
    mode?: 'panel' | 'inline';
    /** Show as collapsed bar with chip summary */
    collapsible?: boolean;
    /** Initially collapsed */
    defaultCollapsed?: boolean;
    /** Disabled state */
    disabled?: boolean;
    /** Maximum nesting depth for groups (default: 3) */
    maxDepth?: number;
}

// ============================================================================
// Operator definitions per field type
// ============================================================================

interface OperatorDef {
    label: string;
    value: string;
    /** Whether this operator needs a value input */
    needsValue: boolean;
}

const STRING_OPERATORS: OperatorDef[] = [
    { label: 'Equals', value: '_eq', needsValue: true },
    { label: 'Not equals', value: '_neq', needsValue: true },
    { label: 'Contains', value: '_contains', needsValue: true },
    { label: 'Does not contain', value: '_ncontains', needsValue: true },
    { label: 'Starts with', value: '_starts_with', needsValue: true },
    { label: 'Ends with', value: '_ends_with', needsValue: true },
    { label: 'Is empty', value: '_empty', needsValue: false },
    { label: 'Is not empty', value: '_nempty', needsValue: false },
    { label: 'Is null', value: '_null', needsValue: false },
    { label: 'Is not null', value: '_nnull', needsValue: false },
];

const NUMBER_OPERATORS: OperatorDef[] = [
    { label: 'Equals', value: '_eq', needsValue: true },
    { label: 'Not equals', value: '_neq', needsValue: true },
    { label: 'Greater than', value: '_gt', needsValue: true },
    { label: 'Greater or equal', value: '_gte', needsValue: true },
    { label: 'Less than', value: '_lt', needsValue: true },
    { label: 'Less or equal', value: '_lte', needsValue: true },
    { label: 'Is null', value: '_null', needsValue: false },
    { label: 'Is not null', value: '_nnull', needsValue: false },
];

const BOOLEAN_OPERATORS: OperatorDef[] = [
    { label: 'Equals', value: '_eq', needsValue: true },
    { label: 'Is null', value: '_null', needsValue: false },
    { label: 'Is not null', value: '_nnull', needsValue: false },
];

const DATE_OPERATORS: OperatorDef[] = [
    { label: 'Equals', value: '_eq', needsValue: true },
    { label: 'Not equals', value: '_neq', needsValue: true },
    { label: 'After', value: '_gt', needsValue: true },
    { label: 'On or after', value: '_gte', needsValue: true },
    { label: 'Before', value: '_lt', needsValue: true },
    { label: 'On or before', value: '_lte', needsValue: true },
    { label: 'Is null', value: '_null', needsValue: false },
    { label: 'Is not null', value: '_nnull', needsValue: false },
];

const UUID_OPERATORS: OperatorDef[] = [
    { label: 'Equals', value: '_eq', needsValue: true },
    { label: 'Not equals', value: '_neq', needsValue: true },
    { label: 'Is null', value: '_null', needsValue: false },
    { label: 'Is not null', value: '_nnull', needsValue: false },
];

const JSON_OPERATORS: OperatorDef[] = [
    { label: 'Is null', value: '_null', needsValue: false },
    { label: 'Is not null', value: '_nnull', needsValue: false },
    { label: 'Is empty', value: '_empty', needsValue: false },
    { label: 'Is not empty', value: '_nempty', needsValue: false },
];

/**
 * Get available operators for a field type
 */
function getOperatorsForType(type: string): OperatorDef[] {
    switch (type) {
        case 'string':
        case 'text':
        case 'csv':
        case 'hash':
            return STRING_OPERATORS;
        case 'integer':
        case 'bigInteger':
        case 'float':
        case 'decimal':
            return NUMBER_OPERATORS;
        case 'boolean':
            return BOOLEAN_OPERATORS;
        case 'timestamp':
        case 'dateTime':
        case 'date':
        case 'time':
            return DATE_OPERATORS;
        case 'uuid':
            return UUID_OPERATORS;
        case 'json':
            return JSON_OPERATORS;
        default:
            return STRING_OPERATORS;
    }
}

/** Generate unique ID */
let _filterId = 0;
function uid() { return `filter-${++_filterId}`; }

// ============================================================================
// Convert between internal model and DaaS filter JSON
// ============================================================================

function rulesToDaaS(rules: (FilterRule | FilterGroup)[]): Record<string, unknown>[] {
    return rules.map((r) => {
        if ('logical' in r) {
            // Sub-group
            return { [r.logical]: rulesToDaaS(r.rules) };
        }
        // Single rule
        const boolOps = ['_null', '_nnull', '_empty', '_nempty'];
        const val = boolOps.includes(r.operator) ? true : r.value;
        return { [r.field]: { [r.operator]: val } };
    });
}

function daasToRules(filter: Record<string, unknown>): (FilterRule | FilterGroup)[] {
    const key = Object.keys(filter)[0];
    if (!key) return [];

    if (key === '_and' || key === '_or') {
        const children = filter[key] as Record<string, unknown>[];
        const rules: (FilterRule | FilterGroup)[] = children.map((child) => {
            const childKey = Object.keys(child)[0];
            if (childKey === '_and' || childKey === '_or') {
                return {
                    id: uid(),
                    logical: childKey as '_and' | '_or',
                    rules: daasToRules(child),
                } as FilterGroup;
            }
            return parseFieldRule(child);
        });
        return rules;
    }

    // Single rule at top level
    return [parseFieldRule(filter)];
}

function parseFieldRule(node: Record<string, unknown>): FilterRule {
    const field = Object.keys(node)[0];
    const opObj = node[field] as Record<string, unknown>;
    const operator = Object.keys(opObj)[0];
    const value = opObj[operator];
    return { id: uid(), field, operator, value };
}

// ============================================================================
// Sub-components
// ============================================================================

interface RuleRowProps {
    rule: FilterRule;
    fields: Field[];
    disabled?: boolean;
    onChange: (rule: FilterRule) => void;
    onRemove: () => void;
}

const RuleRow: React.FC<RuleRowProps> = ({ rule, fields, disabled, onChange, onRemove }) => {
    const fieldData = useMemo(() =>
        fields.map((f) => ({
            value: f.field,
            label: f.meta?.note || f.field.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
        })),
        [fields]
    );

    const selectedField = fields.find((f) => f.field === rule.field);
    const operators = getOperatorsForType(selectedField?.type || 'string');
    const operatorData = operators.map((o) => ({ value: o.value, label: o.label }));
    const currentOp = operators.find((o) => o.value === rule.operator);

    return (
        <Group gap="xs" wrap="nowrap" data-testid="filter-rule">
            <Select
                value={rule.field}
                onChange={(val) => {
                    if (!val) return;
                    const newField = fields.find((f) => f.field === val);
                    const newOps = getOperatorsForType(newField?.type || 'string');
                    onChange({ ...rule, field: val, operator: newOps[0].value, value: null });
                }}
                data={fieldData}
                placeholder="Field..."
                size="xs"
                style={{ minWidth: 130 }}
                disabled={disabled}
                searchable
            />

            <Select
                value={rule.operator}
                onChange={(val) => {
                    if (!val) return;
                    const op = operators.find((o) => o.value === val);
                    onChange({ ...rule, operator: val, value: op?.needsValue ? rule.value : true });
                }}
                data={operatorData}
                size="xs"
                style={{ minWidth: 130 }}
                disabled={disabled}
            />

            {currentOp?.needsValue && (
                (() => {
                    const type = selectedField?.type || 'string';
                    if (['integer', 'bigInteger', 'float', 'decimal'].includes(type)) {
                        return (
                            <NumberInput
                                value={typeof rule.value === 'number' ? rule.value : undefined}
                                onChange={(val) => onChange({ ...rule, value: val })}
                                placeholder="Value..."
                                size="xs"
                                style={{ minWidth: 100, flex: 1 }}
                                disabled={disabled}
                            />
                        );
                    }
                    if (type === 'boolean') {
                        return (
                            <Select
                                value={rule.value === true ? 'true' : rule.value === false ? 'false' : ''}
                                onChange={(val) => onChange({ ...rule, value: val === 'true' })}
                                data={[{ value: 'true', label: 'True' }, { value: 'false', label: 'False' }]}
                                size="xs"
                                style={{ minWidth: 80 }}
                                disabled={disabled}
                            />
                        );
                    }
                    // String / date / uuid — text input
                    return (
                        <TextInput
                            value={typeof rule.value === 'string' ? rule.value : ''}
                            onChange={(e) => onChange({ ...rule, value: e.currentTarget.value })}
                            placeholder={['timestamp', 'dateTime', 'date'].includes(type) ? 'YYYY-MM-DD' : 'Value...'}
                            size="xs"
                            style={{ minWidth: 120, flex: 1 }}
                            disabled={disabled}
                        />
                    );
                })()
            )}

            <ActionIcon
                variant="subtle"
                color="red"
                size="sm"
                onClick={onRemove}
                disabled={disabled}
                title="Remove filter"
            >
                <IconTrash size={14} />
            </ActionIcon>
        </Group>
    );
};

// ============================================================================
// FilterPanel Component
// ============================================================================

export const FilterPanel: React.FC<FilterPanelProps> = ({
    fields,
    value,
    onChange,
    mode = 'panel',
    collapsible = false,
    defaultCollapsed = true,
    disabled = false,
    maxDepth = 3,
}) => {
    const [collapsed, setCollapsed] = useState(defaultCollapsed);

    // Parse incoming value into internal model
    const [rootGroup, setRootGroup] = useState<FilterGroup>(() => {
        if (value && Object.keys(value).length > 0) {
            const key = Object.keys(value)[0];
            const logical = key === '_or' ? '_or' : '_and';
            return {
                id: uid(),
                logical,
                rules: daasToRules(value),
            };
        }
        return { id: uid(), logical: '_and', rules: [] };
    });

    // Emit DaaS-style filter when rootGroup changes
    const emitChange = useCallback((group: FilterGroup) => {
        setRootGroup(group);
        if (group.rules.length === 0) {
            onChange?.(null);
        } else {
            const nodes = rulesToDaaS(group.rules);
            onChange?.({ [group.logical]: nodes });
        }
    }, [onChange]);

    // ----- Actions -----
    const addRule = useCallback(() => {
        if (fields.length === 0) return;
        const firstField = fields[0];
        const ops = getOperatorsForType(firstField.type);
        const newRule: FilterRule = {
            id: uid(),
            field: firstField.field,
            operator: ops[0].value,
            value: ops[0].needsValue ? null : true,
        };
        emitChange({ ...rootGroup, rules: [...rootGroup.rules, newRule] });
    }, [rootGroup, fields, emitChange]);

    const addGroup = useCallback(() => {
        const newGroup: FilterGroup = {
            id: uid(),
            logical: '_and',
            rules: [],
        };
        emitChange({ ...rootGroup, rules: [...rootGroup.rules, newGroup] });
    }, [rootGroup, emitChange]);

    const updateRule = useCallback((index: number, updated: FilterRule) => {
        const newRules = [...rootGroup.rules];
        newRules[index] = updated;
        emitChange({ ...rootGroup, rules: newRules });
    }, [rootGroup, emitChange]);

    const removeRule = useCallback((index: number) => {
        emitChange({ ...rootGroup, rules: rootGroup.rules.filter((_, i) => i !== index) });
    }, [rootGroup, emitChange]);

    const clearAll = useCallback(() => {
        emitChange({ ...rootGroup, rules: [] });
    }, [rootGroup, emitChange]);

    const toggleLogical = useCallback(() => {
        emitChange({ ...rootGroup, logical: rootGroup.logical === '_and' ? '_or' : '_and' });
    }, [rootGroup, emitChange]);

    // ----- Active filter count for badge -----
    const filterCount = rootGroup.rules.length;

    // ----- Collapsed bar view (chip summary) -----
    if (collapsible && collapsed) {
        return (
            <Group gap="xs" data-testid="filter-panel-collapsed">
                <Button
                    variant="subtle"
                    size="xs"
                    leftSection={<IconFilter size={14} />}
                    rightSection={filterCount > 0 ? <Badge size="xs" circle>{filterCount}</Badge> : <IconChevronDown size={14} />}
                    onClick={() => setCollapsed(false)}
                >
                    Filters
                </Button>
                {filterCount > 0 && (
                    <ActionIcon variant="subtle" size="xs" color="dimmed" onClick={clearAll} title="Clear all filters">
                        <IconX size={12} />
                    </ActionIcon>
                )}
            </Group>
        );
    }

    // ----- Full panel view -----
    const content = (
        <Stack gap="xs" data-testid="filter-panel">
            {/* Header */}
            <Group justify="space-between">
                <Group gap="xs">
                    <IconFilter size={16} style={{ color: 'var(--mantine-color-dimmed)' }} />
                    <Text size="sm" fw={600}>Filters</Text>
                    {filterCount > 0 && (
                        <Badge size="xs" variant="light">{filterCount} active</Badge>
                    )}
                </Group>
                <Group gap="xs">
                    {filterCount > 0 && (
                        <Button variant="subtle" size="xs" color="dimmed" onClick={clearAll}>
                            Clear all
                        </Button>
                    )}
                    {collapsible && (
                        <ActionIcon variant="subtle" size="xs" onClick={() => setCollapsed(true)}>
                            <IconChevronUp size={14} />
                        </ActionIcon>
                    )}
                </Group>
            </Group>

            {/* Logical toggle */}
            {rootGroup.rules.length > 1 && (
                <Group gap="xs">
                    <Text size="xs" c="dimmed">Match</Text>
                    <Button
                        variant={rootGroup.logical === '_and' ? 'filled' : 'outline'}
                        size="compact-xs"
                        onClick={() => rootGroup.logical !== '_and' && toggleLogical()}
                    >
                        ALL
                    </Button>
                    <Button
                        variant={rootGroup.logical === '_or' ? 'filled' : 'outline'}
                        size="compact-xs"
                        onClick={() => rootGroup.logical !== '_or' && toggleLogical()}
                    >
                        ANY
                    </Button>
                </Group>
            )}

            {/* Rules */}
            {rootGroup.rules.length === 0 ? (
                <Text size="sm" c="dimmed">No filter rules. Click "Add filter" to get started.</Text>
            ) : (
                <Stack gap={6}>
                    {rootGroup.rules.map((rule, index) => {
                        if ('logical' in rule) {
                            // Nested groups — simplified: show as badge
                            return (
                                <Group key={rule.id} gap="xs">
                                    <Badge variant="outline" size="sm">
                                        {rule.logical === '_and' ? 'AND' : 'OR'} group ({rule.rules.length} rules)
                                    </Badge>
                                    <ActionIcon
                                        variant="subtle" color="red" size="xs"
                                        onClick={() => removeRule(index)}
                                        disabled={disabled}
                                    >
                                        <IconTrash size={12} />
                                    </ActionIcon>
                                </Group>
                            );
                        }
                        return (
                            <RuleRow
                                key={rule.id}
                                rule={rule}
                                fields={fields}
                                disabled={disabled}
                                onChange={(updated) => updateRule(index, updated)}
                                onRemove={() => removeRule(index)}
                            />
                        );
                    })}
                </Stack>
            )}

            {/* Add buttons */}
            <Group gap="xs">
                <Menu position="bottom-start" withArrow shadow="sm">
                    <Menu.Target>
                        <Button variant="subtle" size="xs" leftSection={<IconPlus size={14} />}>
                            Add filter
                        </Button>
                    </Menu.Target>
                    <Menu.Dropdown>
                        {fields.map((f) => (
                            <Menu.Item
                                key={f.field}
                                onClick={() => {
                                    const ops = getOperatorsForType(f.type);
                                    const newRule: FilterRule = {
                                        id: uid(),
                                        field: f.field,
                                        operator: ops[0].value,
                                        value: ops[0].needsValue ? null : true,
                                    };
                                    emitChange({ ...rootGroup, rules: [...rootGroup.rules, newRule] });
                                }}
                            >
                                {f.meta?.note || f.field.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                            </Menu.Item>
                        ))}
                    </Menu.Dropdown>
                </Menu>
                {maxDepth > 1 && (
                    <Button variant="subtle" size="xs" color="dimmed" onClick={addGroup}>
                        Add group
                    </Button>
                )}
            </Group>
        </Stack>
    );

    if (mode === 'inline') return content;

    return (
        <Paper withBorder p="sm" data-testid="filter-panel-container">
            {content}
        </Paper>
    );
};

export default FilterPanel;
