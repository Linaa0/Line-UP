import type { Stop, User } from '../generated/prisma/client.js';

/** The user as returned by the API (never includes the password hash). */
export function toUserView(user: User & { homeStop?: Stop | null }) {
  return {
    id: user.id,
    fullName: user.fullName,
    phone: user.phone,
    email: user.email,
    phoneVerified: user.phoneVerified,
    homeStop: user.homeStop ? { id: user.homeStop.id, name: user.homeStop.name } : null,
    preferences: {
      language: user.language,
      notifyArrivals: user.notifyArrivals,
      notifyQueue: user.notifyQueue,
      notifyReceipts: user.notifyReceipts,
      notifyOffers: user.notifyOffers,
    },
    createdAt: user.createdAt,
  };
}
