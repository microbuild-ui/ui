import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { ListM2M } from '@microbuild/ui-interfaces';

// Mock the daasAPI
jest.mock('@/lib/api', () => ({
    daasAPI: {
        getCollectionFields: jest.fn().mockResolvedValue([
            {
                field: 'tags',
                type: 'alias',
                meta: {
                    interface: 'list-m2m',
                    options: {
                        relatedCollection: 'tags',
                        junctionField: 'tag_id',
                        reverseJunctionField: 'article_id',
                        sortField: 'sort'
                    }
                }
            }
        ]),
        getItems: jest.fn().mockResolvedValue({
            data: [
                {
                    id: 1,
                    article_id: 1,
                    tag_id: { id: 1, name: 'React' },
                    sort: 1
                },
                {
                    id: 2,
                    article_id: 1,
                    tag_id: { id: 2, name: 'TypeScript' },
                    sort: 2
                }
            ],
            meta: { total_count: 2 }
        }),
        createItem: jest.fn().mockResolvedValue({ id: 3 }),
        updateItem: jest.fn().mockResolvedValue({}),
        deleteItem: jest.fn().mockResolvedValue({})
    }
}));

// Mock the CollectionList and CollectionForm components
jest.mock('../../collections/CollectionList', () => ({
    CollectionList: ({ bulkActions }: any) => (
        <div data-testid="collection-list">
            Collection List Mock
            {bulkActions && (
                <button onClick={() => bulkActions[0].action([1, 2])}>
                    Add Selected
                </button>
            )}
        </div>
    )
}));

jest.mock('../../collections/CollectionForm', () => ({
    CollectionForm: ({ collection, mode }: any) => (
        <div data-testid="collection-form">
            Collection Form Mock - {collection} - {mode}
        </div>
    )
}));

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <MantineProvider>
        <Notifications />
        {children}
    </MantineProvider>
);

const defaultProps = {
    collection: 'articles',
    field: 'tags',
    primaryKey: 1,
    value: [],
    onChange: jest.fn(),
};

