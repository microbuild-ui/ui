/**
 * CollectionForm Component
 * 
 * A dynamic form that fetches field definitions and renders appropriate inputs.
 * Used by ListO2M and ListM2M for creating/editing related items.
 * 
 * @package @microbuild/ui-collections
 */

"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
    Paper,
    Stack,
    TextInput,
    Textarea,
    NumberInput,
    Switch,
    Select,
    Button,
    Group,
    Text,
    Alert,
    LoadingOverlay,
} from '@mantine/core';
import { DateTimePicker, DatePickerInput } from '@mantine/dates';
import dayjs from 'dayjs';
import { IconAlertCircle, IconCheck, IconX } from '@tabler/icons-react';
import { FieldsService, ItemsService } from '@microbuild/services';
import type { Field } from '@microbuild/types';

export interface CollectionFormProps {
    /** Collection name */
    collection: string;
    /** Item ID for edit mode */
    id?: string | number;
    /** Mode: create or edit */
    mode?: 'create' | 'edit';
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
    'id',
    'user_created',
    'user_updated', 
    'date_created',
    'date_updated',
    'sort',
];

// Fields that are read-only by nature
const READ_ONLY_FIELDS = [
    'id',
    'user_created',
    'user_updated',
    'date_created',
    'date_updated',
];

/**
 * CollectionForm - Dynamic form for creating/editing collection items
 */
