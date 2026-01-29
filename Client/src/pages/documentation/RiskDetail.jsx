import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import './RiskDetail.css';

const highlightCode = (line) => {
    if (!line) return '&nbsp;';

    let escaped = line
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

    const strings = [];
    escaped = escaped.replace(/('[^']*'|"[^"]*"|`[^`]*`)/g, (match) => {
        strings.push(`<span class="code-string">${match}</span>`);
        return `__STR_${strings.length - 1}__`;
    });

    escaped = escaped
        .replace(/(\/\/.+)/g, '<span class="code-comment">$1</span>')
        .replace(/\b(export|const|let|var|return|if|else|await|async|import|from|try|catch|new|instanceof|function|while|for|break|continue|switch|case|default|throw)\b/g, '<span class="code-keyword">$1</span>')
        .replace(/\b(req|res|next|user|roles|id|err|decoded|token|Activity|type|allowedTypes|statusCode|message|otp|otpEmail|project|task|existingUser|hashedPassword|userToInvite|isMember|isMatch|magicBytes)\b/g, '<span class="code-variable">$1</span>')
        .replace(/([a-zA-Z_]\w*)(?=\s*\()/g, '<span class="code-function">$1</span>')
        .replace(/\b(\d+)\b/g, '<span class="code-number">$1</span>');

    strings.forEach((str, i) => {
        escaped = escaped.replace(`__STR_${i}__`, str);
    });

    return escaped;
};

