    // lib/checkIfUserBanned.ts
    import { prisma } from "@/lib/prisma";
    import { BAN_MESSAGES } from "./WarningMessage";

    export async function checkIfUserBanned(userId: string) {
    const bannedUser = await prisma.bannedUser.findUnique({
        where: { userId },
    });

    if (!bannedUser) {
        return {
        isBanned: false,
        message: BAN_MESSAGES.NOT_BANNED,
        };
    }

    // If permanently banned
    if (bannedUser.isPermanent) {
        return {
        isBanned: true,
        message: BAN_MESSAGES.PERMANENT,
        };
    }

    // If temporarily banned
    return {
        isBanned: true,
        message: BAN_MESSAGES.TEMPORARY(bannedUser.bannedUntil),
        bannedUntil: bannedUser.bannedUntil,
    };
    }
