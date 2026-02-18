/**
 * CollectionList Component
 *
 * A dynamic list/table that fetches items from a collection.
 * Composes VTable for presentation (sorting, resize, reorder, selection)
 * with data fetching from FieldsService/ItemsService.
 *
 * Used by ListO2M and ListM2M for selecting existing items,
 * and by content module pages for collection list views.
 *
 * @package @microbuild/ui-collections
 */

"use client";

import {
  ActionIcon,
  Alert,
  Button,
  Group,
  Menu,
  Pagination,
  Select,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import {
  FieldsService,
  ItemsService,
  PermissionsService,
} from "@microbuild/services";
import type { AnyItem, Field } from "@microbuild/types";
import type { Alignment, Header, HeaderRaw, Sort } from "@microbuild/ui-table";
import { VTable } from "@microbuild/ui-table";
import {
  IconAlertCircle,
  IconAlignCenter,
  IconAlignLeft,
  IconAlignRight,
  IconEyeOff,
  IconPlus,
  IconRefresh,
  IconSearch,
  IconSortAscending,
  IconSortDescending,
} from "@tabler/icons-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import "./CollectionList.css";

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
  /** Filter to apply (DaaS-style filter object) */
  filter?: Record<string, unknown>;
  /** Bulk actions for selected items */
  bulkActions?: BulkAction[];
  /** Fields to display (defaults to first 5 visible fields) */
  fields?: string[];
  /** Items per page */
  limit?: number;
  /** Enable search */
  enableSearch?: boolean;
  /** Enable column sorting */
  enableSort?: boolean;
  /** Enable column resize */
  enableResize?: boolean;
  /** Enable column reorder (drag headers) */
  enableReorder?: boolean;
  /** Enable header context menu (right-click for sort, align, hide) */
  enableHeaderMenu?: boolean;
  /** Enable inline "add field" button in header */
  enableAddField?: boolean;
  /** Primary key field name */
  primaryKeyField?: string;
  /** Row height in pixels */
  rowHeight?: number;
  /** Table spacing preset */
  tableSpacing?: "compact" | "cozy" | "comfortable";
  /** Callback when item row is clicked */
  onItemClick?: (item: AnyItem) => void;
  /** Callback when visible fields change */
  onFieldsChange?: (fields: string[]) => void;
  /** Callback when sort changes */
  onSortChange?: (sort: Sort | null) => void;
}

// System fields to exclude from default display
const SYSTEM_FIELDS = [
  "user_created",
  "user_updated",
  "date_created",
  "date_updated",
];

// Row height per spacing preset
const SPACING_HEIGHT: Record<string, number> = {
  compact: 32,
  cozy: 48,
  comfortable: 56,
};

/**
 * CollectionList - Dynamic list for displaying collection items.
 * Composes VTable for sorting, resize, reorder, selection, and context menu.
 */
