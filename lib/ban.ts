// lib/banUser.ts
import { prisma } from "@/lib/prisma";

export async function checkAndBanUser(user: {
userId: string;
firstName: string;
lastName: string;
email: string;
}) {
const now = new Date();
const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);

// Count flagged prompts in the last 48 hours
const recentFlagCount = await prisma.flaggedPrompt.count({
where: {
    userId: user.userId,
    createdAt: {
    gte: fortyEightHoursAgo,
    },
},
});

// If >= 10 flags in last 48 hours → consider ban
if (recentFlagCount >= 10) {
const banDurationDays = 3;
const bannedUntil = new Date(now.getTime() + banDurationDays * 24 * 60 * 60 * 1000);

// Increment the user's total ban count
await prisma.flaggedPrompt.updateMany({
    where: { userId: user.userId },
    data: { banCount: { increment: 1 } },
});

// Fetch updated ban count
const maxBanCount = await prisma.flaggedPrompt.aggregate({
    where: { userId: user.userId },
    _max: { banCount: true },
});
const userBanCount = maxBanCount._max.banCount || 0;

// **PERMANENT BAN**
if (userBanCount >= 10) {
    await prisma.bannedUser.upsert({
    where: { userId: user.userId },
    update: {
        isPermanent: true,
        bannedUntil: new Date("9999-12-31T23:59:59Z"),
        reason: "Permanently banned after 10 offenses",
    },
    create: {
        userId: user.userId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        bannedUntil: new Date("9999-12-31T23:59:59Z"),
        isPermanent: true,
        reason: "Permanently banned after 10 offenses",
    },
    });

    return {
    success: true,
    type: "PERMANENT_BAN",
    message: "User permanently banned due to repeated violations.",
    };
}

// **TEMPORARY BAN**
await prisma.bannedUser.upsert({
    where: { userId: user.userId },
    update: {
    bannedUntil,
    isPermanent: false,
    reason: "Exceeded 10 flagged prompts in 48 hours",
    },
    create: {
    userId: user.userId,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    bannedUntil,
    isPermanent: false,
    reason: "Exceeded 10 flagged prompts in 48 hours",
    },
});

return {
    success: true,
    type: "TEMP_BAN",
    message: `User temporarily banned for ${banDurationDays} days.`,
    bannedUntil,
};
}

return {
success: false,
message: "No ban required at this time.",
};
}
