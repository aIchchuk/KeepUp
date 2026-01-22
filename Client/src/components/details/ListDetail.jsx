import React from 'react';
import Button from '../ui/Button';
import '../../styles/ProjectDetail.css';

const ListDetail = ({ data, onChange }) => {
    const getChecklist = () => {
        try {
            return JSON.parse(data.content || '[]');
        } catch (e) {
            return [];
        }
    };

    const updateChecklist = (newChecklist) => {
        onChange({ ...data, content: JSON.stringify(newChecklist) });
    };

    const handleChecklistKey = (e, index) => {
        const checklist = getChecklist();
        if (e.key === 'Enter') {
            e.preventDefault();
            const newList = [...checklist];
            newList.splice(index + 1, 0, { id: Date.now(), text: '', checked: false });
            updateChecklist(newList);
            setTimeout(() => {
                const inputs = document.querySelectorAll('.checklist-input');
                inputs[index + 1]?.focus();
            }, 0);
        } else if (e.key === 'Backspace' && checklist[index].text === '' && checklist.length > 1) {
            e.preventDefault();
            const newList = checklist.filter((_, i) => i !== index);
            updateChecklist(newList);
            setTimeout(() => {
                const inputs = document.querySelectorAll('.checklist-input');
                inputs[index - 1]?.focus();
            }, 0);
        }
    };

    return (
        <div>
            <h4 className="status-title" style={{ marginBottom: '10px' }}>Checklist</h4>
            {getChecklist().map((item, idx) => (
                <div key={item.id} className="checklist-item">
                    <input
                        type="checkbox"
                        checked={item.checked}
                        onChange={() => {
                            const newList = getChecklist();
                            newList[idx].checked = !newList[idx].checked;
                            updateChecklist(newList);
                        }}
                        style={{ width: '20px', height: '20px', accentColor: 'var(--primary-color)' }}
                    />
                    <input
                        className={`checklist-input ${item.checked ? 'checked' : ''}`}
                        value={item.text}
                        onChange={(e) => {
                            const newList = getChecklist();
                            newList[idx].text = e.target.value;
                            updateChecklist(newList);
                        }}
                        onKeyDown={(e) => handleChecklistKey(e, idx)}
                        placeholder="List item..."
                    />
                    <button onClick={() => {
                        const newList = getChecklist();
                        newList.splice(idx, 1);
                        updateChecklist(newList);
                    }} style={{ color: 'var(--danger)' }}>&times;</button>
                </div>
            ))}
            <Button variant="ghost" onClick={() => {
                const newList = getChecklist();
                newList.push({ id: Date.now(), text: '', checked: false });
                updateChecklist(newList);
            }} style={{ marginTop: '10px' }}>+ Add Item</Button>
        </div>
    );
};

export default ListDetail;
