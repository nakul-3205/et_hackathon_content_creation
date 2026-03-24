// lib/unbanUser.ts
import { prisma } from "./prisma.js"

export async function unbanExpiredUsers() {
const now = new Date();


const expiredBans = await prisma.bannedUser.findMany({
    where: {
    isPermanent: false,
    bannedUntil: { lte: now },
    },
});

if (expiredBans.length === 0) {
    console.log("No expired bans found.");
    return;
}

for (const user of expiredBans) {
    await prisma.bannedUser.delete({
    where: { userId: user.userId },
    });

    console.log(`Unbanned user: ${user.userId}`);
}
}