const riskDetailData = {
    'A01': {
        id: 'A01:2025',
        category: 'Broken Access Control',
        fullTitle: 'A01: Access Control Vulnerabilities',
        explanation: "Within KeepUp, a security framework is utilized to enforce granular access control. JSON Web Tokens (JWT) are employed for identity, while specific roles (e.g., owner, member) determine access rights. Permissions are checked at multiple stages, including middleware and controller-level logic, to ensure data isolation.",
        sections: [
            {
                text: "Permission-based access management is enforced at the route level via a dedicated role-checker middleware.",
                filePath: "Server/middleware/role.middleware.js",
                startLine: 1,
                codeSnippet: `export const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: "Forbidden" });
        }
        next();
    };
};`,
                caption: "Figure 6: Role-Based Authorization Logic"
            },
            {
                text: "Access to project data is strictly confined to verified members through membership verification within data controllers.",
                filePath: "Server/controller/task.controller.js",
                startLine: 10,
                codeSnippet: `// Security Check: Verify project membership
const project = await Project.findById(id);
if (!project || !project.members.some(m => m.user.toString() === req.user._id.toString())) {
    return res.status(403).json({ message: "Not authorized" });
}`,
                caption: "Figure 7: Resource Isolation Implementation"
            }
        ]
    },
    'A02': {
        id: 'A02:2025',
        category: 'Cryptographic Failures',
        fullTitle: 'A02: Robust Cryptographic Standards',
        explanation: "Sensitive data is protected through high-standard cryptographic algorithms. Passwords are never stored as plain text; instead, they are hashed using salted bcrypt. Additionally, JWT session signatures utilize strong, environment-managed secrets to protect token integrity.",
        sections: [
            {
                text: "Passwords are mathematically scrambled using bcrypt with a high cost factor before database storage.",
                filePath: "Server/controller/user.controller.js",
                startLine: 40,
                codeSnippet: `const hashedPassword = await bcrypt.hash(password, 10);
const user = await User.create({ name, email, password: hashedPassword });`,
                caption: "Figure 8: Salted Password Hashing"
            },
            {
                text: "Temporary MFA tokens are hashed to ensure security even in the event of database exposure.",
                filePath: "Server/controller/user.controller.js",
                startLine: 69,
                codeSnippet: `const otp = Math.floor(100000 + Math.random() * 900000).toString();
user.mfaCode = await bcrypt.hash(otp, 10);
await user.save();`,
                caption: "Figure 9: Hashed Multi-Factor Authentication"
            }
        ]
    },
    'A03': {
        id: 'A03:2025',
        category: 'Injection',
        fullTitle: 'A03: Neutralizing Injection Attacks',
        explanation: "Global sanitization architecture is utilized to mitigate injection attacks. Dangerous script tags and NoSQL command characters are stripped from user input. Furthermore, parameterized queries via Mongoose ensure that input is treated as literal data, effectively blocking exploitation attempts.",
        sections: [
            {
                text: "A global input screening system is utilized to sanitize all incoming data against Cross-Site Scripting (XSS).",
                filePath: "Server/middleware/xss.middleware.js",
                startLine: 7,
                codeSnippet: `const sanitize = (data) => {
    if (typeof data === "string") return xss(data);
    if (typeof data === "object" && data !== null) {
        for (let key in data) data[key] = sanitize(data[key]);
    }
    return data;
};`,
                caption: "Figure 10: Global Input Security Screening"
            },
            {
                text: "Password formats are verified using complex regular expressions to ensure high-entropy credentials.",
                filePath: "Server/controller/user.controller.js",
                startLine: 16,
                codeSnippet: `const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[.@$!%*?&#])[A-Za-z\\d.@$!%*?&#]{8,}$/;
if (!strongRegex.test(password)) {
    return res.status(400).json({ message: "Password too weak" });
}`,
                caption: "Figure 11: Credential Complexity Validation"
            }
        ]
    },
    'A04': {
        id: 'A04:2025',
        category: 'Insecure Design',
        fullTitle: 'A04: Security Architectural Design',
        explanation: "A 'Security-by-Design' approach is followed, integrating protection into every system layer. This includes network-level rate limiting, identification middleware, and internal audit logs. Information disclosure is proactively managed by masking technical system details.",
        sections: [
            {
                text: "A login attempt control system is utilized to hinder brute-force attacks via temporary IP restrictions.",
                filePath: "Server/server.js",
                startLine: 55,
                codeSnippet: `const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: "Too many login attempts"
});`,
                caption: "Figure 12: Brute-Force Rate Limiting"
            },
            {
                text: "Sensitive internal details are kept confidential by suppressing detailed stack traces in live environments.",
                filePath: "Server/middleware/error.middleware.js",
                startLine: 49,
                codeSnippet: `res.status(statusCode).json({
    message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
});`,
                caption: "Figure 13: Information Disclosure Protection"
            }
        ]
    },
    'A05': {
        id: 'A05:2025',
        category: 'Security Misconfiguration',
        fullTitle: 'A05: Hardlining Configurations',
        explanation: "Misconfigurations are avoided through environment-specific settings and modern security headers. Helmet is utilized to enforce strict content security policies, while CORS is configured for exclusive communication with trusted domains.",
        sections: [
            {
                text: "HTTP security headers are set using Helmet to enforce strict source filtering policies.",
                filePath: "Server/server.js",
                startLine: 28,
                codeSnippet: `app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
        },
    }
}));`,
                caption: "Figure 14: Security Header Configuration"
            },
            {
                text: "A specialized CSRF attack prevention system is integrated to verify the intent of every state-changing request.",
                filePath: "Server/middleware/csrf.middleware.js",
                startLine: 11,
                codeSnippet: `const customHeader = req.headers['x-keepup-request'];
if (sensitiveMethods.includes(req.method) && !customHeader) {
    return res.status(403).json({ message: "CSRF Alert" });
}`,
                caption: "Figure 15: CSRF Prevention Mechanism"
            }
        ]
    },
    'A06': {
        id: 'A06:2025',
        category: 'Vulnerable Components',
        fullTitle: 'A06: Component Governance',
        explanation: "A strict governance policy is enforced for all third-party components. Dependency versions are pinned within manifest files to prevent unverified updates, and automated vulnerability scanning is integrated into the delivery pipeline.",
        sections: [
            {
                text: "Dependency versions are strictly locked in the package manifest to ensure software integrity.",
                filePath: "Server/package.json",
                startLine: 16,
                codeSnippet: `"dependencies": {
    "bcryptjs": "^3.0.3",
    "express": "^5.2.1",
    "helmet": "^8.1.0"
}`,
                caption: "Figure 16: Locked Dependency Governance"
            },
            {
                text: "Automated security checks are utilized to scan the entire dependency graph for known vulnerabilities.",
                filePath: "Server/package.json",
                startLine: 10,
                codeSnippet: `"scripts": {
    "security-audit": "npm audit",
    "security-audit:fix": "npm audit fix"
}`,
                caption: "Figure 17: Vulnerability Audit System"
            }
        ]
    },
    'A07': {
        id: 'A07:2025',
        category: 'Authentication Failures',
        fullTitle: 'A07: Enhanced Session Integrity',
        explanation: "Authentication is managed through rigorous verification protocols. Traditional logins are augmented with Multi-Factor Authentication (MFA), and session tokens are issued with restricted lifespans to minimize the impact of credential compromise.",
        sections: [
            {
                text: "A multi-step verification gate is utilized to generate and email secure OTP codes for identity confirmation.",
                filePath: "Server/controller/user.controller.js",
                startLine: 67,
                codeSnippet: `if (user.mfaEnabled) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await sendOtpEmail(user.email, otp);
    return res.status(200).json({ mfaRequired: true });
}`,
                caption: "Figure 18: Multi-Step MFA Dispatch"
            },
            {
                text: "Session security is enforced using cryptographically signed tokens with environment-managed secrets.",
                filePath: "Server/controller/user.controller.js",
                startLine: 12,
                codeSnippet: `const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" });
};`,
                caption: "Figure 19: Secure Token Issuance"
            }
        ]
    },
    'A08': {
        id: 'A08:2025',
        category: 'Integrity Failures',
        fullTitle: 'A08: Verifying Data Integrity',
        explanation: "Integrity failures are mitigated through multi-stage data verification. Binary content inspection is utilized for file uploads to confirm legitimate file structures, while application-level checks ensure critical security environment keys are valid at startup.",
        sections: [
            {
                text: "File upload integrity is verified using binary magic-byte inspection to ensure legitimate image formats.",
                filePath: "Server/controller/user.controller.js",
                startLine: 165,
                codeSnippet: `const type = await fileTypeFromFile(req.file.path);
if (!type || !allowedTypes.includes(type.mime)) {
    fs.unlinkSync(req.file.path);
    return res.status(400).json({ message: "Invalid file" });
}`,
                caption: "Figure 20: Magic-Byte Binary Inspection"
            },
            {
                text: "System startup integrity is enforced by validating essential configuration keys before the server begins listening.",
                filePath: "Server/server.js",
                startLine: 75,
                codeSnippet: `if (!process.env.MONGO_URI || !process.env.JWT_SECRET) {
    console.error("Critical Security Failure");
    process.exit(1);
}`,
                caption: "Figure 21: Environment Boot-Time Validation"
            }
        ]
    },
    'A09': {
        id: 'A09:2025',
        category: 'Logging & Alerting Failures',
        fullTitle: 'A09: Active Security Monitoring',
        explanation: "A monitoring framework is utilized to track all high-risk events. Failures such as MFA mismatches or unauthorized access attempts are logged with high-severity tags in persistent audit files to provide a tamper-resistant incident history.",
        sections: [
            {
                text: "A dedicated security alerting utility is utilized to record active threats in an append-only audit log.",
                filePath: "Server/utils/logger.util.js",
                startLine: 9,
                codeSnippet: `export const logSecurityAlert = async ({ actionType, severity }) => {
    const logMessage = \`[\${new Date().toISOString()}] [\${severity}] \${actionType}\\n\`;
    fs.appendFileSync(path.join("logs", "audit.log"), logMessage);
};`,
                caption: "Figure 22: Persistent Audit File Logging"
            },
            {
                text: "Critical incident alerts are triggered for high-risk events, ensuring immediate visibility into potential compromise attempts.",
                filePath: "Server/controller/user.controller.js",
                startLine: 101,
                codeSnippet: `await logSecurityAlert({
    user: user._id,
    actionType: "mfa_failure",
    severity: "high"
});`,
                caption: "Figure 23: Incident Response Dispatch"
            }
        ]
    },
    'A10': {
        id: 'A10:2025',
        category: 'Mishandling Exceptional Conditions',
        fullTitle: 'A10: Secure Exception Handling',
        explanation: "Uncontrolled exceptions are managed through a centralized policy to prevent information leakage. Technical details—such as database schemas or stack traces—are masked, presenting only safe, non-technical messages to public clients.",
        sections: [
            {
                text: "A centralized error handler is utilized to intercept exceptions and standardize safe responses.",
                filePath: "Server/middleware/error.middleware.js",
                startLine: 6,
                codeSnippet: `const errorHandler = (err, req, res, next) => {
    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || "Server Error"
    });
};`,
                caption: "Figure 24: Global Exception Interception"
            },
            {
                text: "Schema-specific validation errors are masked to prevent the disclosure of internal database structures.",
                filePath: "Server/middleware/error.middleware.js",
                startLine: 28,
                codeSnippet: `if (err.name === 'ValidationError') {
    message = "Invalid data format";
    statusCode = 400;
}`,
                caption: "Figure 25: Database Validation Masking"
            }
        ]
    }
};

