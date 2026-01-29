import React from 'react';
import './Dependencies.css';

const dependencies = [
    { name: 'axios', version: '^1.13.3', purpose: 'HTTP client for making API requests to external services (Khalti/eSewa).' },
    { name: 'bcryptjs', version: '^3.0.3', purpose: 'Secure password hashing and verification.' },
    { name: 'cors', version: '^2.8.6', purpose: 'Enabling Cross-Origin Resource Sharing.' },
    { name: 'dotenv', version: '^17.2.3', purpose: 'Management of environment variables and secrets.' },
    { name: 'express', version: '^5.2.1', purpose: 'Web framework for building the REST API.' },
    { name: 'express-rate-limit', version: '^8.2.1', purpose: 'Brute-force protection and API rate limiting.' },
    { name: 'file-type', version: '^21.3.0', purpose: 'Detecting file types via magic bytes for integrity checks.' },
    { name: 'helmet', version: '^8.1.0', purpose: 'Securing Express apps by setting various HTTP headers.' },
    { name: 'jsonwebtoken', version: '^9.0.3', purpose: 'Stateless authentication using JWT tokens.' },
    { name: 'mongoose', version: '^9.1.5', purpose: 'MongoDB object modeling and parameterized queries.' },
    { name: 'multer', version: '^2.0.2', purpose: 'Middleware for handling multipart/form-data (file uploads).' },
    { name: 'nodemailer', version: '^7.0.12', purpose: 'Sending emails for MFA (OTP) verification.' },
    { name: 'xss', version: '^1.0.15', purpose: 'Sanitizing user input to prevent Cross-Site Scripting.' },
];

const ServerDependencies = () => {
    return (
        <div className="dependencies-page dark-mode">
            <div className="content-container">
                <h1>Server-Side Dependencies</h1>
                <p>Third-party libraries used in the KeepUp backend ecosystem.</p>
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

export default ServerDependencies;
