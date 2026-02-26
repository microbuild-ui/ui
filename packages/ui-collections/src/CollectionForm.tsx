/**
 * CollectionForm Component
 *
 * A CRUD wrapper around VForm that handles data fetching and persistence.
 * Uses VForm for the actual form rendering with all @microbuild/ui-interfaces components.
 *
 * Architecture:
 * - CollectionForm = Data layer (fetch fields, load/save items, CRUD operations)
 * - VForm = Presentation layer (renders fields with proper interfaces from @microbuild/ui-interfaces)
 *
 * @package @microbuild/ui-collections
 */

"use client";

import {
  Alert,
  Button,
  Group,
  LoadingOverlay,
  Paper,
  Stack,
  Text,
} from "@mantine/core";
import { FieldsService, apiRequest } from "@microbuild/services";
import type { Field } from "@microbuild/types";
import { VForm } from "@microbuild/ui-form";
import { IconAlertCircle, IconCheck, IconX } from "@tabler/icons-react";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

export interface CollectionFormProps {
  /** Collection name */
  collection: string;
  /** Item ID for edit mode */
  id?: string | number;
  /** Mode: create or edit */
  mode?: "create" | "edit";
  /** Default values for new items */
  defaultValues?: Record<string, unknown>;
  /** Callback on successful save */
  onSuccess?: (data?: Record<string, unknown>) => void;
  /** Callback on cancel */
  onCancel?: () => void;
  /** Fields to exclude from form */
  excludeFields?: string[];
  /** Fields to show (if set, only these fields are shown) */
  includeFields?: string[];
}

// System fields that should be auto-generated
const SYSTEM_FIELDS = [
  "id",
  "user_created",
  "user_updated",
  "date_created",
  "date_updated",
  "sort",
];

// Fields that are read-only by nature
const READ_ONLY_FIELDS = [
  "id",
  "user_created",
  "user_updated",
  "date_created",
  "date_updated",
];

// Stable empty references to prevent re-renders
const EMPTY_OBJECT: Record<string, unknown> = {};
const EMPTY_ARRAY: string[] = [];

/**
 * CollectionForm - Dynamic form for creating/editing collection items
 */
export const CollectionForm: React.FC<CollectionFormProps> = ({
  collection,
  id,
  mode = "create",
  defaultValues,
  onSuccess,
  onCancel,
  excludeFields,
  includeFields,
}) => {
  // Use stable references for optional props
  const stableDefaultValues = useMemo(
    () => defaultValues || EMPTY_OBJECT,
    [defaultValues],
  );
  const stableExcludeFields = useMemo(
    () => excludeFields || EMPTY_ARRAY,
    [excludeFields],
  );
  const stableIncludeFields = useMemo(() => includeFields, [includeFields]);

  const [fields, setFields] = useState<Field[]>([]);
  const [formData, setFormData] =
    useState<Record<string, unknown>>(stableDefaultValues);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Track if data has been loaded to prevent re-fetching
  const dataLoadedRef = useRef(false);
  const lastLoadKey = useRef<string>("");

  // Load fields and item data
  useEffect(() => {
    // Create a unique key for this load request
    const loadKey = `${collection}-${id}-${mode}`;

    // Skip if already loaded for the same key
    if (dataLoadedRef.current && lastLoadKey.current === loadKey) {
      return;
    }

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load fields for the collection
        const fieldsService = new FieldsService();
        const allFields = await fieldsService.readAll(collection);

        // Filter out system fields and alias fields (like O2M, M2M)
        const editableFields = allFields.filter((f) => {
          // Exclude system fields unless they're in defaultValues
          if (
            SYSTEM_FIELDS.includes(f.field) &&
            !stableDefaultValues[f.field]
          ) {
            return false;
          }
          // Exclude alias fields (O2M, M2M, M2A)
          if (f.type === "alias") {
            return false;
          }
          // Apply exclude list
          if (stableExcludeFields.includes(f.field)) {
            return false;
          }
          // Apply include list if provided
          if (stableIncludeFields && !stableIncludeFields.includes(f.field)) {
            return false;
          }
          return true;
        });

        setFields(editableFields);

        // If editing, load the existing item
        if (mode === "edit" && id) {
          const response = await apiRequest<{ data: Record<string, unknown> }>(
            `/api/items/${collection}/${id}`,
          );
          setFormData({ ...stableDefaultValues, ...response.data });
        } else {
          setFormData(stableDefaultValues);
        }

        // Mark as loaded
        dataLoadedRef.current = true;
        lastLoadKey.current = loadKey;
      } catch (err) {
        console.error("Error loading form data:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load form data",
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
    stableIncludeFields,
  ]);

  // Update form field - used by VForm's onUpdate callback
  const handleFormUpdate = useCallback((values: Record<string, unknown>) => {
    setFormData((prev) => ({
      ...prev,
      ...values,
    }));
    setSuccess(false); // Clear success message when user edits
  }, []);

  // Compute primary key for VForm context
  const primaryKey = mode === "create" ? "+" : id;

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      // Remove read-only fields from data
      const dataToSave = { ...formData };
      READ_ONLY_FIELDS.forEach((f) => {
        if (!stableDefaultValues[f]) {
          delete dataToSave[f];
        }
      });

      if (mode === "create") {
        const response = await apiRequest<{ data: Record<string, unknown> }>(
          `/api/items/${collection}`,
          { method: "POST", body: JSON.stringify(dataToSave) },
        );
        const newId = response.data?.id;
        setSuccess(true);
        onSuccess?.({ ...dataToSave, id: newId });
      } else if (id) {
        await apiRequest(`/api/items/${collection}/${id}`, {
          method: "PATCH",
          body: JSON.stringify(dataToSave),
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
    return (
      <Paper p="md" pos="relative" mih={200}>
        <LoadingOverlay visible />
      </Paper>
    );
  }

  return (
    <Paper p="md" data-testid="collection-form">
      {error && (
        <Alert
          icon={<IconAlertCircle size={16} />}
          color="red"
          mb="md"
          data-testid="form-error"
        >
          {error}
        </Alert>
      )}

      {success && (
        <Alert
          icon={<IconCheck size={16} />}
          color="green"
          mb="md"
          data-testid="form-success"
        >
          {mode === "create"
            ? "Item created successfully!"
            : "Item updated successfully!"}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          {fields.length === 0 ? (
            <Text c="dimmed" ta="center" py="xl">
              No editable fields found for {collection}
            </Text>
          ) : (
            <VForm
              collection={collection}
              fields={fields}
              modelValue={formData}
              initialValues={defaultValues}
              onUpdate={handleFormUpdate}
              primaryKey={primaryKey}
              disabled={saving}
              loading={saving}
              showNoVisibleFields={false}
            />
          )}

          <Group justify="flex-end" mt="md">
            {onCancel && (
              <Button
                variant="subtle"
                onClick={onCancel}
                leftSection={<IconX size={16} />}
                disabled={saving}
                data-testid="form-cancel-btn"
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              loading={saving}
              disabled={fields.length === 0}
              leftSection={<IconCheck size={16} />}
              data-testid="form-submit-btn"
            >
              {mode === "create" ? "Create" : "Save"}
            </Button>
          </Group>
        </Stack>
      </form>
    </Paper>
  );
};

export default CollectionForm;
