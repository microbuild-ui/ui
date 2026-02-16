/**
 * TableHeader Component
 * Renders the table header row with sorting, resizing, and selection controls
 */

import React, { useState, useRef, useCallback } from 'react';
import { Checkbox, Tooltip, Text } from '@mantine/core';
import { 
  IconArrowUp, 
  IconArrowDown, 
  IconArrowsSort,
  IconGripVertical 
} from '@tabler/icons-react';
import type { Header, Sort, ShowSelect } from '../types';
import './TableHeader.css';

export interface TableHeaderProps {
  /** Column headers */
  headers: Header[];
  /** Current sort state */
  sort: Sort;
  /** Whether header reordering is in progress */
  reordering?: boolean;
  /** Allow header reorder via drag-and-drop */
  allowHeaderReorder?: boolean;
  /** Selection mode */
  showSelect?: ShowSelect;
  /** Show column resize handles */
  showResize?: boolean;
  /** Show manual sort column */
  showManualSort?: boolean;
  /** Whether some items are selected */
  someItemsSelected?: boolean;
  /** Whether all items are selected */
  allItemsSelected?: boolean;
  /** Whether header is fixed/sticky */
  fixed?: boolean;
  /** Force at least one column to be sorted */
  mustSort?: boolean;
  /** Whether there's an append slot */
  hasItemAppendSlot?: boolean;
  /** Manual sort field key */
  manualSortKey?: string;
  /** Custom header renderer */
  renderHeader?: (header: Header) => React.ReactNode;
  /** Custom header context-menu content (rendered inside a positioned popup) */
  renderHeaderContextMenu?: (header: Header) => React.ReactNode;
  /** Sort change handler */
  onSortChange?: (sort: Sort) => void;
  /** Toggle select all handler */
  onToggleSelectAll?: (selectAll: boolean) => void;
  /** Headers update handler (for resize/reorder) */
  onHeadersChange?: (headers: Header[]) => void;
  /** Reordering state change handler */
  onReorderingChange?: (reordering: boolean) => void;
  /** Header right-click handler (alternative to renderHeaderContextMenu) */
  onHeaderContextMenu?: (header: Header, event: React.MouseEvent) => void;
}

