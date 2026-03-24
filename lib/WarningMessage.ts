
export const FLAG_WARNING_MESSAGE = `
⚠️ Important Notice
Your recent prompt has been flagged as malicious by our system.

You are allowed a maximum of 10 warnings within a 48-hour window.
If you exceed this limit, your account will be temporarily banned for 3 days.

⚡ Permanent Ban Policy:
If your account is banned 10 times or more, it will be permanently banned and you will lose access to all services.

Please use the system responsibly to avoid losing access.
`;

// constants/messages.ts

export const BAN_MESSAGES = {
  PERMANENT: `
🚫 Your account has been **permanently banned** due to repeated violations of our usage policies.
If you believe this was a mistake, please **contact the developer or support team** with your account details.  
You will **not** be able to access any features of this service.
`,

  TEMPORARY: (unbanDate: Date) => `
⏳ Your account has been **temporarily banned** due to suspicious or abusive activity.
You will regain access on: **${unbanDate.toLocaleString()}**

If you believe this was a mistake, please **contact the developer** with your Email ID to appeal.
`,

  NOT_BANNED: "✅ Your account is in good standing. No bans detected.",
};
