import { URL } from 'url';

/**
 * Validates if a URL is allowed for outbound requests.
 * Prevents SSRF by checking against a whitelist and blocking internal IP ranges.
 */
const ALLOWED_DOMAINS = [
    'khalti.com',
    'esewa.com.np',
    'api.khalti.com',
    'rc-epay.esewa.com.np'
];

export const validateUrl = (urlStr) => {
    try {
        const parsedUrl = new URL(urlStr);

        // 1. Check protocol
        if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
            throw new Error(`Invalid protocol: ${parsedUrl.protocol}`);
        }

        // 2. Block internal/private IP addresses
        const hostname = parsedUrl.hostname;
        if (
            hostname === 'localhost' ||
            hostname === '127.0.0.1' ||
            hostname.startsWith('192.168.') ||
            hostname.startsWith('10.') ||
            hostname.startsWith('169.254.') || // AWS Metadata
            hostname === '0.0.0.0'
        ) {
            throw new Error(`Access to internal/private address is blocked: ${hostname}`);
        }

        // 3. Whitelist check (Optional but recommended for strict security)
        const isAllowed = ALLOWED_DOMAINS.some(domain =>
            hostname === domain || hostname.endsWith(`.${domain}`)
        );

        if (!isAllowed) {
            // If it's not in the whitelist, we might want to log it or block it
            // For this project, we'll block it to be safe since we know where we should be calling
            throw new Error(`Target domain not in whitelist: ${hostname}`);
        }

        return true;
    } catch (error) {
        console.error(`SSRF Validation failed: ${error.message}`);
        return false;
    }
};
