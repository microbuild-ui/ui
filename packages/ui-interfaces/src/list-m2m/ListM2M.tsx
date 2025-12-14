"use client";

import React, { useState, useEffect } from "react";
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
} from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import { useRelationM2M, useRelationM2MItems, type M2MItem } from "@microbuild/hooks";
import { CollectionList } from "@microbuild/ui-collections";
import { CollectionForm } from "@microbuild/ui-collections";

/**
 * Props for the ListM2M component
 */
export interface ListM2MProps {
    /** Current value - array of junction items or related items */
    value?: any[];
    /** Callback fired when value changes */
    onChange?: (value: any[]) => void;
    /** Current collection name */
    collection: string;
    /** Field name for this M2M relationship */
    field: string;
    /** Primary key of the current item */
    primaryKey?: string | number;
    /** Layout mode - 'list' or 'table' */
    layout?: 'list' | 'table';
    /** Table spacing for table layout */
    tableSpacing?: 'compact' | 'cozy' | 'comfortable';
    /** Fields to display in table layout */
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
    filter?: any;
    /** Enable search filter in table mode */
    enableSearchFilter?: boolean;
    /** Enable link to related items */
    enableLink?: boolean;
    /** Items per page */
    limit?: number;
    /** Allow duplicate selections */
    allowDuplicates?: boolean;
    /** Junction field location in edit form */
    junctionFieldLocation?: 'top' | 'bottom';
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
}

