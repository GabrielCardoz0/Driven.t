import bookingRepository from "@/repositories/booking-repository";
import enrollmentRepository from "@/repositories/enrollment-repository";
import ticketRepository from "@/repositories/ticket-repository";
import { log } from "console";

async function getBooking(userId: number) {
  const booking = await bookingRepository.getBooking(userId);
  
  if(!booking) {
    throw {
      name: "NotFoundError",
      message: "No result for this search! getbooking",
    };
  }

  return { bookingId: booking.id, Room: booking.Room };
}

async function postBooking(userId: number, roomId: number) {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if(!enrollment) {
    throw {
      name: "NotFoundError",
      message: "No result for this search! enrollment",
    };
  }

  const ticket = await ticketRepository.findTicketByEnrollmentId(enrollment.id);
  if (!ticket || ticket.status === "RESERVED" || ticket.TicketType.isRemote || !ticket.TicketType.includesHotel) {
    throw {
      name: "NotFoundError",
      message: "No result for this search! ticket",
    };
  }

  const room = await bookingRepository.findRoomByRoomId(roomId);

  if(!room) {
    throw {
      name: "NotFoundError",
      message: "No result for this search! room",
    };
  }

  if(room.capacity === room.Booking.length) {
    throw {
      name: "403",
      message: "No result for this search! room capacity",
    };
  }

  const booking = await bookingRepository.createBooking(userId, roomId);

  return booking.id;
}

async function putBookingWithRoomId(bookingId: number, roomId: number,) {
  log("veririca booking");
  const booking = await bookingRepository.findWithBookingByBookingId(bookingId);
  
  if(!booking) {
    throw {
      name: "NotFoundError",
      message: "No result for this search! put booking ",
    };
  }
  log("tem booking");

  // if(booking.userId !== userId) {
  //   log("toma o if");
  //   log(booking.userId, typeof(booking.userId));
  //   log(userId, typeof(userId));
  //   throw {
  //     name: "NotFoundError",
  //     message: "No result for this search! userId não coincide",
  //   };
  // }

  const room = await bookingRepository.findRoomByRoomId(roomId);
  if(!room) {
    throw {
      name: "NotFoundError",
      message: "No result for this search! no room",
    };
  }
  
  log("tem room");
  
  if(room.capacity === room.Booking.length) {
    throw {
      name: "403",
      message: "No result for this search! room capacity over",
    };
  }

  const newBooking = await bookingRepository.updateBooking(booking.userId, roomId, bookingId);

  return { bookingId: newBooking.id };
}

const bookingService = {
  getBooking,
  postBooking,
  putBookingWithRoomId
};

export default bookingService;
