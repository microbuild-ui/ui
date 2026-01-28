# @microbuild/ui-interfaces

Directus-compatible field interface components built with Mantine v8. A complete set of input, selection, file, and relational components for building dynamic forms.

## Installation

```bash
pnpm add @microbuild/ui-interfaces
```

## Peer Dependencies

```bash
pnpm add @mantine/core @mantine/hooks @mantine/dates @tabler/icons-react react react-dom
```

Optional peer dependencies for advanced components:
```bash
# Rich text editors
pnpm add @mantine/tiptap @tiptap/react @tiptap/starter-kit

# Map component
pnpm add maplibre-gl @mapbox/mapbox-gl-draw
```

## Quick Start

```tsx
import { Input, SelectDropdown, DateTime, Toggle, Color } from '@microbuild/ui-interfaces';

function ProductForm() {
  const [values, setValues] = useState({});
  const update = (field: string) => (value: unknown) => 
    setValues(prev => ({ ...prev, [field]: value }));

  return (
    <form>
      <Input
        field="title"
        value={values.title}
        onChange={update('title')}
        placeholder="Product title"
      />
      
      <SelectDropdown
        field="status"
        value={values.status}
        onChange={update('status')}
        choices={[
          { text: 'Draft', value: 'draft' },
          { text: 'Published', value: 'published' },
        ]}
      />
      
      <DateTime
        field="publish_date"
        value={values.publish_date}
        onChange={update('publish_date')}
        type="datetime"
      />
      
      <Toggle
        field="featured"
        value={values.featured}
        onChange={update('featured')}
        label="Featured product"
      />

      <Color
        field="brand_color"
        value={values.brand_color}
        onChange={update('brand_color')}
        opacity
      />
    </form>
  );
}
```

## Components

### Boolean / Toggle

```tsx
import { Boolean, Toggle } from '@microbuild/ui-interfaces';

// Simple switch
<Boolean field="active" value={active} onChange={setActive} />

// Enhanced toggle with icons and labels
<Toggle
  field="featured"
  value={featured}
  onChange={setFeatured}
  label="Featured"
  iconOn={IconStar}
  iconOff={IconStarOff}
  colorOn="yellow"
/>
```

### Text Inputs

```tsx
import { Input, Textarea, InputCode } from '@microbuild/ui-interfaces';

// Single line
<Input field="title" value={title} onChange={setTitle} placeholder="Title" />

// Multi-line
<Textarea field="description" value={desc} onChange={setDesc} rows={5} />

// Code editor with syntax highlighting
<InputCode
  field="config"
  value={config}
  onChange={setConfig}
  language="json"
  lineNumbers
/>
```

### DateTime

```tsx
import { DateTime } from '@microbuild/ui-interfaces';

// Date only
<DateTime field="birth_date" type="date" value={date} onChange={setDate} />

// Date + time
<DateTime field="event_start" type="datetime" value={datetime} onChange={setDatetime} />

// Time only
<DateTime field="opening_time" type="time" value={time} onChange={setTime} />

// Timestamp
<DateTime field="created_at" type="timestamp" value={ts} onChange={setTs} />
```

### Selection Components

```tsx
import { 
  SelectDropdown, 
  SelectRadio, 
  SelectMultipleCheckbox,
  SelectMultipleDropdown,
  SelectIcon,
  Tags,
  AutocompleteAPI,
  CollectionItemDropdown 
} from '@microbuild/ui-interfaces';

// Dropdown
<SelectDropdown
  field="category"
  value={category}
  onChange={setCategory}
  choices={[
    { text: 'Electronics', value: 'electronics' },
    { text: 'Clothing', value: 'clothing' },
  ]}
  allowNone
  placeholder="Select category"
/>

// Radio buttons
<SelectRadio
  field="size"
  value={size}
  onChange={setSize}
  choices={[
    { text: 'Small', value: 'S' },
    { text: 'Medium', value: 'M' },
    { text: 'Large', value: 'L' },
  ]}
/>

// Multiple checkboxes
<SelectMultipleCheckbox
  field="features"
  value={features}
  onChange={setFeatures}
  choices={[
    { text: 'Waterproof', value: 'waterproof' },
    { text: 'Wireless', value: 'wireless' },
  ]}
  allowOther
/>

// Icon picker
<SelectIcon field="icon" value={icon} onChange={setIcon} />

// Tags
<Tags
  field="keywords"
  value={keywords}
  onChange={setKeywords}
  presets={['Featured', 'Sale', 'New']}
  allowCustom
/>

// API-backed autocomplete
<AutocompleteAPI
  field="city"
  value={city}
  onChange={setCity}
  url="/api/cities"
  resultsPath="data"
  textPath="name"
  valuePath="id"
/>

// Collection item selector
<CollectionItemDropdown
  field="author"
  value={authorId}
  onChange={setAuthorId}
  collection="users"
  template="{{first_name}} {{last_name}}"
/>
```

