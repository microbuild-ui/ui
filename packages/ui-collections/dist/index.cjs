"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  CollectionForm: () => CollectionForm,
  CollectionList: () => CollectionList
});
module.exports = __toCommonJS(index_exports);

// src/CollectionForm.tsx
var import_react = require("react");
var import_core = require("@mantine/core");
var import_icons_react = require("@tabler/icons-react");
var import_services = require("@microbuild/services");
var import_ui_form = require("@microbuild/ui-form");
var import_jsx_runtime = require("react/jsx-runtime");
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
  const stableDefaultValues = (0, import_react.useMemo)(
    () => defaultValues || EMPTY_OBJECT,
    [defaultValues]
  );
  const stableExcludeFields = (0, import_react.useMemo)(
    () => excludeFields || EMPTY_ARRAY,
    [excludeFields]
  );
  const stableIncludeFields = (0, import_react.useMemo)(
    () => includeFields,
    [includeFields]
  );
  const [fields, setFields] = (0, import_react.useState)([]);
  const [formData, setFormData] = (0, import_react.useState)(stableDefaultValues);
  const [loading, setLoading] = (0, import_react.useState)(true);
  const [saving, setSaving] = (0, import_react.useState)(false);
  const [error, setError] = (0, import_react.useState)(null);
  const [success, setSuccess] = (0, import_react.useState)(false);
  const dataLoadedRef = (0, import_react.useRef)(false);
  const lastLoadKey = (0, import_react.useRef)("");
  (0, import_react.useEffect)(() => {
    const loadKey = `${collection}-${id}-${mode}`;
    if (dataLoadedRef.current && lastLoadKey.current === loadKey) {
      return;
    }
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const fieldsService = new import_services.FieldsService();
        const allFields = await fieldsService.readAll(collection);
        const editableFields = allFields.filter((f) => {
          if (SYSTEM_FIELDS.includes(f.field) && !stableDefaultValues[f.field]) {
            return false;
          }
          if (f.type === "alias") {
            return false;
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
          const itemsService = new import_services.ItemsService(collection);
          const item = await itemsService.readOne(id);
          setFormData({ ...stableDefaultValues, ...item });
        } else {
          setFormData(stableDefaultValues);
        }
        dataLoadedRef.current = true;
        lastLoadKey.current = loadKey;
      } catch (err) {
        console.error("Error loading form data:", err);
        setError(err instanceof Error ? err.message : "Failed to load form data");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [collection, id, mode, stableDefaultValues, stableExcludeFields, stableIncludeFields]);
  const handleFormUpdate = (0, import_react.useCallback)((values) => {
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
      const itemsService = new import_services.ItemsService(collection);
      const dataToSave = { ...formData };
      READ_ONLY_FIELDS.forEach((f) => {
        if (!stableDefaultValues[f]) {
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
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_core.Paper, { p: "md", pos: "relative", mih: 200, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_core.LoadingOverlay, { visible: true }) });
  }
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_core.Paper, { p: "md", "data-testid": "collection-form", children: [
    error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_core.Alert, { icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_icons_react.IconAlertCircle, { size: 16 }), color: "red", mb: "md", "data-testid": "form-error", children: error }),
    success && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_core.Alert, { icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_icons_react.IconCheck, { size: 16 }), color: "green", mb: "md", "data-testid": "form-success", children: mode === "create" ? "Item created successfully!" : "Item updated successfully!" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("form", { onSubmit: handleSubmit, children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_core.Stack, { gap: "md", children: [
      fields.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_core.Text, { c: "dimmed", ta: "center", py: "xl", children: [
        "No editable fields found for ",
        collection
      ] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        import_ui_form.VForm,
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
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_core.Group, { justify: "flex-end", mt: "md", children: [
        onCancel && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          import_core.Button,
          {
            variant: "subtle",
            onClick: onCancel,
            leftSection: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_icons_react.IconX, { size: 16 }),
            disabled: saving,
            "data-testid": "form-cancel-btn",
            children: "Cancel"
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          import_core.Button,
          {
            type: "submit",
            loading: saving,
            disabled: fields.length === 0,
            leftSection: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_icons_react.IconCheck, { size: 16 }),
            "data-testid": "form-submit-btn",
            children: mode === "create" ? "Create" : "Save"
          }
        )
      ] })
    ] }) })
  ] });
};

