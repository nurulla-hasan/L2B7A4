import { prisma } from "../../lib/prisma";

interface IContactMessage {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const createMessageIntoDB = async (data: IContactMessage) => {
  const result = await prisma.contactMessage.create({
    data,
  });
  return result;
};

export const contactService = {
  createMessageIntoDB,
};
