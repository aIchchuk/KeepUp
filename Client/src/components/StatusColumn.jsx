import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import TaskCard from './TaskCard';

const StatusColumn = ({ status, items, onTaskClick, onQuickStatusUpdate }) => {
    const { setNodeRef, isOver } = useDroppable({
        id: status,
        data: {
            type: 'column',
            status
        }
    });

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
                <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400">
                    {status.replace('-', ' ')}
                </h3>
                <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md text-[10px] font-bold">
                    {items.length}
                </span>
            </div>

            <div
                ref={setNodeRef}
                className={`space-y-4 min-h-[500px] p-2 rounded-[32px] transition-all duration-300 ${isOver ? 'bg-indigo-50/50 ring-2 ring-indigo-200 ring-dashed' : 'bg-transparent'}`}
            >
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
