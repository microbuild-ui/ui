/**
 * @microbuild/ui-collections
 * 
 * Dynamic collection components (Form, List, Navigation, Layout, Filter) for Microbuild projects.
 * Built with Mantine v8 and using @microbuild/services for data fetching.
 */

export { CollectionForm } from './CollectionForm';
export type { CollectionFormProps } from './CollectionForm';

export { CollectionList } from './CollectionList';
export type { CollectionListProps, BulkAction } from './CollectionList';

export { FilterPanel } from './FilterPanel';
export type { FilterPanelProps, FilterRule, FilterGroup } from './FilterPanel';

export { ContentNavigation } from './ContentNavigation';
export type { ContentNavigationProps, CollectionTreeNode } from './ContentNavigation';

export { ContentLayout } from './ContentLayout';
export type { ContentLayoutProps, BreadcrumbItem } from './ContentLayout';

export { SaveOptions } from './SaveOptions';
export type { SaveOptionsProps, SaveAction } from './SaveOptions';
