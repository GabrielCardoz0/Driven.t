import app, { init } from "@/app";
import faker from "@faker-js/faker";
import supertest from "supertest";
import { createEnrollmentWithAddress, createHotel, createPayment, createRoomWithHotelId, createTicket, createTicketTypeWithHotel, createUser } from "../factories";
import { cleanDb, generateValidToken } from "../helpers";
import * as jwt from "jsonwebtoken";
import { createBookingWithUserIdAndRoomId } from "../factories/booking-factory";
import { TicketStatus } from "@prisma/client";

beforeAll(async () => {
  await init();
  cleanDb();
});

beforeEach(async () => {
  cleanDb();
});

const server = supertest(app);

describe("GET /booking", () => {
  it("should respond with status 401 if no token given", async () => {
    const response = await server.get("/booking");

    expect(response.status).toBe(401);
  });

  it("should respond with status 401 if give token is not valid", async () => {
    const token = faker.lorem.word();

    const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(401);
  });

  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();

    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(401);
  });

  describe("when token is valid", () => {
    it("should respond with status 404 if no booking", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(404);
    });

    it("should respond with status 200 and a booking include room", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const hotel = await createHotel();
      const createdRoom = await createRoomWithHotelId(hotel.id);
      const booking = await createBookingWithUserIdAndRoomId(user.id, createdRoom.id);

      const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);

      expect(response.body.bookingId).toBe(booking.id);
      expect(response.status).toBe(200);
    });
  });
});

describe("POST /booking", () => {
  it("should respond with status 401 if no token given", async () => {
    const response = await server.post("/booking");

    expect(response.status).toBe(401);
  });

  it("should respond with status 401 if give token is not valid", async () => {
    const token = faker.lorem.word();

    const response = await server.post("/booking").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(401);
  });

  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();

    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.post("/booking").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(401);
  });

  describe("When token is valid", () => {
    it("should respond with status 400 if body is invalid", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(400);
    });

    it("should respond with status 404 when body is valid and no enrollment", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      const response = await server.post("/booking").send({ roomId: 0 }).set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(404);
    });

    it("should respond with status 404 if have enrollment and no ticket", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      await createEnrollmentWithAddress(user);

      const response = await server.post("/booking").send({ roomId: 0 }).set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(404);
    });

    it("should respond with status if no room", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await createPayment(ticket.id, ticketType.price);

      const response = await server.post("/booking").send({ roomId: 0 }).set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(404);
    });

    it("should respond with status 403 if room no have capacity", async () => {
      const user = await createUser();
      const user2 = await createUser();
      const user3 = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await createPayment(ticket.id, ticketType.price);
      const createdHotel = await createHotel();
      const createdRoom = await createRoomWithHotelId(createdHotel.id);

      await createBookingWithUserIdAndRoomId(user.id, createdRoom.id);
      await createBookingWithUserIdAndRoomId(user2.id, createdRoom.id);
      await createBookingWithUserIdAndRoomId(user3.id, createdRoom.id);

      const response = await server.post("/booking").send({ roomId: createdRoom.id }).set("Authorization", `Bearer ${token}`);
      
      expect(response.status).toBe(403);
    });

    it("should respond with status 200 and bookingId", async () => {
      const user = await createUser();
      const user2 = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await createPayment(ticket.id, ticketType.price);
      const createdHotel = await createHotel();
      const createdRoom = await createRoomWithHotelId(createdHotel.id);

      await createBookingWithUserIdAndRoomId(user.id, createdRoom.id);
      await createBookingWithUserIdAndRoomId(user2.id, createdRoom.id);

      const response = await server.post("/booking").send({ roomId: createdRoom.id }).set("Authorization", `Bearer ${token}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        bookingId: expect.any(Number)
      });
    });
  });
});

describe("PUT /booking/:bookingId", () => {
  it("should respond with status 401 if no token given", async () => {
    const response = await server.put("/booking");

    expect(response.status).toBe(401);
  });

  it("should respond with status 401 if give token is not valid", async () => {
    const token = faker.lorem.word();

    const response = await server.put("/booking").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(401);
  });

  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();

    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.put("/booking").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(401);
  });

  describe("When token is valid", () => {
    it("should respond with status 400 if body is invalid", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      const response = await server.put("/booking/0").set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(400);
    });

    it("should respond with status 404 if bookingId is invalid", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      const response = await server.put("/booking/0").send({ roomId: 0 }).set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(404);
    });

    it("should respond with status 404 if no room", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const hotel = await createHotel();
      const room = await createRoomWithHotelId(hotel.id);
      const booking = await createBookingWithUserIdAndRoomId(user.id, room.id);

      const response = await server.put(`/booking/${booking.id}`).send({ roomId: 0 }).set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(404);
    });

    it("should respond with status 403 if room no have capacity", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      const user1 = await createUser();
      const user2 = await createUser();
      const user3 = await createUser();

      const hotel = await createHotel();
      const newHotel = await createHotel();

      const room = await createRoomWithHotelId(hotel.id);
      const newRoom = await createRoomWithHotelId(newHotel.id);

      const booking = await createBookingWithUserIdAndRoomId(user.id, room.id);

      await createBookingWithUserIdAndRoomId(user1.id, newRoom.id);
      await createBookingWithUserIdAndRoomId(user2.id, newRoom.id);
      await createBookingWithUserIdAndRoomId(user3.id, newRoom.id);

      const response = await server.put(`/booking/${booking.id}`).send({ roomId: newRoom.id }).set("Authorization", `Bearer ${token}`);
      
      expect(response.status).toBe(403);
    });

    it("should respond with status 200 and newBooking id", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      const hotel = await createHotel();
      const newHotel = await createHotel();
      const room = await createRoomWithHotelId(hotel.id);
      const newRoom = await createRoomWithHotelId(newHotel.id);

      const booking = await createBookingWithUserIdAndRoomId(user.id, room.id);

      const response = await server.put(`/booking/${booking.id}`).send({ roomId: newRoom.id }).set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
    });
  });
});
