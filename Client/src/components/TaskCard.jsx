import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const TaskCard = ({ task, onClick, onQuickStatusUpdate, isOverlay }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({
        id: task._id,
        disabled: isOverlay, // Overlay shouldn't be sortable itself
        data: {
            type: 'task',
            task
        }
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1, // Dim the original card
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            onClick={() => onClick(task)}
            className={`bg-white p-6 rounded-[24px] border transition-all cursor-grab active:cursor-grabbing group relative ${isOverlay ? 'rotate-2 shadow-2xl border-indigo-200 w-[350px]' : 'border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1'}`}
        >
            <div className="flex gap-4">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onQuickStatusUpdate(task, task.status === 'done' ? 'todo' : 'done');
                    }}
                    onPointerDown={(e) => e.stopPropagation()} // Prevent drag when clicking checkbox
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${task.status === 'done' ? 'bg-green-500 border-green-500 text-white' : 'border-gray-200 group-hover:border-indigo-400'}`}
                >
                    {task.status === 'done' && (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                    )}
                </button>
                <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                        <h4 className={`font-bold text-gray-900 group-hover:text-indigo-600 transition-colors leading-tight ${task.status === 'done' ? 'line-through text-gray-400' : ''}`}>
                            {task.title}
                        </h4>
                        <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${task.priority === 'high' ? 'bg-red-500' : task.priority === 'medium' ? 'bg-yellow-400' : 'bg-green-500'}`}></div>
                    </div>
                    {task.description && (
                        <p className={`text-sm text-gray-400 line-clamp-2 leading-relaxed ${task.status === 'done' ? 'opacity-50' : ''}`}>
                            {task.description}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TaskCard;
