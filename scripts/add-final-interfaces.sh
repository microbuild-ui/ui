#!/bin/bash
# Add remaining exported interfaces that were missed

BASE_URL="https://6db63358-169b-4d26-a758-4a39f0088d91.buildpad-daas.xtremax.com"
TOKEN="_dVeDC5ilSpRWeyaVyNXUQPX4PKbTr6Q"
COLLECTION="interface_showcase"

echo "Adding workflow-button interface..."
curl -s -X POST "${BASE_URL}/api/fields/${COLLECTION}" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "field": "workflow_action",
    "type": "alias",
    "meta": {
      "interface": "workflow-button",
      "width": "full",
      "note": "Workflow state transition button",
      "special": ["alias", "no-data"],
      "options": {
        "collection": "interface_showcase"
      }
    }
  }' | python3 -c "import json,sys; d=json.load(sys.stdin); print('✅ workflow_action' if 'data' in d else '❌', d.get('error',''))" 2>/dev/null || echo "Error"

echo "Creating M2A junction collection..."
curl -s -X POST "${BASE_URL}/api/collections" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "collection": "interface_showcase_m2a",
    "meta": {
      "collection": "interface_showcase_m2a",
      "icon": "dynamic_feed",
      "note": "M2A junction for polymorphic relations",
      "hidden": true
    },
    "schema": {},
    "fields": [
      {
        "field": "id",
        "type": "integer",
        "meta": {"interface": "input", "readonly": true, "hidden": true},
        "schema": {"is_primary_key": true, "has_auto_increment": true}
      },
      {
        "field": "interface_showcase_id",
        "type": "uuid",
        "meta": {"interface": "input", "hidden": true}
      },
      {
        "field": "collection",
        "type": "string",
        "meta": {"interface": "input", "hidden": true},
        "schema": {"max_length": 255}
      },
      {
        "field": "item",
        "type": "string",
        "meta": {"interface": "input", "hidden": true},
        "schema": {"max_length": 255}
      }
    ]
  }' | python3 -c "import json,sys; d=json.load(sys.stdin); print('✅ M2A junction created' if 'data' in d else '⚠️', d.get('error',''))" 2>/dev/null || echo "Error"

echo "Adding list-m2a interface..."
curl -s -X POST "${BASE_URL}/api/fields/${COLLECTION}" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "field": "polymorphic_items",
    "type": "alias",
    "meta": {
      "interface": "list-m2a",
      "width": "full",
      "note": "Many-to-Any (polymorphic) relation",
      "special": ["m2a"],
      "options": {
        "enableCreate": true,
        "enableSelect": true,
        "allowedCollections": ["interface_showcase_items", "daas_files"]
      }
    }
  }' | python3 -c "import json,sys; d=json.load(sys.stdin); print('✅ polymorphic_items' if 'data' in d else '❌', d.get('error',''))" 2>/dev/null || echo "Error"

echo ""
echo "Done! Final interface count:"
curl -s "${BASE_URL}/api/fields/${COLLECTION}" \
  -H "Authorization: Bearer ${TOKEN}" | python3 -c "
import json, sys
data = json.load(sys.stdin)
fields = data.get('data', [])
interfaces = set()
for f in fields:
    iface = f.get('meta', {}).get('interface')
    if iface:
        interfaces.add(iface)
print(f'Total fields: {len(fields)}')
print(f'Unique interfaces: {len(interfaces)}')
print('Interfaces:', ', '.join(sorted(interfaces)))
"
