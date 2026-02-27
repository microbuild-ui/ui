#!/bin/bash

# Add remaining fields to interface_showcase
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

echo "Adding remaining fields..."

# Select Dropdown
add_field '{"field":"status","type":"string","meta":{"interface":"select-dropdown","width":"half","note":"Dropdown select","options":{"choices":[{"text":"Draft","value":"draft"},{"text":"Published","value":"published"},{"text":"Archived","value":"archived"}],"allowNone":true}}}'

# Select Radio
add_field '{"field":"priority","type":"string","meta":{"interface":"select-radio","width":"half","note":"Radio selection","options":{"choices":[{"text":"Low","value":"low"},{"text":"Medium","value":"medium"},{"text":"High","value":"high"}]}}}'

# Color Picker
add_field '{"field":"color","type":"string","meta":{"interface":"select-color","width":"half","note":"Color picker"}}'

# Slider
add_field '{"field":"rating","type":"integer","meta":{"interface":"slider","width":"full","note":"Slider for values","options":{"min":0,"max":100,"step":5}},"schema":{"default_value":50}}'

# Tags
add_field '{"field":"tags","type":"json","meta":{"interface":"tags","width":"full","note":"Tag input","special":["cast-json"],"options":{"placeholder":"Add tags..."}}}'

# Number inputs
add_field '{"field":"price","type":"decimal","meta":{"interface":"input","width":"half","note":"Decimal input","options":{"step":0.01}},"schema":{"numeric_precision":10,"numeric_scale":2}}'

add_field '{"field":"quantity","type":"integer","meta":{"interface":"input","width":"half","note":"Integer input","options":{"min":0}}}'

# Presentation
add_field '{"field":"divider_section","type":"alias","meta":{"interface":"presentation-divider","width":"full","special":["alias","no-data"],"options":{"title":"Additional Info","icon":"info"}}}'

add_field '{"field":"notice_info","type":"alias","meta":{"interface":"presentation-notice","width":"full","special":["alias","no-data"],"options":{"text":"This is an informational notice.","color":"info"}}}'

# File fields
add_field '{"field":"attachment","type":"uuid","meta":{"interface":"file","width":"full","note":"Single file upload","special":["file"]}}'

add_field '{"field":"featured_image","type":"uuid","meta":{"interface":"file-image","width":"full","note":"Image upload","special":["file"]}}'

# JSON
add_field '{"field":"metadata","type":"json","meta":{"interface":"input-code","width":"full","note":"JSON editor","special":["cast-json"],"options":{"language":"json"}}}'

# URL and Email
add_field '{"field":"website","type":"string","meta":{"interface":"input","width":"half","note":"URL field","options":{"placeholder":"https://example.com"}},"schema":{"max_length":500}}'

add_field '{"field":"email","type":"string","meta":{"interface":"input","width":"half","note":"Email field","options":{"placeholder":"user@example.com"}},"schema":{"max_length":255}}'

# System fields
add_field '{"field":"date_created","type":"timestamp","meta":{"interface":"datetime","width":"half","readonly":true,"note":"Creation date","special":["date-created"]},"schema":{"default_value":"now()"}}'

add_field '{"field":"date_updated","type":"timestamp","meta":{"interface":"datetime","width":"half","readonly":true,"note":"Update date","special":["date-updated"]}}'

echo ""
echo "Done! Test the collection in Storybook:"
echo "Collection: interface_showcase"
