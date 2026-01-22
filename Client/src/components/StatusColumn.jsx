import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import TaskCard from './TaskCard';
import '../styles/ProjectDetail.css';

const StatusColumn = ({ status, items, onTaskClick, onQuickStatusUpdate }) => {
    const { setNodeRef, isOver } = useDroppable({
        id: status,
        data: {
            type: 'column',
            status
        }
    });

    return (
        <div
            ref={setNodeRef}
            className={`status-column ${isOver ? 'is-over' : ''}`}
        >
            <div className="column-header">
                <h3 className="status-title">
                    <div className={`status-dot ${status}`}></div>
                    {status.replace('-', ' ')}
                </h3>
                <span className="status-count">
                    {items.length}
                </span>
            </div>

            <div className="status-items-container" style={{ minHeight: '200px' }}>
                <SortableContext
                    items={items.map(i => i._id)}
                    strategy={verticalListSortingStrategy}
                >
                    {items.map(task => (
                        <TaskCard
                            key={task._id}
                            task={task}
                            onClick={onTaskClick}
                            onQuickStatusUpdate={onQuickStatusUpdate}
                        />
                    ))}
                </SortableContext>
            </div>
        </div>
    );
};

export default StatusColumn;