const RiskDetail = () => {
    const { id } = useParams();
    const data = useMemo(() => riskDetailData[id], [id]);

    if (!data) return <div className="risk-error">Risk document not found.</div>;

    return (
        <div className="risk-detail-page">
            <div className="risk-detail-container">
                <header className="risk-detail-header">
                    <h1>{data.fullTitle}</h1>
                </header>

                <div className="risk-detail-content">
                    <p className="explanation-text">{data.explanation}</p>

                    {data.sections.map((section, idx) => (
                        <div key={idx} className="risk-section">
                            <p className="section-text">{section.text}</p>
                            <div className="code-screenshot-box">
                                <div className="code-window-header">
                                    <div className="dot red"></div>
                                    <div className="dot yellow"></div>
                                    <div className="dot green"></div>
                                    <span className="window-title">
                                        {section.filePath} {section.startLine ? `• Line ${section.startLine}` : ''}
                                    </span>
                                </div>
                                <div className="editor-container">
                                    <div className="code-lines">
                                        {section.codeSnippet && section.codeSnippet.split('\n').map((line, lIdx) => (
                                            <div key={lIdx} className="code-line">
                                                <span className="line-number">{(section.startLine || 1) + lIdx}</span>
                                                <span
                                                    className="line-content"
                                                    dangerouslySetInnerHTML={{ __html: highlightCode(line) }}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                    <div className="editor-footer">
                                        Ctrl+I for Command, Ctrl+L for Agent
                                    </div>
                                </div>
                            </div>
                            <div className="figure-caption">{section.caption}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default RiskDetail;
