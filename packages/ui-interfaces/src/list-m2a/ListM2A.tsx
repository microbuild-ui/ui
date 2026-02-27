"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
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
    Menu,
    Badge,
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
    IconChevronDown as IconDropdown,
    IconBox,
} from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import { 
    useRelationM2A, 
    useRelationM2AItems, 
    type M2AItem, 
    type M2ARelationInfo 
} from "@buildpad/hooks";
import { CollectionList } from "@buildpad/ui-collections";
import { CollectionForm } from "@buildpad/ui-collections";

/**
 * Props for the ListM2A component
 * 
 * Many-to-Any (M2A) relationship interface - allows linking to items from
 * MULTIPLE different collections through a junction table.
 * 
 * Example: A "page" can have "blocks" that are articles, images, videos, etc.
 * The junction table stores: page_id, collection (e.g., "articles"), item (the article ID)
 */
export interface ListM2AProps {
    /** Current value - array of junction items */
    value?: M2AItem[];
    /** Callback fired when value changes */
    onChange?: (value: M2AItem[]) => void;
    /** Current collection name (the parent/one side) */
    collection: string;
    /** Field name for this M2A relationship */
    field: string;
    /** Primary key of the current item */
    primaryKey?: string | number;
    /** Layout mode - 'list' or 'table' */
    layout?: 'list' | 'table';
    /** Table spacing for table layout */
    tableSpacing?: 'compact' | 'cozy' | 'comfortable';
    /** Fields to display (applies to junction table) */
    fields?: string[];
    /** Prefix template for displaying collection name before item */
    prefix?: string;
    /** Whether the interface is disabled */
    disabled?: boolean;
    /** Enable create new items button */
    enableCreate?: boolean;
    /** Enable select existing items button */
    enableSelect?: boolean;
    /** Enable search filter in table mode */
    enableSearchFilter?: boolean;
    /** Enable link to related items */
    enableLink?: boolean;
    /** Items per page */
    limit?: number;
    /** Allow duplicate items from the same collection */
    allowDuplicates?: boolean;
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
    /** Mock items for demo/testing */
    mockItems?: M2AItem[];
    /** Mock relationship info for demo/testing */
    mockRelationInfo?: Partial<M2ARelationInfo>;
}

/**
 * ListM2A - Many-to-Any relationship interface
 * 
 * Similar to DaaS list-m2a interface.
 * Displays items from multiple different collections through a junction table.
 */
