import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import '../styles/ProjectDetail.css';

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
        disabled: isOverlay,
        data: {
            type: 'task',
            task
        }
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            onClick={() => onClick(task)}
            className={`task-card ${isDragging ? 'is-dragging' : ''} ${isOverlay ? 'overlay' : ''}`}
        >
            <div className="task-content">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onQuickStatusUpdate(task, task.status === 'done' ? 'todo' : 'done');
                    }}
                    onPointerDown={(e) => e.stopPropagation()}
                    className={`task-checkbox ${task.status === 'done' ? 'done' : ''}`}
                >
                    {task.status === 'done' && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
                            <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    )}
                </button>

                <div className="task-main">
                    <div className="flex items-start justify-between">
                        <h4 className={`task-title ${task.status === 'done' ? 'done' : ''}`}>
                            {task.title}
                        </h4>
                        <div className={`priority-badge ${task.priority}`}></div>
                    </div>

                    {task.description && (
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.4', marginBottom: '8px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {task.description}
                        </p>
                    )}

                    <div className="task-meta">
                        {task.dueDate && (
                            <div className="task-due">
                                <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                <span>{new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TaskCard;
