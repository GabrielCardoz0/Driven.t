import { prisma } from "@/config";
import dayjs from "dayjs";

async function getBooking(userId: number) {
  return prisma.booking.findFirst({
    where: {
      userId
    },
    include: {
      Room: true
    }
  });
}

async function createBooking(userId: number, roomId: number) {
  const booking = await prisma.booking.create({
    data: {
      userId,
      roomId,
      updatedAt: dayjs(Date.now()).toDate()
    }
  });

  return booking;
}

async function findWithBookingByBookingId(bookingId: number) {
  return prisma.booking.findFirst({
    where: {
      id: bookingId
    }
  });
}

async function findRoomByRoomId(roomId: number) {
  return prisma.room.findFirst({
    where: {
      id: roomId
    },
    include: {
      Booking: true
    }
  });
}

async function updateBooking(userId: number, roomId: number, bookingId: number) {
  return prisma.booking.update({
    data: {
      userId,
      roomId,
      updatedAt: dayjs(Date.now()).toDate()
    },
    where: {
      id: bookingId
    }
  });
}

const bookingRepository = {
  getBooking,
  createBooking,
  findWithBookingByBookingId,
  findRoomByRoomId,
  updateBooking
};

export default bookingRepository;
