#!/bin/bash

# Add missing fields to interface_showcase
BASE_URL="https://6db63358-169b-4d26-a758-4a39f0088d91.buildpad-daas.xtremax.com"
TOKEN="_dVeDC5ilSpRWeyaVyNXUQPX4PKbTr6Q"
COLLECTION="interface_showcase"

add_field() {
  local field_json="$1"
  curl -s -X POST "${BASE_URL}/api/fields/${COLLECTION}" \
    -H "Authorization: Bearer ${TOKEN}" \
    -H "Content-Type: application/json" \
    -d "$field_json" | python3 -c "import json,sys; d=json.load(sys.stdin); print('✅' if 'data' in d else '❌', d.get('data',{}).get('field') or d.get('error',''))" 2>/dev/null || echo "Error"
}

echo "Adding missing interface fields..."

# Autocomplete API
add_field '{"field":"autocomplete_field","type":"string","meta":{"interface":"input-autocomplete-api","width":"full","note":"Autocomplete from API","options":{"url":"https://api.example.com/search","resultsPath":"data","textPath":"name","valuePath":"id","trigger":"debounce","rate":300}},"schema":{"max_length":255}}'

# Select Icon
add_field '{"field":"icon_field","type":"string","meta":{"interface":"select-icon","width":"half","note":"Icon picker"}}'

# Select Multiple Checkbox
add_field '{"field":"permissions","type":"json","meta":{"interface":"select-multiple-checkbox","width":"full","note":"Multiple checkbox selection","special":["cast-json"],"options":{"choices":[{"text":"Read","value":"read"},{"text":"Write","value":"write"},{"text":"Delete","value":"delete"},{"text":"Admin","value":"admin"}]}}}'

# Select Multiple Dropdown
add_field '{"field":"categories","type":"json","meta":{"interface":"select-multiple-dropdown","width":"full","note":"Multiple dropdown selection","special":["cast-json"],"options":{"choices":[{"text":"Technology","value":"tech"},{"text":"Science","value":"science"},{"text":"Art","value":"art"},{"text":"Sports","value":"sports"}],"placeholder":"Select categories..."}}}'

# Collection Item Dropdown
add_field '{"field":"related_item","type":"string","meta":{"interface":"collection-item-dropdown","width":"full","note":"Select item from another collection","options":{"collection":"daas_users","template":"{{first_name}} {{last_name}}","filter":{}}}}'

# Multiple Files
add_field '{"field":"documents","type":"json","meta":{"interface":"files","width":"full","note":"Multiple file uploads","special":["files","cast-json"]}}'

# Group Detail (for organizing fields)
add_field '{"field":"advanced_settings","type":"alias","meta":{"interface":"group-detail","width":"full","note":"Collapsible field group","special":["alias","no-data","group"],"options":{"headerIcon":"settings","headerColor":"#6644ff"}}}'

echo ""
echo "Now creating related collection for relational interfaces..."

# First create a related collection for testing relations
curl -s -X POST "${BASE_URL}/api/collections" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "collection": "interface_showcase_items",
    "meta": {
      "collection": "interface_showcase_items",
      "icon": "list",
      "note": "Related items for testing relational interfaces",
      "hidden": false
    },
    "schema": {},
    "fields": [
      {"field":"id","type":"uuid","meta":{"interface":"input","readonly":true,"hidden":true,"special":["uuid"]},"schema":{"is_primary_key":true,"default_value":"gen_random_uuid()"}},
      {"field":"name","type":"string","meta":{"interface":"input","width":"full"},"schema":{"max_length":255}},
      {"field":"description","type":"text","meta":{"interface":"input-multiline","width":"full"}}
    ]
  }' | python3 -c "import json,sys; d=json.load(sys.stdin); print('✅ Created collection' if 'data' in d else '❌', d.get('error',''))" 2>/dev/null

# Create junction table for M2M
curl -s -X POST "${BASE_URL}/api/collections" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "collection": "interface_showcase_items_junction",
    "meta": {
      "collection": "interface_showcase_items_junction",
      "icon": "import_export",
      "note": "Junction table for M2M relation",
      "hidden": true
    },
    "schema": {},
    "fields": [
      {"field":"id","type":"integer","meta":{"interface":"input","readonly":true,"hidden":true},"schema":{"is_primary_key":true,"has_auto_increment":true}},
      {"field":"interface_showcase_id","type":"uuid","meta":{"interface":"input","hidden":true}},
      {"field":"related_item_id","type":"uuid","meta":{"interface":"input","hidden":true}}
    ]
  }' | python3 -c "import json,sys; d=json.load(sys.stdin); print('✅ Created junction table' if 'data' in d else '❌', d.get('error',''))" 2>/dev/null

echo ""
echo "Creating relations..."

# Create O2M relation (interface_showcase -> interface_showcase_items)
curl -s -X POST "${BASE_URL}/api/relations" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "collection": "interface_showcase_items",
    "field": "parent_id",
    "related_collection": "interface_showcase",
    "meta": {"one_field": "child_items"}
  }' | python3 -c "import json,sys; d=json.load(sys.stdin); print('✅ Created O2M relation' if 'data' in d else '❌', d.get('error',''))" 2>/dev/null

# Add M2O field to showcase
add_field '{"field":"parent_showcase","type":"uuid","meta":{"interface":"select-dropdown-m2o","width":"full","note":"Many-to-One relation","options":{"template":"{{id}}"}}}'

# Create M2O relation
curl -s -X POST "${BASE_URL}/api/relations" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "collection": "interface_showcase",
    "field": "parent_showcase",
    "related_collection": "interface_showcase"
  }' | python3 -c "import json,sys; d=json.load(sys.stdin); print('✅ Created M2O relation' if 'data' in d else '❌', d.get('error',''))" 2>/dev/null

# Add O2M alias field
add_field '{"field":"child_items","type":"alias","meta":{"interface":"list-o2m","width":"full","note":"One-to-Many relation (children)","special":["o2m"],"options":{"template":"{{name}}","enableCreate":true,"enableSelect":true}}}'

# Add M2M junction relations
curl -s -X POST "${BASE_URL}/api/relations" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "collection": "interface_showcase_items_junction",
    "field": "interface_showcase_id",
    "related_collection": "interface_showcase",
    "meta": {"one_field": "related_items_m2m", "junction_field": "related_item_id"}
  }' | python3 -c "import json,sys; d=json.load(sys.stdin); print('✅ Created M2M relation 1' if 'data' in d else '❌', d.get('error',''))" 2>/dev/null

curl -s -X POST "${BASE_URL}/api/relations" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "collection": "interface_showcase_items_junction",
    "field": "related_item_id",
    "related_collection": "interface_showcase_items"
  }' | python3 -c "import json,sys; d=json.load(sys.stdin); print('✅ Created M2M relation 2' if 'data' in d else '❌', d.get('error',''))" 2>/dev/null

# Add M2M alias field
add_field '{"field":"related_items_m2m","type":"alias","meta":{"interface":"list-m2m","width":"full","note":"Many-to-Many relation","special":["m2m"],"options":{"template":"{{related_item_id.name}}","enableCreate":true,"enableSelect":true}}}'

echo ""
echo "Done! All interfaces added."
