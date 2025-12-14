import React from 'react';
import { MantineProvider } from '@mantine/core';
import { AutocompleteAPI } from '../AutocompleteAPI';

// Example usage component for demonstration
export function AutocompleteExample() {
  const [value, setValue] = React.useState('');

  return (
    <MantineProvider>
      <div style={{ padding: '20px', maxWidth: '400px' }}>
        <h3>Country Autocomplete Example</h3>
        
        {/* Basic usage */}
        <AutocompleteAPI
          url="https://usmanlive.com/wp-json/api/countries?q={{value}}"
          textPath="name"
          valuePath="iso2"
          label="Select Country"
          placeholder="Type to search countries..."
          value={value}
          onChange={setValue}
          trigger="debounce"
          rate={300}
          limit={5}
          clearable
        />
        
        <p>Selected value: {value}</p>
        
        {/* Example with different configuration */}
        <div style={{ marginTop: '20px' }}>
          <h4>Simple String Array Example</h4>
          <AutocompleteAPI
            url="https://jsonplaceholder.typicode.com/users?name_like={{value}}"
            textPath="name"
            valuePath="email"
            label="Select User"
            placeholder="Type user name..."
            trigger="throttle"
            rate={500}
          />
        </div>
      </div>
    </MantineProvider>
  );
}
