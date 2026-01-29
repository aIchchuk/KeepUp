import React from 'react';
import './Dependencies.css';

const dependencies = [
    { name: '@dnd-kit/core', version: '^6.3.1', purpose: 'Core engine for drag-and-drop functionality.' },
    { name: '@dnd-kit/sortable', version: '^10.0.0', purpose: 'Sortable lists for task management.' },
    { name: '@dnd-kit/utilities', version: '^3.2.2', purpose: 'Helper utilities for dnd-kit implementation.' },
    { name: 'axios', version: '^1.13.2', purpose: 'Handling asynchronous API communication with the server.' },
    { name: 'date-fns', version: '^4.1.0', purpose: 'Modern JavaScript date utility library.' },
    { name: 'react', version: '^19.2.0', purpose: 'Core library for building the user interface.' },
    { name: 'react-dom', version: '^19.2.0', purpose: 'Entry point for DOM-related rendering.' },
    { name: 'react-router-dom', version: '^7.12.0', purpose: 'Declarative routing for the single-page application.' },
];

const ClientDependencies = () => {
    return (
        <div className="dependencies-page dark-mode">
            <div className="content-container">
                <h1>Client-Side Dependencies</h1>
                <p>Frontend libraries and frameworks powering the KeepUp user experience.</p>
                <div className="table-wrapper">
                    <table className="dep-table">
                        <thead>
                            <tr>
                                <th>S.No.</th>
                                <th>Package Name</th>
                                <th>Version</th>
                                <th>Purpose</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dependencies.map((dep, index) => (
                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td className="pkg-name">{dep.name}</td>
                                    <td className="pkg-version">{dep.version}</td>
                                    <td>{dep.purpose}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ClientDependencies;
