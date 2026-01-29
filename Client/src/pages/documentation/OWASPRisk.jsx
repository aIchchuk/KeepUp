import React from 'react';
import './OWASPRisk.css';

const risks = [
    {
        id: "A01:2025",
        category: "Broken Access Control",
        severity: "Critical",
        icon: "🛡️",
        description: "Access is granted based on verified roles and permissions.",
        mitigation: "A role-based middleware is utilized to restrict unauthorized route access."
    },
    {
        id: "A02:2025",
        category: "Security Misconfiguration",
        severity: "High",
        icon: "⚙️",
        description: "Sensitive information is exposed due to default settings.",
        mitigation: "Strict security headers and environment variables are hardlined."
    },
    {
        id: "A03:2025",
        category: "Software Supply Chain Failures",
        severity: "High",
        icon: "📦",
        description: "Third-party libraries are used without integrity checks.",
        mitigation: "Dependency versions are pinned and audited via strict NPM policies."
    },
    {
        id: "A04:2025",
        category: "Cryptographic Failures",
        severity: "Critical",
        icon: "🔐",
        description: "Data is compromised due to weak encryption practices.",
        mitigation: "Strong password hashing and JWT signing are enforced."
    },
    {
        id: "A05:2025",
        category: "Injection",
        severity: "High",
        icon: "💉",
        description: "Untrusted data is executed as malicious commands.",
        mitigation: "Global XSS sanitization and parameterized queries are applied."
    },
    {
        id: "A06:2025",
        category: "Insecure Design",
        severity: "Medium",
        icon: "📐",
        description: "Attacks are enabled due to flaws in the app's architecture.",
        mitigation: "A 'Security-by-Design' approach is adopted for all features."
    },
    {
        id: "A07:2025",
        category: "Authentication Failures",
        severity: "Critical",
        icon: "👤",
        description: "Accounts are breached due to poor login security.",
        mitigation: "Multi-Factor Authentication and Rate Limiting are integrated."
    },
    {
        id: "A08:2025",
        category: "Software or Data Integrity Failures",
        severity: "High",
        icon: "💾",
        description: "Malicious files are uploaded bypassing basic checks.",
        mitigation: "Magic-byte validation is used to confirm file integrity."
    },
    {
        id: "A09:2025",
        category: "Logging & Alerting Failures",
        severity: "Medium",
        icon: "🚨",
        description: "Security breaches go undetected due to lack of logs.",
        mitigation: "Persistent security auditing and alerting are implemented."
    },
    {
        id: "A10:2025",
        category: "Mishandling of Exceptional Conditions",
        severity: "Medium",
        icon: "⚠️",
        description: "System secrets are leaked via error messages.",
        mitigation: "Centralized error handling is used to mask technical details."
    }
];

const OWASPRisk = () => {
    return (
        <div className="owasp-dark-page">
            <header className="owasp-header">
                <h1>OWASP Top 10 Security Protocol</h1>
                <p>An official analysis of the security vulnerabilities identified in the 2025 standard and the corresponding mitigations implemented within the KeepUp ecosystem.</p>
            </header>

            <div className="risk-grid">
                {risks.map((risk, index) => (
                    <div
                        key={index}
                        className="risk-card"
                        onClick={() => window.open(`/docs/OWASPrisk/${risk.id.split(':')[0]}`, '_blank')}
                    >
                        <div className="risk-card-inner">
                            <div className="risk-card-front">
                                <div className="risk-header">
                                    <span className="risk-id">{risk.id}</span>
                                    <span className="risk-icon">{risk.icon}</span>
                                </div>
                                <h3 className="risk-name">{risk.category}</h3>
                                <div className={`severity-badge ${risk.severity.toLowerCase()}`}>
                                    {risk.severity}
                                </div>
                                <p className="card-desc">{risk.description}</p>
                            </div>
                            <div className="risk-card-back">
                                <h4>Applied Mitigation</h4>
                                <p>{risk.mitigation}</p>
                                <div className="view-more-hint">Click to view code implementation →</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <section className="legacy-table-view">
                <h2>Compliance Summary</h2>
                <div className="table-wrapper">
                    <table className="dark-table">
                        <thead>
                            <tr>
                                <th>Risk Code</th>
                                <th>Category</th>
                                <th>Status</th>
                                <th>Applied Feature</th>
                            </tr>
                        </thead>
                        <tbody>
                            {risks.map((risk, index) => (
                                <tr key={index}>
                                    <td className="code-col">{risk.id}</td>
                                    <td className="title-col">{risk.category}</td>
                                    <td><span className={`status-dot ${risk.severity.toLowerCase()}`}></span> Active</td>
                                    <td className="mitigation-col">{risk.mitigation.split('is ')[1] || risk.mitigation}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
};

export default OWASPRisk;
