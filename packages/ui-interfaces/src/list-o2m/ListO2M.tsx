"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
    Paper,
    Group,
    Button,
    Text,
    LoadingOverlay,
    Modal,
    Stack,
    ActionIcon,
    Pagination,
    Select,
    Table,
    TextInput,
    Alert,
    Box,
    Tooltip,
} from "@mantine/core";
import {
    IconPlus,
    IconEdit,
    IconTrash,
    IconExternalLink,
    IconSearch,
    IconChevronUp,
    IconChevronDown,
    IconAlertCircle,
    IconUnlink,
} from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import { useRelationO2M, useRelationO2MItems, type O2MItem } from "@microbuild/hooks";
import { CollectionList } from "@microbuild/ui-collections";
import { CollectionForm } from "@microbuild/ui-collections";

/**
 * Props for the ListO2M component
 * 
 * One-to-Many (O2M) relationship interface - displays MULTIPLE items from a related collection
 * that have a foreign key pointing to the current item.
 * 
 * Example: A "category" has MANY "posts" (posts have category_id foreign key)
 * This is the INVERSE of M2O - viewing the "many" side from the "one" perspective.
 */
export interface ListO2MProps {
    /** Current value - array of related item IDs or objects (usually managed internally) */
    value?: (string | number | Record<string, unknown>)[];
    /** Callback fired when value changes */
    onChange?: (value: (string | number | Record<string, unknown>)[]) => void;
    /** Current collection name (the "one" side) */
    collection: string;
    /** Field name for this O2M relationship */
    field: string;
    /** Primary key of the current item */
    primaryKey?: string | number;
    /** Layout mode - 'list' or 'table' */
    layout?: 'list' | 'table';
    /** Table spacing for table layout */
    tableSpacing?: 'compact' | 'cozy' | 'comfortable';
    /** Fields to display from related collection */
    fields?: string[];
    /** Template string for list layout */
    template?: string;
    /** Whether the interface is disabled */
    disabled?: boolean;
    /** Enable create new items button */
    enableCreate?: boolean;
    /** Enable select existing items button */
    enableSelect?: boolean;
    /** Filter to apply when selecting items */
    filter?: Record<string, unknown>;
    /** Enable search filter in table mode */
    enableSearchFilter?: boolean;
    /** Enable link to related items */
    enableLink?: boolean;
    /** Items per page */
    limit?: number;
    /** Field label */
    label?: string;
    /** Field description */
    description?: string;
    /** Error message */
    error?: string | boolean;
    /** Whether the field is required */
    required?: boolean;
    /** Whether the field is read-only */
    readOnly?: boolean;
    /** Action when removing: 'unlink' (set FK to null) or 'delete' (delete item) */
    removeAction?: 'unlink' | 'delete';
    /** Mock items for demo/testing - bypasses hook-based data loading */
    mockItems?: O2MItem[];
    /** Mock relationship info for demo/testing - partial O2MRelationInfo for demo purposes */
    mockRelationInfo?: Partial<{
        relatedCollection: { collection: string };
        reverseJunctionField: { field: string; type: string };
        sortField: string;
    }>;
}

/**
 * ListO2M - One-to-Many relationship interface
 * 
 * Similar to DaaS list-o2m interface.
 * Displays items from a related collection that have a foreign key pointing to this item.
 */
