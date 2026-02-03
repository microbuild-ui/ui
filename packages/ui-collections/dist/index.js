// src/CollectionForm.tsx
import { useState, useEffect, useCallback } from "react";
import {
  Paper,
  Stack,
  Button,
  Group,
  Text,
  Alert,
  LoadingOverlay
} from "@mantine/core";
import { IconAlertCircle, IconCheck, IconX } from "@tabler/icons-react";
import { FieldsService, ItemsService } from "@microbuild/services";
import { VForm } from "@microbuild/ui-form";
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
var CollectionForm = ({
  collection,
  id,
  mode = "create",
  defaultValues = {},
  onSuccess,
  onCancel,
  excludeFields = [],
  includeFields
}) => {
  const [fields, setFields] = useState([]);
  const [formData, setFormData] = useState(defaultValues);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const fieldsService = new FieldsService();
        const allFields = await fieldsService.readAll(collection);
        const editableFields = allFields.filter((f) => {
          if (SYSTEM_FIELDS.includes(f.field) && !defaultValues[f.field]) {
            return false;
          }
          if (f.type === "alias") {
            return false;
          }
          if (excludeFields.includes(f.field)) {
            return false;
          }
          if (includeFields && !includeFields.includes(f.field)) {
            return false;
          }
          return true;
        });
        setFields(editableFields);
        if (mode === "edit" && id) {
          const itemsService = new ItemsService(collection);
          const item = await itemsService.readOne(id);
          setFormData({ ...defaultValues, ...item });
        } else {
          setFormData(defaultValues);
        }
      } catch (err) {
        console.error("Error loading form data:", err);
        setError(err instanceof Error ? err.message : "Failed to load form data");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [collection, id, mode, defaultValues, excludeFields, includeFields]);
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
      const itemsService = new ItemsService(collection);
      const dataToSave = { ...formData };
      READ_ONLY_FIELDS.forEach((f) => {
        if (!defaultValues[f]) {
          delete dataToSave[f];
        }
      });
      if (mode === "create") {
        const newId = await itemsService.createOne(dataToSave);
        setSuccess(true);
        onSuccess?.({ ...dataToSave, id: newId });
      } else if (id) {
        await itemsService.updateOne(id, dataToSave);
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
    error && /* @__PURE__ */ jsx(Alert, { icon: /* @__PURE__ */ jsx(IconAlertCircle, { size: 16 }), color: "red", mb: "md", "data-testid": "form-error", children: error }),
    success && /* @__PURE__ */ jsx(Alert, { icon: /* @__PURE__ */ jsx(IconCheck, { size: 16 }), color: "green", mb: "md", "data-testid": "form-success", children: mode === "create" ? "Item created successfully!" : "Item updated successfully!" }),
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
import { useState as useState2, useEffect as useEffect2, useCallback as useCallback2 } from "react";
import {
  Paper as Paper2,
  Table,
  Group as Group2,
  Button as Button2,
  Text as Text2,
  Checkbox,
  Stack as Stack2,
  LoadingOverlay as LoadingOverlay2,
  TextInput,
  Pagination,
  Select,
  Alert as Alert2,
  ActionIcon
} from "@mantine/core";
import { IconSearch, IconRefresh, IconAlertCircle as IconAlertCircle2 } from "@tabler/icons-react";
import { FieldsService as FieldsService2, ItemsService as ItemsService2 } from "@microbuild/services";
import { jsx as jsx2, jsxs as jsxs2 } from "react/jsx-runtime";
var SYSTEM_FIELDS2 = [
  "user_created",
  "user_updated",
  "date_created",
  "date_updated"
];
var CollectionList = ({
  collection,
  enableSelection = false,
  filter,
  bulkActions = [],
  fields: displayFields,
  limit: initialLimit = 15,
  enableSearch = true,
  primaryKeyField = "id",
  onItemClick
}) => {
  const [fields, setFields] = useState2([]);
  const [items, setItems] = useState2([]);
  const [totalCount, setTotalCount] = useState2(0);
  const [selectedIds, setSelectedIds] = useState2([]);
  const [loading, setLoading] = useState2(true);
  const [error, setError] = useState2(null);
  const [page, setPage] = useState2(1);
  const [limit, setLimit] = useState2(initialLimit);
  const [search, setSearch] = useState2("");
  useEffect2(() => {
    const loadFields = async () => {
      try {
        const fieldsService = new FieldsService2();
        const allFields = await fieldsService.readAll(collection);
        const visibleFields = allFields.filter((f) => {
          if (SYSTEM_FIELDS2.includes(f.field)) return false;
          if (f.type === "alias") return false;
          if (f.meta?.hidden) return false;
          return true;
        });
        setFields(visibleFields);
      } catch (err) {
        console.error("Error loading fields:", err);
      }
    };
    loadFields();
  }, [collection]);
  const loadItems = useCallback2(async () => {
    try {
      setLoading(true);
      setError(null);
      const itemsService = new ItemsService2(collection);
      const query = {
        limit,
        page,
        meta: ["total_count", "filter_count"]
      };
      const fieldsToFetch = displayFields || fields.slice(0, 5).map((f) => f.field);
      if (fieldsToFetch.length > 0) {
        if (!fieldsToFetch.includes(primaryKeyField)) {
          fieldsToFetch.unshift(primaryKeyField);
        }
        query.fields = fieldsToFetch;
      }
      if (filter) {
        query.filter = filter;
      }
      if (search) {
        query.search = search;
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
  }, [collection, fields, displayFields, filter, limit, page, search, primaryKeyField]);
  useEffect2(() => {
    if (fields.length > 0 || displayFields) {
      loadItems();
    }
  }, [loadItems, fields.length, displayFields]);
  useEffect2(() => {
    setPage(1);
  }, [search]);
  const toggleSelection = (id) => {
    setSelectedIds(
      (prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };
  const toggleAll = () => {
    if (selectedIds.length === items.length && items.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(items.map((i) => i[primaryKeyField]));
    }
  };
  const getDisplayColumns = () => {
    if (displayFields) return displayFields;
    const cols = fields.filter((f) => f.field !== primaryKeyField).slice(0, 4).map((f) => f.field);
    return [primaryKeyField, ...cols];
  };
  const columns = getDisplayColumns();
  const totalPages = Math.max(1, Math.ceil(totalCount / limit));
  const formatHeader = (fieldName) => {
    const field = fields.find((f) => f.field === fieldName);
    if (field?.meta?.note) return field.meta.note;
    return fieldName.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };
  const formatValue = (value) => {
    if (value === null || value === void 0) return "-";
    if (typeof value === "boolean") return value ? "Yes" : "No";
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
  };
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
            style: { width: 250 },
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
    error && /* @__PURE__ */ jsx2(Alert2, { icon: /* @__PURE__ */ jsx2(IconAlertCircle2, { size: 16 }), color: "red", "data-testid": "collection-list-error", children: error }),
    /* @__PURE__ */ jsxs2(Paper2, { withBorder: true, pos: "relative", children: [
      /* @__PURE__ */ jsx2(LoadingOverlay2, { visible: loading }),
      /* @__PURE__ */ jsxs2(Table, { striped: true, highlightOnHover: true, "data-testid": "collection-list-table", children: [
        /* @__PURE__ */ jsx2(Table.Thead, { children: /* @__PURE__ */ jsxs2(Table.Tr, { children: [
          enableSelection && /* @__PURE__ */ jsx2(Table.Th, { style: { width: 40 }, children: /* @__PURE__ */ jsx2(
            Checkbox,
            {
              checked: selectedIds.length === items.length && items.length > 0,
              indeterminate: selectedIds.length > 0 && selectedIds.length < items.length,
              onChange: toggleAll,
              "data-testid": "collection-list-select-all"
            }
          ) }),
          columns.map((col) => /* @__PURE__ */ jsx2(Table.Th, { children: formatHeader(col) }, col))
        ] }) }),
        /* @__PURE__ */ jsx2(Table.Tbody, { children: items.length === 0 && !loading ? /* @__PURE__ */ jsx2(Table.Tr, { children: /* @__PURE__ */ jsx2(Table.Td, { colSpan: columns.length + (enableSelection ? 1 : 0), children: /* @__PURE__ */ jsx2(Text2, { ta: "center", c: "dimmed", py: "xl", children: "No items found" }) }) }) : items.map((item) => {
          const itemId = item[primaryKeyField];
          return /* @__PURE__ */ jsxs2(
            Table.Tr,
            {
              bg: selectedIds.includes(itemId) ? "var(--mantine-color-blue-light)" : void 0,
              style: { cursor: onItemClick ? "pointer" : void 0 },
              onClick: () => onItemClick?.(item),
              "data-testid": `collection-list-row-${itemId}`,
              children: [
                enableSelection && /* @__PURE__ */ jsx2(Table.Td, { onClick: (e) => e.stopPropagation(), children: /* @__PURE__ */ jsx2(
                  Checkbox,
                  {
                    checked: selectedIds.includes(itemId),
                    onChange: () => toggleSelection(itemId),
                    "data-testid": `collection-list-select-${itemId}`
                  }
                ) }),
                columns.map((col) => /* @__PURE__ */ jsx2(Table.Td, { children: /* @__PURE__ */ jsx2(Text2, { size: "sm", lineClamp: 1, children: formatValue(item[col]) }) }, col))
              ]
            },
            itemId
          );
        }) })
      ] })
    ] }),
    totalPages > 1 && /* @__PURE__ */ jsxs2(Group2, { justify: "space-between", "data-testid": "collection-list-pagination", children: [
      /* @__PURE__ */ jsx2(Group2, { children: /* @__PURE__ */ jsxs2(Text2, { size: "sm", c: "dimmed", children: [
        "Showing ",
        (page - 1) * limit + 1,
        " to ",
        Math.min(page * limit, totalCount),
        " of ",
        totalCount
      ] }) }),
      /* @__PURE__ */ jsxs2(Group2, { children: [
        /* @__PURE__ */ jsx2(Text2, { size: "sm", children: "Items per page:" }),
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
            data: ["10", "15", "25", "50", "100"],
            style: { width: 80 },
            "data-testid": "collection-list-per-page"
          }
        ),
        /* @__PURE__ */ jsx2(
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
    ] })
  ] });
};
export {
  CollectionForm,
  CollectionList
};