### Layout / Presentation

```tsx
import { Divider, Notice, GroupDetail, Slider } from '@microbuild/ui-interfaces';

// Section divider
<Divider title="Product Details" icon={IconInfoCircle} />

// Notice/alert
<Notice type="warning" title="Attention">
  This product is out of stock.
</Notice>

// Collapsible group
<GroupDetail title="Advanced Settings" startOpen={false}>
  {/* fields */}
</GroupDetail>

// Slider
<Slider
  field="quantity"
  value={quantity}
  onChange={setQuantity}
  min={0}
  max={100}
  step={1}
/>
```

### Color

```tsx
import { Color } from '@microbuild/ui-interfaces';

// Basic color picker
<Color field="color" value={color} onChange={setColor} />

// With opacity
<Color field="background" value={bg} onChange={setBg} opacity />

// With presets
<Color
  field="brand"
  value={brand}
  onChange={setBrand}
  presets={['#FF0000', '#00FF00', '#0000FF']}
/>
```

### File Components

```tsx
import { FileInterface, Upload } from '@microbuild/ui-interfaces';

// Single file (requires onUpload handler)
<FileInterface
  field="document"
  value={fileId}
  onChange={setFileId}
  onUpload={handleUpload}
/>

// Drag-and-drop upload zone
<Upload
  field="attachments"
  onUpload={handleUpload}
  accept={['image/*', 'application/pdf']}
  multiple
/>
```

### Relational Components

```tsx
import { ListM2M, ListM2O, ListO2M, ListM2A } from '@microbuild/ui-interfaces';

// Many-to-Many (with hooks integration)
<ListM2M
  field="tags"
  collection="products"
  primaryKey={productId}
  relatedCollection="tags"
  junctionCollection="product_tags"
  template="{{name}}"
/>

// Many-to-One
<ListM2O
  field="category"
  collection="products"
  primaryKey={productId}
  relatedCollection="categories"
  template="{{name}}"
/>

// One-to-Many
<ListO2M
  field="variants"
  collection="products"
  primaryKey={productId}
  relatedCollection="product_variants"
/>

// Many-to-Any (polymorphic)
<ListM2A
  field="blocks"
  collection="pages"
  primaryKey={pageId}
  allowedCollections={['text_blocks', 'image_blocks', 'video_blocks']}
/>
```

### Rich Text Editors

```tsx
import { InputBlockEditor, RichTextHTML, RichTextMarkdown } from '@microbuild/ui-interfaces';

// Block-based editor (EditorJS style)
<InputBlockEditor
  field="content"
  value={blocks}
  onChange={setBlocks}
  tools={['header', 'paragraph', 'nestedlist', 'code', 'quote']}
  placeholder="Start writing..."
/>

// WYSIWYG HTML editor
<RichTextHTML
  field="body"
  value={html}
  onChange={setHtml}
  toolbar={['bold', 'italic', 'h1', 'h2', 'bullist', 'link']}
  softLength={2000}
/>

// Markdown editor with preview
<RichTextMarkdown
  field="description"
  value={markdown}
  onChange={setMarkdown}
  editorFont="monospace"
/>
```

### Map / Geometry

```tsx
import { Map, MapWithRealMap } from '@microbuild/ui-interfaces';

// Geometry input with map
<Map
  field="location"
  value={geojson}
  onChange={setGeojson}
  geometryType="Point"
  geometryFormat="geojson"
/>

// Full MapLibre implementation
<MapWithRealMap
  field="area"
  value={polygon}
  onChange={setPolygon}
  geometryType="Polygon"
  defaultView={{ center: [103.8, 1.35], zoom: 11 }}
/>
```

### Workflow Button

