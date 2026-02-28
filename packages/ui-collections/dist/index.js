// src/CollectionForm.tsx
import {
  Alert,
  Button,
  Group,
  LoadingOverlay,
  Paper,
  Stack,
  Text
} from "@mantine/core";
import { FieldsService, apiRequest } from "@buildpad/services";
import { VForm } from "@buildpad/ui-form";
import { IconAlertCircle, IconCheck, IconX } from "@tabler/icons-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { jsx, jsxs } from "react/jsx-runtime";
var SYSTEM_FIELDS = [
  "id",
  "user_created",
  "user_updated",
  "date_created",
  "date_updated",
  "sort"
];
var READ_ONLY_FIELDS = [
  "id",
  "user_created",
  "user_updated",
  "date_created",
  "date_updated"
];
var EMPTY_OBJECT = {};
var EMPTY_ARRAY = [];
var CollectionForm = ({
  collection,
  id,
  mode = "create",
  defaultValues,
  onSuccess,
  onCancel,
  excludeFields,
  includeFields
}) => {
  const stableDefaultValues = useMemo(
    () => defaultValues || EMPTY_OBJECT,
    [defaultValues]
  );
  const stableExcludeFields = useMemo(
    () => excludeFields || EMPTY_ARRAY,
    [excludeFields]
  );
  const stableIncludeFields = useMemo(() => includeFields, [includeFields]);
  const [fields, setFields] = useState([]);
  const [formData, setFormData] = useState(stableDefaultValues);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const dataLoadedRef = useRef(false);
  const lastLoadKey = useRef("");
  useEffect(() => {
    const loadKey = `${collection}-${id}-${mode}`;
    if (dataLoadedRef.current && lastLoadKey.current === loadKey) {
      return;
    }
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const fieldsService = new FieldsService();
        const allFields = await fieldsService.readAll(collection);
        const editableFields = allFields.filter((f) => {
          if (SYSTEM_FIELDS.includes(f.field) && !stableDefaultValues[f.field]) {
            return false;
          }
          if (f.type === "alias") {
            const isGroup = f.meta?.special?.includes?.("group");
            const isPresentation = f.meta?.interface === "presentation-divider" || f.meta?.interface === "presentation-notice";
            if (!isGroup && !isPresentation) {
              return false;
            }
          }
          if (stableExcludeFields.includes(f.field)) {
            return false;
          }
          if (stableIncludeFields && !stableIncludeFields.includes(f.field)) {
            return false;
          }
          return true;
        });
        setFields(editableFields);
        if (mode === "edit" && id) {
          const response = await apiRequest(
            `/api/items/${collection}/${id}`
          );
          setFormData({ ...stableDefaultValues, ...response.data });
        } else {
          setFormData(stableDefaultValues);
        }
        dataLoadedRef.current = true;
        lastLoadKey.current = loadKey;
      } catch (err) {
        console.error("Error loading form data:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load form data"
        );
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [
    collection,
    id,
    mode,
    stableDefaultValues,
    stableExcludeFields,
    stableIncludeFields
  ]);
  const handleFormUpdate = useCallback((values) => {
    setFormData((prev) => ({
      ...prev,
      ...values
    }));
    setSuccess(false);
  }, []);
  const primaryKey = mode === "create" ? "+" : id;
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const dataToSave = { ...formData };
      READ_ONLY_FIELDS.forEach((f) => {
        if (!stableDefaultValues[f]) {
          delete dataToSave[f];
        }
      });
      if (mode === "create") {
        const response = await apiRequest(
          `/api/items/${collection}`,
          { method: "POST", body: JSON.stringify(dataToSave) }
        );
        const newId = response.data?.id;
        setSuccess(true);
        onSuccess?.({ ...dataToSave, id: newId });
      } else if (id) {
        await apiRequest(`/api/items/${collection}/${id}`, {
          method: "PATCH",
          body: JSON.stringify(dataToSave)
        });
        setSuccess(true);
        onSuccess?.({ ...dataToSave, id });
      }
    } catch (err) {
      console.error("Error saving item:", err);
      setError(err instanceof Error ? err.message : "Failed to save item");
    } finally {
      setSaving(false);
    }
  };
  if (loading) {
    return /* @__PURE__ */ jsx(Paper, { p: "md", pos: "relative", mih: 200, children: /* @__PURE__ */ jsx(LoadingOverlay, { visible: true }) });
  }
  return /* @__PURE__ */ jsxs(Paper, { p: "md", "data-testid": "collection-form", children: [
    error && /* @__PURE__ */ jsx(
      Alert,
      {
        icon: /* @__PURE__ */ jsx(IconAlertCircle, { size: 16 }),
        color: "red",
        mb: "md",
        "data-testid": "form-error",
        children: error
      }
    ),
    success && /* @__PURE__ */ jsx(
      Alert,
      {
        icon: /* @__PURE__ */ jsx(IconCheck, { size: 16 }),
        color: "green",
        mb: "md",
        "data-testid": "form-success",
        children: mode === "create" ? "Item created successfully!" : "Item updated successfully!"
      }
    ),
    /* @__PURE__ */ jsx("form", { onSubmit: handleSubmit, children: /* @__PURE__ */ jsxs(Stack, { gap: "md", children: [
      fields.length === 0 ? /* @__PURE__ */ jsxs(Text, { c: "dimmed", ta: "center", py: "xl", children: [
        "No editable fields found for ",
        collection
      ] }) : /* @__PURE__ */ jsx(
        VForm,
        {
          collection,
          fields,
          modelValue: formData,
          initialValues: defaultValues,
          onUpdate: handleFormUpdate,
          primaryKey,
          disabled: saving,
          loading: saving,
          showNoVisibleFields: false
        }
      ),
      /* @__PURE__ */ jsxs(Group, { justify: "flex-end", mt: "md", children: [
        onCancel && /* @__PURE__ */ jsx(
          Button,
          {
            variant: "subtle",
            onClick: onCancel,
            leftSection: /* @__PURE__ */ jsx(IconX, { size: 16 }),
            disabled: saving,
            "data-testid": "form-cancel-btn",
            children: "Cancel"
          }
        ),
        /* @__PURE__ */ jsx(
          Button,
          {
            type: "submit",
            loading: saving,
            disabled: fields.length === 0,
            leftSection: /* @__PURE__ */ jsx(IconCheck, { size: 16 }),
            "data-testid": "form-submit-btn",
            children: mode === "create" ? "Create" : "Save"
          }
        )
      ] })
    ] }) })
  ] });
};