export const ListM2M: React.FC<ListM2MProps> = ({
    value: _value = [],
    onChange: _onChange,
    collection,
    field,
    primaryKey,
    layout = 'list',
    tableSpacing: _tableSpacing = 'cozy',
    fields = ['id'],
    template,
    disabled = false,
    enableCreate = true,
    enableSelect = true,
    filter: _filter,
    enableSearchFilter = false,
    enableLink = false,
    limit = 15,
    allowDuplicates: _allowDuplicates = false,
    junctionFieldLocation: _junctionFieldLocation = 'bottom',
    label,
    description,
    error,
    required = false,
    readOnly: _readOnly = false,
}) => {
    // Use the custom hooks for M2M relationship management
    const { relationInfo, loading: relationLoading, error: relationError } = useRelationM2M(collection, field);
    
    // State for pagination and search
    const [currentPage, setCurrentPage] = useState(1);
    const [search, setSearch] = useState("");
    const [sortField, _setSortField] = useState("");
    const [sortDirection, _setSortDirection] = useState<"asc" | "desc">("asc");
    
    // Staged selections - items selected but not yet persisted (for new parent items)
    // Following Directus pattern: stage locally, persist when parent saves
    const [stagedSelections, setStagedSelections] = useState<M2MItem[]>([]);
    
    // Check if parent item is saved (has valid primary key, not '+' which means new)
    const isParentSaved = Boolean(primaryKey && primaryKey !== '+');
    
    // Error notification state
    const [selectError, setSelectError] = useState<string | null>(null);
    
    // Modal states
    const [editModalOpened, { open: openEditModal, close: closeEditModal }] = useDisclosure(false);
    const [selectModalOpened, { open: openSelectModal, close: closeSelectModal }] = useDisclosure(false);
    const [currentlyEditing, setCurrentlyEditing] = useState<M2MItem | null>(null);
    const [isCreatingNew, setIsCreatingNew] = useState(false);

    // Use the items management hook
    const {
        items: hookItems,
        totalCount: hookTotalCount,
        loading: itemsLoading,
        loadItems,
        selectItems,
        removeItem,
        moveItemUp: hookMoveItemUp,
        moveItemDown: hookMoveItemDown,
        selectedPrimaryKeys,
        canPerformOperations
    } = useRelationM2MItems(relationInfo, primaryKey || null);

    // Combine fetched items with staged selections (for unsaved parent items)
    // Staged items have $type: 'staged' to distinguish them
    const items: M2MItem[] = isParentSaved 
        ? hookItems 
        : [...hookItems, ...stagedSelections];
    
    const totalCount = hookTotalCount + (isParentSaved ? 0 : stagedSelections.length);

    // Combined loading state
    const loading = relationLoading || itemsLoading;

    // Notify parent component when staged selections change
    // This allows the parent form to include these in the save payload (Directus pattern)
    useEffect(() => {
        if (!isParentSaved && _onChange) {
            // Build the value in Directus format for M2M
            // For M2M, we need to create junction records when parent is saved
            if (stagedSelections.length > 0 && relationInfo) {
                const createPayload = stagedSelections.map(item => ({
                    [relationInfo.junctionField.field]: { id: item.id },
                }));
                _onChange(createPayload);
            } else if (stagedSelections.length === 0 && _value.length > 0) {
                // Clear if no staged items
                _onChange([]);
            }
        }
    }, [stagedSelections, isParentSaved, _onChange, relationInfo, _value.length]);

    // Load items when parameters change
    useEffect(() => {
        if (relationInfo && primaryKey && canPerformOperations) {
            loadItems({
                limit,
                page: currentPage,
                search,
                sortField,
                sortDirection,
                fields,
                enableSearchFilter
            });
        }
    }, [relationInfo, primaryKey, canPerformOperations, currentPage, limit, search, sortField, sortDirection, fields, enableSearchFilter, loadItems]);

    // Handle creating new item
    const handleCreateNew = () => {
        setCurrentlyEditing(null);
        setIsCreatingNew(true);
        openEditModal();
    };

    // Handle editing existing item
    const handleEditItem = (item: M2MItem) => {
        setCurrentlyEditing(item);
        setIsCreatingNew(false);
        openEditModal();
    };

    // Handle selecting existing items from the RELATED collection (not junction)
    const handleSelectItems = async (selectedIds: (string | number)[]) => {
        if (isParentSaved) {
            // Parent is saved - persist immediately via API
            try {
                await selectItems(selectedIds);
                closeSelectModal();
                // Reload items to show the new selections
                if (relationInfo && primaryKey) {
                    loadItems({
                        limit,
                        page: currentPage,
                        search,
                        sortField,
                        sortDirection,
                        fields,
                        enableSearchFilter
                    });
                }
            } catch (err) {
                console.error('Error selecting items:', err);
                setSelectError('Failed to link items. Please try again.');
            }
        } else {
            // Parent is NOT saved - stage selections locally (Directus pattern)
            // These will be persisted when the parent item is saved
            try {
                // Fetch the selected items to display them
                const response = await fetch(
                    `/api/items/${relationInfo?.relatedCollection.collection}?filter=${JSON.stringify({
                        id: { _in: selectedIds }
                    })}&fields=${fields.join(',')}`
                );
                
                if (!response.ok) throw new Error('Failed to fetch items');
                
                const { data: fetchedItems } = await response.json();
                
                // Add to staged selections with $type: 'staged'
                const stagedItems: M2MItem[] = fetchedItems.map((item: M2MItem) => ({
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
                setSelectError(null);
            } catch (err) {
                console.error('Error staging items:', err);
                setSelectError('Failed to select items. Please try again.');
            }
        }
    };

    // Handle removing item (including staged items)
    const handleRemoveItem = async (item: M2MItem) => {
        // If it's a staged item, just remove from local state
        if ((item as M2MItem & { $type?: string }).$type === 'staged') {
            setStagedSelections(prev => prev.filter(i => i.id !== item.id));
            return;
        }
        
        try {
            await removeItem(item);
            // Reload items to reflect the removal
            if (relationInfo && primaryKey) {
                loadItems({
                    limit,
                    page: currentPage,
                    search,
                    sortField,
                    sortDirection,
                    fields,
                    enableSearchFilter
                });
            }
        } catch (error) {
            // Error handling is done in the hook
        }
    };

    // Handle drag and drop reordering using hooks
    const handleMoveUp = async (index: number) => {
        try {
            await hookMoveItemUp(index);
        } catch (error) {
            // Error handling is done in the hook
        }
    };

    const handleMoveDown = async (index: number) => {
        try {
            await hookMoveItemDown(index);
        } catch (error) {
            // Error handling is done in the hook
        }
    };

    // Format display value for an item
    const formatDisplayValue = (item: M2MItem) => {
        // Check if this is a staged item (data is directly on item, not nested)
        const isStaged = (item as M2MItem & { $type?: string }).$type === 'staged';
        
        if (template && relationInfo) {
            // Simple template rendering - in a real implementation you'd use a proper template engine
            let rendered = template;
            // For staged items, data is on item directly; for persisted items, it's nested in junctionField
            const relatedData = isStaged 
                ? item as Record<string, unknown>
                : item[relationInfo.junctionField.field] as Record<string, unknown> | undefined;
            if (relatedData && typeof relatedData === 'object') {
                Object.keys(relatedData).forEach(key => {
                    rendered = rendered.replace(`{{${key}}}`, String(relatedData[key] || ''));
                });
            }
            return rendered;
        }

        // Default: show the first available field
        // For staged items, data is on item directly; for persisted items, it's nested in junctionField
        const relatedData = isStaged
            ? item as Record<string, unknown>
            : (relationInfo ? item[relationInfo.junctionField.field] : item) as Record<string, unknown> | undefined;
        const displayField = fields.find(f => relatedData?.[f]) || 'id';
        return String(relatedData?.[displayField] ?? item.id);
    };

    const totalPages = Math.ceil(totalCount / limit);

    // Show relation error
    if (relationError) {
        return (
            <Alert icon={<IconAlertCircle size={16} />} title="Configuration Error" color="red">
                {relationError}
            </Alert>
        );
    }

    if (!relationInfo) {
        return (
            <Alert icon={<IconAlertCircle size={16} />} title="Relationship not configured" color="orange">
                The many-to-many relationship is not properly configured for this field.
            </Alert>
        );
    }

    if (loading) {
        return (
            <Paper p="md" withBorder style={{ position: "relative", minHeight: 200 }}>
                <LoadingOverlay visible />
            </Paper>
        );
    }

    return (
        <Stack gap="sm">
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

            <Paper p="md" withBorder>
                {/* Header Actions */}
                <Group justify="space-between" mb="md">
                    <Group>
                        {enableSearchFilter && layout === 'table' && (
                            <TextInput
                                placeholder="Search..."
                                leftSection={<IconSearch size={16} />}
                                value={search}
                                onChange={(e) => setSearch(e.currentTarget.value)}
                                style={{ width: 250 }}
                            />
                        )}
                    </Group>

                    <Group>
                        {totalCount > 0 && (
                            <Text size="sm" c="dimmed">
                                {totalCount} item{totalCount !== 1 ? 's' : ''}
                                {!isParentSaved && stagedSelections.length > 0 && (
                                    <Text span c="yellow" size="xs"> ({stagedSelections.length} staged)</Text>
                                )}
                            </Text>
                        )}

                        {!disabled && enableSelect && (
                            <Button
                                variant="light"
                                leftSection={<IconPlus size={16} />}
                                onClick={openSelectModal}
                            >
                                Add Existing
                            </Button>
                        )}

                        {!disabled && enableCreate && (
                            <Tooltip 
                                label="Save the item first before creating related items"
                                disabled={isParentSaved}
                            >
                                <Button
                                    leftSection={<IconPlus size={16} />}
                                    onClick={handleCreateNew}
                                    disabled={!isParentSaved}
                                >
                                    Create New
                                </Button>
                            </Tooltip>
                        )}
                    </Group>
                </Group>

                {/* Staged items notice for new parent items */}
                {!isParentSaved && stagedSelections.length > 0 && (
                    <Alert icon={<IconAlertCircle size={16} />} color="blue" mb="md">
                        {stagedSelections.length} item{stagedSelections.length !== 1 ? 's' : ''} selected. 
                        These will be linked when you save the item.
                    </Alert>
                )}
                
                {/* Error notification */}
                {selectError && (
                    <Alert icon={<IconAlertCircle size={16} />} color="red" mb="md" withCloseButton onClose={() => setSelectError(null)}>
                        {selectError}
                    </Alert>
                )}

                {/* Content */}
                {items.length === 0 ? (
                    <Paper p="xl" style={{ textAlign: 'center' }}>
                        <Text c="dimmed">No related items</Text>
                    </Paper>
                ) : layout === 'table' ? (
                    /* Table Layout */
                    <Table striped highlightOnHover>
                        <Table.Thead>
                            <Table.Tr>
                                {relationInfo.sortField && (
                                    <Table.Th style={{ width: 80 }}>Order</Table.Th>
                                )}
                                {fields.map(field => (
                                    <Table.Th key={field}>
                                        <Text size="sm" fw={500}>
                                            {field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                        </Text>
                                    </Table.Th>
                                ))}
                                <Table.Th style={{ width: 120 }}>Actions</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {items.map((item, index) => (
                                <Table.Tr key={item.id}>
                                    {relationInfo.sortField && (
                                        <Table.Td>
                                            <Group gap="xs">
                                                <ActionIcon
                                                    variant="subtle"
                                                    size="sm"
                                                    disabled={index === 0}
                                                    onClick={() => handleMoveUp(index)}
                                                >
                                                    <IconChevronUp size={14} />
                                                </ActionIcon>
                                                <ActionIcon
                                                    variant="subtle"
                                                    size="sm"
                                                    disabled={index === items.length - 1}
                                                    onClick={() => handleMoveDown(index)}
                                                >
                                                    <IconChevronDown size={14} />
                                                </ActionIcon>
                                            </Group>
                                        </Table.Td>
                                    )}
                                    {fields.map(fieldName => {
                                        const relatedData = item[relationInfo.junctionField.field] as Record<string, unknown> | undefined;
                                        const value = relatedData?.[fieldName] ?? item[fieldName];
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
                                                        >
                                                            <IconEdit size={14} />
                                                        </ActionIcon>
                                                    </Tooltip>
                                                    
                                                    <Tooltip label="Remove">
                                                        <ActionIcon
                                                            variant="subtle"
                                                            color="red"
                                                            size="sm"
                                                            onClick={() => handleRemoveItem(item)}
                                                        >
                                                            <IconTrash size={14} />
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
                    <Stack gap="xs">
                        {items.map((item, index) => (
                            <Paper
                                key={item.id}
                                p="sm"
                                withBorder
                                style={{ cursor: 'pointer' }}
                                onClick={() => handleEditItem(item)}
                            >
                                <Group justify="space-between">
                                    <Group>
                                        {relationInfo.sortField && (
                                            <Group gap="xs">
                                                <ActionIcon
                                                    variant="subtle"
                                                    size="sm"
                                                    disabled={index === 0}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleMoveUp(index);
                                                    }}
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
                                            >
                                                <IconTrash size={14} />
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
                    <Group justify="space-between" mt="md">
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
                                        // TODO: Update limit and reload
                                    }
                                }}
                                data={['10', '15', '25', '50', '100']}
                                style={{ width: 80 }}
                            />
                            
                            <Pagination
                                value={currentPage}
                                onChange={setCurrentPage}
                                total={totalPages}
                                size="sm"
                            />
                        </Group>
                    </Group>
                )}
            </Paper>

            {error && (
                <Text size="xs" c="red">{typeof error === 'string' ? error : 'Invalid value'}</Text>
            )}

            {/* Edit Modal */}
            <Modal
                opened={editModalOpened}
                onClose={closeEditModal}
                title={isCreatingNew ? "Create New Item" : "Edit Item"}
                size="lg"
            >
                {relationInfo && (
                    <CollectionForm
                        collection={isCreatingNew ? relationInfo.relatedCollection.collection : relationInfo.junctionCollection.collection}
                        id={currentlyEditing?.id}
                        mode={isCreatingNew ? "create" : "edit"}
                    />
                )}
            </Modal>

            {/* Select Modal */}
            <Modal
                opened={selectModalOpened}
                onClose={closeSelectModal}
                title="Select Items"
                size="xl"
            >
                {relationInfo && (
                    <Box p="md">
                        <CollectionList
                            collection={relationInfo.relatedCollection.collection}
                            enableSelection
                            filter={selectedPrimaryKeys.length > 0 ? {
                                // Filter out items that are already linked via the junction table
                                [relationInfo.relatedPrimaryKeyField.field]: {
                                    _nin: selectedPrimaryKeys
                                }
                            } : undefined}
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
