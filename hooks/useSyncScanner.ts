import { useEffect } from "react";
import { db } from "@/lib/db";

export function useSyncScanner(eventId: string) {
  useEffect(() => {
    const sync = async () => {
      // 1. Get the timestamp of our last local update
      const lastTicket = await db.tickets.orderBy("updatedAt").last();
      const since = lastTicket ? lastTicket.updatedAt : 0;

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/v1/tickets/event/${eventId}/sync?since=${since}`,
        );
        const data = await res.json();

        if (data.tickets.length > 0) {
          // 2. Bulk update local database
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await db.tickets.bulkPut(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            data.tickets.map((t: any) => ({
              id: t._id,
              checkInCode: t.checkInCode,
              guestName: `${t.buyerInfo.firstName} ${t.buyerInfo.lastName}`,
              tier: t.tierName,
              status: t.status,
              updatedAt: new Date(t.updatedAt).getTime(),
            })),
          );
          console.log(`Synced ${data.tickets.length} tickets`);
        }
      } catch (err) {
        console.error("Sync failed, operating in offline mode", err);
      }
    };

    // Initial sync
    sync();
    // Poll every 30 seconds for new ticket sales or check-ins from other devices
    const interval = setInterval(sync, 30000);
    return () => clearInterval(interval);
  }, [eventId]);
}