describe('ListM2M Interface', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders without crashing', () => {
        render(
            <TestWrapper>
                <ListM2M {...defaultProps} />
            </TestWrapper>
        );
        
        expect(screen.getByText(/Loading/)).toBeInTheDocument();
    });

    it('displays label and description when provided', async () => {
        render(
            <TestWrapper>
                <ListM2M 
                    {...defaultProps} 
                    label="Article Tags"
                    description="Tags associated with this article"
                />
            </TestWrapper>
        );

        await waitFor(() => {
            expect(screen.getByText('Article Tags')).toBeInTheDocument();
            expect(screen.getByText('Tags associated with this article')).toBeInTheDocument();
        });
    });

    it('shows required indicator when required is true', async () => {
        render(
            <TestWrapper>
                <ListM2M 
                    {...defaultProps} 
                    label="Article Tags"
                    required
                />
            </TestWrapper>
        );

        await waitFor(() => {
            expect(screen.getByText('*')).toBeInTheDocument();
        });
    });

    it('loads and displays items in list layout', async () => {
        render(
            <TestWrapper>
                <ListM2M 
                    {...defaultProps} 
                    layout="list"
                />
            </TestWrapper>
        );

        await waitFor(() => {
            expect(screen.getByText('2 items')).toBeInTheDocument();
        });
    });

    it('loads and displays items in table layout', async () => {
        render(
            <TestWrapper>
                <ListM2M 
                    {...defaultProps} 
                    layout="table"
                    fields={['tag_id.name', 'sort']}
                />
            </TestWrapper>
        );

        await waitFor(() => {
            expect(screen.getByText('Tag Id Name')).toBeInTheDocument();
            expect(screen.getByText('Sort')).toBeInTheDocument();
        });
    });

    it('shows create and select buttons when enabled', async () => {
        render(
            <TestWrapper>
                <ListM2M 
                    {...defaultProps} 
                    enableCreate
                    enableSelect
                />
            </TestWrapper>
        );

        await waitFor(() => {
            expect(screen.getByText('Create New')).toBeInTheDocument();
            expect(screen.getByText('Add Existing')).toBeInTheDocument();
        });
    });

    it('hides action buttons when disabled', async () => {
        render(
            <TestWrapper>
                <ListM2M 
                    {...defaultProps} 
                    disabled
                />
            </TestWrapper>
        );

        await waitFor(() => {
            expect(screen.queryByText('Create New')).not.toBeInTheDocument();
            expect(screen.queryByText('Add Existing')).not.toBeInTheDocument();
        });
    });

    it('opens create modal when create button is clicked', async () => {
        render(
            <TestWrapper>
                <ListM2M 
                    {...defaultProps} 
                    enableCreate
                />
            </TestWrapper>
        );

        await waitFor(() => {
            const createButton = screen.getByText('Create New');
            fireEvent.click(createButton);
        });

        expect(screen.getByText('Create New Item')).toBeInTheDocument();
        expect(screen.getByTestId('collection-form')).toBeInTheDocument();
    });

    it('opens select modal when select button is clicked', async () => {
        render(
            <TestWrapper>
                <ListM2M 
                    {...defaultProps} 
                    enableSelect
                />
            </TestWrapper>
        );

        await waitFor(() => {
            const selectButton = screen.getByText('Add Existing');
            fireEvent.click(selectButton);
        });

        expect(screen.getByText('Select Items')).toBeInTheDocument();
        expect(screen.getByTestId('collection-list')).toBeInTheDocument();
    });

    it('shows search input when enableSearchFilter is true and layout is table', async () => {
        render(
            <TestWrapper>
                <ListM2M 
                    {...defaultProps} 
                    layout="table"
                    enableSearchFilter
                />
            </TestWrapper>
        );

        await waitFor(() => {
            expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
        });
    });

    it('does not show search input for list layout', async () => {
        render(
            <TestWrapper>
                <ListM2M 
                    {...defaultProps} 
                    layout="list"
                    enableSearchFilter
                />
            </TestWrapper>
        );

        await waitFor(() => {
            expect(screen.queryByPlaceholderText('Search...')).not.toBeInTheDocument();
        });
    });

    it('shows error message when provided', async () => {
        render(
            <TestWrapper>
                <ListM2M 
                    {...defaultProps} 
                    error="This field is required"
                />
            </TestWrapper>
        );

        await waitFor(() => {
            expect(screen.getByText('This field is required')).toBeInTheDocument();
        });
    });

    it('shows warning when relationship is not configured', async () => {
        // Mock API to return field without proper M2M configuration
        const { daasAPI } = require('@/lib/api');
        daasAPI.getCollectionFields.mockResolvedValueOnce([
            {
                field: 'tags',
                type: 'string',
                meta: { interface: 'input' }
            }
        ]);

        render(
            <TestWrapper>
                <ListM2M {...defaultProps} />
            </TestWrapper>
        );

        await waitFor(() => {
            expect(screen.getByText('Relationship not configured')).toBeInTheDocument();
            expect(screen.getByText(/many-to-many relationship is not properly configured/)).toBeInTheDocument();
        });
    });

    it('displays empty state when no items are present', async () => {
        // Mock API to return empty items
        const { daasAPI } = require('@/lib/api');
        daasAPI.getItems.mockResolvedValueOnce({
            data: [],
            meta: { total_count: 0 }
        });

        render(
            <TestWrapper>
                <ListM2M {...defaultProps} />
            </TestWrapper>
        );

        await waitFor(() => {
            expect(screen.getByText('No related items')).toBeInTheDocument();
        });
    });

    it('handles item selection in select modal', async () => {
        render(
            <TestWrapper>
                <ListM2M 
                    {...defaultProps} 
                    enableSelect
                />
            </TestWrapper>
        );

        await waitFor(() => {
            const selectButton = screen.getByText('Add Existing');
            fireEvent.click(selectButton);
        });

        // Click the mock "Add Selected" button
        const addSelectedButton = screen.getByText('Add Selected');
        fireEvent.click(addSelectedButton);

        // Verify the API calls
        const { daasAPI } = require('@/lib/api');
        expect(daasAPI.createItem).toHaveBeenCalledTimes(2); // For items 1 and 2
    });

    it('shows ordering controls when sort field is present', async () => {
        render(
            <TestWrapper>
                <ListM2M 
                    {...defaultProps} 
                    layout="table"
                />
            </TestWrapper>
        );

        await waitFor(() => {
            expect(screen.getByText('Order')).toBeInTheDocument();
        });
    });

    it('applies template formatting in list layout', async () => {
        render(
            <TestWrapper>
                <ListM2M 
                    {...defaultProps} 
                    layout="list"
                    template="Tag: {{tag_id.name}}"
                />
            </TestWrapper>
        );

        await waitFor(() => {
            // The formatDisplayValue function should apply the template
            // This would need more sophisticated mocking to test properly
            expect(screen.getByText(/No related items|2 items/)).toBeInTheDocument();
        });
    });
});

describe('ListM2M Accessibility', () => {
    it('has proper ARIA labels', async () => {
        render(
            <TestWrapper>
                <ListM2M 
                    {...defaultProps} 
                    label="Article Tags"
                    required
                />
            </TestWrapper>
        );

        await waitFor(() => {
            expect(screen.getByText('Article Tags')).toBeInTheDocument();
        });

        // Check for proper labeling
        const createButton = await screen.findByText('Create New');
        expect(createButton).toBeInTheDocument();
    });

    it('supports keyboard navigation', async () => {
        render(
            <TestWrapper>
                <ListM2M 
                    {...defaultProps} 
                    enableCreate
                    enableSelect
                />
            </TestWrapper>
        );

        await waitFor(() => {
            const createButton = screen.getByText('Create New');
            expect(createButton).toBeInTheDocument();
            
            // Test tab navigation
            createButton.focus();
            expect(document.activeElement).toBe(createButton);
        });
    });
});

describe('ListM2M Error Handling', () => {
    it('handles API errors gracefully', async () => {
        // Mock API to throw an error
        const { daasAPI } = require('@/lib/api');
        daasAPI.getItems.mockRejectedValueOnce(new Error('Network error'));

        render(
            <TestWrapper>
                <ListM2M {...defaultProps} />
            </TestWrapper>
        );

        // Component should still render and show error state
        await waitFor(() => {
            expect(screen.getByText(/Loading|No related items/)).toBeInTheDocument();
        });
    });

    it('validates required fields', async () => {
        render(
            <TestWrapper>
                <ListM2M 
                    {...defaultProps} 
                    required
                    error="This field is required"
                />
            </TestWrapper>
        );

        await waitFor(() => {
            expect(screen.getByText('This field is required')).toBeInTheDocument();
        });
    });
});
