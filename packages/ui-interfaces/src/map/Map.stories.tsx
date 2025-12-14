import type { Meta, StoryObj } from '@storybook/react-vite';
import { Map } from './Map';

const meta = {
  title: 'Interfaces/Map',
  component: Map,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'A map interface component that matches the Directus map interface functionality. Supports various geometry types and formats with validation.',
      },
    },
  },
  argTypes: {
    geometryType: {
      control: 'select',
      options: ['Point', 'LineString', 'Polygon', 'MultiPoint', 'MultiLineString', 'MultiPolygon', 'GeometryCollection'],
      description: 'Type of geometry to restrict drawing to',
    },
    geometryFormat: {
      control: 'select',
      options: ['geometry', 'json', 'csv', 'string', 'text'],
      description: 'Format for storing the geometry data',
    },
    height: {
      control: 'number',
      description: 'Height of the map container in pixels',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the map is disabled',
    },
    readOnly: {
      control: 'boolean',
      description: 'Whether the map is readonly',
    },
    required: {
      control: 'boolean',
      description: 'Whether the field is required',
    },
    showBasemapSelector: {
      control: 'boolean',
      description: 'Whether to show basemap selector',
    },
  },
} satisfies Meta<typeof Map>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default story
export const Default: Story = {
  args: {
    label: 'Location',
    description: 'Select or enter a location on the map',
    geometryType: 'Point',
    geometryFormat: 'geometry',
    height: 400,
    disabled: false,
    readOnly: false,
    required: false,
    showBasemapSelector: true,
  },
};

// Point geometry
export const Point: Story = {
  args: {
    ...Default.args,
    label: 'Point Location',
    description: 'Enter a point location (latitude, longitude)',
    geometryType: 'Point',
    geometryFormat: 'csv',
    value: '40.7128,-74.0060', // New York City
  },
};

// LineString geometry
export const LineString: Story = {
  args: {
    ...Default.args,
    label: 'Route',
    description: 'Draw a line or route on the map',
    geometryType: 'LineString',
    geometryFormat: 'geometry',
    value: {
      type: 'LineString',
      coordinates: [
        [-74.0060, 40.7128],
        [-73.9857, 40.7484],
        [-73.9681, 40.7829],
      ],
    },
  },
};

// Polygon geometry
export const Polygon: Story = {
  args: {
    ...Default.args,
    label: 'Area',
    description: 'Draw a polygon area on the map',
    geometryType: 'Polygon',
    geometryFormat: 'geometry',
    value: {
      type: 'Polygon',
      coordinates: [[
        [-74.0060, 40.7128],
        [-73.9857, 40.7128],
        [-73.9857, 40.7328],
        [-74.0060, 40.7328],
        [-74.0060, 40.7128],
      ]],
    },
  },
};

// JSON format
export const JSONFormat: Story = {
  args: {
    ...Default.args,
    label: 'GeoJSON Data',
    description: 'Enter geometry data in JSON format',
    geometryFormat: 'json',
    value: {
      type: 'Point',
      coordinates: [-74.0060, 40.7128],
    },
  },
};

// String format
export const StringFormat: Story = {
  args: {
    ...Default.args,
    label: 'Geometry String',
    description: 'Enter geometry data as a JSON string',
    geometryFormat: 'string',
    value: '{"type":"Point","coordinates":[-74.0060,40.7128]}',
  },
};

// Disabled state
export const Disabled: Story = {
  args: {
    ...Default.args,
    disabled: true,
    value: {
      type: 'Point',
      coordinates: [-74.0060, 40.7128],
    },
  },
};

// Read-only state
export const ReadOnly: Story = {
  args: {
    ...Default.args,
    readOnly: true,
    value: {
      type: 'Point',
      coordinates: [-74.0060, 40.7128],
    },
  },
};

// Required field
export const Required: Story = {
  args: {
    ...Default.args,
    required: true,
  },
};

// Error state
export const WithError: Story = {
  args: {
    ...Default.args,
    error: 'Invalid geometry format. Please check your input.',
  },
};

// Multi-point geometry
export const MultiPoint: Story = {
  args: {
    ...Default.args,
    label: 'Multiple Points',
    description: 'Define multiple point locations',
    geometryType: 'MultiPoint',
    value: {
      type: 'MultiPoint',
      coordinates: [
        [-74.0060, 40.7128],
        [-73.9857, 40.7484],
        [-73.9681, 40.7829],
      ],
    },
  },
};

// Any geometry type
export const AnyGeometry: Story = {
  args: {
    ...Default.args,
    label: 'Any Geometry',
    description: 'Supports any type of geometry',
    geometryType: undefined,
    value: {
      type: 'GeometryCollection',
      geometries: [
        {
          type: 'Point',
          coordinates: [-74.0060, 40.7128],
        },
        {
          type: 'LineString',
          coordinates: [
            [-74.0060, 40.7128],
            [-73.9857, 40.7484],
          ],
        },
      ],
    },
  },
};

// Compact height
export const CompactHeight: Story = {
  args: {
    ...Default.args,
    height: 200,
    label: 'Compact Map',
    description: 'Map with reduced height',
  },
};

// Without basemap selector
export const NoBasemapSelector: Story = {
  args: {
    ...Default.args,
    showBasemapSelector: false,
    label: 'Fixed Basemap',
    description: 'Map without basemap selection option',
  },
};