// src/CollectionList.tsx
var import_react2 = require("react");
var import_core2 = require("@mantine/core");
var import_icons_react2 = require("@tabler/icons-react");
var import_services2 = require("@microbuild/services");
var import_jsx_runtime2 = require("react/jsx-runtime");
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
  const [fields, setFields] = (0, import_react2.useState)([]);
  const [items, setItems] = (0, import_react2.useState)([]);
  const [totalCount, setTotalCount] = (0, import_react2.useState)(0);
  const [selectedIds, setSelectedIds] = (0, import_react2.useState)([]);
  const [loading, setLoading] = (0, import_react2.useState)(true);
  const [error, setError] = (0, import_react2.useState)(null);
  const [page, setPage] = (0, import_react2.useState)(1);
  const [limit, setLimit] = (0, import_react2.useState)(initialLimit);
  const [search, setSearch] = (0, import_react2.useState)("");
  (0, import_react2.useEffect)(() => {
    const loadFields = async () => {
      try {
        const fieldsService = new import_services2.FieldsService();
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
        setError(
          "Failed to load collection fields. Make sure the Storybook Host app is running (pnpm dev:host) and connected at http://localhost:3000."
        );
        setLoading(false);
      }
    };
    loadFields();
  }, [collection]);
  const loadItems = (0, import_react2.useCallback)(async () => {
    try {
      setLoading(true);
      setError(null);
      const itemsService = new import_services2.ItemsService(collection);
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
  (0, import_react2.useEffect)(() => {
    if (fields.length > 0 || displayFields) {
      loadItems();
    }
  }, [loadItems, fields.length, displayFields]);
  (0, import_react2.useEffect)(() => {
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
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Stack, { gap: "md", "data-testid": "collection-list", children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Group, { justify: "space-between", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Group, { children: [
        enableSearch && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
          import_core2.TextInput,
          {
            placeholder: "Search...",
            leftSection: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_icons_react2.IconSearch, { size: 16 }),
            value: search,
            onChange: (e) => setSearch(e.currentTarget.value),
            style: { width: 250 },
            "data-testid": "collection-list-search"
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
          import_core2.ActionIcon,
          {
            variant: "subtle",
            onClick: loadItems,
            title: "Refresh",
            "data-testid": "collection-list-refresh",
            children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_icons_react2.IconRefresh, { size: 16 })
          }
        )
      ] }),
      enableSelection && selectedIds.length > 0 && bulkActions.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Group, { "data-testid": "collection-list-bulk-actions", children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Text, { size: "sm", c: "dimmed", children: [
          selectedIds.length,
          " selected"
        ] }),
        bulkActions.map((action, index) => /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
          import_core2.Button,
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
    error && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Alert, { icon: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_icons_react2.IconAlertCircle, { size: 16 }), color: "red", "data-testid": "collection-list-error", children: error }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Paper, { withBorder: true, pos: "relative", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.LoadingOverlay, { visible: loading }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Table, { striped: true, highlightOnHover: true, "data-testid": "collection-list-table", children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Table.Thead, { children: /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Table.Tr, { children: [
          enableSelection && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Table.Th, { style: { width: 40 }, children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
            import_core2.Checkbox,
            {
              checked: selectedIds.length === items.length && items.length > 0,
              indeterminate: selectedIds.length > 0 && selectedIds.length < items.length,
              onChange: toggleAll,
              "data-testid": "collection-list-select-all"
            }
          ) }),
          columns.map((col) => /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Table.Th, { children: formatHeader(col) }, col))
        ] }) }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Table.Tbody, { children: items.length === 0 && !loading ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Table.Tr, { children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Table.Td, { colSpan: columns.length + (enableSelection ? 1 : 0), children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Text, { ta: "center", c: "dimmed", py: "xl", children: "No items found" }) }) }) : items.map((item) => {
          const itemId = item[primaryKeyField];
          return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
            import_core2.Table.Tr,
            {
              bg: selectedIds.includes(itemId) ? "var(--mantine-color-blue-light)" : void 0,
              style: { cursor: onItemClick ? "pointer" : void 0 },
              onClick: () => onItemClick?.(item),
              "data-testid": `collection-list-row-${itemId}`,
              children: [
                enableSelection && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Table.Td, { onClick: (e) => e.stopPropagation(), children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
                  import_core2.Checkbox,
                  {
                    checked: selectedIds.includes(itemId),
                    onChange: () => toggleSelection(itemId),
                    "data-testid": `collection-list-select-${itemId}`
                  }
                ) }),
                columns.map((col) => /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Table.Td, { children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Text, { size: "sm", lineClamp: 1, children: formatValue(item[col]) }) }, col))
              ]
            },
            itemId
          );
        }) })
      ] })
    ] }),
    totalPages > 1 && /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Group, { justify: "space-between", "data-testid": "collection-list-pagination", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Group, { children: /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Text, { size: "sm", c: "dimmed", children: [
        "Showing ",
        (page - 1) * limit + 1,
        " to ",
        Math.min(page * limit, totalCount),
        " of ",
        totalCount
      ] }) }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Group, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Text, { size: "sm", children: "Items per page:" }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
          import_core2.Select,
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
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
          import_core2.Pagination,
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  CollectionForm,
  CollectionList
});
