import { SelectIcon } from './SelectIcon';

// Story metadata
export default {
  title: 'Interfaces/SelectIcon',
  component: SelectIcon,
};

export const Default = () => (
  <SelectIcon placeholder="Select an icon" />
);

export const WithLabel = () => (
  <SelectIcon 
    label="Choose an Icon"
    placeholder="Select an icon"
  />
);

export const Required = () => (
  <SelectIcon 
    label="Icon"
    placeholder="Select an icon"
    required
  />
);

export const WithValue = () => (
  <SelectIcon 
    label="Selected Icon"
    value="home"
  />
);

export const WithError = () => (
  <SelectIcon 
    label="Icon"
    placeholder="Select an icon"
    error="Please select an icon"
    required
  />
);

export const Disabled = () => (
  <SelectIcon 
    label="Icon"
    placeholder="Select an icon"
    disabled
  />
);

export const DisabledWithValue = () => (
  <SelectIcon 
    label="Icon"
    value="star"
    disabled
  />
);

export const CustomWidth = () => (
  <SelectIcon 
    label="Icon"
    placeholder="Select an icon"
    width="400px"
  />
);

export const LongIconName = () => (
  <SelectIcon 
    label="Icon"
    value="settings_system_daydream"
  />
);

export const SearchExample = () => (
  <SelectIcon 
    label="Icon"
    placeholder="Try searching for &quot;arrow&quot;, &quot;home&quot;, or &quot;star&quot;"
  />
);

export const IconCategories = () => (
  <SelectIcon 
    label="Browse Categories"
    placeholder="Open to see icon categories"
  />
);
