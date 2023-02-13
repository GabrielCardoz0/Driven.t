import { AuthenticatedRequest } from "@/middlewares";
import bookingService from "@/services/booking-service";
import { log } from "console";
import { Response } from "express";

export async function getBooking(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  
  try {
    const booking = await bookingService.getBooking(userId);

    res.status(200).send(booking);
  } catch (error) {
    log(error);

    res.sendStatus(404);
  }
}

export async function postBooking(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const { roomId } = req.body;

  try {
    const bookingId = await bookingService.postBooking(userId, roomId);

    res.status(200).send({ bookingId });
  } catch (error) {
    log(error);

    if(error.name === "NotFoundError") {
      return res.sendStatus(404);
    }

    res.sendStatus(403);
  }
}

export async function putBookingWithBookingId(req: AuthenticatedRequest, res: Response) {
  const { roomId } = req.body;
  const { bookingId } = req.params;

  try {
    const newBookingId = await bookingService.putBookingWithRoomId(Number(bookingId), roomId);

    res.status(200).send({ bookingId: newBookingId });
  } catch (error) {
    log(error);

    if(error.name === "NotFoundError") {
      return res.sendStatus(404);
    }

    res.sendStatus(403);
  }
}
