"use client";

import React, { useState, useCallback, useMemo } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import styles from "./component.preview.node.module.scss";
import { ComponentPreviewNodeData } from "./types";

interface ResizeHandle {
  width: number;
  height: number;
  isResizing: boolean;
}

export const ComponentPreviewNode: React.FC<NodeProps<ComponentPreviewNodeData>> = ({
  data,
  selected,
  id
}) => {
  const [dimensions, setDimensions] = useState<ResizeHandle>({
    width: data.initialWidth || 400,
    height: data.initialHeight || 300,
    isResizing: false
  });

  const [showProps, setShowProps] = useState(false);
  const [propOverrides, setPropOverrides] = useState<Record<string, any>>(
    data.defaultProps || {}
  );

  // Handle resizing for responsive testing
  const handleResize = useCallback((event: React.MouseEvent) => {
    const startX = event.clientX;
    const startY = event.clientY;
    const startWidth = dimensions.width;
    const startHeight = dimensions.height;

    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = Math.max(200, startWidth + (e.clientX - startX));
      const newHeight = Math.max(150, startHeight + (e.clientY - startY));

      setDimensions(prev => ({
        ...prev,
        width: newWidth,
        height: newHeight,
        isResizing: true
      }));
    };

    const handleMouseUp = () => {
      setDimensions(prev => ({ ...prev, isResizing: false }));
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [dimensions.width, dimensions.height]);

  // Render the component with current props
  const renderedComponent = useMemo(() => {
    if (!data.component) return null;

    try {
      const Component = data.component;
      const mergedProps = { ...data.defaultProps, ...propOverrides };

      return <Component {...mergedProps} />;
    } catch (error) {
      return (
        <div className={styles.errorState}>
          <span>Component Error:</span>
          <code>{error instanceof Error ? error.message : 'Unknown error'}</code>
        </div>
      );
    }
  }, [data.component, data.defaultProps, propOverrides]);

  // Handle prop value changes
  const handlePropChange = useCallback((key: string, value: unknown) => {
    setPropOverrides(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  // Responsive breakpoint indicators
  const getBreakpointClass = useCallback(() => {
    if (dimensions.width >= 1200) return styles.breakpointXl;
    if (dimensions.width >= 992) return styles.breakpointLg;
    if (dimensions.width >= 768) return styles.breakpointMd;
    if (dimensions.width >= 576) return styles.breakpointSm;
    return styles.breakpointXs;
  }, [dimensions.width]);

  return (
    <div
      className={`${styles.previewNode}${selected ? styles.selected : ''}`}
      data-component-id={id}
      data-component-name={data.componentName}
    >
      {/* Connection Handles */}
      <Handle
        type="target"
        position={Position.Left}
        className={styles.handleInput}
        id="props-input"
      />
      <Handle
        type="source"
        position={Position.Right}
        className={styles.handleOutput}
        id="component-output"
      />

      {/* Header with component info */}
      <div className={styles.header}>
        <div className={styles.componentInfo}>
          <h3 className={styles.componentName}>{data.componentName}</h3>
          <span className={styles.componentType}>{data.componentType}</span>
        </div>

        <div className={styles.controls}>
          <button
            className={`${styles.controlBtn}${showProps ? styles.active : ''}`}
            onClick={() => setShowProps(!showProps)}
            title="Toggle Props Panel"
          >
            ⚙️
          </button>
          <div className={styles.breakpointIndicator}>
            <span className={getBreakpointClass()}>
              {dimensions.width}×{dimensions.height}
            </span>
          </div>
        </div>
      </div>

      {/* Props Panel */}
      {showProps && (
        <div className={styles.propsPanel}>
          <h4>Props</h4>
          <div className={styles.propsList}>
            {data.availableProps?.map((prop) => (
              <div key={prop.name} className={styles.propItem}>
                <label className={styles.propLabel}>
                  {prop.name}
                  {prop.required && <span className={styles.required}>*</span>}
                </label>

                {prop.type === 'boolean' ? (
                  <input
                    type="checkbox"
                    checked={propOverrides[prop.name] || false}
                    onChange={(e) => handlePropChange(prop.name, e.target.checked)}
                    className={styles.propInput}
                  />
                ) : prop.type === 'select' && prop.options ? (
                  <select
                    value={propOverrides[prop.name] || prop.defaultValue || ''}
                    onChange={(e) => handlePropChange(prop.name, e.target.value)}
                    className={styles.propSelect}
                  >
                    {prop.options.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={prop.type === 'number' ? 'number' : 'text'}
                    value={propOverrides[prop.name] || prop.defaultValue || ''}
                    onChange={(e) => {
                      const value = prop.type === 'number'
                        ? parseInt(e.target.value)
                        : e.target.value;
                      handlePropChange(prop.name, value);
                    }}
                    placeholder={prop.defaultValue}
                    className={styles.propInput}
                  />
                )}

                {prop.description && (
                  <small className={styles.propDescription}>
                    {prop.description}
                  </small>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Component Preview Area */}
      <div
        className={`${styles.previewArea}${getBreakpointClass()}`}
        style={{
          width: dimensions.width,
          height: dimensions.height
        }}
        data-width={dimensions.width}
        data-height={dimensions.height}
      >
        <div className={styles.componentWrapper}>
          {renderedComponent}
        </div>

        {/* Resize Handle */}
        <div
          className={styles.resizeHandle}
          onMouseDown={handleResize}
          title="Drag to resize for responsive testing"
        >
          ↘️
        </div>
      </div>

      {/* Footer with metadata */}
      <div className={styles.footer}>
        <div className={styles.metadata}>
          <span>Theme: {data.theme || 'system'}</span>
          <span>Locale: {data.locale || 'en'}</span>
          {data.version && <span>v{data.version}</span>}
        </div>
      </div>
    </div>
  );
};

// Export for component registry
export default ComponentPreviewNode;
