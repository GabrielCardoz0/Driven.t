import Joi from "joi";

export const roomIdSchema = Joi.object({
  roomId: Joi.number().required()
});