export const CollectionList: React.FC<CollectionListProps> = ({
  collection,
  enableSelection = false,
  filter,
  bulkActions = [],
  fields: displayFields,
  limit: initialLimit = 25,
  enableSearch = true,
  enableSort = true,
  enableResize = true,
  enableReorder = true,
  enableHeaderMenu = true,
  enableAddField = true,
  primaryKeyField = "id",
  rowHeight: rowHeightProp,
  tableSpacing = "cozy",
  onItemClick,
  onFieldsChange,
  onSortChange: onSortChangeProp,
}) => {
  // ----- Data state -----
  const [allFields, setAllFields] = useState<Field[]>([]);
  const [visibleFieldKeys, setVisibleFieldKeys] = useState<string[]>([]);
  const [items, setItems] = useState<AnyItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedItems, setSelectedItems] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ----- Pagination & search state -----
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(initialLimit);
  const [search, setSearch] = useState("");

  // ----- Sort state -----
  const [sort, setSort] = useState<Sort>({ by: null, desc: false });

  // ----- Header state (for resize/reorder persistence) -----
  const [headerOverrides, setHeaderOverrides] = useState<
    Record<string, Partial<HeaderRaw>>
  >({});

  // ----- Computed row height -----
  const rowHeight = rowHeightProp ?? SPACING_HEIGHT[tableSpacing] ?? 48;

  // ----- Permission-aware field filtering (mirrors DaaS getFields()) -----
  // Uses DaaS GET /permissions/me endpoint via PermissionsService.
  // DaaS GET /fields does NOT filter by permissions (unlike DaaS server-side),
  // so we must apply permission filtering client-side.
  const [readableFields, setReadableFields] = useState<string[] | null>(null);

  // =========================================================================
  // Load fields + permissions in parallel (avoids race condition)
  // =========================================================================
  useEffect(() => {
    let cancelled = false;

    const loadFieldsAndPermissions = async () => {
      try {
        // Fetch both in parallel — neither depends on the other
        const [fieldsResult, permFields] = await Promise.all([
          new FieldsService().readAll(collection),
          PermissionsService.getReadableFields(collection).catch(() => null),
        ]);

        if (cancelled) return;

        // All non-system, non-hidden, non-alias fields
        let visible = fieldsResult.filter((f: Field) => {
          if (SYSTEM_FIELDS.includes(f.field)) return false;
          if (f.type === "alias") return false;
          if (f.meta?.hidden) return false;
          return true;
        });

        // Apply permission filter BEFORE setting state
        // permFields: null = fetch failed (show all), ['*'] = full access, [...] = specific fields
        setReadableFields(permFields);

        const hasRestriction =
          permFields && permFields.length > 0 && !permFields.includes("*");

        if (hasRestriction) {
          const accessibleSet = new Set(permFields);
          visible = visible.filter((f) => accessibleSet.has(f.field));
        }

        setAllFields(visible);

        // Set initial visible columns (already permission-filtered)
        if (displayFields) {
          const keys = hasRestriction
            ? displayFields.filter((k) => new Set(permFields).has(k))
            : displayFields;
          setVisibleFieldKeys(
            keys.length > 0
              ? keys
              : visible.slice(0, 5).map((f: Field) => f.field),
          );
        } else {
          const initial = visible.slice(0, 5).map((f: Field) => f.field);
          // Always include PK if visible
          if (
            !initial.includes(primaryKeyField) &&
            visible.some((f) => f.field === primaryKeyField)
          ) {
            initial.unshift(primaryKeyField);
          }
          setVisibleFieldKeys(initial);
        }
      } catch (err) {
        console.error("Error loading fields:", err);
        if (!cancelled) {
          setError(
            "Failed to load collection fields. Make sure the Storybook Host app is running (pnpm dev:host) and connected at http://localhost:3000.",
          );
          setLoading(false);
        }
      }
    };

    loadFieldsAndPermissions();
    return () => {
      cancelled = true;
    };
  }, [collection, displayFields, primaryKeyField]);

  // =========================================================================
  // Load items
  // =========================================================================
  const loadItems = useCallback(async () => {
    if (visibleFieldKeys.length === 0) return;
    try {
      setLoading(true);
      setError(null);

      const itemsService = new ItemsService(collection);
      const query: Record<string, unknown> = {
        limit,
        page,
        meta: ["total_count", "filter_count"],
      };

      // Fields to fetch — always include PK
      const fieldsToFetch = [...visibleFieldKeys];
      if (!fieldsToFetch.includes(primaryKeyField)) {
        fieldsToFetch.unshift(primaryKeyField);
      }
      query.fields = fieldsToFetch;

      // Filter
      if (filter && Object.keys(filter).length > 0) {
        query.filter = filter;
      }

      // Search
      if (search) {
        query.search = search;
      }

      // Sort
      if (sort.by) {
        query.sort = sort.desc ? `-${sort.by}` : sort.by;
      }

      const result = await itemsService.readByQuery(query);
      setItems(result || []);
      setTotalCount(result.length || 0);
    } catch (err) {
      console.error("Error loading items:", err);
      setError(err instanceof Error ? err.message : "Failed to load items");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [
    collection,
    visibleFieldKeys,
    filter,
    limit,
    page,
    search,
    sort,
    primaryKeyField,
  ]);

  useEffect(() => {
    if (visibleFieldKeys.length > 0) {
      loadItems();
    }
  }, [loadItems, visibleFieldKeys.length]);

  // Reset page on search/filter change
  useEffect(() => {
    setPage(1);
  }, [search, filter]);

  // Permission-filtered field list (allFields is already filtered by permissions
  // in the combined load effect above, so permittedFields === allFields)
  const permittedFields = useMemo<Field[]>(() => allFields, [allFields]);

  // =========================================================================
  // Build VTable headers from field metadata
  // =========================================================================
  const headers = useMemo<HeaderRaw[]>(() => {
    return visibleFieldKeys.map((key) => {
      const fieldMeta = permittedFields.find((f) => f.field === key);
      const overrides = headerOverrides[key] || {};
      const label =
        fieldMeta?.meta?.note ||
        key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

      return {
        text: label,
        value: key,
        sortable: enableSort,
        align: (overrides.align as Alignment) || "left",
        width: overrides.width ?? null,
        // Attach field metadata for consumers
        field: fieldMeta,
        ...overrides,
      } as HeaderRaw;
    });
  }, [visibleFieldKeys, permittedFields, headerOverrides, enableSort]);

  // =========================================================================
  // Derived / computed
  // =========================================================================
  const totalPages = Math.max(1, Math.ceil(totalCount / limit));
  const selectedIds = useMemo(() => {
    return selectedItems.map((item) =>
      typeof item === "object" && item !== null
        ? (item as AnyItem)[primaryKeyField]
        : item,
    ) as (string | number)[];
  }, [selectedItems, primaryKeyField]);

  // =========================================================================
  // Field add/remove helpers
  // =========================================================================
  const addField = useCallback(
    (fieldKey: string) => {
      setVisibleFieldKeys((prev) => {
        if (prev.includes(fieldKey)) return prev;
        const next = [...prev, fieldKey];
        onFieldsChange?.(next);
        return next;
      });
    },
    [onFieldsChange],
  );

  const removeField = useCallback(
    (fieldKey: string) => {
      setVisibleFieldKeys((prev) => {
        const next = prev.filter((k) => k !== fieldKey);
        onFieldsChange?.(next);
        return next;
      });
    },
    [onFieldsChange],
  );

  // =========================================================================
  // Header context menu actions
  // =========================================================================
  const handleAlignChange = useCallback(
    (fieldKey: string, align: Alignment) => {
      setHeaderOverrides((prev) => ({
        ...prev,
        [fieldKey]: { ...prev[fieldKey], align },
      }));
    },
    [],
  );

  const handleSortChange = useCallback(
    (newSort: Sort | null) => {
      const s = newSort ?? { by: null, desc: false };
      setSort(s);
      onSortChangeProp?.(s);
    },
    [onSortChangeProp],
  );

  const handleHeadersChange = useCallback((newHeaders: HeaderRaw[]) => {
    // Persist width/align overrides
    const overrides: Record<string, Partial<HeaderRaw>> = {};
    newHeaders.forEach((h) => {
      overrides[h.value] = {};
      if (h.width) overrides[h.value].width = h.width;
      if (h.align && h.align !== "left") overrides[h.value].align = h.align;
    });
    setHeaderOverrides((prev) => ({ ...prev, ...overrides }));
    // Update visible field order
    setVisibleFieldKeys(newHeaders.map((h) => h.value));
  }, []);

  // =========================================================================
  // Render header context menu (right-click)
  // =========================================================================
  const renderHeaderContextMenu = useCallback(
    (header: Header) => {
      if (!enableHeaderMenu) return null;
      return (
        <div className="collection-list-context-menu" role="menu">
          {/* Sort */}
          <Menu.Label>Sort</Menu.Label>
          <div
            role="menuitem"
            className="mantine-Menu-item collection-list-context-menu-item"
            onClick={() => handleSortChange({ by: header.value, desc: false })}
          >
            <IconSortAscending size={14} />
            <Text size="sm">Sort ascending</Text>
          </div>
          <div
            role="menuitem"
            className="mantine-Menu-item collection-list-context-menu-item"
            onClick={() => handleSortChange({ by: header.value, desc: true })}
          >
            <IconSortDescending size={14} />
            <Text size="sm">Sort descending</Text>
          </div>

          <div className="collection-list-context-menu-divider" />

          {/* Alignment */}
          <Menu.Label>Alignment</Menu.Label>
          {[
            {
              align: "left" as Alignment,
              icon: <IconAlignLeft size={14} />,
              label: "Align left",
            },
            {
              align: "center" as Alignment,
              icon: <IconAlignCenter size={14} />,
              label: "Align center",
            },
            {
              align: "right" as Alignment,
              icon: <IconAlignRight size={14} />,
              label: "Align right",
            },
          ].map(({ align, icon, label }) => (
            <div
              key={align}
              role="menuitem"
              className={`mantine-Menu-item collection-list-context-menu-item${header.align === align ? " active" : ""}`}
              onClick={() => handleAlignChange(header.value, align)}
            >
              {icon}
              <Text size="sm">{label}</Text>
            </div>
          ))}

          <div className="collection-list-context-menu-divider" />

          {/* Hide field */}
          <div
            role="menuitem"
            className="mantine-Menu-item collection-list-context-menu-item danger"
            onClick={() => removeField(header.value)}
          >
            <IconEyeOff size={14} />
            <Text size="sm">Hide field</Text>
          </div>
        </div>
      );
    },
    [enableHeaderMenu, handleSortChange, handleAlignChange, removeField],
  );

  // =========================================================================
  // "Add field" button for header append slot
  // =========================================================================
  const hiddenFields = useMemo(() => {
    return permittedFields.filter((f) => !visibleFieldKeys.includes(f.field));
  }, [permittedFields, visibleFieldKeys]);

  const renderHeaderAppend = useCallback(() => {
    if (!enableAddField || hiddenFields.length === 0) return null;
    return (
      <Menu position="bottom-end" withArrow shadow="md" closeOnItemClick>
        <Menu.Target>
          <ActionIcon variant="subtle" size="sm" title="Add field">
            <IconPlus size={16} />
          </ActionIcon>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Label>Add field</Menu.Label>
          {hiddenFields.map((f) => (
            <Menu.Item key={f.field} onClick={() => addField(f.field)}>
              {f.meta?.note ||
                f.field
                  .replace(/_/g, " ")
                  .replace(/\b\w/g, (l) => l.toUpperCase())}
            </Menu.Item>
          ))}
        </Menu.Dropdown>
      </Menu>
    );
  }, [enableAddField, hiddenFields, addField]);

  // =========================================================================
  // Render
  // =========================================================================
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
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSearch(e.currentTarget.value)
              }
              className="collection-list-search"
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
        {enableSelection &&
          selectedIds.length > 0 &&
          bulkActions.length > 0 && (
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
        <Alert
          icon={<IconAlertCircle size={16} />}
          color="red"
          data-testid="collection-list-error"
        >
          {error}
        </Alert>
      )}

      {/* VTable */}
      <VTable
        headers={headers}
        items={items}
        itemKey={primaryKeyField}
        sort={sort}
        mustSort={false}
        showSelect={enableSelection ? "multiple" : "none"}
        showResize={enableResize}
        allowHeaderReorder={enableReorder}
        value={selectedItems}
        fixedHeader
        loading={loading}
        loadingText="Loading items..."
        noItemsText="No items found"
        rowHeight={rowHeight}
        selectionUseKeys
        clickable={!!onItemClick}
        renderHeaderContextMenu={
          enableHeaderMenu ? renderHeaderContextMenu : undefined
        }
        renderHeaderAppend={enableAddField ? renderHeaderAppend : undefined}
        renderFooter={() => (
          <div className="collection-list-footer">

            <Text size="sm" c="dimmed">
              {loading
                ? "Loading..."
                : `Showing ${Math.min(
                    (page - 1) * limit + 1,
                    totalCount,
                  )}–${Math.min(page * limit, totalCount)} of ${totalCount}`}
            </Text>
            <Group>
              <Text size="sm">Per page:</Text>
              <Select
                value={String(limit)}
                onChange={(value) => {
                  if (value) {
                    setLimit(Number(value));
                    setPage(1);
                  }
                }}
                data={["10", "25", "50", "100"]}
                size="xs"
                className="collection-list-per-page-select"
                data-testid="collection-list-per-page"
              />
              {totalPages > 1 && (
                <Pagination
                  value={page}
                  onChange={setPage}
                  total={totalPages}
                  size="sm"
                  data-testid="collection-list-pagination-control"
                />
              )}
            </Group>
          </div>
        )}
        onUpdate={setSelectedItems}
        onSortChange={handleSortChange}
        onHeadersChange={handleHeadersChange}
        onRowClick={
          onItemClick ? ({ item }) => onItemClick(item as AnyItem) : undefined
        }
        data-testid="collection-list-table"
      />
    </Stack>
  );
};

export default CollectionList;