export const CollectionForm: React.FC<CollectionFormProps> = ({
    collection,
    id,
    mode = 'create',
    defaultValues = {},
    onSuccess,
    onCancel,
    excludeFields = [],
    includeFields,
}) => {
    const [fields, setFields] = useState<Field[]>([]);
    const [formData, setFormData] = useState<Record<string, unknown>>(defaultValues);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // Load fields and item data
    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Load fields for the collection
                const fieldsService = new FieldsService();
                const allFields = await fieldsService.readAll(collection);
                
                // Filter out system fields and alias fields (like O2M, M2M)
                const editableFields = allFields.filter(f => {
                    // Exclude system fields unless they're in defaultValues
                    if (SYSTEM_FIELDS.includes(f.field) && !defaultValues[f.field]) {
                        return false;
                    }
                    // Exclude alias fields (O2M, M2M, M2A)
                    if (f.type === 'alias') {
                        return false;
                    }
                    // Apply exclude list
                    if (excludeFields.includes(f.field)) {
                        return false;
                    }
                    // Apply include list if provided
                    if (includeFields && !includeFields.includes(f.field)) {
                        return false;
                    }
                    return true;
                });

                setFields(editableFields);

                // If editing, load the existing item
                if (mode === 'edit' && id) {
                    const itemsService = new ItemsService(collection);
                    const item = await itemsService.readOne(id);
                    setFormData({ ...defaultValues, ...item });
                } else {
                    setFormData(defaultValues);
                }
            } catch (err) {
                console.error('Error loading form data:', err);
                setError(err instanceof Error ? err.message : 'Failed to load form data');
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [collection, id, mode, defaultValues, excludeFields, includeFields]);

    // Update form field
    const handleFieldChange = useCallback((fieldName: string, value: unknown) => {
        setFormData(prev => ({
            ...prev,
            [fieldName]: value,
        }));
    }, []);

    // Submit form
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        setSuccess(false);

        try {
            const itemsService = new ItemsService(collection);

            // Remove read-only fields from data
            const dataToSave = { ...formData };
            READ_ONLY_FIELDS.forEach(f => {
                if (!defaultValues[f]) {
                    delete dataToSave[f];
                }
            });

            if (mode === 'create') {
                const newId = await itemsService.createOne(dataToSave);
                setSuccess(true);
                onSuccess?.({ ...dataToSave, id: newId });
            } else if (id) {
                await itemsService.updateOne(id, dataToSave);
                setSuccess(true);
                onSuccess?.({ ...dataToSave, id });
            }
        } catch (err) {
            console.error('Error saving item:', err);
            setError(err instanceof Error ? err.message : 'Failed to save item');
        } finally {
            setSaving(false);
        }
    };

    // Render field input based on type
    const renderField = (field: Field) => {
        const value = formData[field.field];
        const isReadOnly = READ_ONLY_FIELDS.includes(field.field) || field.meta?.readonly;
        const isRequired = field.meta?.required || false;
        const label = field.meta?.note || field.field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        const interfaceType = field.meta?.interface || '';

        // Determine the input type based on field type and interface
        const fieldType = field.type?.toLowerCase() || 'string';

        // Boolean fields
        if (fieldType === 'boolean' || interfaceType === 'boolean' || interfaceType === 'toggle') {
            return (
                <Switch
                    key={field.field}
                    label={label}
                    checked={Boolean(value)}
                    onChange={(e) => handleFieldChange(field.field, e.currentTarget.checked)}
                    disabled={isReadOnly}
                    data-testid={`form-field-${field.field}`}
                />
            );
        }

        // Number fields
        if (fieldType === 'integer' || fieldType === 'biginteger' || fieldType === 'float' || fieldType === 'decimal') {
            return (
                <NumberInput
                    key={field.field}
                    label={label}
                    value={value as number | undefined}
                    onChange={(val) => handleFieldChange(field.field, val)}
                    required={isRequired}
                    disabled={isReadOnly}
                    data-testid={`form-field-${field.field}`}
                />
            );
        }

        // Date/DateTime fields - Mantine 8 uses string values (YYYY-MM-DD HH:mm:ss)
        if (fieldType === 'timestamp' || fieldType === 'datetime') {
            // Convert ISO string to Mantine 8 format
            const dateValue = value ? dayjs(value as string).format('YYYY-MM-DD HH:mm:ss') : null;
            return (
                <DateTimePicker
                    key={field.field}
                    label={label}
                    value={dateValue}
                    onChange={(dateStr) => handleFieldChange(field.field, dateStr ? dayjs(dateStr).toISOString() : null)}
                    required={isRequired}
                    disabled={isReadOnly}
                    data-testid={`form-field-${field.field}`}
                />
            );
        }

        if (fieldType === 'date') {
            // Convert ISO string to Mantine 8 format (YYYY-MM-DD)
            const dateValue = value ? dayjs(value as string).format('YYYY-MM-DD') : null;
            return (
                <DatePickerInput
                    key={field.field}
                    label={label}
                    value={dateValue}
                    onChange={(dateStr) => handleFieldChange(field.field, dateStr)}
                    required={isRequired}
                    disabled={isReadOnly}
                    data-testid={`form-field-${field.field}`}
                />
            );
        }

        // Textarea for text/json
        if (fieldType === 'text' || fieldType === 'json' || interfaceType === 'input-multiline') {
            return (
                <Textarea
                    key={field.field}
                    label={label}
                    value={String(value || '')}
                    onChange={(e) => handleFieldChange(field.field, e.currentTarget.value)}
                    required={isRequired}
                    disabled={isReadOnly}
                    minRows={3}
                    data-testid={`form-field-${field.field}`}
                />
            );
        }

        // Select dropdown for fields with options
        if (interfaceType === 'select-dropdown' && field.meta?.options?.choices) {
            const choices = field.meta.options.choices as Array<{ text: string; value: string }>;
            return (
                <Select
                    key={field.field}
                    label={label}
                    value={value as string | undefined}
                    onChange={(val) => handleFieldChange(field.field, val)}
                    data={choices.map(c => ({ label: c.text, value: c.value }))}
                    required={isRequired}
                    disabled={isReadOnly}
                    clearable
                    data-testid={`form-field-${field.field}`}
                />
            );
        }

        // Default: TextInput
        return (
            <TextInput
                key={field.field}
                label={label}
                value={String(value || '')}
                onChange={(e) => handleFieldChange(field.field, e.currentTarget.value)}
                required={isRequired}
                disabled={isReadOnly}
                data-testid={`form-field-${field.field}`}
            />
        );
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
                <Alert icon={<IconAlertCircle size={16} />} color="red" mb="md" data-testid="form-error">
                    {error}
                </Alert>
            )}

            {success && (
                <Alert icon={<IconCheck size={16} />} color="green" mb="md" data-testid="form-success">
                    {mode === 'create' ? 'Item created successfully!' : 'Item updated successfully!'}
                </Alert>
            )}

            <form onSubmit={handleSubmit}>
                <Stack gap="md">
                    {fields.length === 0 ? (
                        <Text c="dimmed" ta="center" py="xl">
                            No editable fields found for {collection}
                        </Text>
                    ) : (
                        fields.map(renderField)
                    )}

                    <Group justify="flex-end" mt="md">
                        {onCancel && (
                            <Button
                                variant="subtle"
                                onClick={onCancel}
                                leftSection={<IconX size={16} />}
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
                            {mode === 'create' ? 'Create' : 'Save'}
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Paper>
    );
};

export default CollectionForm;
