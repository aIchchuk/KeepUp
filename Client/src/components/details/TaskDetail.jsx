import React from 'react';
import '../../styles/ProjectDetail.css';

const TaskDetail = ({ data, onChange }) => {
    return (
        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', marginBottom: '20px' }}>
            <div className="item-property">
                <div className="item-property-label">Status</div>
                <div style={{ display: 'flex', gap: '8px', flex: 1 }}>
                    {['todo', 'in-progress', 'done'].map(status => (
                        <button
                            key={status}
                            onClick={() => onChange({ ...data, status })}
                            style={{
                                flex: 1,
                                padding: '8px',
                                borderRadius: '6px',
                                border: `1px solid ${data.status === status ? 'var(--primary-color)' : 'var(--glass-border)'}`,
                                background: data.status === status ? 'rgba(138, 43, 226, 0.2)' : 'transparent',
                                color: data.status === status ? 'white' : 'var(--text-muted)',
                                cursor: 'pointer',
                                textTransform: 'capitalize',
                                fontSize: '13px'
                            }}
                        >
                            {status.replace('-', ' ')}
                        </button>
                    ))}
                </div>
            </div>
            <div className="item-property">
                <div className="item-property-label">Priority</div>
                <div style={{ display: 'flex', gap: '8px', flex: 1 }}>
                    {['low', 'medium', 'high'].map(priority => (
                        <button
                            key={priority}
                            onClick={() => onChange({ ...data, priority })}
                            style={{
                                flex: 1,
                                padding: '8px',
                                borderRadius: '6px',
                                border: `1px solid ${data.priority === priority ? 'var(--primary-color)' : 'var(--glass-border)'}`,
                                background: data.priority === priority ? 'rgba(138, 43, 226, 0.2)' : 'transparent',
                                color: data.priority === priority ? 'white' : 'var(--text-muted)',
                                cursor: 'pointer',
                                textTransform: 'capitalize',
                                fontSize: '13px'
                            }}
                        >
                            {priority}
                        </button>
                    ))}
                </div>
            </div>
            <div className="item-property">
                <div className="item-property-label">Due Date</div>
                <input
                    type="date"
                    className="ui-input"
                    style={{ padding: '8px' }}
                    value={data.dueDate || ''}
                    onChange={e => onChange({ ...data, dueDate: e.target.value })}
                />
            </div>
            <div className="item-property">
                <div className="item-property-label">Description</div>
            </div>
            <textarea
                className="ui-input"
                style={{ minHeight: '300px', background: 'transparent', border: 'none' }}
                value={data.description || ''}
                onChange={e => onChange({ ...data, description: e.target.value })}
                placeholder="Add description..."
            />
        </div>
    );
};

export default TaskDetail;
