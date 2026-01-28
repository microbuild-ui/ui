#!/bin/bash

# Create interface_showcase fields
# This script adds all available interface types to the collection

BASE_URL="https://6db63358-169b-4d26-a758-4a39f0088d91.microbuild-daas.xtremax.com"
TOKEN="_dVeDC5ilSpRWeyaVyNXUQPX4PKbTr6Q"
COLLECTION="interface_showcase"

add_field() {
  local field_json="$1"
  echo "Adding field..."
  curl -s -X POST "${BASE_URL}/api/fields/${COLLECTION}" \
    -H "Authorization: Bearer ${TOKEN}" \
    -H "Content-Type: application/json" \
    -d "$field_json"
  echo ""
}

# Text Input
add_field '{
  "field": "text_input",
  "type": "string",
  "meta": {
    "interface": "input",
    "width": "half",
    "note": "Standard text input field",
    "options": { "placeholder": "Enter text..." }
  },
  "schema": { "max_length": 255 }
}'

# Masked Text Input
add_field '{
  "field": "text_input_masked",
  "type": "string",
  "meta": {
    "interface": "input",
    "width": "half",
    "note": "Masked text input (like password)",
    "options": { "placeholder": "Enter password...", "masked": true }
  },
  "schema": { "max_length": 255 }
}'

# Textarea / Multiline
add_field '{
  "field": "text_multiline",
  "type": "text",
  "meta": {
    "interface": "input-multiline",
    "width": "full",
    "note": "Multi-line textarea",
    "options": { "placeholder": "Enter description..." }
  }
}'

# Code Editor
add_field '{
  "field": "code_editor",
  "type": "text",
  "meta": {
    "interface": "input-code",
    "width": "full",
    "note": "Code editor with syntax highlighting",
    "options": { "language": "json", "lineNumber": true }
  }
}'

# Boolean Toggle
add_field '{
  "field": "is_active",
  "type": "boolean",
  "meta": {
    "interface": "boolean",
    "width": "half",
    "note": "Boolean toggle switch",
    "options": { "label": "Is Active" }
  },
  "schema": { "default_value": false }
}'

# Toggle (alternative)
add_field '{
  "field": "is_featured",
  "type": "boolean",
  "meta": {
    "interface": "toggle",
    "width": "half",
    "note": "Toggle switch style",
    "options": { "label": "Featured Item" }
  },
  "schema": { "default_value": false }
}'

# DateTime
add_field '{
  "field": "publish_date",
  "type": "timestamp",
  "meta": {
    "interface": "datetime",
    "width": "half",
    "note": "Date and time picker",
    "options": { "includeSeconds": false }
  }
}'

# Date Only
add_field '{
  "field": "birth_date",
  "type": "date",
  "meta": {
    "interface": "datetime",
    "width": "half",
    "note": "Date picker only",
    "options": { "type": "date" }
  }
}'

# Select Dropdown
add_field '{
  "field": "status",
  "type": "string",
  "meta": {
    "interface": "select-dropdown",
    "width": "half",
    "note": "Dropdown select with choices",
    "options": {
      "choices": [
        { "text": "Draft", "value": "draft" },
        { "text": "Published", "value": "published" },
        { "text": "Archived", "value": "archived" }
      ],
      "allowNone": true,
      "placeholder": "Select status..."
    }
  }
}'

# Select Radio
add_field '{
  "field": "priority",
  "type": "string",
  "meta": {
    "interface": "select-radio",
    "width": "half",
    "note": "Radio button selection",
    "options": {
      "choices": [
        { "text": "Low", "value": "low" },
        { "text": "Medium", "value": "medium" },
        { "text": "High", "value": "high" }
      ]
    }
  }
}'

# Select Icon
add_field '{
  "field": "icon",
  "type": "string",
  "meta": {
    "interface": "select-icon",
    "width": "half",
    "note": "Icon picker"
  }
}'

# Color Picker
add_field '{
  "field": "color",
  "type": "string",
  "meta": {
    "interface": "select-color",
    "width": "half",
    "note": "Color picker",
    "options": { "presets": ["#FF0000", "#00FF00", "#0000FF", "#FFFF00"] }
  }
}'

