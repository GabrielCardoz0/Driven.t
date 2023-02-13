import { getBooking, postBooking, putBookingWithBookingId } from "@/controllers";
import { authenticateToken, validateBody } from "@/middlewares";
import { roomIdSchema } from "@/schemas";
import Router from "express";

const bookingRouter = Router();

bookingRouter
  .all("", authenticateToken)
  .get("/", getBooking)
  .post("/", validateBody(roomIdSchema), postBooking)
  .put("/:bookingId", validateBody(roomIdSchema), putBookingWithBookingId);

export { bookingRouter };