// src/CollectionList.tsx
import {
  ActionIcon,
  Alert as Alert2,
  Button as Button2,
  Group as Group2,
  Menu,
  Pagination,
  Select,
  Stack as Stack2,
  Text as Text2,
  TextInput
} from "@mantine/core";
import {
  FieldsService as FieldsService2,
  PermissionsService,
  apiRequest as apiRequest2
} from "@buildpad/services";
import { VTable } from "@buildpad/ui-table";
import {
  IconAlertCircle as IconAlertCircle2,
  IconAlignCenter,
  IconAlignLeft,
  IconAlignRight,
  IconEyeOff,
  IconPlus,
  IconRefresh,
  IconSearch,
  IconSortAscending,
  IconSortDescending
} from "@tabler/icons-react";
import { useCallback as useCallback2, useEffect as useEffect2, useMemo as useMemo2, useState as useState2 } from "react";
import { jsx as jsx2, jsxs as jsxs2 } from "react/jsx-runtime";
var SYSTEM_FIELDS2 = [
  "user_created",
  "user_updated",
  "date_created",
  "date_updated"
];
var SPACING_HEIGHT = {
  compact: 32,
  cozy: 48,
  comfortable: 56
};
var CollectionList = ({
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
  onSortChange: onSortChangeProp
}) => {
  const [allFields, setAllFields] = useState2([]);
  const [visibleFieldKeys, setVisibleFieldKeys] = useState2([]);
  const [items, setItems] = useState2([]);
  const [totalCount, setTotalCount] = useState2(0);
  const [selectedItems, setSelectedItems] = useState2([]);
  const [loading, setLoading] = useState2(true);
  const [error, setError] = useState2(null);
  const [page, setPage] = useState2(1);
  const [limit, setLimit] = useState2(initialLimit);
  const [search, setSearch] = useState2("");
  const [sort, setSort] = useState2({ by: null, desc: false });
  const [headerOverrides, setHeaderOverrides] = useState2({});
  const rowHeight = rowHeightProp ?? SPACING_HEIGHT[tableSpacing] ?? 48;
  const [readableFields, setReadableFields] = useState2(null);
  useEffect2(() => {
    let cancelled = false;
    const loadFieldsAndPermissions = async () => {
      try {
        const [fieldsResult, permFields] = await Promise.all([
          new FieldsService2().readAll(collection),
          PermissionsService.getReadableFields(collection).catch(() => null)
        ]);
        if (cancelled) return;
        let visible = fieldsResult.filter((f) => {
          if (SYSTEM_FIELDS2.includes(f.field)) return false;
          if (f.type === "alias") return false;
          if (f.meta?.hidden) return false;
          return true;
        });
        setReadableFields(permFields);
        const hasRestriction = permFields && permFields.length > 0 && !permFields.includes("*");
        if (hasRestriction) {
          const accessibleSet = new Set(permFields);
          visible = visible.filter((f) => accessibleSet.has(f.field));
        }
        setAllFields(visible);
        if (displayFields) {
          const keys = hasRestriction ? displayFields.filter((k) => new Set(permFields).has(k)) : displayFields;
          setVisibleFieldKeys(
            keys.length > 0 ? keys : visible.slice(0, 5).map((f) => f.field)
          );
        } else {
          const initial = visible.slice(0, 5).map((f) => f.field);
          if (!initial.includes(primaryKeyField) && visible.some((f) => f.field === primaryKeyField)) {
            initial.unshift(primaryKeyField);
          }
          setVisibleFieldKeys(initial);
        }
      } catch (err) {
        console.error("Error loading fields:", err);
        if (!cancelled) {
          setError(
            "Failed to load collection fields. Make sure the Storybook Host app is running (pnpm dev:host) and connected at http://localhost:3000."
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
  const loadItems = useCallback2(async () => {
    if (visibleFieldKeys.length === 0) return;
    try {
      setLoading(true);
      setError(null);
      const query = {
        limit,
        page,
        meta: ["total_count", "filter_count"]
      };
      const fieldsToFetch = [...visibleFieldKeys];
      if (!fieldsToFetch.includes(primaryKeyField)) {
        fieldsToFetch.unshift(primaryKeyField);
      }
      query.fields = fieldsToFetch;
      if (filter && Object.keys(filter).length > 0) {
        query.filter = filter;
      }
      if (search) {
        query.search = search;
      }
      if (sort.by) {
        query.sort = sort.desc ? `-${sort.by}` : sort.by;
      }
      const queryString = new URLSearchParams(
        Object.entries(query).filter(([, v]) => v !== void 0 && v !== null).map(([k, v]) => [
          k,
          typeof v === "object" ? JSON.stringify(v) : String(v)
        ])
      ).toString();
      const response = await apiRequest2(`/api/items/${collection}${queryString ? `?${queryString}` : ""}`);
      setItems(response.data || []);
      setTotalCount(
        response.meta?.total_count || response.meta?.filter_count || response.data?.length || 0
      );
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
    primaryKeyField
  ]);
  useEffect2(() => {
    if (visibleFieldKeys.length > 0) {
      loadItems();
    }
  }, [loadItems, visibleFieldKeys.length]);
  useEffect2(() => {
    setPage(1);
  }, [search, filter]);
  const permittedFields = useMemo2(() => allFields, [allFields]);
  const headers = useMemo2(() => {
    return visibleFieldKeys.map((key) => {
      const fieldMeta = permittedFields.find((f) => f.field === key);
      const overrides = headerOverrides[key] || {};
      const label = fieldMeta?.meta?.note || key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
      return {
        text: label,
        value: key,
        sortable: enableSort,
        align: overrides.align || "left",
        width: overrides.width ?? null,
        // Attach field metadata for consumers
        field: fieldMeta,
        ...overrides
      };
    });
  }, [visibleFieldKeys, permittedFields, headerOverrides, enableSort]);
  const totalPages = Math.max(1, Math.ceil(totalCount / limit));
  const selectedIds = useMemo2(() => {
    return selectedItems.map(
      (item) => typeof item === "object" && item !== null ? item[primaryKeyField] : item
    );
  }, [selectedItems, primaryKeyField]);
  const addField = useCallback2(
    (fieldKey) => {
      setVisibleFieldKeys((prev) => {
        if (prev.includes(fieldKey)) return prev;
        const next = [...prev, fieldKey];
        onFieldsChange?.(next);
        return next;
      });
    },
    [onFieldsChange]
  );
  const removeField = useCallback2(
    (fieldKey) => {
      setVisibleFieldKeys((prev) => {
        const next = prev.filter((k) => k !== fieldKey);
        onFieldsChange?.(next);
        return next;
      });
    },
    [onFieldsChange]
  );
  const handleAlignChange = useCallback2(
    (fieldKey, align) => {
      setHeaderOverrides((prev) => ({
        ...prev,
        [fieldKey]: { ...prev[fieldKey], align }
      }));
    },
    []
  );
  const handleSortChange = useCallback2(
    (newSort) => {
      const s = newSort ?? { by: null, desc: false };
      setSort(s);
      onSortChangeProp?.(s);
    },
    [onSortChangeProp]
  );
  const handleHeadersChange = useCallback2((newHeaders) => {
    const overrides = {};
    newHeaders.forEach((h) => {
      overrides[h.value] = {};
      if (h.width) overrides[h.value].width = h.width;
      if (h.align && h.align !== "left") overrides[h.value].align = h.align;
    });
    setHeaderOverrides((prev) => ({ ...prev, ...overrides }));
    setVisibleFieldKeys(newHeaders.map((h) => h.value));
  }, []);
  const renderHeaderContextMenu = useCallback2(
    (header) => {
      if (!enableHeaderMenu) return null;
      return /* @__PURE__ */ jsxs2("div", { className: "collection-list-context-menu", role: "menu", children: [
        /* @__PURE__ */ jsx2(Menu.Label, { children: "Sort" }),
        /* @__PURE__ */ jsxs2(
          "div",
          {
            role: "menuitem",
            className: "mantine-Menu-item collection-list-context-menu-item",
            onClick: () => handleSortChange({ by: header.value, desc: false }),
            children: [
              /* @__PURE__ */ jsx2(IconSortAscending, { size: 14 }),
              /* @__PURE__ */ jsx2(Text2, { size: "sm", children: "Sort ascending" })
            ]
          }
        ),
        /* @__PURE__ */ jsxs2(
          "div",
          {
            role: "menuitem",
            className: "mantine-Menu-item collection-list-context-menu-item",
            onClick: () => handleSortChange({ by: header.value, desc: true }),
            children: [
              /* @__PURE__ */ jsx2(IconSortDescending, { size: 14 }),
              /* @__PURE__ */ jsx2(Text2, { size: "sm", children: "Sort descending" })
            ]
          }
        ),
        /* @__PURE__ */ jsx2("div", { className: "collection-list-context-menu-divider" }),
        /* @__PURE__ */ jsx2(Menu.Label, { children: "Alignment" }),
        [
          {
            align: "left",
            icon: /* @__PURE__ */ jsx2(IconAlignLeft, { size: 14 }),
            label: "Align left"
          },
          {
            align: "center",
            icon: /* @__PURE__ */ jsx2(IconAlignCenter, { size: 14 }),
            label: "Align center"
          },
          {
            align: "right",
            icon: /* @__PURE__ */ jsx2(IconAlignRight, { size: 14 }),
            label: "Align right"
          }
        ].map(({ align, icon, label }) => /* @__PURE__ */ jsxs2(
          "div",
          {
            role: "menuitem",
            className: `mantine-Menu-item collection-list-context-menu-item${header.align === align ? " active" : ""}`,
            onClick: () => handleAlignChange(header.value, align),
            children: [
              icon,
              /* @__PURE__ */ jsx2(Text2, { size: "sm", children: label })
            ]
          },
          align
        )),
        /* @__PURE__ */ jsx2("div", { className: "collection-list-context-menu-divider" }),
        /* @__PURE__ */ jsxs2(
          "div",
          {
            role: "menuitem",
            className: "mantine-Menu-item collection-list-context-menu-item danger",
            onClick: () => removeField(header.value),
            children: [
              /* @__PURE__ */ jsx2(IconEyeOff, { size: 14 }),
              /* @__PURE__ */ jsx2(Text2, { size: "sm", children: "Hide field" })
            ]
          }
        )
      ] });
    },
    [enableHeaderMenu, handleSortChange, handleAlignChange, removeField]
  );
  const hiddenFields = useMemo2(() => {
    return permittedFields.filter((f) => !visibleFieldKeys.includes(f.field));
  }, [permittedFields, visibleFieldKeys]);
  const renderHeaderAppend = useCallback2(() => {
    if (!enableAddField || hiddenFields.length === 0) return null;
    return /* @__PURE__ */ jsxs2(Menu, { position: "bottom-end", withArrow: true, shadow: "md", closeOnItemClick: true, children: [
      /* @__PURE__ */ jsx2(Menu.Target, { children: /* @__PURE__ */ jsx2(ActionIcon, { variant: "subtle", size: "sm", title: "Add field", children: /* @__PURE__ */ jsx2(IconPlus, { size: 16 }) }) }),
      /* @__PURE__ */ jsxs2(Menu.Dropdown, { children: [
        /* @__PURE__ */ jsx2(Menu.Label, { children: "Add field" }),
        hiddenFields.map((f) => /* @__PURE__ */ jsx2(Menu.Item, { onClick: () => addField(f.field), children: f.meta?.note || f.field.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) }, f.field))
      ] })
    ] });
  }, [enableAddField, hiddenFields, addField]);
  return /* @__PURE__ */ jsxs2(Stack2, { gap: "md", "data-testid": "collection-list", children: [
    /* @__PURE__ */ jsxs2(Group2, { justify: "space-between", children: [
      /* @__PURE__ */ jsxs2(Group2, { children: [
        enableSearch && /* @__PURE__ */ jsx2(
          TextInput,
          {
            placeholder: "Search...",
            leftSection: /* @__PURE__ */ jsx2(IconSearch, { size: 16 }),
            value: search,
            onChange: (e) => setSearch(e.currentTarget.value),
            className: "collection-list-search",
            "data-testid": "collection-list-search"
          }
        ),
        /* @__PURE__ */ jsx2(
          ActionIcon,
          {
            variant: "subtle",
            onClick: loadItems,
            title: "Refresh",
            "data-testid": "collection-list-refresh",
            children: /* @__PURE__ */ jsx2(IconRefresh, { size: 16 })
          }
        )
      ] }),
      enableSelection && selectedIds.length > 0 && bulkActions.length > 0 && /* @__PURE__ */ jsxs2(Group2, { "data-testid": "collection-list-bulk-actions", children: [
        /* @__PURE__ */ jsxs2(Text2, { size: "sm", c: "dimmed", children: [
          selectedIds.length,
          " selected"
        ] }),
        bulkActions.map((action, index) => /* @__PURE__ */ jsx2(
          Button2,
          {
            size: "sm",
            variant: "light",
            color: action.color,
            leftSection: action.icon,
            onClick: () => action.action(selectedIds),
            "data-testid": `bulk-action-${index}`,
            children: action.label
          },
          index
        ))
      ] })
    ] }),
    error && /* @__PURE__ */ jsx2(
      Alert2,
      {
        icon: /* @__PURE__ */ jsx2(IconAlertCircle2, { size: 16 }),
        color: "red",
        "data-testid": "collection-list-error",
        children: error
      }
    ),
    /* @__PURE__ */ jsx2(
      VTable,
      {
        headers,
        items,
        itemKey: primaryKeyField,
        sort,
        mustSort: false,
        showSelect: enableSelection ? "multiple" : "none",
        showResize: enableResize,
        allowHeaderReorder: enableReorder,
        value: selectedItems,
        fixedHeader: true,
        loading,
        loadingText: "Loading items...",
        noItemsText: "No items found",
        rowHeight,
        selectionUseKeys: true,
        clickable: !!onItemClick,
        renderHeaderContextMenu: enableHeaderMenu ? renderHeaderContextMenu : void 0,
        renderHeaderAppend: enableAddField ? renderHeaderAppend : void 0,
        renderFooter: () => /* @__PURE__ */ jsxs2("div", { className: "collection-list-footer", children: [
          /* @__PURE__ */ jsx2(Text2, { size: "sm", c: "dimmed", children: loading ? "Loading..." : `Showing ${Math.min(
            (page - 1) * limit + 1,
            totalCount
          )}\u2013${Math.min(page * limit, totalCount)} of ${totalCount}` }),
          /* @__PURE__ */ jsxs2(Group2, { children: [
            /* @__PURE__ */ jsx2(Text2, { size: "sm", children: "Per page:" }),
            /* @__PURE__ */ jsx2(
              Select,
              {
                value: String(limit),
                onChange: (value) => {
                  if (value) {
                    setLimit(Number(value));
                    setPage(1);
                  }
                },
                data: ["10", "25", "50", "100"],
                size: "xs",
                className: "collection-list-per-page-select",
                "data-testid": "collection-list-per-page"
              }
            ),
            totalPages > 1 && /* @__PURE__ */ jsx2(
              Pagination,
              {
                value: page,
                onChange: setPage,
                total: totalPages,
                size: "sm",
                "data-testid": "collection-list-pagination-control"
              }
            )
          ] })
        ] }),
        onUpdate: setSelectedItems,
        onSortChange: handleSortChange,
        onHeadersChange: handleHeadersChange,
        onRowClick: onItemClick ? ({ item }) => onItemClick(item) : void 0,
        "data-testid": "collection-list-table"
      }
    )
  ] });
};

// src/FilterPanel.tsx
import { useState as useState3, useCallback as useCallback3, useMemo as useMemo3 } from "react";
import {
  Group as Group3,
  Stack as Stack3,
  Button as Button3,
  Text as Text3,
  Select as Select2,
  TextInput as TextInput2,
  NumberInput,
  ActionIcon as ActionIcon2,
  Paper as Paper2,
  Menu as Menu2,
  Badge
} from "@mantine/core";
import {
  IconFilter,
  IconPlus as IconPlus2,
  IconTrash,
  IconChevronDown,
  IconChevronUp,
  IconX as IconX2
} from "@tabler/icons-react";
import { jsx as jsx3, jsxs as jsxs3 } from "react/jsx-runtime";
var STRING_OPERATORS = [
  { label: "Equals", value: "_eq", needsValue: true },
  { label: "Not equals", value: "_neq", needsValue: true },
  { label: "Contains", value: "_contains", needsValue: true },
  { label: "Does not contain", value: "_ncontains", needsValue: true },
  { label: "Starts with", value: "_starts_with", needsValue: true },
  { label: "Ends with", value: "_ends_with", needsValue: true },
  { label: "Is empty", value: "_empty", needsValue: false },
  { label: "Is not empty", value: "_nempty", needsValue: false },
  { label: "Is null", value: "_null", needsValue: false },
  { label: "Is not null", value: "_nnull", needsValue: false }
];
var NUMBER_OPERATORS = [
  { label: "Equals", value: "_eq", needsValue: true },
  { label: "Not equals", value: "_neq", needsValue: true },
  { label: "Greater than", value: "_gt", needsValue: true },
  { label: "Greater or equal", value: "_gte", needsValue: true },
  { label: "Less than", value: "_lt", needsValue: true },
  { label: "Less or equal", value: "_lte", needsValue: true },
  { label: "Is null", value: "_null", needsValue: false },
  { label: "Is not null", value: "_nnull", needsValue: false }
];
var BOOLEAN_OPERATORS = [
  { label: "Equals", value: "_eq", needsValue: true },
  { label: "Is null", value: "_null", needsValue: false },
  { label: "Is not null", value: "_nnull", needsValue: false }
];
var DATE_OPERATORS = [
  { label: "Equals", value: "_eq", needsValue: true },
  { label: "Not equals", value: "_neq", needsValue: true },
  { label: "After", value: "_gt", needsValue: true },
  { label: "On or after", value: "_gte", needsValue: true },
  { label: "Before", value: "_lt", needsValue: true },
  { label: "On or before", value: "_lte", needsValue: true },
  { label: "Is null", value: "_null", needsValue: false },
  { label: "Is not null", value: "_nnull", needsValue: false }
];
var UUID_OPERATORS = [
  { label: "Equals", value: "_eq", needsValue: true },
  { label: "Not equals", value: "_neq", needsValue: true },
  { label: "Is null", value: "_null", needsValue: false },
  { label: "Is not null", value: "_nnull", needsValue: false }
];
var JSON_OPERATORS = [
  { label: "Is null", value: "_null", needsValue: false },
  { label: "Is not null", value: "_nnull", needsValue: false },
  { label: "Is empty", value: "_empty", needsValue: false },
  { label: "Is not empty", value: "_nempty", needsValue: false }
];
function getOperatorsForType(type) {
  switch (type) {
    case "string":
    case "text":
    case "csv":
    case "hash":
      return STRING_OPERATORS;
    case "integer":
    case "bigInteger":
    case "float":
    case "decimal":
      return NUMBER_OPERATORS;
    case "boolean":
      return BOOLEAN_OPERATORS;
    case "timestamp":
    case "dateTime":
    case "date":
    case "time":
      return DATE_OPERATORS;
    case "uuid":
      return UUID_OPERATORS;
    case "json":
      return JSON_OPERATORS;
    default:
      return STRING_OPERATORS;
  }
}
var _filterId = 0;
function uid() {
  return `filter-${++_filterId}`;
}
function rulesToDaaS(rules) {
  return rules.map((r) => {
    if ("logical" in r) {
      return { [r.logical]: rulesToDaaS(r.rules) };
    }
    const boolOps = ["_null", "_nnull", "_empty", "_nempty"];
    const val = boolOps.includes(r.operator) ? true : r.value;
    return { [r.field]: { [r.operator]: val } };
  });
}
function daasToRules(filter) {
  const key = Object.keys(filter)[0];
  if (!key) return [];
  if (key === "_and" || key === "_or") {
    const children = filter[key];
    const rules = children.map((child) => {
      const childKey = Object.keys(child)[0];
      if (childKey === "_and" || childKey === "_or") {
        return {
          id: uid(),
          logical: childKey,
          rules: daasToRules(child)
        };
      }
      return parseFieldRule(child);
    });
    return rules;
  }
  return [parseFieldRule(filter)];
}
function parseFieldRule(node) {
  const field = Object.keys(node)[0];
  const opObj = node[field];
  const operator = Object.keys(opObj)[0];
  const value = opObj[operator];
  return { id: uid(), field, operator, value };
}
var RuleRow = ({ rule, fields, disabled, onChange, onRemove }) => {
  const fieldData = useMemo3(
    () => fields.map((f) => ({
      value: f.field,
      label: f.meta?.note || f.field.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
    })),
    [fields]
  );
  const selectedField = fields.find((f) => f.field === rule.field);
  const operators = getOperatorsForType(selectedField?.type || "string");
  const operatorData = operators.map((o) => ({ value: o.value, label: o.label }));
  const currentOp = operators.find((o) => o.value === rule.operator);
  return /* @__PURE__ */ jsxs3(Group3, { gap: "xs", wrap: "nowrap", "data-testid": "filter-rule", children: [
    /* @__PURE__ */ jsx3(
      Select2,
      {
        value: rule.field,
        onChange: (val) => {
          if (!val) return;
          const newField = fields.find((f) => f.field === val);
          const newOps = getOperatorsForType(newField?.type || "string");
          onChange({ ...rule, field: val, operator: newOps[0].value, value: null });
        },
        data: fieldData,
        placeholder: "Field...",
        size: "xs",
        style: { minWidth: 130 },
        disabled,
        searchable: true
      }
    ),
    /* @__PURE__ */ jsx3(
      Select2,
      {
        value: rule.operator,
        onChange: (val) => {
          if (!val) return;
          const op = operators.find((o) => o.value === val);
          onChange({ ...rule, operator: val, value: op?.needsValue ? rule.value : true });
        },
        data: operatorData,
        size: "xs",
        style: { minWidth: 130 },
        disabled
      }
    ),
    currentOp?.needsValue && (() => {
      const type = selectedField?.type || "string";
      if (["integer", "bigInteger", "float", "decimal"].includes(type)) {
        return /* @__PURE__ */ jsx3(
          NumberInput,
          {
            value: typeof rule.value === "number" ? rule.value : void 0,
            onChange: (val) => onChange({ ...rule, value: val }),
            placeholder: "Value...",
            size: "xs",
            style: { minWidth: 100, flex: 1 },
            disabled
          }
        );
      }
      if (type === "boolean") {
        return /* @__PURE__ */ jsx3(
          Select2,
          {
            value: rule.value === true ? "true" : rule.value === false ? "false" : "",
            onChange: (val) => onChange({ ...rule, value: val === "true" }),
            data: [{ value: "true", label: "True" }, { value: "false", label: "False" }],
            size: "xs",
            style: { minWidth: 80 },
            disabled
          }
        );
      }
      return /* @__PURE__ */ jsx3(
        TextInput2,
        {
          value: typeof rule.value === "string" ? rule.value : "",
          onChange: (e) => onChange({ ...rule, value: e.currentTarget.value }),
          placeholder: ["timestamp", "dateTime", "date"].includes(type) ? "YYYY-MM-DD" : "Value...",
          size: "xs",
          style: { minWidth: 120, flex: 1 },
          disabled
        }
      );
    })(),
    /* @__PURE__ */ jsx3(
      ActionIcon2,
      {
        variant: "subtle",
        color: "red",
        size: "sm",
        onClick: onRemove,
        disabled,
        title: "Remove filter",
        children: /* @__PURE__ */ jsx3(IconTrash, { size: 14 })
      }
    )
  ] });
};
var FilterPanel = ({
  fields,
  value,
  onChange,
  mode = "panel",
  collapsible = false,
  defaultCollapsed = true,
  disabled = false,
  maxDepth = 3
}) => {
  const [collapsed, setCollapsed] = useState3(defaultCollapsed);
  const [rootGroup, setRootGroup] = useState3(() => {
    if (value && Object.keys(value).length > 0) {
      const key = Object.keys(value)[0];
      const logical = key === "_or" ? "_or" : "_and";
      return {
        id: uid(),
        logical,
        rules: daasToRules(value)
      };
    }
    return { id: uid(), logical: "_and", rules: [] };
  });
  const emitChange = useCallback3((group) => {
    setRootGroup(group);
    if (group.rules.length === 0) {
      onChange?.(null);
    } else {
      const nodes = rulesToDaaS(group.rules);
      onChange?.({ [group.logical]: nodes });
    }
  }, [onChange]);
  const addRule = useCallback3(() => {
    if (fields.length === 0) return;
    const firstField = fields[0];
    const ops = getOperatorsForType(firstField.type);
    const newRule = {
      id: uid(),
      field: firstField.field,
      operator: ops[0].value,
      value: ops[0].needsValue ? null : true
    };
    emitChange({ ...rootGroup, rules: [...rootGroup.rules, newRule] });
  }, [rootGroup, fields, emitChange]);
  const addGroup = useCallback3(() => {
    const newGroup = {
      id: uid(),
      logical: "_and",
      rules: []
    };
    emitChange({ ...rootGroup, rules: [...rootGroup.rules, newGroup] });
  }, [rootGroup, emitChange]);
  const updateRule = useCallback3((index, updated) => {
    const newRules = [...rootGroup.rules];
    newRules[index] = updated;
    emitChange({ ...rootGroup, rules: newRules });
  }, [rootGroup, emitChange]);
  const removeRule = useCallback3((index) => {
    emitChange({ ...rootGroup, rules: rootGroup.rules.filter((_, i) => i !== index) });
  }, [rootGroup, emitChange]);
  const clearAll = useCallback3(() => {
    emitChange({ ...rootGroup, rules: [] });
  }, [rootGroup, emitChange]);
  const toggleLogical = useCallback3(() => {
    emitChange({ ...rootGroup, logical: rootGroup.logical === "_and" ? "_or" : "_and" });
  }, [rootGroup, emitChange]);
  const filterCount = rootGroup.rules.length;
  if (collapsible && collapsed) {
    return /* @__PURE__ */ jsxs3(Group3, { gap: "xs", "data-testid": "filter-panel-collapsed", children: [
      /* @__PURE__ */ jsx3(
        Button3,
        {
          variant: "subtle",
          size: "xs",
          leftSection: /* @__PURE__ */ jsx3(IconFilter, { size: 14 }),
          rightSection: filterCount > 0 ? /* @__PURE__ */ jsx3(Badge, { size: "xs", circle: true, children: filterCount }) : /* @__PURE__ */ jsx3(IconChevronDown, { size: 14 }),
          onClick: () => setCollapsed(false),
          children: "Filters"
        }
      ),
      filterCount > 0 && /* @__PURE__ */ jsx3(ActionIcon2, { variant: "subtle", size: "xs", color: "dimmed", onClick: clearAll, title: "Clear all filters", children: /* @__PURE__ */ jsx3(IconX2, { size: 12 }) })
    ] });
  }
  const content = /* @__PURE__ */ jsxs3(Stack3, { gap: "xs", "data-testid": "filter-panel", children: [
    /* @__PURE__ */ jsxs3(Group3, { justify: "space-between", children: [
      /* @__PURE__ */ jsxs3(Group3, { gap: "xs", children: [
        /* @__PURE__ */ jsx3(IconFilter, { size: 16, style: { color: "var(--mantine-color-dimmed)" } }),
        /* @__PURE__ */ jsx3(Text3, { size: "sm", fw: 600, children: "Filters" }),
        filterCount > 0 && /* @__PURE__ */ jsxs3(Badge, { size: "xs", variant: "light", children: [
          filterCount,
          " active"
        ] })
      ] }),
      /* @__PURE__ */ jsxs3(Group3, { gap: "xs", children: [
        filterCount > 0 && /* @__PURE__ */ jsx3(Button3, { variant: "subtle", size: "xs", color: "dimmed", onClick: clearAll, children: "Clear all" }),
        collapsible && /* @__PURE__ */ jsx3(ActionIcon2, { variant: "subtle", size: "xs", onClick: () => setCollapsed(true), children: /* @__PURE__ */ jsx3(IconChevronUp, { size: 14 }) })
      ] })
    ] }),
    rootGroup.rules.length > 1 && /* @__PURE__ */ jsxs3(Group3, { gap: "xs", children: [
      /* @__PURE__ */ jsx3(Text3, { size: "xs", c: "dimmed", children: "Match" }),
      /* @__PURE__ */ jsx3(
        Button3,
        {
          variant: rootGroup.logical === "_and" ? "filled" : "outline",
          size: "compact-xs",
          onClick: () => rootGroup.logical !== "_and" && toggleLogical(),
          children: "ALL"
        }
      ),
      /* @__PURE__ */ jsx3(
        Button3,
        {
          variant: rootGroup.logical === "_or" ? "filled" : "outline",
          size: "compact-xs",
          onClick: () => rootGroup.logical !== "_or" && toggleLogical(),
          children: "ANY"
        }
      )
    ] }),
    rootGroup.rules.length === 0 ? /* @__PURE__ */ jsx3(Text3, { size: "sm", c: "dimmed", children: 'No filter rules. Click "Add filter" to get started.' }) : /* @__PURE__ */ jsx3(Stack3, { gap: 6, children: rootGroup.rules.map((rule, index) => {
      if ("logical" in rule) {
        return /* @__PURE__ */ jsxs3(Group3, { gap: "xs", children: [
          /* @__PURE__ */ jsxs3(Badge, { variant: "outline", size: "sm", children: [
            rule.logical === "_and" ? "AND" : "OR",
            " group (",
            rule.rules.length,
            " rules)"
          ] }),
          /* @__PURE__ */ jsx3(
            ActionIcon2,
            {
              variant: "subtle",
              color: "red",
              size: "xs",
              onClick: () => removeRule(index),
              disabled,
              children: /* @__PURE__ */ jsx3(IconTrash, { size: 12 })
            }
          )
        ] }, rule.id);
      }
      return /* @__PURE__ */ jsx3(
        RuleRow,
        {
          rule,
          fields,
          disabled,
          onChange: (updated) => updateRule(index, updated),
          onRemove: () => removeRule(index)
        },
        rule.id
      );
    }) }),
    /* @__PURE__ */ jsxs3(Group3, { gap: "xs", children: [
      /* @__PURE__ */ jsxs3(Menu2, { position: "bottom-start", withArrow: true, shadow: "sm", children: [
        /* @__PURE__ */ jsx3(Menu2.Target, { children: /* @__PURE__ */ jsx3(Button3, { variant: "subtle", size: "xs", leftSection: /* @__PURE__ */ jsx3(IconPlus2, { size: 14 }), children: "Add filter" }) }),
        /* @__PURE__ */ jsx3(Menu2.Dropdown, { children: fields.map((f) => /* @__PURE__ */ jsx3(
          Menu2.Item,
          {
            onClick: () => {
              const ops = getOperatorsForType(f.type);
              const newRule = {
                id: uid(),
                field: f.field,
                operator: ops[0].value,
                value: ops[0].needsValue ? null : true
              };
              emitChange({ ...rootGroup, rules: [...rootGroup.rules, newRule] });
            },
            children: f.meta?.note || f.field.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
          },
          f.field
        )) })
      ] }),
      maxDepth > 1 && /* @__PURE__ */ jsx3(Button3, { variant: "subtle", size: "xs", color: "dimmed", onClick: addGroup, children: "Add group" })
    ] })
  ] });
  if (mode === "inline") return content;
  return /* @__PURE__ */ jsx3(Paper2, { withBorder: true, p: "sm", "data-testid": "filter-panel-container", children: content });
};

// src/ContentNavigation.tsx
import { useState as useState4, useMemo as useMemo4, useCallback as useCallback4 } from "react";
import {
  NavLink,
  TextInput as TextInput3,
  Stack as Stack4,
  ScrollArea,
  Text as Text4,
  Menu as Menu3,
  ActionIcon as ActionIcon3,
  Group as Group4,
  Box,
  UnstyledButton
} from "@mantine/core";
import {
  IconSearch as IconSearch2,
  IconChevronRight,
  IconFolder,
  IconTable,
  IconEye,
  IconEyeOff as IconEyeOff2,
  IconBookmark,
  IconSettings,
  IconDatabase,
  IconBox
} from "@tabler/icons-react";
import { Fragment, jsx as jsx4, jsxs as jsxs4 } from "react/jsx-runtime";
function CollectionIcon({ icon, color }) {
  const iconColor = color || void 0;
  const size = 18;
  switch (icon) {
    case "box":
      return /* @__PURE__ */ jsx4(IconBox, { size, color: iconColor });
    case "folder":
    case "folder_open":
      return /* @__PURE__ */ jsx4(IconFolder, { size, color: iconColor });
    case "database":
      return /* @__PURE__ */ jsx4(IconDatabase, { size, color: iconColor });
    default:
      return /* @__PURE__ */ jsx4(IconTable, { size, color: iconColor });
  }
}
function NavigationItem({
  node,
  currentCollection,
  activeGroups,
  onToggleGroup,
  onNavigate,
  bookmarks,
  onBookmarkClick,
  onEditCollection,
  isAdmin,
  search,
  dense
}) {
  const isGroup = node.children.length > 0;
  const isExpanded = activeGroups.includes(node.collection);
  const isActive = currentCollection === node.collection;
  const isLocked = node.meta?.collapse === "locked";
  const isHidden = node.meta?.hidden;
  const hasSchema = !!node.schema;
  const collectionBookmarks = useMemo4(
    () => (bookmarks || []).filter((b) => b.collection === node.collection),
    [bookmarks, node.collection]
  );
  const hasBookmarks = collectionBookmarks.length > 0;
  const isGroupWithContent = isGroup || hasBookmarks;
  const matchesSearch = useMemo4(() => {
    if (!search || search.length < 3) return true;
    const q = search.toLowerCase();
    const selfMatch = node.collection.toLowerCase().includes(q) || (node.name || "").toLowerCase().includes(q);
    if (selfMatch) return true;
    function childMatches(children) {
      return children.some(
        (child) => child.collection.toLowerCase().includes(q) || (child.name || "").toLowerCase().includes(q) || childMatches(child.children)
      );
    }
    const bookmarkMatch = collectionBookmarks.some(
      (b) => b.bookmark?.toLowerCase().includes(q)
    );
    return childMatches(node.children) || bookmarkMatch;
  }, [search, node, collectionBookmarks]);
  if (!matchesSearch) return null;
  const handleClick = () => {
    if (hasSchema) {
      onNavigate(node.collection);
    }
  };
  const handleGroupToggle = () => {
    if (isGroupWithContent && !isLocked) {
      onToggleGroup(node.collection);
    }
  };
  const label = /* @__PURE__ */ jsx4(Group4, { gap: 4, wrap: "nowrap", children: /* @__PURE__ */ jsx4(
    Text4,
    {
      size: dense ? "sm" : void 0,
      fw: isActive ? 600 : 400,
      c: isHidden ? "dimmed" : void 0,
      truncate: true,
      children: node.name || node.collection
    }
  ) });
  const contextMenu = isAdmin && hasSchema ? /* @__PURE__ */ jsxs4(Menu3, { shadow: "md", width: 200, position: "bottom-start", withArrow: true, children: [
    /* @__PURE__ */ jsx4(Menu3.Target, { children: /* @__PURE__ */ jsx4(
      ActionIcon3,
      {
        variant: "subtle",
        size: "xs",
        onClick: (e) => {
          e.stopPropagation();
        },
        style: { opacity: 0, transition: "opacity 150ms" },
        className: "nav-item-action",
        children: /* @__PURE__ */ jsx4(IconSettings, { size: 14 })
      }
    ) }),
    /* @__PURE__ */ jsx4(Menu3.Dropdown, { children: /* @__PURE__ */ jsx4(
      Menu3.Item,
      {
        leftSection: /* @__PURE__ */ jsx4(IconDatabase, { size: 14 }),
        onClick: () => onEditCollection?.(node.collection),
        children: "Edit Collection"
      }
    ) })
  ] }) : null;
  if (isGroupWithContent) {
    return /* @__PURE__ */ jsx4(Fragment, { children: /* @__PURE__ */ jsxs4(
      NavLink,
      {
        label,
        leftSection: /* @__PURE__ */ jsx4(CollectionIcon, { icon: node.icon, color: node.color }),
        rightSection: /* @__PURE__ */ jsxs4(Group4, { gap: 4, children: [
          contextMenu,
          !isLocked && /* @__PURE__ */ jsx4(
            IconChevronRight,
            {
              size: 14,
              style: {
                transform: isExpanded ? "rotate(90deg)" : void 0,
                transition: "transform 150ms"
              }
            }
          )
        ] }),
        active: isActive,
        opened: isExpanded,
        onClick: () => {
          handleClick();
          handleGroupToggle();
        },
        py: dense ? 4 : 6,
        styles: {
          root: {
            "&:hover .nav-item-action": {
              opacity: 1
            }
          }
        },
        children: [
          node.children.map((child) => /* @__PURE__ */ jsx4(
            NavigationItem,
            {
              node: child,
              currentCollection,
              activeGroups,
              onToggleGroup,
              onNavigate,
              bookmarks,
              onBookmarkClick,
              onEditCollection,
              isAdmin,
              search,
              dense
            },
            child.collection
          )),
          collectionBookmarks.map((bookmark) => /* @__PURE__ */ jsx4(
            NavLink,
            {
              label: /* @__PURE__ */ jsx4(Text4, { size: "sm", truncate: true, children: bookmark.bookmark || "Untitled Bookmark" }),
              leftSection: /* @__PURE__ */ jsx4(
                IconBookmark,
                {
                  size: 16,
                  color: bookmark.color || void 0,
                  fill: bookmark.color || "none"
                }
              ),
              onClick: () => onBookmarkClick?.(bookmark),
              py: dense ? 3 : 5
            },
            bookmark.id
          ))
        ]
      }
    ) });
  }
  return /* @__PURE__ */ jsx4(
    NavLink,
    {
      label,
      leftSection: /* @__PURE__ */ jsx4(CollectionIcon, { icon: node.icon, color: node.color }),
      rightSection: contextMenu,
      active: isActive,
      onClick: handleClick,
      py: dense ? 4 : 6,
      styles: {
        root: {
          "&:hover .nav-item-action": {
            opacity: 1
          }
        }
      }
    }
  );
}
var ContentNavigation = ({
  currentCollection,
  rootCollections,
  activeGroups,
  onToggleGroup,
  showHidden = false,
  onToggleHidden,
  hasHiddenCollections = false,
  showSearch = false,
  dense = false,
  bookmarks,
  onNavigate,
  onBookmarkClick,
  onEditCollection,
  isAdmin = false,
  loading = false,
  onSearchChange
}) => {
  const [search, setSearch] = useState4("");
  const handleSearchChange = useCallback4(
    (value) => {
      setSearch(value);
      onSearchChange?.(value);
    },
    [onSearchChange]
  );
  if (loading) {
    return /* @__PURE__ */ jsx4(Stack4, { gap: "xs", p: "md", children: Array.from({ length: 6 }).map((_, i) => /* @__PURE__ */ jsx4(
      Box,
      {
        h: dense ? 28 : 36,
        bg: "var(--mantine-color-gray-1)",
        style: { borderRadius: "var(--mantine-radius-sm)", animation: "pulse 1.5s ease-in-out infinite" }
      },
      i
    )) });
  }
  if (rootCollections.length === 0) {
    return /* @__PURE__ */ jsxs4(Stack4, { gap: "md", p: "md", align: "center", justify: "center", style: { minHeight: 200 }, children: [
      /* @__PURE__ */ jsx4(IconBox, { size: 48, color: "var(--mantine-color-gray-5)" }),
      /* @__PURE__ */ jsx4(Text4, { c: "dimmed", ta: "center", size: "sm", children: "No collections available" }),
      isAdmin && /* @__PURE__ */ jsx4(Text4, { c: "dimmed", ta: "center", size: "xs", children: "Create your first collection in the data model settings" })
    ] });
  }
  return /* @__PURE__ */ jsxs4(Stack4, { gap: 0, style: { minHeight: "100%" }, children: [
    showSearch && /* @__PURE__ */ jsx4(Box, { p: "sm", pb: 0, style: { position: "sticky", top: 0, zIndex: 1 }, children: /* @__PURE__ */ jsx4(
      TextInput3,
      {
        value: search,
        onChange: (e) => handleSearchChange(e.currentTarget.value),
        placeholder: "Search collections...",
        leftSection: /* @__PURE__ */ jsx4(IconSearch2, { size: 16 }),
        size: dense ? "xs" : "sm",
        type: "search"
      }
    ) }),
    /* @__PURE__ */ jsx4(ScrollArea, { style: { flex: 1 }, p: "xs", children: /* @__PURE__ */ jsx4("nav", { children: rootCollections.map((node) => /* @__PURE__ */ jsx4(
      NavigationItem,
      {
        node,
        currentCollection,
        activeGroups,
        onToggleGroup,
        onNavigate,
        bookmarks,
        onBookmarkClick,
        onEditCollection,
        isAdmin,
        search,
        dense
      },
      node.collection
    )) }) }),
    hasHiddenCollections && onToggleHidden && /* @__PURE__ */ jsx4(
      Box,
      {
        p: "xs",
        style: {
          borderTop: "1px solid var(--mantine-color-gray-3)",
          position: "sticky",
          bottom: 0
        },
        children: /* @__PURE__ */ jsxs4(
          UnstyledButton,
          {
            onClick: onToggleHidden,
            style: { display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "4px 8px" },
            children: [
              showHidden ? /* @__PURE__ */ jsx4(IconEyeOff2, { size: 16 }) : /* @__PURE__ */ jsx4(IconEye, { size: 16 }),
              /* @__PURE__ */ jsx4(Text4, { size: "xs", c: "dimmed", children: showHidden ? "Hide hidden collections" : "Show hidden collections" })
            ]
          }
        )
      }
    )
  ] });
};

// src/ContentLayout.tsx
import { useCallback as useCallback5 } from "react";
import {
  AppShell,
  Group as Group5,
  ActionIcon as ActionIcon4,
  Title,
  Breadcrumbs,
  Anchor,
  Burger,
  Box as Box2,
  ScrollArea as ScrollArea2,
  Skeleton
} from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import {
  IconMenu2,
  IconChevronRight as IconChevronRight2
} from "@tabler/icons-react";
import { jsx as jsx5, jsxs as jsxs5 } from "react/jsx-runtime";
var ContentLayout = ({
  title,
  icon,
  iconColor,
  breadcrumbs,
  showBack = false,
  onBack,
  showHeaderShadow = false,
  sidebar,
  sidebarDetail,
  actions,
  titleAppend,
  headline,
  loading = false,
  sidebarWidth = 260,
  detailWidth = 284,
  children
}) => {
  const [sidebarOpened, { toggle: toggleSidebar, close: closeSidebar }] = useDisclosure(true);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const handleBreadcrumbClick = useCallback5(
    (e, href) => {
      if (!href) e.preventDefault();
    },
    []
  );
  return /* @__PURE__ */ jsxs5(
    AppShell,
    {
      navbar: {
        width: sidebarWidth,
        breakpoint: "sm",
        collapsed: { mobile: !sidebarOpened, desktop: !sidebarOpened }
      },
      aside: sidebarDetail ? {
        width: detailWidth,
        breakpoint: "md",
        collapsed: { mobile: true, desktop: false }
      } : void 0,
      padding: 0,
      children: [
        /* @__PURE__ */ jsx5(AppShell.Navbar, { p: 0, children: /* @__PURE__ */ jsx5(AppShell.Section, { grow: true, component: ScrollArea2, children: sidebar }) }),
        /* @__PURE__ */ jsxs5(AppShell.Main, { children: [
          /* @__PURE__ */ jsxs5(
            Box2,
            {
              py: "sm",
              px: "md",
              style: {
                borderBottom: "1px solid var(--mantine-color-gray-3)",
                boxShadow: showHeaderShadow ? "0 4px 6px -1px rgba(0, 0, 0, 0.07)" : void 0,
                transition: "box-shadow 150ms ease",
                position: "sticky",
                top: 0,
                zIndex: 100,
                backgroundColor: "var(--mantine-color-body)"
              },
              children: [
                (breadcrumbs || headline) && /* @__PURE__ */ jsxs5(Group5, { gap: 4, mb: 4, children: [
                  isMobile && /* @__PURE__ */ jsx5(
                    Burger,
                    {
                      opened: sidebarOpened,
                      onClick: toggleSidebar,
                      size: "sm",
                      hiddenFrom: "sm"
                    }
                  ),
                  !isMobile && !sidebarOpened && /* @__PURE__ */ jsx5(ActionIcon4, { variant: "subtle", onClick: toggleSidebar, size: "sm", mr: 4, children: /* @__PURE__ */ jsx5(IconMenu2, { size: 16 }) }),
                  breadcrumbs && breadcrumbs.length > 0 && /* @__PURE__ */ jsx5(
                    Breadcrumbs,
                    {
                      separator: /* @__PURE__ */ jsx5(IconChevronRight2, { size: 12 }),
                      style: { fontSize: "var(--mantine-font-size-xs)" },
                      children: breadcrumbs.map((item, idx) => /* @__PURE__ */ jsx5(
                        Anchor,
                        {
                          href: item.href || "#",
                          size: "xs",
                          c: "dimmed",
                          onClick: (e) => handleBreadcrumbClick(e, item.href),
                          children: item.label
                        },
                        idx
                      ))
                    }
                  ),
                  headline
                ] }),
                /* @__PURE__ */ jsxs5(Group5, { justify: "space-between", wrap: "nowrap", children: [
                  /* @__PURE__ */ jsxs5(Group5, { gap: "sm", wrap: "nowrap", style: { minWidth: 0 }, children: [
                    showBack && onBack && /* @__PURE__ */ jsx5(ActionIcon4, { variant: "subtle", onClick: onBack, size: "md", children: /* @__PURE__ */ jsx5(
                      IconChevronRight2,
                      {
                        size: 18,
                        style: { transform: "rotate(180deg)" }
                      }
                    ) }),
                    icon && /* @__PURE__ */ jsx5(Box2, { c: iconColor, style: { display: "flex", alignItems: "center" }, children: icon }),
                    loading ? /* @__PURE__ */ jsx5(Skeleton, { width: 200, height: 28 }) : title && /* @__PURE__ */ jsx5(Title, { order: 3, lineClamp: 1, style: { minWidth: 0 }, children: title }),
                    titleAppend
                  ] }),
                  actions && /* @__PURE__ */ jsx5(Group5, { gap: "xs", wrap: "nowrap", children: actions })
                ] })
              ]
            }
          ),
          /* @__PURE__ */ jsx5(Box2, { style: { flex: 1 }, children })
        ] }),
        sidebarDetail && /* @__PURE__ */ jsx5(AppShell.Aside, { p: "md", children: /* @__PURE__ */ jsx5(AppShell.Section, { grow: true, component: ScrollArea2, children: sidebarDetail }) })
      ]
    }
  );
};

// src/SaveOptions.tsx
import {
  Menu as Menu4,
  ActionIcon as ActionIcon5,
  Kbd,
  Group as Group6
} from "@mantine/core";
import {
  IconPlus as IconPlus3,
  IconCopy,
  IconArrowBack,
  IconChevronDown as IconChevronDown2,
  IconDeviceFloppy
} from "@tabler/icons-react";
import { jsx as jsx6, jsxs as jsxs6 } from "react/jsx-runtime";
var SaveOptions = ({
  disabledOptions = [],
  onSaveAndStay,
  onSaveAndAddNew,
  onSaveAsCopy,
  onDiscardAndStay,
  disabled = false,
  platform
}) => {
  const isMac = platform ? platform === "mac" : typeof navigator !== "undefined" && /Mac/.test(navigator.userAgent);
  const metaKey = isMac ? "\u2318" : "Ctrl";
  const isDisabled = (action) => disabledOptions.includes(action);
  return /* @__PURE__ */ jsxs6(Menu4, { shadow: "md", width: 280, position: "bottom-end", withArrow: true, children: [
    /* @__PURE__ */ jsx6(Menu4.Target, { children: /* @__PURE__ */ jsx6(
      ActionIcon5,
      {
        variant: "filled",
        size: "md",
        disabled,
        "aria-label": "More save options",
        style: {
          borderTopLeftRadius: 0,
          borderBottomLeftRadius: 0,
          marginLeft: -1
        },
        children: /* @__PURE__ */ jsx6(IconChevronDown2, { size: 14 })
      }
    ) }),
    /* @__PURE__ */ jsxs6(Menu4.Dropdown, { children: [
      /* @__PURE__ */ jsx6(
        Menu4.Item,
        {
          leftSection: /* @__PURE__ */ jsx6(IconDeviceFloppy, { size: 16 }),
          disabled: isDisabled("save-and-stay"),
          onClick: onSaveAndStay,
          rightSection: /* @__PURE__ */ jsxs6(Group6, { gap: 2, children: [
            /* @__PURE__ */ jsx6(Kbd, { size: "xs", children: metaKey }),
            /* @__PURE__ */ jsx6(Kbd, { size: "xs", children: "S" })
          ] }),
          children: "Save and Stay"
        }
      ),
      /* @__PURE__ */ jsx6(
        Menu4.Item,
        {
          leftSection: /* @__PURE__ */ jsx6(IconPlus3, { size: 16 }),
          disabled: isDisabled("save-and-add-new"),
          onClick: onSaveAndAddNew,
          rightSection: /* @__PURE__ */ jsxs6(Group6, { gap: 2, children: [
            /* @__PURE__ */ jsx6(Kbd, { size: "xs", children: metaKey }),
            /* @__PURE__ */ jsx6(Kbd, { size: "xs", children: "\u21E7" }),
            /* @__PURE__ */ jsx6(Kbd, { size: "xs", children: "S" })
          ] }),
          children: "Save and Create New"
        }
      ),
      /* @__PURE__ */ jsx6(
        Menu4.Item,
        {
          leftSection: /* @__PURE__ */ jsx6(IconCopy, { size: 16 }),
          disabled: isDisabled("save-as-copy"),
          onClick: onSaveAsCopy,
          children: "Save as Copy"
        }
      ),
      /* @__PURE__ */ jsx6(Menu4.Divider, {}),
      /* @__PURE__ */ jsx6(
        Menu4.Item,
        {
          leftSection: /* @__PURE__ */ jsx6(IconArrowBack, { size: 16 }),
          disabled: isDisabled("discard-and-stay"),
          onClick: onDiscardAndStay,
          color: "red",
          children: "Discard Changes"
        }
      )
    ] })
  ] });
};
export {
  CollectionForm,
  CollectionList,
  ContentLayout,
  ContentNavigation,
  FilterPanel,
  SaveOptions
};
