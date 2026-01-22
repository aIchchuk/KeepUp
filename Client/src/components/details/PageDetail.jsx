import React from 'react';
import '../../styles/ProjectDetail.css';

const PageDetail = ({ data, onChange }) => {
    return (
        <textarea
            className="ui-input"
            style={{ minHeight: '300px', background: 'transparent', border: 'none' }}
            value={data.description || ''}
            onChange={e => onChange({ ...data, description: e.target.value })}
            placeholder="Write your page content..."
        />
    );
};

export default PageDetail;