```tsx
import { WorkflowButton } from '@microbuild/ui-interfaces';

<WorkflowButton
  itemId={articleId}
  collection="articles"
  canCompare={true}
  onChange={(newState) => console.log('State:', newState)}
  onTransition={() => refetch()}
/>
```

## Component Reference

### Input Components

| Component | Description | Key Props |
|-----------|-------------|-----------|
| `Input` | Single-line text | `type`, `placeholder`, `maxLength` |
| `Textarea` | Multi-line text | `rows`, `maxLength` |
| `InputCode` | Code editor | `language`, `lineNumbers` |
| `Tags` | Tag input | `presets`, `allowCustom` |

### Selection Components

| Component | Description | Key Props |
|-----------|-------------|-----------|
| `SelectDropdown` | Dropdown select | `choices`, `allowNone`, `allowOther` |
| `SelectRadio` | Radio buttons | `choices` |
| `SelectMultipleCheckbox` | Checkbox group | `choices`, `allowOther` |
| `SelectMultipleDropdown` | Multi-select dropdown | `choices` |
| `SelectIcon` | Icon picker | `icons` (optional) |
| `AutocompleteAPI` | API autocomplete | `url`, `resultsPath`, `textPath`, `valuePath` |
| `CollectionItemDropdown` | Collection item | `collection`, `template` |

### Date/Time Components

| Component | Description | Key Props |
|-----------|-------------|-----------|
| `DateTime` | Date/time picker | `type` ('date', 'time', 'datetime', 'timestamp') |

### Boolean Components

| Component | Description | Key Props |
|-----------|-------------|-----------|
| `Boolean` | Simple switch | - |
| `Toggle` | Enhanced toggle | `iconOn`, `iconOff`, `colorOn`, `colorOff` |

### Layout Components

| Component | Description | Key Props |
|-----------|-------------|-----------|
| `Divider` | Section divider | `title`, `icon`, `color` |
| `Notice` | Alert/notice | `type`, `title` |
| `GroupDetail` | Collapsible group | `title`, `startOpen` |
| `Slider` | Range slider | `min`, `max`, `step` |

### Media Components

| Component | Description | Key Props |
|-----------|-------------|-----------|
| `Color` | Color picker | `opacity`, `presets` |
| `FileInterface` | File upload | `onUpload` |
| `Upload` | Dropzone | `accept`, `multiple` |

### Relational Components

| Component | Description | Key Props |
|-----------|-------------|-----------|
| `ListM2M` | Many-to-Many | `junctionCollection`, `relatedCollection` |
| `ListM2O` | Many-to-One | `relatedCollection` |
| `ListO2M` | One-to-Many | `relatedCollection` |
| `ListM2A` | Many-to-Any | `allowedCollections` |

### Workflow Components

| Component | Description | Key Props |
|-----------|-------------|-----------|
| `WorkflowButton` | Workflow state | `itemId`, `collection`, `canCompare` |

### Rich Text Components

| Component | Description | Key Props |
|-----------|-------------|-----------|
| `InputBlockEditor` | Block-based editor (EditorJS) | `tools`, `placeholder`, `font` |
| `RichTextHTML` | WYSIWYG HTML editor (TipTap) | `toolbar`, `softLength`, `minimal` |
| `RichTextMarkdown` | Markdown editor with preview | `toolbar`, `softLength`, `editorFont` |

### Map Components

| Component | Description | Key Props |
|-----------|-------------|-----------|
| `Map` | Geometry input with map | `geometryType`, `geometryFormat`, `basemap` |
| `MapWithRealMap` | Full MapLibre implementation | `defaultView`, `basemap` |

## Common Props

All field components share these common props:

| Prop | Type | Description |
|------|------|-------------|
| `field` | `string` | Field name (used for form binding) |
| `value` | `T` | Current value |
| `onChange` | `(value: T) => void` | Change handler |
| `label` | `string` | Field label |
| `description` | `string` | Help text below field |
| `disabled` | `boolean` | Disable input |
| `required` | `boolean` | Mark as required |
| `error` | `string` | Error message |

## Related Packages

- [@microbuild/types](../types) - TypeScript types
- [@microbuild/hooks](../hooks) - Relation hooks used by List* components
- [@microbuild/ui-collections](../ui-collections) - CollectionForm & CollectionList
