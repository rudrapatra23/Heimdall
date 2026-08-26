import { Bot, Keyboard } from "gramio";
import { db } from "../../db/index.ts";
import { profiles } from "../../db/schema.ts";
import { eq } from "drizzle-orm";

export function registerAuthHandlers(bot: Bot) {
    return bot
        .command("start", async (ctx) => {
            return ctx.send(
                "Hi, I'm Sery 🌼. Tap the button below to share your phone number. " +
                "I'll use it to check whether this Telegram chat matches your Sery account.",
                {
                    reply_markup: new Keyboard()
                        .requestContact("📱 Share phone number")
                        .oneTime()
                        .resized(),
                }
            );
        })
        .on("message", async (ctx, next) => {
            // Not a contact-share message — let it fall through to commands / free-text handler
            if (!ctx.contact) return next();

            const contact = ctx.contact;

            if (!contact.userId || contact.userId !== ctx.from?.id) {
                return ctx.send(
                    "Please share your own phone number using the button above."
                );
            }

            const phone = normalizePhone(contact.phoneNumber);
            const telegramUserId = ctx.from.id.toString();
            const telegramUsername = ctx.from.username ?? null;

            try {
                const [profile] = await db
                    .select()
                    .from(profiles)
                    .where(eq(profiles.phone_number, phone))
                    .limit(1);

                if (!profile) {
                    return ctx.send(
                        "❌ We couldn't find an Heymdall account associated with this phone number. " +
                        "Please create an account first or contact support."
                    );
                }

                await db
                    .update(profiles)
                    .set({
                        telegram_user_id: telegramUserId,
                        telegram_username: telegramUsername,
                        telegram_linked_at: new Date(),
                        updated_at: new Date(),
                    })
                    .where(eq(profiles.id, profile.id));

                const nameGreeting = profile.full_name ? `, ${profile.full_name}` : "";
                return ctx.send(
                    `✅ You're in${nameGreeting}! Your Heymdall account is verified. We will talk here from now on.`
                );
            } catch (error) {
                console.error("Failed to link Telegram profile:", error);
                return ctx.send(
                    "An error occurred while verifying your account. Please try again later."
                );
            }
        });
}

// Used by bot.ts to check if a chat is linked before routing free text
export async function getProfileByTelegramId(telegramUserId: string) {
    const [profile] = await db
        .select()
        .from(profiles)
        .where(eq(profiles.telegram_user_id, telegramUserId))
        .limit(1);

    return profile ?? null;
}

function normalizePhone(phone: string) {
    const cleaned = phone.replace(/[^\d+]/g, "");
    return cleaned.startsWith("+") ? cleaned : `+${cleaned}`;
}