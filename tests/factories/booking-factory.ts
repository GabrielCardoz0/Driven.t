import { prisma } from "@/config";
import dayjs from "dayjs";

export async function createBookingWithUserIdAndRoomId(userId: number, roomId: number) {
  return prisma.booking.create({
    data: {
      userId,
      roomId,
      updatedAt: dayjs(Date.now()).toDate()
    }
  });
}