# Slider
add_field '{
  "field": "rating",
  "type": "integer",
  "meta": {
    "interface": "slider",
    "width": "full",
    "note": "Slider for numeric values",
    "options": { "min": 0, "max": 100, "step": 5 }
  },
  "schema": { "default_value": 50 }
}'

# Tags
add_field '{
  "field": "tags",
  "type": "json",
  "meta": {
    "interface": "tags",
    "width": "full",
    "note": "Tag input for multiple values",
    "special": ["cast-json"],
    "options": { "placeholder": "Add tags...", "presets": ["featured", "new", "sale"] }
  }
}'

# Number Input
add_field '{
  "field": "price",
  "type": "decimal",
  "meta": {
    "interface": "input",
    "width": "half",
    "note": "Decimal number input",
    "options": { "placeholder": "0.00", "step": 0.01 }
  },
  "schema": { "numeric_precision": 10, "numeric_scale": 2 }
}'

# Integer Input
add_field '{
  "field": "quantity",
  "type": "integer",
  "meta": {
    "interface": "input",
    "width": "half",
    "note": "Integer number input",
    "options": { "placeholder": "0", "min": 0 }
  }
}'

# Presentation Divider
add_field '{
  "field": "divider_basic_info",
  "type": "alias",
  "meta": {
    "interface": "presentation-divider",
    "width": "full",
    "special": ["alias", "no-data"],
    "options": { "title": "Additional Information", "icon": "info" }
  }
}'

# Presentation Notice
add_field '{
  "field": "notice_warning",
  "type": "alias",
  "meta": {
    "interface": "presentation-notice",
    "width": "full",
    "special": ["alias", "no-data"],
    "options": { 
      "text": "This is a warning notice. Please review the information carefully.",
      "color": "warning",
      "icon": "warning"
    }
  }
}'

# File Upload
add_field '{
  "field": "attachment",
  "type": "uuid",
  "meta": {
    "interface": "file",
    "width": "full",
    "note": "Single file upload",
    "special": ["file"]
  }
}'

# Image Upload
add_field '{
  "field": "featured_image",
  "type": "uuid",
  "meta": {
    "interface": "file-image",
    "width": "full",
    "note": "Image file upload with preview",
    "special": ["file"]
  }
}'

# Multiple Files
add_field '{
  "field": "gallery",
  "type": "json",
  "meta": {
    "interface": "files",
    "width": "full",
    "note": "Multiple file uploads",
    "special": ["files", "cast-json"]
  }
}'

# JSON Editor
add_field '{
  "field": "metadata",
  "type": "json",
  "meta": {
    "interface": "input-code",
    "width": "full",
    "note": "JSON data editor",
    "special": ["cast-json"],
    "options": { "language": "json" }
  }
}'

# URL Input
add_field '{
  "field": "website",
  "type": "string",
  "meta": {
    "interface": "input",
    "width": "half",
    "note": "URL input field",
    "options": { "placeholder": "https://example.com", "iconLeft": "link" }
  },
  "schema": { "max_length": 500 }
}'

# Email Input
add_field '{
  "field": "email",
  "type": "string",
  "meta": {
    "interface": "input",
    "width": "half",
    "note": "Email input field",
    "options": { "placeholder": "user@example.com", "iconLeft": "mail" },
    "validation": { "_regex": "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$" },
    "validation_message": "Please enter a valid email address"
  },
  "schema": { "max_length": 255 }
}'

# System Fields (readonly)
add_field '{
  "field": "date_created",
  "type": "timestamp",
  "meta": {
    "interface": "datetime",
    "width": "half",
    "readonly": true,
    "hidden": false,
    "note": "Auto-generated creation timestamp",
    "special": ["date-created"]
  },
  "schema": { "default_value": "now()" }
}'

add_field '{
  "field": "date_updated",
  "type": "timestamp",
  "meta": {
    "interface": "datetime",
    "width": "half",
    "readonly": true,
    "hidden": false,
    "note": "Auto-updated modification timestamp",
    "special": ["date-updated"]
  }
}'

echo ""
echo "Done! Collection interface_showcase created with all interface types."
echo "Test it in Storybook at: http://localhost:6006/?path=/story/forms-vform-daas-playground--playground"
echo "Use collection name: interface_showcase"