export const ListM2A: React.FC<ListM2AProps> = ({
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    value: _value = [],
    onChange: _onChange,
    collection,
    field,
    primaryKey,
    layout = 'list',
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    tableSpacing: _tableSpacing,
    fields = ['id'],
    prefix,
    disabled = false,
    enableCreate = true,
    enableSelect = true,
    enableSearchFilter = false,
    enableLink = false,
    limit: initialLimit = 15,
    allowDuplicates = false,
    label,
    description,
    error,
    required = false,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    readOnly: _readOnly,
    mockItems,
    mockRelationInfo,
}) => {
    // Determine if we're in demo/mock mode
    const isDemoMode = mockItems !== undefined;

    // Use the custom hook for M2A relationship info (only when not in demo mode)
    const { 
        relationInfo: hookRelationInfo, 
        loading: hookLoading, 
        error: hookError 
    } = useRelationM2A(isDemoMode ? '' : collection, isDemoMode ? '' : field);

    // State for pagination and search
    const [currentPage, setCurrentPage] = useState(1);
    const [limit, setLimit] = useState(initialLimit);
    const [search, setSearch] = useState("");
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [sortField, _setSortField] = useState("");
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [sortDirection, _setSortDirection] = useState<"asc" | "desc">("asc");

    // Internal state for mock items (for demo mode)
    const [internalMockItems, setInternalMockItems] = useState<M2AItem[]>(mockItems || []);

    // Staged selections - items selected but not yet persisted (for new parent items)
    const [stagedSelections, setStagedSelections] = useState<M2AItem[]>([]);

    // Check if parent item is saved (has valid primary key, not '+' which means new)
    const isParentSaved = primaryKey && primaryKey !== '+';

    // Modal states
    const [editModalOpened, { open: openEditModal, close: closeEditModal }] = useDisclosure(false);
    const [selectModalOpened, { open: openSelectModal, close: closeSelectModal }] = useDisclosure(false);
    const [currentlyEditing, setCurrentlyEditing] = useState<M2AItem | null>(null);
    const [isCreatingNew, setIsCreatingNew] = useState(false);
    const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
    
    // Error notification state
    const [selectError, setSelectError] = useState<string | null>(null);

    // Use the items management hook (only when not in demo mode)
    const {
        items: hookItems,
        totalCount: hookTotalCount,
        loading: itemsLoading,
        loadItems,
        createItem,
        removeItem,
        selectItems,
        moveItemUp: hookMoveItemUp,
        moveItemDown: hookMoveItemDown,
        getSelectedPrimaryKeysByCollection,
    } = useRelationM2AItems(
        isDemoMode ? null : (hookRelationInfo as M2ARelationInfo | null), 
        isDemoMode ? null : (primaryKey || null)
    );

    // Combined values - use mock data in demo mode, hook data otherwise
    const relationInfo = isDemoMode ? (mockRelationInfo as M2ARelationInfo | undefined) : hookRelationInfo;
    const relationError = isDemoMode ? null : hookError;
    const relationLoading = isDemoMode ? false : hookLoading;

    // Combine fetched items with staged selections
    const baseItems: M2AItem[] = isDemoMode ? internalMockItems : hookItems;
    const items: M2AItem[] = isParentSaved 
        ? baseItems 
        : [...baseItems, ...stagedSelections];
    
    const totalCount = isDemoMode 
        ? internalMockItems.length 
        : (hookTotalCount + stagedSelections.length);
    const loading = isDemoMode ? false : (relationLoading || itemsLoading);

    // Allowed collections (non-singleton)
    const allowedCollections = useMemo(() => {
        return relationInfo?.allowedCollections?.filter(
            c => c.meta?.singleton !== true
        ) || [];
    }, [relationInfo?.allowedCollections]);

    // Get display template for each collection
    const getDisplayTemplate = useCallback((collectionName: string) => {
        const collInfo = allowedCollections.find(c => c.collection === collectionName);
        return collInfo?.meta?.display_template || `{{id}}`;
    }, [allowedCollections]);

    // Use ref for onChange to avoid triggering effect on every render
    const onChangeRef = useRef(_onChange);
    useEffect(() => {
        onChangeRef.current = _onChange;
    }, [_onChange]);

    // Track previous staged selections to avoid duplicate updates
    const prevStagedSelectionsRef = useRef<string>('');

    // Notify parent component when staged selections change (for unsaved parent items)
    useEffect(() => {
        // Only process for unsaved parent items
        if (isParentSaved || !relationInfo) {
            return;
        }

        // Serialize current selections to compare
        const currentSerialized = JSON.stringify(
            stagedSelections.map(item => ({
                collection: item.collection,
                item: item.item,
            }))
        );

        // Skip if nothing changed
        if (currentSerialized === prevStagedSelectionsRef.current) {
            return;
        }

        prevStagedSelectionsRef.current = currentSerialized;

        // Build payload and notify parent
        if (onChangeRef.current) {
            if (stagedSelections.length > 0) {
                const createPayload = stagedSelections.map(item => ({
                    [relationInfo.collectionField.field]: item.collection,
                    [relationInfo.junctionField.field]: item.item,
                }));
                onChangeRef.current(createPayload as M2AItem[]);
            } else {
                onChangeRef.current([]);
            }
        }
    }, [stagedSelections, isParentSaved, relationInfo]);

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
        if (!isDemoMode && relationInfo && primaryKey && primaryKey !== '+') {
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

    // Handle creating new item in a specific collection
    const handleCreateNew = (collectionName: string) => {
        setCurrentlyEditing(null);
        setIsCreatingNew(true);
        setSelectedCollection(collectionName);
        openEditModal();
    };

    // Handle editing existing item
    const handleEditItem = (item: M2AItem) => {
        if (!relationInfo) return;
        const collectionName = item[relationInfo.collectionField.field] as string;
        setCurrentlyEditing(item);
        setIsCreatingNew(false);
        setSelectedCollection(collectionName);
        openEditModal();
    };

    // Handle opening select modal for a specific collection
    const handleOpenSelectModal = (collectionName: string) => {
        setSelectedCollection(collectionName);
        openSelectModal();
    };

    // Handle selecting existing items
    const handleSelectItems = async (selectedIds: (string | number)[]) => {
        if (!selectedCollection) return;
        setSelectError(null);

        if (isParentSaved) {
            try {
                await selectItems(selectedCollection, selectedIds);
                closeSelectModal();
                setSelectedCollection(null);
                // Reload items
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
            // Stage selections for unsaved parent
            try {
                const response = await fetch(
                    `/api/items/${selectedCollection}?filter=${JSON.stringify({
                        id: { _in: selectedIds }
                    })}&fields=*`
                );

                if (!response.ok) throw new Error('Failed to fetch items');

                const { data: fetchedItems } = await response.json();

                const stagedItems: M2AItem[] = fetchedItems.map((itemData: Record<string, unknown>) => ({
                    id: `staged-${Date.now()}-${Math.random()}`,
                    collection: selectedCollection,
                    item: itemData,
                    $type: 'staged' as const,
                }));

                setStagedSelections(prev => {
                    if (allowDuplicates) {
                        return [...prev, ...stagedItems];
                    }
                    // Filter out duplicates
                    const existingIds = new Set(
                        prev
                            .filter(i => i.collection === selectedCollection)
                            .map(i => (i.item as Record<string, unknown>)?.id)
                    );
                    const newItems = stagedItems.filter(
                        i => !existingIds.has((i.item as Record<string, unknown>)?.id)
                    );
                    return [...prev, ...newItems];
                });

                closeSelectModal();
                setSelectedCollection(null);
            } catch (err) {
                console.error('Error staging items:', err);
                setSelectError('Failed to select items. Please try again.');
            }
        }
    };

    // Handle removing item
    const handleRemoveItem = async (item: M2AItem) => {
        if (item.$type === 'staged') {
            setStagedSelections(prev => prev.filter(i => i.id !== item.id));
            return;
        }

        if (isDemoMode) {
            setInternalMockItems(prev => prev.filter(i => i.id !== item.id));
            return;
        }

        try {
            await removeItem(item);
        } catch (err) {
            console.error('Error removing item:', err);
        }
    };

    // Get the collection prefix/label for an item
    const getItemPrefix = (item: M2AItem): string => {
        if (!relationInfo) return '';
        const collectionName = item[relationInfo.collectionField.field] as string || item.collection;
        
        if (prefix) {
            // Simple template rendering for prefix
            let rendered = prefix;
            Object.entries(item).forEach(([key, value]) => {
                rendered = rendered.replace(`{{${key}}}`, String(value || ''));
            });
            return rendered;
        }

        const collInfo = allowedCollections.find(c => c.collection === collectionName);
        return collInfo?.name || collectionName || 'Unknown';
    };

    // Get display value for an item
    const getItemDisplayValue = (item: M2AItem): string => {
        if (!relationInfo) return String(item.id);
        
        const collectionName = item[relationInfo.collectionField.field] as string || item.collection;
        const itemData = item[relationInfo.junctionField.field] || item.item;
        
        if (!itemData) return String(item.id);

        const template = getDisplayTemplate(collectionName || '');
        
        if (typeof itemData === 'object' && itemData !== null) {
            // Simple template rendering
            let rendered = template;
            Object.entries(itemData as Record<string, unknown>).forEach(([key, value]) => {
                rendered = rendered.replace(`{{${key}}}`, String(value || ''));
            });
            return rendered;
        }

        return String(itemData);
    };

    // Check if item's collection is still allowed
    const isCollectionAllowed = (item: M2AItem): boolean => {
        if (!relationInfo) return false;
        const collectionName = item[relationInfo.collectionField.field] as string || item.collection;
        return allowedCollections.some(c => c.collection === collectionName);
    };

    const totalPages = Math.ceil(totalCount / limit);

    // Show relation error (only in non-demo mode)
    if (!isDemoMode && relationError) {
        return (
            <Alert 
                icon={<IconAlertCircle size={16} />} 
                title="Configuration Error" 
                color="red" 
                data-testid="m2a-error"
            >
                {relationError}
            </Alert>
        );
    }

    // In non-demo mode, show warning if no allowed collections
    if (!isDemoMode && relationInfo && allowedCollections.length === 0 && !relationLoading) {
        return (
            <Alert 
                icon={<IconAlertCircle size={16} />} 
                title="No available collections" 
                color="orange" 
                data-testid="m2a-no-collections"
            >
                No non-singleton collections are configured for this M2A relationship.
            </Alert>
        );
    }

    // In non-demo mode, show warning if relationship not configured
    if (!isDemoMode && !relationInfo && !relationLoading) {
        return (
            <Alert 
                icon={<IconAlertCircle size={16} />} 
                title="Relationship not configured" 
                color="orange" 
                data-testid="m2a-not-configured"
            >
                The many-to-any relationship is not properly configured for this field.
            </Alert>
        );
    }

    return (
        <Stack gap="sm" data-testid="list-m2a">
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
                                data-testid="m2a-search"
                            />
                        )}
                    </Group>

                    <Group>
                        {totalCount > 0 && (
                            <Text size="sm" c="dimmed" data-testid="m2a-count">
                                {totalCount} item{totalCount !== 1 ? 's' : ''}
                            </Text>
                        )}

                        {!disabled && enableSelect && allowedCollections.length > 0 && (
                            <Menu shadow="md" width={200}>
                                <Menu.Target>
                                    <Button
                                        variant="light"
                                        leftSection={<IconPlus size={16} />}
                                        rightSection={<IconDropdown size={14} />}
                                        data-testid="m2a-select-btn"
                                    >
                                        Add Existing
                                    </Button>
                                </Menu.Target>
                                <Menu.Dropdown>
                                    {allowedCollections.map(coll => (
                                        <Menu.Item
                                            key={coll.collection}
                                            leftSection={<IconBox size={14} />}
                                            onClick={() => handleOpenSelectModal(coll.collection)}
                                            data-testid={`m2a-select-${coll.collection}`}
                                        >
                                            {coll.name || coll.collection}
                                        </Menu.Item>
                                    ))}
                                </Menu.Dropdown>
                            </Menu>
                        )}

                        {!disabled && enableCreate && allowedCollections.length > 0 && (
                            <Menu shadow="md" width={200}>
                                <Menu.Target>
                                    <Tooltip 
                                        label="Save the item first before creating related items"
                                        disabled={!!isParentSaved}
                                    >
                                        <Button
                                            leftSection={<IconPlus size={16} />}
                                            rightSection={<IconDropdown size={14} />}
                                            disabled={!isParentSaved}
                                            data-testid="m2a-create-btn"
                                        >
                                            Create New
                                        </Button>
                                    </Tooltip>
                                </Menu.Target>
                                <Menu.Dropdown>
                                    {allowedCollections.map(coll => (
                                        <Menu.Item
                                            key={coll.collection}
                                            leftSection={<IconBox size={14} />}
                                            onClick={() => handleCreateNew(coll.collection)}
                                            data-testid={`m2a-create-${coll.collection}`}
                                        >
                                            {coll.name || coll.collection}
                                        </Menu.Item>
                                    ))}
                                </Menu.Dropdown>
                            </Menu>
                        )}
                    </Group>
                </Group>

                {/* Staged items notice */}
                {!isParentSaved && stagedSelections.length > 0 && (
                    <Alert icon={<IconAlertCircle size={16} />} color="blue" mb="md">
                        {stagedSelections.length} item{stagedSelections.length !== 1 ? 's' : ''} selected.
                        These will be linked when you save the item.
                    </Alert>
                )}

                {/* Error notification */}
                {selectError && (
                    <Alert 
                        icon={<IconAlertCircle size={16} />} 
                        color="red" 
                        mb="md" 
                        withCloseButton 
                        onClose={() => setSelectError(null)}
                    >
                        {selectError}
                    </Alert>
                )}

                {/* Content */}
                {items.length === 0 && !loading ? (
                    <Paper p="xl" style={{ textAlign: 'center' }} data-testid="m2a-empty">
                        <Text c="dimmed">No items</Text>
                    </Paper>
                ) : layout === 'table' ? (
                    /* Table Layout */
                    <Table striped highlightOnHover data-testid="m2a-table">
                        <Table.Thead>
                            <Table.Tr>
                                {relationInfo?.sortField && (
                                    <Table.Th style={{ width: 80 }}>Order</Table.Th>
                                )}
                                <Table.Th style={{ width: 150 }}>Collection</Table.Th>
                                <Table.Th>Item</Table.Th>
                                <Table.Th style={{ width: 120 }}>Actions</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {items.map((item, index) => {
                                const isAllowed = isCollectionAllowed(item);
                                
                                return (
                                    <Table.Tr 
                                        key={item.id} 
                                        data-testid={`m2a-row-${item.id}`}
                                        style={!isAllowed ? { opacity: 0.6 } : undefined}
                                    >
                                        {relationInfo?.sortField && (
                                            <Table.Td>
                                                <Group gap="xs">
                                                    <ActionIcon
                                                        variant="subtle"
                                                        size="sm"
                                                        disabled={index === 0 || disabled}
                                                        onClick={() => moveItemUp(index)}
                                                        data-testid={`m2a-move-up-${item.id}`}
                                                    >
                                                        <IconChevronUp size={14} />
                                                    </ActionIcon>
                                                    <ActionIcon
                                                        variant="subtle"
                                                        size="sm"
                                                        disabled={index === items.length - 1 || disabled}
                                                        onClick={() => moveItemDown(index)}
                                                        data-testid={`m2a-move-down-${item.id}`}
                                                    >
                                                        <IconChevronDown size={14} />
                                                    </ActionIcon>
                                                </Group>
                                            </Table.Td>
                                        )}
                                        <Table.Td>
                                            <Badge 
                                                color={isAllowed ? 'blue' : 'gray'}
                                                variant="light"
                                            >
                                                {getItemPrefix(item)}
                                            </Badge>
                                        </Table.Td>
                                        <Table.Td>
                                            {isAllowed ? (
                                                <Text size="sm">{getItemDisplayValue(item)}</Text>
                                            ) : (
                                                <Group gap="xs">
                                                    <IconAlertCircle size={14} color="orange" />
                                                    <Text size="sm" c="dimmed">Invalid item</Text>
                                                </Group>
                                            )}
                                        </Table.Td>
                                        <Table.Td>
                                            <Group gap="xs">
                                                {enableLink && isAllowed && (
                                                    <Tooltip label="View item">
                                                        <ActionIcon
                                                            variant="subtle"
                                                            color="blue"
                                                            size="sm"
                                                            data-testid={`m2a-link-${item.id}`}
                                                        >
                                                            <IconExternalLink size={14} />
                                                        </ActionIcon>
                                                    </Tooltip>
                                                )}

                                                {!disabled && isAllowed && (
                                                    <Tooltip label="Edit">
                                                        <ActionIcon
                                                            variant="subtle"
                                                            color="gray"
                                                            size="sm"
                                                            onClick={() => handleEditItem(item)}
                                                            data-testid={`m2a-edit-${item.id}`}
                                                        >
                                                            <IconEdit size={14} />
                                                        </ActionIcon>
                                                    </Tooltip>
                                                )}

                                                {!disabled && (
                                                    <Tooltip label="Remove">
                                                        <ActionIcon
                                                            variant="subtle"
                                                            color="red"
                                                            size="sm"
                                                            onClick={() => handleRemoveItem(item)}
                                                            data-testid={`m2a-remove-${item.id}`}
                                                        >
                                                            <IconTrash size={14} />
                                                        </ActionIcon>
                                                    </Tooltip>
                                                )}
                                            </Group>
                                        </Table.Td>
                                    </Table.Tr>
                                );
                            })}
                        </Table.Tbody>
                    </Table>
                ) : (
                    /* List Layout */
                    <Stack gap="xs" data-testid="m2a-list">
                        {items.map((item, index) => {
                            const isAllowed = isCollectionAllowed(item);
                            const isDeleted = item.$type === 'deleted';
                            
                            return (
                                <Paper
                                    key={item.id}
                                    p="sm"
                                    withBorder
                                    style={{ 
                                        cursor: disabled || !isAllowed ? 'default' : 'pointer',
                                        opacity: !isAllowed || isDeleted ? 0.6 : 1,
                                    }}
                                    onClick={() => !disabled && isAllowed && handleEditItem(item)}
                                    data-testid={`m2a-item-${item.id}`}
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
                                                            moveItemUp(index);
                                                        }}
                                                        data-testid={`m2a-list-move-up-${item.id}`}
                                                    >
                                                        <IconChevronUp size={14} />
                                                    </ActionIcon>
                                                    <ActionIcon
                                                        variant="subtle"
                                                        size="sm"
                                                        disabled={index === items.length - 1}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            moveItemDown(index);
                                                        }}
                                                        data-testid={`m2a-list-move-down-${item.id}`}
                                                    >
                                                        <IconChevronDown size={14} />
                                                    </ActionIcon>
                                                </Group>
                                            )}
                                            
                                            {isAllowed ? (
                                                <Group gap="xs">
                                                    <Text c="blue" fw={500}>{getItemPrefix(item)}:</Text>
                                                    <Text>{getItemDisplayValue(item)}</Text>
                                                </Group>
                                            ) : (
                                                <Group gap="xs">
                                                    <IconAlertCircle size={14} color="orange" />
                                                    <Text c="dimmed">Invalid item</Text>
                                                </Group>
                                            )}
                                        </Group>
                                        
                                        <Group gap="xs">
                                            {enableLink && isAllowed && (
                                                <ActionIcon
                                                    variant="subtle"
                                                    color="blue"
                                                    size="sm"
                                                    onClick={(e) => e.stopPropagation()}
                                                    data-testid={`m2a-list-link-${item.id}`}
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
                                                    data-testid={`m2a-list-remove-${item.id}`}
                                                >
                                                    <IconTrash size={14} />
                                                </ActionIcon>
                                            )}
                                        </Group>
                                    </Group>
                                </Paper>
                            );
                        })}
                    </Stack>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <Group justify="space-between" mt="md" data-testid="m2a-pagination">
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
                                data-testid="m2a-per-page"
                            />

                            <Pagination
                                value={currentPage}
                                onChange={setCurrentPage}
                                total={totalPages}
                                size="sm"
                                data-testid="m2a-pagination-control"
                            />
                        </Group>
                    </Group>
                )}
            </Paper>

            {error && (
                <Text size="xs" c="red" data-testid="m2a-error-text">
                    {typeof error === 'string' ? error : 'Invalid value'}
                </Text>
            )}

            {/* Edit Modal */}
            <Modal
                opened={editModalOpened}
                onClose={() => {
                    closeEditModal();
                    setSelectedCollection(null);
                }}
                title={isCreatingNew ? `Create New ${selectedCollection}` : `Edit ${selectedCollection}`}
                size="lg"
            >
                {selectedCollection && (
                    <CollectionForm
                        collection={selectedCollection}
                        id={currentlyEditing 
                            ? (currentlyEditing[relationInfo?.junctionField?.field || 'item'] as Record<string, unknown>)?.id as string | number
                            : undefined
                        }
                        mode={isCreatingNew ? "create" : "edit"}
                        onSuccess={async (newId) => {
                            closeEditModal();
                            if (isCreatingNew && newId && isParentSaved) {
                                // Create junction record linking to new item
                                const itemId = typeof newId === 'object' && newId !== null 
                                    ? (newId as Record<string, unknown>).id as string | number
                                    : newId as string | number;
                                await createItem(selectedCollection, itemId);
                            }
                            setSelectedCollection(null);
                            // Reload items
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
                    setSelectedCollection(null);
                    setSelectError(null);
                }}
                title={`Select from ${selectedCollection}`}
                size="xl"
            >
                {/* Error */}
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

                {/* Staged notice */}
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

                {selectedCollection && (
                    <Box p="md">
                        <CollectionList
                            collection={selectedCollection}
                            enableSelection
                            filter={!allowDuplicates && isParentSaved ? (() => {
                                const selectedByCollection = getSelectedPrimaryKeysByCollection();
                                const selectedIds = selectedByCollection[selectedCollection] || [];
                                if (selectedIds.length === 0) return undefined;
                                return {
                                    id: { _nin: selectedIds }
                                };
                            })() : undefined}
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

export default ListM2A;
