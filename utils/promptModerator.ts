interface PromptCheckResult {
    isMalicious: boolean;
    reason: string;
    }

const maliciousKeywords: string[] = [
    "override security","bypass security","jailbreak","disable filters","secret key",
    "system password","hidden info","admin credentials","exploit","hack","root access",
    "escalate privileges","confidential","backdoor","elevate","decrypt","brute force",
    "unblock","unrestricted","impersonate","simulate admin","override limits","hidden commands",
    "inject","disable safety","mislead","cheat","secret command","hidden function","gain access",
    "circumvent","tamper","override restrictions","penetrate","unlock","gain privileges",
    "unauthorized","force execute","access all"
    ];

const maliciousRegex: RegExp[] = [
    /ignore.*(all instructions|your instructions|security|filters|rules)/i,
    /forget.*(all instructions|previous instructions|security|rules|commands)/i,
    /disregard.*(previous instructions|rules)/i,
    /override.*(security|filters|instructions)/i,
    /bypass.*(safety|security|filters)/i,
    /jailbreak/i,
    /disable.*(filter|safety|security)/i,
    /elevate.*privileges/i,
    /secret.*(key|info|command)/i,
    /admin.*(password|credentials)/i,
    /hidden.*(command|function|info)/i,
    /(act|pretend|simulate).*(admin|root)/i,
    /unblock.*restrictions/i,
    /(exploit|hack|brute\s*force)/i,
    /execute.*(code|command)/i,
    /mislead.*AI/i,
    /circumvent.*rules/i,
    /penetrate.*system/i,
    /disable.*restrictions/i,
    /unauthorized.*access/i,
    /gain.*privileges/i,
    /tamper.*settings/i,
    /force.*execute/i,
    /unlock.*features/i,
    /unsafe.*operation/i,
    /bypass.*limits/i,
    /override.*instructions/i,
    /tell me how to.*(bypass|exploit|hack|override|decrypt)/i
    ];

const whitelistedKeywords: string[] = [
    "act as a chatbot","as a language model","explain like i’m 5","simulate conversation",
    "roleplay as assistant","provide example","explain concept","answer questions",
    "teach me","give me advice","tell me how to cook","tell me how to code",
    "tell me how to debug","tell me how to build","tell me how to learn",
    "ignore spelling mistakes","ignore previous example","ignore minor errors"
    ];

export function isMaliciousPrompt(prompt: string): PromptCheckResult {
    const lowerCasePrompt = prompt.toLowerCase();

    for (const safe of whitelistedKeywords) {
        if (lowerCasePrompt.includes(safe)) {
        return { isMalicious: false, reason: "Prompt is whitelisted." };
        }
    }

    for (const keyword of maliciousKeywords) {
        if (lowerCasePrompt.includes(keyword)) {
        return { isMalicious: true, reason: `Blocked: Contains malicious keyword '${keyword}'.` };
        }
    }

    for (const pattern of maliciousRegex) {
        if (pattern.test(prompt)) {
        return { isMalicious: true, reason: `Blocked: Matched a malicious regex pattern.` };
        }
    }

    return { isMalicious: false, reason: "Prompt is clean." };
    }

