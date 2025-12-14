import React from 'react';
import { render, screen, fireEvent } from '@/test-utils';
import Map from './Map';

describe('Map', () => {
  it('renders with default props', () => {
    render(<Map />);
    expect(screen.getByText('Map Visualization')).toBeInTheDocument();
  });

  it('renders with label and description', () => {
    render(
      <Map 
        label="Test Map"
        description="Test description"
      />
    );
    expect(screen.getByText('Test Map')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
  });

  it('displays required indicator when required', () => {
    render(<Map label="Required Map" required />);
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('displays error message when provided', () => {
    render(<Map error="Test error message" />);
    expect(screen.getByText('Test error message')).toBeInTheDocument();
  });

  it('displays geometry type badge when specified', () => {
    render(<Map geometryType="Point" />);
    expect(screen.getByText('Point')).toBeInTheDocument();
  });

  it('displays format badge', () => {
    render(<Map geometryFormat="csv" />);
    expect(screen.getByText('CSV')).toBeInTheDocument();
  });

  it('calls onChange when text input changes', () => {
    const onChange = jest.fn();
    render(<Map onChange={onChange} geometryFormat="csv" />);
    
    const textarea = screen.getByPlaceholderText(/Enter coordinates/);
    fireEvent.change(textarea, { target: { value: '40.7128,-74.0060' } });
    
    expect(onChange).toHaveBeenCalled();
  });

  it('generates sample geometry when generate button is clicked', () => {
    const onChange = jest.fn();
    render(<Map geometryType="Point" onChange={onChange} />);
    
    const generateButton = screen.getByText('Generate Point');
    fireEvent.click(generateButton);
    
    expect(onChange).toHaveBeenCalled();
  });

  it('clears geometry when clear button is clicked', () => {
    const onChange = jest.fn();
    render(<Map value="test" onChange={onChange} />);
    
    const clearButton = screen.getByText('Clear');
    fireEvent.click(clearButton);
    
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it('disables controls when disabled prop is true', () => {
    render(<Map geometryType="Point" disabled showBasemapSelector={false} />);
    
    const generateButton = screen.getByRole('button', { name: /Generate Point/ });
    const clearButton = screen.getByRole('button', { name: /Clear/ });
    const textarea = screen.getByPlaceholderText(/Enter GeoJSON/);
    
    expect(generateButton).toBeDisabled();
    expect(clearButton).toBeDisabled();
    expect(textarea).toBeDisabled();
  });

  it('makes controls readonly when readOnly prop is true', () => {
    render(<Map geometryType="Point" readOnly showBasemapSelector={false} />);
    
    const generateButton = screen.getByRole('button', { name: /Generate Point/ });
    const clearButton = screen.getByRole('button', { name: /Clear/ });
    const textarea = screen.getByPlaceholderText(/Enter GeoJSON/);
    
    expect(generateButton).toBeDisabled();
    expect(clearButton).toBeDisabled();
    expect(textarea).toHaveAttribute('readonly');
  });

  it('formats CSV coordinates correctly', () => {
    const onChange = jest.fn();
    render(<Map geometryFormat="csv" onChange={onChange} showBasemapSelector={false} />);
    
    const textarea = screen.getByPlaceholderText(/Enter coordinates/);
    fireEvent.change(textarea, { target: { value: '40.7128,-74.006' } });
    
    // For CSV format, should pass the string as-is
    expect(onChange).toHaveBeenCalledWith('40.7128,-74.006');
  });

  it('validates JSON geometry input', () => {
    render(<Map geometryFormat="json" showBasemapSelector={false} />);
    
    const textarea = screen.getByPlaceholderText(/Enter GeoJSON/);
    fireEvent.change(textarea, { target: { value: '{"invalid": "json"}' } });
    
    expect(screen.getAllByText(/Geometry must have a type property/)[0]).toBeInTheDocument();
  });

  it('enforces geometry type restrictions', () => {
    render(<Map geometryType="Point" geometryFormat="json" showBasemapSelector={false} />);
    
    const textarea = screen.getByPlaceholderText(/Enter GeoJSON/);
    fireEvent.change(textarea, { target: { value: '{"type": "LineString", "coordinates": [[0,0],[1,1]]}' } });
    
    expect(screen.getAllByText(/Expected Point but got LineString/)[0]).toBeInTheDocument();
  });

  it('shows basemap selector when enabled', () => {
    render(<Map showBasemapSelector />);
    expect(screen.getAllByDisplayValue('OpenStreetMap')[0]).toBeInTheDocument();
  });

  it('hides basemap selector when disabled', () => {
    render(<Map showBasemapSelector={false} />);
    expect(screen.queryByDisplayValue('OpenStreetMap')).not.toBeInTheDocument();
  });
});
