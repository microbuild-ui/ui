/**
 * CollectionList Component
 * 
 * A dynamic list/table that fetches items from a collection.
 * Used by ListO2M and ListM2M for selecting existing items.
 * 
 * @package @microbuild/ui-collections
 */

"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
    Paper,
    Table,
    Group,
    Button,
    Text,
    Checkbox,
    Stack,
    LoadingOverlay,
    TextInput,
    Pagination,
    Select,
    Alert,
    ActionIcon,
} from '@mantine/core';
import { IconSearch, IconRefresh, IconAlertCircle } from '@tabler/icons-react';
import { FieldsService, ItemsService } from '@microbuild/services';
import type { Field, AnyItem } from '@microbuild/types';

export interface BulkAction {
    label: string;
    icon?: React.ReactNode;
    color?: string;
    action: (selectedIds: (string | number)[]) => void | Promise<void>;
}

export interface CollectionListProps {
    /** Collection name to display */
    collection: string;
    /** Enable row selection */
    enableSelection?: boolean;
    /** Filter to apply */
    filter?: Record<string, unknown>;
    /** Bulk actions for selected items */
    bulkActions?: BulkAction[];
    /** Fields to display (defaults to first 4 fields) */
    fields?: string[];
    /** Items per page */
    limit?: number;
    /** Enable search */
    enableSearch?: boolean;
    /** Primary key field name */
    primaryKeyField?: string;
    /** Callback when item is clicked */
    onItemClick?: (item: AnyItem) => void;
}

// System fields to exclude from default display
const SYSTEM_FIELDS = [
    'user_created',
    'user_updated', 
    'date_created',
    'date_updated',
];

/**
 * CollectionList - Dynamic list for displaying collection items
 */
