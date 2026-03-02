import React from 'react';
import { EuiDragDropContext, EuiDroppable, EuiDraggable } from '@elastic/eui';

const moveItem = <T,>(items: T[], fromIndex: number, toIndex: number): T[] => {
  const updatedItems = Array.from(items);
  const [movedItem] = updatedItems.splice(fromIndex, 1);
  updatedItems.splice(toIndex, 0, movedItem);
  return updatedItems;
};

export type RearrangeItemsProps<T> = {
  items: T[];
  renderItem: (
    item: T,
    index: number,
    items: T[],
    other: { hidx: number; lastMovement: number; moveItem: (toIndex: number) => void }
  ) => React.ReactNode;
  onChange: (newOrder: T[]) => void;
  draggableKey?: (item: T, index: number) => string; // Function to generate a unique key for each droppable item
  droppableProps?: any; // Additional props for EuiDroppable
  draggableProps?: any; // Additional props for EuiDraggable
};

export const RearrangeItems = <T,>({
  items,
  onChange,
  renderItem,
  draggableKey,
  droppableProps = {},
  draggableProps = {},
}: RearrangeItemsProps<T>) => {
  const [lastMovement, setLastMovement] = React.useState(0);

  const moveItemFromTo = (fromIndex: number, toIndex: number) => {
    const newItemsOrder = moveItem(items, fromIndex, toIndex);
    onChange(newItemsOrder);
    setLastMovement((state) => state + 1);
  };
  const onDragEnd = ({ destination, source }) => {
    if (!destination) return;
    moveItemFromTo(source.index, destination.index);
  };

  return (
    <EuiDragDropContext onDragEnd={onDragEnd}>
      <EuiDroppable droppableId="droppable-area" {...droppableProps}>
        {items.map((item, idx) => {
          const key = draggableKey ? draggableKey(item, idx) : `draggable-${idx}`;
          return (
            <EuiDraggable
              {...draggableProps}
              key={key}
              index={idx}
              draggableId={`draggable-${idx}`}
            >
              {renderItem ? (
                renderItem(item, idx, items, {
                  hidx: idx + 1,
                  lastMovement,
                  moveItem: (toIndex: number) => {
                    moveItemFromTo(idx, toIndex - 1);
                  },
                })
              ) : (
                <div>{item}</div>
              )}
            </EuiDraggable>
          );
        })}
      </EuiDroppable>
    </EuiDragDropContext>
  );
};
