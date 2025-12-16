/**
 * @microbuild/ui-interfaces
 * 
 * Shared UI interface components for Microbuild projects.
 * Directus-compatible field interfaces built with Mantine v8.
 */

// Boolean / Toggle
export { Boolean } from './boolean';
export type { BooleanProps } from './boolean';
export { Toggle } from './toggle';
export type { ToggleProps } from './toggle';

// Date / Time
export { DateTime } from './datetime';
export type { DateTimeProps } from './datetime';

// Text inputs
export { Input } from './input';
export type { InputProps } from './input';
export { Textarea } from './textarea';
export type { TextareaProps } from './textarea';
export { InputCode } from './input-code';
export type { InputCodeProps } from './input-code';

// Select / Dropdown
export { SelectDropdown } from './select-dropdown';
export type { SelectDropdownProps, SelectOption } from './select-dropdown';
export { SelectRadio } from './select-radio';
export type { SelectRadioProps } from './select-radio';
export { SelectMultipleCheckbox } from './select-multiple-checkbox';
export type { SelectMultipleCheckboxProps, Option } from './select-multiple-checkbox';
export { SelectIcon } from './select-icon';
export type { SelectIconProps } from './select-icon';

// Autocomplete
export { AutocompleteAPI } from './autocomplete-api';
export type { AutocompleteAPIProps } from './autocomplete-api';

// Collection Item Dropdown
export { CollectionItemDropdown } from './collection-item-dropdown';
export type { CollectionItemDropdownProps, CollectionItemDropdownValue } from './collection-item-dropdown';

// Color
export { Color } from './color';
export type { ColorProps } from './color';

// Tags
export { Tags } from './tags';
export type { TagsProps } from './tags';

// Slider
export { Slider } from './slider';
export type { SliderProps, SliderValueType } from './slider';

// Layout / Presentation
export { Divider } from './divider';
export type { DividerProps } from './divider';
export { Notice } from './notice';
export type { NoticeProps, NoticeType } from './notice';
export { GroupDetail } from './group-detail';
export type { GroupDetailProps } from './group-detail';

// File interfaces (placeholders - require app-specific implementation)
export { FileInterface } from './file';
export type { FileInterfaceProps, FileUploadHandler } from './file';
export { FileInterface as FileImageInterface } from './file';
export { FileInterface as FilesInterface } from './file';
// Note: Full File, FileImage, Files components require app-specific API - use FileInterface wrapper
// export { File } from './file';
// export { FileImage } from './file-image';
// export { Files } from './files';
export { Upload } from './upload';
export type { UploadProps, FileUpload } from './upload';

// Relational interfaces (placeholders - require render props)
export { ListM2MInterface } from './list-m2m';
export type { ListM2MInterfaceProps, ListM2MRenderProps } from './list-m2m';
export { ListM2OInterface } from './list-m2o';
export type { ListM2OInterfaceProps, ListM2ORenderProps } from './list-m2o';
export { ListO2MInterface } from './list-o2m';
export type { ListO2MInterfaceProps, ListO2MRenderProps } from './list-o2m';

// Full relational components (with hooks integration)
export { ListM2M } from './list-m2m';
export type { ListM2MProps } from './list-m2m';
export { ListM2O } from './list-m2o';
export type { ListM2OProps } from './list-m2o';
export { ListO2M } from './list-o2m';
export type { ListO2MProps } from './list-o2m';
export { ListM2A } from './list-m2a';
export type { ListM2AProps } from './list-m2a';

// Rich text editors - require @mantine/tiptap and @editorjs packages
// export { InputBlockEditor } from './input-block-editor';
// export { RichTextHTML } from './rich-text-html';
// export { RichTextMarkdown } from './rich-text-markdown';
// export { Map } from './map';
// Note: Rich text editors and Map require additional dependencies (tiptap, editorjs, maplibre)