export const CollectionList: React.FC<CollectionListProps> = ({
    collection,
    enableSelection = false,
    filter,
    bulkActions = [],
    fields: displayFields,
    limit: initialLimit = 15,
    enableSearch = true,
    primaryKeyField = 'id',
    onItemClick,
}) => {
    const [fields, setFields] = useState<Field[]>([]);
    const [items, setItems] = useState<AnyItem[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // Pagination state
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(initialLimit);
    const [search, setSearch] = useState('');

    // Load fields for the collection
    useEffect(() => {
        const loadFields = async () => {
            try {
                const fieldsService = new FieldsService();
                const allFields = await fieldsService.readAll(collection);
                
                // Filter out system fields and alias fields
                const visibleFields = allFields.filter((f: Field) => {
                    if (SYSTEM_FIELDS.includes(f.field)) return false;
                    if (f.type === 'alias') return false;
                    if (f.meta?.hidden) return false;
                    return true;
                });

                setFields(visibleFields);
            } catch (err) {
                console.error('Error loading fields:', err);
                setError(
                    'Failed to load collection fields. Make sure the Storybook Host app is running (pnpm dev:host) and connected at http://localhost:3000.'
                );
                setLoading(false);
            }
        };

        loadFields();
    }, [collection]);

    // Load items
    const loadItems = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const itemsService = new ItemsService(collection);
            
            // Build query
            const query: Record<string, unknown> = {
                limit,
                page,
                meta: ['total_count', 'filter_count'],
            };

            // Add fields to fetch
            const fieldsToFetch = displayFields || fields.slice(0, 5).map((f: Field) => f.field);
            if (fieldsToFetch.length > 0) {
                // Always include primary key
                if (!fieldsToFetch.includes(primaryKeyField)) {
                    fieldsToFetch.unshift(primaryKeyField);
                }
                query.fields = fieldsToFetch;
            }

            // Add filter
            if (filter) {
                query.filter = filter;
            }

            // Add search
            if (search) {
                query.search = search;
            }

            const result = await itemsService.readByQuery(query);
            setItems(result || []);
            
            // Try to get total count from meta or fallback to items length
            // Note: The API should return meta.total_count
            setTotalCount(result.length || 0);
            
        } catch (err) {
            console.error('Error loading items:', err);
            setError(err instanceof Error ? err.message : 'Failed to load items');
            setItems([]);
        } finally {
            setLoading(false);
        }
    }, [collection, fields, displayFields, filter, limit, page, search, primaryKeyField]);

    // Load items when dependencies change
    useEffect(() => {
        if (fields.length > 0 || displayFields) {
            loadItems();
        }
    }, [loadItems, fields.length, displayFields]);

    // Reset page when search changes
    useEffect(() => {
        setPage(1);
    }, [search]);

    // Toggle item selection
    const toggleSelection = (id: string | number) => {
        setSelectedIds(prev => 
            prev.includes(id) 
                ? prev.filter(i => i !== id)
                : [...prev, id]
        );
    };

    // Toggle all items
    const toggleAll = () => {
        if (selectedIds.length === items.length && items.length > 0) {
            setSelectedIds([]);
        } else {
            setSelectedIds(items.map(i => i[primaryKeyField] as string | number));
        }
    };

    // Get columns to display
    const getDisplayColumns = (): string[] => {
        if (displayFields) return displayFields;
        // Default: show first 4 non-id fields plus id
        const cols = fields
            .filter((f: Field) => f.field !== primaryKeyField)
            .slice(0, 4)
            .map((f: Field) => f.field);
        return [primaryKeyField, ...cols];
    };

    const columns = getDisplayColumns();
    const totalPages = Math.max(1, Math.ceil(totalCount / limit));

    // Format column header
    const formatHeader = (fieldName: string): string => {
        const field = fields.find((f: Field) => f.field === fieldName);
        if (field?.meta?.note) return field.meta.note;
        return fieldName.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
    };

    // Format cell value
    const formatValue = (value: unknown): string => {
        if (value === null || value === undefined) return '-';
        if (typeof value === 'boolean') return value ? 'Yes' : 'No';
        if (typeof value === 'object') return JSON.stringify(value);
        return String(value);
    };

    return (
        <Stack gap="md" data-testid="collection-list">
            {/* Search and Actions Bar */}
            <Group justify="space-between">
                <Group>
                    {enableSearch && (
                        <TextInput
                            placeholder="Search..."
                            leftSection={<IconSearch size={16} />}
                            value={search}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.currentTarget.value)}
                            style={{ width: 250 }}
                            data-testid="collection-list-search"
                        />
                    )}
                    <ActionIcon 
                        variant="subtle" 
                        onClick={loadItems}
                        title="Refresh"
                        data-testid="collection-list-refresh"
                    >
                        <IconRefresh size={16} />
                    </ActionIcon>
                </Group>

                {/* Bulk Actions */}
                {enableSelection && selectedIds.length > 0 && bulkActions.length > 0 && (
                    <Group data-testid="collection-list-bulk-actions">
                        <Text size="sm" c="dimmed">
                            {selectedIds.length} selected
                        </Text>
                        {bulkActions.map((action, index) => (
                            <Button
                                key={index}
                                size="sm"
                                variant="light"
                                color={action.color}
                                leftSection={action.icon}
                                onClick={() => action.action(selectedIds)}
                                data-testid={`bulk-action-${index}`}
                            >
                                {action.label}
                            </Button>
                        ))}
                    </Group>
                )}
            </Group>

            {/* Error Alert */}
            {error && (
                <Alert icon={<IconAlertCircle size={16} />} color="red" data-testid="collection-list-error">
                    {error}
                </Alert>
            )}

            {/* Table */}
            <Paper withBorder pos="relative">
                <LoadingOverlay visible={loading} />
                
                <Table striped highlightOnHover data-testid="collection-list-table">
                    <Table.Thead>
                        <Table.Tr>
                            {enableSelection && (
                                <Table.Th style={{ width: 40 }}>
                                    <Checkbox
                                        checked={selectedIds.length === items.length && items.length > 0}
                                        indeterminate={selectedIds.length > 0 && selectedIds.length < items.length}
                                        onChange={toggleAll}
                                        data-testid="collection-list-select-all"
                                    />
                                </Table.Th>
                            )}
                            {columns.map(col => (
                                <Table.Th key={col}>{formatHeader(col)}</Table.Th>
                            ))}
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {items.length === 0 && !loading ? (
                            <Table.Tr>
                                <Table.Td colSpan={columns.length + (enableSelection ? 1 : 0)}>
                                    <Text ta="center" c="dimmed" py="xl">
                                        No items found
                                    </Text>
                                </Table.Td>
                            </Table.Tr>
                        ) : (
                            items.map((item) => {
                                const itemId = item[primaryKeyField] as string | number;
                                return (
                                    <Table.Tr 
                                        key={itemId}
                                        bg={selectedIds.includes(itemId) ? 'var(--mantine-color-blue-light)' : undefined}
                                        style={{ cursor: onItemClick ? 'pointer' : undefined }}
                                        onClick={() => onItemClick?.(item)}
                                        data-testid={`collection-list-row-${itemId}`}
                                    >
                                        {enableSelection && (
                                            <Table.Td onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                                                <Checkbox
                                                    checked={selectedIds.includes(itemId)}
                                                    onChange={() => toggleSelection(itemId)}
                                                    data-testid={`collection-list-select-${itemId}`}
                                                />
                                            </Table.Td>
                                        )}
                                        {columns.map(col => (
                                            <Table.Td key={col}>
                                                <Text size="sm" lineClamp={1}>
                                                    {formatValue(item[col])}
                                                </Text>
                                            </Table.Td>
                                        ))}
                                    </Table.Tr>
                                );
                            })
                        )}
                    </Table.Tbody>
                </Table>
            </Paper>

            {/* Pagination */}
            {totalPages > 1 && (
                <Group justify="space-between" data-testid="collection-list-pagination">
                    <Group>
                        <Text size="sm" c="dimmed">
                            Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, totalCount)} of {totalCount}
                        </Text>
                    </Group>

                    <Group>
                        <Text size="sm">Items per page:</Text>
                        <Select
                            value={String(limit)}
                            onChange={(value) => {
                                if (value) {
                                    setLimit(Number(value));
                                    setPage(1);
                                }
                            }}
                            data={['10', '15', '25', '50', '100']}
                            style={{ width: 80 }}
                            data-testid="collection-list-per-page"
                        />

                        <Pagination
                            value={page}
                            onChange={setPage}
                            total={totalPages}
                            size="sm"
                            data-testid="collection-list-pagination-control"
                        />
                    </Group>
                </Group>
            )}
        </Stack>
    );
};

export default CollectionList;
