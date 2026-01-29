import Activity from "../models/activity.model.js";
import fs from "fs";
import path from "path";

/**
 * Security Alerting Utility (OWASP A09:2025)
 * Logs events to the database and also to a dedicated security audit log file.
 */
export const logSecurityAlert = async ({ user, actionType, metadata, ipAddress, severity = "high" }) => {
    try {
        // 1. Log to Database
        await Activity.create({
            user: user?._id || user,
            actionType,
            metadata,
            ipAddress,
            severity
        });

        // 2. Log to Security Audit File (Simulating real-time monitoring/SIEM ingestion)
        const logDir = path.resolve("logs");
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir);
        }

        const logMessage = `[${new Date().toISOString()}] [${severity.toUpperCase()}] Action: ${actionType} | User: ${user?.email || user} | IP: ${ipAddress} | Meta: ${JSON.stringify(metadata)}\n`;

        fs.appendFileSync(path.join(logDir, "security_audit.log"), logMessage);

        // 3. Proactive Alerting (Placeholder for real-time notifications like Email/Slack)
        if (severity === "critical") {
            console.warn(`[SECURITY ALERT] Critical incident detected: ${actionType} from ${ipAddress}`);
            // In a real app, you would call: sendAlertToAdmin(logMessage);
        }

    } catch (error) {
        console.error("Failed to log security alert:", error);
    }
};