export const ListO2M: React.FC<ListO2MProps> = ({
    value: valueProp,
    onChange,
    collection,
    field,
    primaryKey,
    layout = 'list',
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    tableSpacing: _tableSpacing = 'cozy',
    fields = ['id'],
    template,
    disabled = false,
    enableCreate = true,
    enableSelect = true,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    filter: _filter,
    enableSearchFilter = false,
    enableLink = false,
    limit: initialLimit = 15,
    label,
    description,
    error,
    required = false,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    readOnly: _readOnly = false,
    removeAction = 'unlink',
    mockItems,
    mockRelationInfo,
}) => {
    // Ensure value is always an array (protect against null)
    const value = valueProp ?? [];
    
    // Determine if we're in demo/mock mode
    const isDemoMode = mockItems !== undefined;

    // Use the custom hook for O2M relationship info (only when not in demo mode)
    const { relationInfo: hookRelationInfo, loading: hookLoading, error: hookError } = useRelationO2M(
        isDemoMode ? '' : collection, 
        isDemoMode ? '' : field
    );

    // State for pagination and search
    const [currentPage, setCurrentPage] = useState(1);
    const [limit, setLimit] = useState(initialLimit);
    const [search, setSearch] = useState("");
    const [sortField, setSortField] = useState("");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

    // Internal state for mock items (for demo mode)
    const [internalMockItems, setInternalMockItems] = useState<O2MItem[]>(mockItems || []);

    // Staged selections - items selected but not yet persisted (for new parent items)
    // Following DaaS pattern: stage locally, persist when parent saves
    const [stagedSelections, setStagedSelections] = useState<O2MItem[]>([]);

    // Check if parent item is saved (has valid primary key, not '+' which means new)
    const isParentSaved = primaryKey && primaryKey !== '+';

    // Modal states
    const [editModalOpened, { open: openEditModal, close: closeEditModal }] = useDisclosure(false);
    const [selectModalOpened, { open: openSelectModal, close: closeSelectModal }] = useDisclosure(false);
    const [currentlyEditing, setCurrentlyEditing] = useState<O2MItem | null>(null);
    const [isCreatingNew, setIsCreatingNew] = useState(false);
    
    // Error notification state
    const [selectError, setSelectError] = useState<string | null>(null);

    // Use the items management hook (only when not in demo mode)
    const {
        items: hookItems,
        totalCount: hookTotalCount,
        loading: itemsLoading,
        loadItems,
        selectItems,
        removeItem,
        deleteItem,
        moveItemUp: hookMoveItemUp,
        moveItemDown: hookMoveItemDown,
    } = useRelationO2MItems(isDemoMode ? null : hookRelationInfo, isDemoMode ? null : (primaryKey || null));

    // Combined values - use mock data in demo mode, hook data otherwise
    const relationInfo = isDemoMode ? mockRelationInfo : hookRelationInfo;
    const relationError = isDemoMode ? null : hookError;
    const relationLoading = isDemoMode ? false : hookLoading;
    
    // Combine fetched items with staged selections (for unsaved parent items)
    // Staged items have $type: 'staged' to distinguish them
    const baseItems: O2MItem[] = isDemoMode ? internalMockItems : hookItems;
    const items: O2MItem[] = isParentSaved 
        ? baseItems 
        : [...baseItems, ...stagedSelections];
    
    const totalCount = isDemoMode 
        ? internalMockItems.length 
        : (hookTotalCount + stagedSelections.length);
    const loading = isDemoMode ? false : (relationLoading || itemsLoading);

    // Notify parent component when staged selections change
    // This allows the parent form to include these in the save payload (DaaS pattern)
    useEffect(() => {
        if (!isParentSaved && onChange) {
            // Build the value in DaaS format for O2M
            // Staged selections include the FK field pointing to the (future) parent
            if (stagedSelections.length > 0 && relationInfo?.reverseJunctionField) {
                const updatePayload = stagedSelections.map(item => ({
                    [relationInfo.reverseJunctionField!.field]: primaryKey || '+',
                    id: item.id,
                }));
                onChange(updatePayload);
            } else if (stagedSelections.length === 0 && value.length > 0) {
                // Clear if no staged items
                onChange([]);
            }
        }
    }, [stagedSelections, isParentSaved, onChange, relationInfo, primaryKey, value.length]);
    
    // Functions that work for both demo and real mode
    const moveItemUp = async (index: number) => {
        if (isDemoMode) {
            if (index <= 0) return;
            const newItems = [...internalMockItems];
            [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
            setInternalMockItems(newItems);
        } else {
            await hookMoveItemUp(index);
        }
    };

    const moveItemDown = async (index: number) => {
        if (isDemoMode) {
            if (index >= internalMockItems.length - 1) return;
            const newItems = [...internalMockItems];
            [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
            setInternalMockItems(newItems);
        } else {
            await hookMoveItemDown(index);
        }
    };

    // Load items when parameters change (only for real mode)
    useEffect(() => {
        if (!isDemoMode && relationInfo && primaryKey) {
            loadItems({
                limit,
                page: currentPage,
                search: enableSearchFilter ? search : undefined,
                sortField,
                sortDirection,
                fields,
            });
        }
    }, [isDemoMode, relationInfo, primaryKey, currentPage, limit, search, sortField, sortDirection, fields, enableSearchFilter, loadItems]);

    // Handle creating new item
    const handleCreateNew = () => {
        setCurrentlyEditing(null);
        setIsCreatingNew(true);
        openEditModal();
    };

    // Handle editing existing item
    const handleEditItem = (item: O2MItem) => {
        setCurrentlyEditing(item);
        setIsCreatingNew(false);
        openEditModal();
    };

    // Handle selecting existing items from the related collection
    // Following DaaS pattern: if parent is saved, link immediately via API
    // If parent is new (not saved), stage selections locally
    const handleSelectItems = async (selectedIds: (string | number)[]) => {
        // Clear any previous error
        setSelectError(null);
        
        if (isParentSaved) {
            // Parent is saved - link items immediately via API
            try {
                await selectItems(selectedIds);
                closeSelectModal();
                // Reload items to show the new selections
                if (relationInfo && primaryKey) {
                    loadItems({
                        limit,
                        page: currentPage,
                        search: enableSearchFilter ? search : undefined,
                        sortField,
                        sortDirection,
                        fields,
                    });
                }
            } catch (err) {
                console.error('Error selecting items:', err);
                setSelectError('Failed to link items. Please try again.');
            }
        } else {
            // Parent is NOT saved - stage selections locally (DaaS pattern)
            // These will be persisted when the parent item is saved
            try {
                // Fetch the selected items to display them
                const ItemsService = (await import('@microbuild/services')).ItemsService;
                if (relationInfo?.relatedCollection?.collection) {
                    const itemsService = new ItemsService(relationInfo.relatedCollection.collection);
                    const fetchedItems = await itemsService.readMany(selectedIds as (string | number)[], {
                        fields,
                    });
                    
                    // Add to staged selections with $type: 'staged'
                    const stagedItems: O2MItem[] = (fetchedItems as O2MItem[]).map(item => ({
                        ...item,
                        $type: 'staged' as const,
                    }));
                    
                    setStagedSelections(prev => {
                        // Avoid duplicates
                        const existingIds = new Set(prev.map(i => i.id));
                        const newItems = stagedItems.filter(i => !existingIds.has(i.id));
                        return [...prev, ...newItems];
                    });
                    
                    closeSelectModal();
                }
            } catch (err) {
                console.error('Error staging items:', err);
                setSelectError('Failed to select items. Please try again.');
            }
        }
    };

    // Handle removing/unlinking item (including staged items)
    const handleRemoveItem = async (item: O2MItem) => {
        // If it's a staged item, just remove from local state
        if (item.$type === 'staged') {
            setStagedSelections(prev => prev.filter(i => i.id !== item.id));
            return;
        }
        
        try {
            if (removeAction === 'delete') {
                await deleteItem(item);
            } else {
                await removeItem(item);
            }
        } catch (err) {
            console.error('Error removing item:', err);
        }
    };

    // Handle drag and drop reordering using hooks
    const handleMoveUp = async (index: number) => {
        try {
            await moveItemUp(index);
        } catch (err) {
            console.error('Error moving item up:', err);
        }
    };

    const handleMoveDown = async (index: number) => {
        try {
            await moveItemDown(index);
        } catch (err) {
            console.error('Error moving item down:', err);
        }
    };

    // Handle sorting column click
    const handleSort = useCallback((fieldName: string) => {
        if (sortField === fieldName) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(fieldName);
            setSortDirection('asc');
        }
    }, [sortField]);

    // Format display value for an item
    const formatDisplayValue = (item: O2MItem) => {
        if (template) {
            // Simple template rendering
            let rendered = template;
            Object.keys(item).forEach(key => {
                rendered = rendered.replace(`{{${key}}}`, String(item[key] || ''));
            });
            return rendered;
        }

        // Default: show the first available field that's not 'id'
        const displayField = fields.find(f => f !== 'id' && item[f]) || 'id';
        return String(item[displayField] ?? item.id ?? '');
    };

    const totalPages = Math.ceil(totalCount / limit);

    // Show relation error (only in non-demo mode)
    if (!isDemoMode && relationError) {
        return (
            <Stack gap="xs">
                {label && <Text size="sm" fw={500}>{label}</Text>}
                <Alert icon={<IconAlertCircle size={16} />} title="Configuration Error" color="red" data-testid="o2m-error">
                    <Text size="sm">{relationError}</Text>
                    <Text size="xs" c="dimmed" mt="xs">
                        Note: In Storybook, relational interfaces require API proxy routes. 
                        This component works fully in a Next.js app with DaaS integration.
                    </Text>
                </Alert>
            </Stack>
        );
    }

    // In non-demo mode, show warning if relationship not configured
    if (!isDemoMode && !relationInfo && !relationLoading) {
        return (
            <Alert icon={<IconAlertCircle size={16} />} title="Relationship not configured" color="orange" data-testid="o2m-not-configured">
                The one-to-many relationship is not properly configured for this field.
            </Alert>
        );
    }

    return (
        <Stack gap="sm" data-testid="list-o2m">
            {label && (
                <Group>
                    <Text size="sm" fw={500}>
                        {label}
                        {required && <Text span c="red"> *</Text>}
                    </Text>
                </Group>
            )}

            {description && (
                <Text size="xs" c="dimmed">{description}</Text>
            )}

            <Paper p="md" withBorder pos="relative">
                <LoadingOverlay visible={loading} />

                {/* Header Actions */}
                <Group justify="space-between" mb="md">
                    <Group>
                        {enableSearchFilter && layout === 'table' && (
                            <TextInput
                                placeholder="Search..."
                                leftSection={<IconSearch size={16} />}
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.currentTarget.value);
                                    setCurrentPage(1);
                                }}
                                style={{ width: 250 }}
                                data-testid="o2m-search"
                            />
                        )}
                    </Group>

                    <Group>
                        {totalCount > 0 && (
                            <Text size="sm" c="dimmed" data-testid="o2m-count">
                                {totalCount} item{totalCount !== 1 ? 's' : ''}
                            </Text>
                        )}

                        {!disabled && enableSelect && (
                            <Button
                                variant="light"
                                leftSection={<IconPlus size={16} />}
                                onClick={openSelectModal}
                                data-testid="o2m-select-btn"
                            >
                                Add Existing
                            </Button>
                        )}

                        {!disabled && enableCreate && (
                            <Button
                                leftSection={<IconPlus size={16} />}
                                onClick={handleCreateNew}
                                data-testid="o2m-create-btn"
                            >
                                Create New
                            </Button>
                        )}
                    </Group>
                </Group>

                {/* Content */}
                {items.length === 0 && !loading ? (
                    <Paper p="xl" style={{ textAlign: 'center' }} data-testid="o2m-empty">
                        <Text c="dimmed">No related items</Text>
                    </Paper>
                ) : layout === 'table' ? (
                    /* Table Layout */
                    <Table striped highlightOnHover data-testid="o2m-table">
                        <Table.Thead>
                            <Table.Tr>
                                {relationInfo?.sortField && (
                                    <Table.Th style={{ width: 80 }}>Order</Table.Th>
                                )}
                                {fields.map(fieldName => (
                                    <Table.Th 
                                        key={fieldName}
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => handleSort(fieldName)}
                                    >
                                        <Group gap="xs" wrap="nowrap">
                                            <Text size="sm" fw={500}>
                                                {fieldName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                            </Text>
                                            {sortField === fieldName && (
                                                sortDirection === 'asc' 
                                                    ? <IconChevronUp size={14} />
                                                    : <IconChevronDown size={14} />
                                            )}
                                        </Group>
                                    </Table.Th>
                                ))}
                                <Table.Th style={{ width: 120 }}>Actions</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {items.map((item, index) => (
                                <Table.Tr key={item.id} data-testid={`o2m-row-${item.id}`}>
                                    {relationInfo?.sortField && (
                                        <Table.Td>
                                            <Group gap="xs">
                                                <ActionIcon
                                                    variant="subtle"
                                                    size="sm"
                                                    disabled={index === 0 || disabled}
                                                    onClick={() => handleMoveUp(index)}
                                                    data-testid={`o2m-move-up-${item.id}`}
                                                >
                                                    <IconChevronUp size={14} />
                                                </ActionIcon>
                                                <ActionIcon
                                                    variant="subtle"
                                                    size="sm"
                                                    disabled={index === items.length - 1 || disabled}
                                                    onClick={() => handleMoveDown(index)}
                                                    data-testid={`o2m-move-down-${item.id}`}
                                                >
                                                    <IconChevronDown size={14} />
                                                </ActionIcon>
                                            </Group>
                                        </Table.Td>
                                    )}
                                    {fields.map(fieldName => {
                                        const value = item[fieldName];
                                        return (
                                            <Table.Td key={fieldName}>
                                                <Text size="sm">{String(value ?? '-')}</Text>
                                            </Table.Td>
                                        );
                                    })}
                                    <Table.Td>
                                        <Group gap="xs">
                                            {enableLink && (
                                                <Tooltip label="View item">
                                                    <ActionIcon
                                                        variant="subtle"
                                                        color="blue"
                                                        size="sm"
                                                        data-testid={`o2m-link-${item.id}`}
                                                    >
                                                        <IconExternalLink size={14} />
                                                    </ActionIcon>
                                                </Tooltip>
                                                )}

                                            {!disabled && (
                                                <>
                                                    <Tooltip label="Edit">
                                                        <ActionIcon
                                                            variant="subtle"
                                                            color="gray"
                                                            size="sm"
                                                            onClick={() => handleEditItem(item)}
                                                            data-testid={`o2m-edit-${item.id}`}
                                                        >
                                                            <IconEdit size={14} />
                                                        </ActionIcon>
                                                    </Tooltip>

                                                    <Tooltip label={removeAction === 'delete' ? 'Delete' : 'Unlink'}>
                                                        <ActionIcon
                                                            variant="subtle"
                                                            color="red"
                                                            size="sm"
                                                            onClick={() => handleRemoveItem(item)}
                                                            data-testid={`o2m-remove-${item.id}`}
                                                        >
                                                            {removeAction === 'delete' ? <IconTrash size={14} /> : <IconUnlink size={14} />}
                                                        </ActionIcon>
                                                    </Tooltip>
                                                </>
                                            )}
                                        </Group>
                                    </Table.Td>
                                </Table.Tr>
                            ))}
                        </Table.Tbody>
                    </Table>
                ) : (
                    /* List Layout */
                    <Stack gap="xs" data-testid="o2m-list">
                        {items.map((item, index) => (
                            <Paper
                                key={item.id}
                                p="sm"
                                withBorder
                                style={{ cursor: disabled ? 'default' : 'pointer' }}
                                onClick={() => !disabled && handleEditItem(item)}
                                data-testid={`o2m-item-${item.id}`}
                            >
                                <Group justify="space-between">
                                    <Group>
                                        {relationInfo?.sortField && !disabled && (
                                            <Group gap="xs">
                                                <ActionIcon
                                                    variant="subtle"
                                                    size="sm"
                                                    disabled={index === 0}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleMoveUp(index);
                                                    }}
                                                    data-testid={`o2m-list-move-up-${item.id}`}
                                                >
                                                    <IconChevronUp size={14} />
                                                </ActionIcon>
                                                <ActionIcon
                                                    variant="subtle"
                                                    size="sm"
                                                    disabled={index === items.length - 1}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleMoveDown(index);
                                                    }}
                                                    data-testid={`o2m-list-move-down-${item.id}`}
                                                >
                                                    <IconChevronDown size={14} />
                                                </ActionIcon>
                                            </Group>
                                        )}
                                        <Text>{formatDisplayValue(item)}</Text>
                                    </Group>
                                    <Group gap="xs">
                                        {enableLink && (
                                            <ActionIcon
                                                variant="subtle"
                                                color="blue"
                                                size="sm"
                                                onClick={(e) => e.stopPropagation()}
                                                data-testid={`o2m-list-link-${item.id}`}
                                            >
                                                <IconExternalLink size={14} />
                                            </ActionIcon>
                                            )}
                                        {!disabled && (
                                            <ActionIcon
                                                variant="subtle"
                                                color="red"
                                                size="sm"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleRemoveItem(item);
                                                }}
                                                data-testid={`o2m-list-remove-${item.id}`}
                                            >
                                                {removeAction === 'delete' ? <IconTrash size={14} /> : <IconUnlink size={14} />}
                                            </ActionIcon>
                                        )}
                                    </Group>
                                </Group>
                            </Paper>
                        ))}
                    </Stack>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <Group justify="space-between" mt="md" data-testid="o2m-pagination">
                        <Group>
                            <Text size="sm" c="dimmed">
                                Showing {((currentPage - 1) * limit) + 1} to {Math.min(currentPage * limit, totalCount)} of {totalCount}
                        </Text>
                        </Group>

                        <Group>
                            <Text size="sm">Items per page:</Text>
                            <Select
                                value={String(limit)}
                                onChange={(value) => {
                                    if (value) {
                                        setLimit(Number(value));
                                        setCurrentPage(1);
                                    }
                                }}
                                data={['10', '15', '25', '50', '100']}
                                style={{ width: 80 }}
                                data-testid="o2m-per-page"
                            />

                            <Pagination
                                value={currentPage}
                                onChange={setCurrentPage}
                                total={totalPages}
                                size="sm"
                                data-testid="o2m-pagination-control"
                            />
                        </Group>
                    </Group>
                )}
            </Paper>

            {error && (
                <Text size="xs" c="red" data-testid="o2m-error-text">{typeof error === 'string' ? error : 'Invalid value'}</Text>
            )}

            {/* Edit Modal */}
            <Modal
                opened={editModalOpened}
                onClose={closeEditModal}
                title={isCreatingNew ? "Create New Item" : "Edit Item"}
                size="lg"
            >
                {relationInfo && relationInfo.relatedCollection && (
                    <CollectionForm
                        collection={relationInfo.relatedCollection.collection}
                        id={currentlyEditing?.id}
                        mode={isCreatingNew ? "create" : "edit"}
                        defaultValues={isCreatingNew && relationInfo.reverseJunctionField ? {
                            [relationInfo.reverseJunctionField.field]: primaryKey
                        } : undefined}
                        onSuccess={() => {
                            closeEditModal();
                            if (!isDemoMode && relationInfo && primaryKey) {
                                loadItems({
                                    limit,
                                    page: currentPage,
                                    search: enableSearchFilter ? search : undefined,
                                    sortField,
                                    sortDirection,
                                    fields,
                                });
                            }
                        }}
                    />
                    )}
            </Modal>

            {/* Select Modal */}
            <Modal
                opened={selectModalOpened}
                onClose={() => {
                    closeSelectModal();
                    setSelectError(null);
                }}
                title="Select Existing Items"
                size="xl"
            >
                {/* Show error if there was a problem */}
                {selectError && (
                    <Alert 
                        icon={<IconAlertCircle size={16} />} 
                        title="Error" 
                        color="red" 
                        mb="md"
                        withCloseButton
                        onClose={() => setSelectError(null)}
                    >
                        {selectError}
                    </Alert>
                )}
                
                {/* Info notice when parent is not saved - items will be staged */}
                {!isParentSaved && !selectError && (
                    <Alert 
                        icon={<IconAlertCircle size={16} />} 
                        title="Items will be linked when you save" 
                        color="blue" 
                        mb="md"
                    >
                        Selected items will be linked after you save the current item.
                    </Alert>
                )}
                
                {relationInfo && relationInfo.relatedCollection && relationInfo.reverseJunctionField && (
                    <Box p="md">
                        <CollectionList
                            collection={relationInfo.relatedCollection.collection}
                            enableSelection
                            filter={primaryKey && primaryKey !== '+' ? {
                                // Filter to show only items not already linked
                                // Note: primaryKey === '+' is DaaS convention for "new item"
                                _or: [
                                    {
                                        [relationInfo.reverseJunctionField.field]: {
                                            _null: true
                                        }
                                    },
                                    {
                                        [relationInfo.reverseJunctionField.field]: {
                                            _neq: primaryKey
                                        }
                                    }
                                ]
                            } : {
                                // When no primary key or '+' (new item), show items with null FK
                                [relationInfo.reverseJunctionField.field]: {
                                    _null: true
                                }
                            }}
                            bulkActions={[
                                {
                                    label: "Add Selected",
                                    icon: <IconPlus size={14} />,
                                    color: "blue",
                                    action: handleSelectItems,
                                }
                            ]}
                        />
                    </Box>
                    )}
            </Modal>
        </Stack>
    );
};

export default ListO2M;