export const TableHeader: React.FC<TableHeaderProps> = ({
  headers,
  sort,
  reordering = false,
  allowHeaderReorder = false,
  showSelect = 'none',
  showResize = false,
  showManualSort = false,
  someItemsSelected = false,
  allItemsSelected = false,
  fixed = false,
  mustSort = false,
  hasItemAppendSlot = false,
  manualSortKey,
  renderHeader,
  renderHeaderContextMenu,
  onSortChange,
  onToggleSelectAll,
  onHeadersChange,
  onReorderingChange: _onReorderingChange,
  onHeaderContextMenu,
}) => {
  // Context menu state
  const [contextMenu, setContextMenu] = useState<{
    header: Header;
    x: number;
    y: number;
  } | null>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);
  const [resizing, setResizing] = useState(false);
  const resizeRef = useRef<{
    header: Header;
    startX: number;
    startWidth: number;
  } | null>(null);

  /**
   * Handle header right-click (context menu)
   */
  const handleContextMenu = useCallback((header: Header, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    // If external handler is provided, delegate to it
    if (onHeaderContextMenu) {
      onHeaderContextMenu(header, event);
      return;
    }
    // Otherwise show built-in popup if renderer is provided
    if (renderHeaderContextMenu) {
      setContextMenu({ header, x: event.clientX, y: event.clientY });
    }
  }, [onHeaderContextMenu, renderHeaderContextMenu]);

  // Close context menu on outside click
  React.useEffect(() => {
    if (!contextMenu) return;
    const handleClick = (e: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node)) {
        setContextMenu(null);
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setContextMenu(null);
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [contextMenu]);

  /**
   * Handle column sort
   */
  const handleSort = useCallback((header: Header) => {
    if (!header.sortable || resizing) return;

    if (header.value === sort.by) {
      if (mustSort) {
        // Toggle direction only
        onSortChange?.({ by: sort.by, desc: !sort.desc });
      } else if (!sort.desc) {
        // First click: asc, second: desc, third: clear
        onSortChange?.({ by: sort.by, desc: true });
      } else {
        onSortChange?.({ by: null, desc: false });
      }
    } else {
      onSortChange?.({ by: header.value, desc: false });
    }
  }, [sort, mustSort, resizing, onSortChange]);

  /**
   * Handle manual sort toggle
   */
  const handleManualSortToggle = useCallback(() => {
    if (sort.by === manualSortKey) {
      onSortChange?.({ by: null, desc: false });
    } else {
      onSortChange?.({ by: manualSortKey ?? null, desc: false });
    }
  }, [sort.by, manualSortKey, onSortChange]);

  /**
   * Start column resize
   */
  const handleResizeStart = useCallback((header: Header, event: React.PointerEvent) => {
    const target = event.currentTarget as HTMLElement;
    const parent = target.parentElement as HTMLElement;
    
    setResizing(true);
    resizeRef.current = {
      header,
      startX: event.pageX,
      startWidth: parent.offsetWidth,
    };

    // Add global listeners
    const handleMouseMove = (e: PointerEvent) => {
      if (!resizeRef.current) return;
      
      const deltaX = e.pageX - resizeRef.current.startX;
      const newWidth = Math.max(32, resizeRef.current.startWidth + deltaX);
      
      const newHeaders = headers.map((h) =>
        h.value === resizeRef.current!.header.value
          ? { ...h, width: newWidth }
          : h
      );
      onHeadersChange?.(newHeaders);
    };

    const handleMouseUp = () => {
      setResizing(false);
      resizeRef.current = null;
      window.removeEventListener('pointermove', handleMouseMove);
      window.removeEventListener('pointerup', handleMouseUp);
    };

    window.addEventListener('pointermove', handleMouseMove);
    window.addEventListener('pointerup', handleMouseUp);
  }, [headers, onHeadersChange]);

  /**
   * Get sort icon for header
   */
  const getSortIcon = (header: Header) => {
    if (sort.by !== header.value) {
      return <IconArrowsSort size={14} className="sort-icon idle" />;
    }
    return sort.desc 
      ? <IconArrowDown size={14} className="sort-icon active" />
      : <IconArrowUp size={14} className="sort-icon active" />;
  };

  /**
   * Get header classes
   */
  const getHeaderClasses = (header: Header) => {
    const classes = ['cell', `align-${header.align}`];
    
    if (header.sortable) {
      classes.push('sortable');
    }
    
    if (header.width && header.width < 90) {
      classes.push('small');
    }
    
    if (sort.by === header.value) {
      classes.push(sort.desc ? 'sort-desc' : 'sort-asc');
    }
    
    return classes.join(' ');
  };

  return (
    <thead className={`table-header ${resizing ? 'resizing' : ''} ${reordering ? 'reordering' : ''}`}>
      <tr className={fixed ? 'fixed' : ''}>
        {/* Manual Sort Column */}
        {showManualSort && (
          <th
            className={`cell manual ${sort.by === manualSortKey ? 'sorted-manually' : ''}`}
            onClick={handleManualSortToggle}
          >
            <IconGripVertical size={18} />
          </th>
        )}

        {/* Select All Checkbox */}
        {showSelect !== 'none' && (
          <th className="cell select">
            {showSelect === 'multiple' && (
              <Checkbox
                checked={allItemsSelected}
                indeterminate={someItemsSelected && !allItemsSelected}
                onChange={() => onToggleSelectAll?.(!allItemsSelected)}
                aria-label="Select all"
              />
            )}
          </th>
        )}

        {/* Column Headers */}
        {headers.map((header) => (
          <th
            key={header.value}
            className={getHeaderClasses(header)}
            onClick={() => handleSort(header)}
            onContextMenu={(e) => handleContextMenu(header, e)}
            style={{ width: header.width ? `${header.width}px` : undefined }}
          >
            <div className="header-content">
              {allowHeaderReorder && (
                <div className="reorder-handle">
                  <IconGripVertical size={14} />
                </div>
              )}
              
              {renderHeader ? (
                renderHeader(header)
              ) : (
                <Tooltip label={header.description} disabled={!header.description}>
                  <Text size="sm" fw={600} truncate="end">
                    {header.text}
                  </Text>
                </Tooltip>
              )}

              {header.sortable && (
                <span className="sort-indicator">
                  {getSortIcon(header)}
                </span>
              )}
            </div>

            {/* Resize Handle */}
            {showResize && (
              <div
                className="resize-handle"
                onPointerDown={(e) => handleResizeStart(header, e)}
              />
            )}
          </th>
        ))}

        {/* Spacer */}
        <th className="cell spacer" />

        {/* Append Column */}
        {hasItemAppendSlot && <th className="cell append" />}
      </tr>

      {/* Context Menu Popup */}
      {contextMenu && renderHeaderContextMenu && (
        <tr className="context-menu-row" style={{ display: 'contents' }}>
          <td colSpan={999} style={{ position: 'relative', padding: 0, border: 'none' }}>
            <div
              ref={contextMenuRef}
              className="header-context-menu"
              style={{
                position: 'fixed',
                top: contextMenu.y,
                left: contextMenu.x,
                zIndex: 1000,
              }}
              onClick={() => setContextMenu(null)}
            >
              {renderHeaderContextMenu(contextMenu.header)}
            </div>
          </td>
        </tr>
      )}
    </thead>
  );
};
