import React from 'react';
import './Abbreviations.css';

const abbreviations = [
    { abbrev: "JWT", fullForm: "JSON Web Token" },
    { abbrev: "XSS", fullForm: "Cross-Site Scripting" },
    { abbrev: "CSRF", fullForm: "Cross-Site Request Forgery" },
    { abbrev: "OWASP", fullForm: "Open Web Application Security Project" },
    { abbrev: "API", fullForm: "Application Programming Interface" },
    { abbrev: "MFA", fullForm: "Multi-Factor Authentication" },
    { abbrev: "OTP", fullForm: "One-Time Password" },
    { abbrev: "CSP", fullForm: "Content Security Policy" },
    { abbrev: "CORS", fullForm: "Cross-Origin Resource Sharing" },
    { abbrev: "SSL", fullForm: "Secure Sockets Layer" },
    { abbrev: "TLS", fullForm: "Transport Layer Security" },
    { abbrev: "CRUD", fullForm: "Create, Read, Update, Delete" },
    { abbrev: "REST", fullForm: "Representational State Transfer" },
    { abbrev: "HTTP", fullForm: "Hypertext Transfer Protocol" },
    { abbrev: "HTTPS", fullForm: "Hypertext Transfer Protocol Secure" },
    { abbrev: "UI", fullForm: "User Interface" },
    { abbrev: "UX", fullForm: "User Experience" },
    { abbrev: "JSON", fullForm: "JavaScript Object Notation" },
    { abbrev: "NPM", fullForm: "Node Package Manager" },
    { abbrev: "ODM", fullForm: "Object-Document Mapper" },
    { abbrev: "RBAC", fullForm: "Role-Based Access Control" },
    { abbrev: "IDOR", fullForm: "Insecure Direct Object Reference" },
    { abbrev: "IDE", fullForm: "Integrated Development Environment" },
    { abbrev: "CSS", fullForm: "Cascading Style Sheets" },
    { abbrev: "HTML", fullForm: "HyperText Markup Language" },
    { abbrev: "JSX", fullForm: "JavaScript XML" },
    { abbrev: "Vite", fullForm: "Next Generation Frontend Tooling" }
];

const Abbreviations = () => {
    return (
        <div className="abbreviations-page dark-mode">
            <div className="abbreviations-container">
                <header className="abbrev-header">
                    <h1>Technical Abbreviations</h1>
                    <p>A comprehensive glossary of the technical acronyms and abbreviations utilized throughout the KeepUp ecosystem.</p>
                </header>

                <div className="table-section">
                    <div className="table-wrapper">
                        <table className="abbrev-table">
                            <thead>
                                <tr>
                                    <th>S.No.</th>
                                    <th>Abbreviation</th>
                                    <th>Full Form</th>
                                </tr>
                            </thead>
                            <tbody>
                                {abbreviations.map((item, index) => (
                                    <tr key={index}>
                                        <td className="sno-cell">{index + 1}</td>
                                        <td className="abbrev-cell">{item.abbrev}</td>
                                        <td className="fullform-cell">{item.fullForm}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <footer className="abbrev-footer">
                    <p>Documented by KeepUp Engineering Team • 2026</p>
                </footer>
            </div>
        </div>
    );
};

export default Abbreviations;
