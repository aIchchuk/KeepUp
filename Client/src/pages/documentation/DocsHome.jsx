import React from 'react';
import { Link } from 'react-router-dom';
import './DocsHome.css';

const documentationLinks = [
    {
        title: 'OWASP Security Risk',
        description: 'Analysis of top security risks and how KeepUp mitigates them using 2025 standards.',
        path: '/docs/OWASPrisk',
        icon: '🛡️',
        tag: 'Security'
    },
    {
        title: 'Server Dependencies',
        description: 'Comprehensive list of backend packages, versions, and their technical purposes.',
        path: '/docs/server-side-dependencies',
        icon: '🖥️',
        tag: 'Backend'
    },
    {
        title: 'Client Dependencies',
        description: 'Overview of frontend libraries and tools powering the KeepUp user interface.',
        path: '/docs/client-side-dependencies',
        icon: '💻',
        tag: 'Frontend'
    },
    {
        title: 'Technical Abbreviations',
        description: 'Glossary of technical acronyms and terms utilized in the KeepUp development.',
        path: '/docs/abbreviations',
        icon: '📝',
        tag: 'General'
    }
];

const DocsHome = () => {
    return (
        <div className="docs-home dark-mode">
            <div className="docs-content">
                <header className="docs-header">
                    <div className="accent-line"></div>
                    <h1>Documentation Center</h1>
                    <p>Explore the architecture, security protocols, and dependencies of KeepUp.</p>
                </header>

                <div className="docs-grid">
                    {documentationLinks.map((doc, index) => (
                        <Link to={doc.path} key={index} className="doc-link-card">
                            <div className="doc-card-header">
                                <span className="doc-icon-wrapper">{doc.icon}</span>
                                <span className="doc-tag">{doc.tag}</span>
                            </div>
                            <h2>{doc.title}</h2>
                            <p>{doc.description}</p>
                            <div className="doc-card-footer">
                                <span>Explore Page</span>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="arrow-icon">
                                    <path d="M5 12h14M12 5l7 7-7 7" />
                                </svg>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DocsHome;
