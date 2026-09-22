import { prisma } from "@/lib/db";
import { getTenantContext } from "@/lib/auth/tenant";
import { ok, serverError, handleZodError } from "@/lib/api";
import { sendMessageSchema, createMessageSchema } from "@/validators";
import { getMessagingProvider } from "@/lib/messaging/provider";

export async function GET(req: Request) {
  try {
    const ctx = await getTenantContext();
    const { searchParams } = new URL(req.url);
    const channel = searchParams.get("channel");

    const conversations = await prisma.conversation.findMany({
      where: {
        clinicId: ctx.clinicId,
        ...(channel && channel !== "all" ? { channel: channel as any } : {}),
      },
      include: {
        messages: { orderBy: { createdAt: "asc" } },
        patient: true,
      },
      orderBy: { lastMessageAt: "desc" },
    });
    return ok(conversations);
  } catch (e) {
    return serverError((e as Error).message);
  }
}

export async function POST(req: Request) {
  try {
    const ctx = await getTenantContext();
    const body = await req.json();

    // Two modes: send to existing conversation, or start a new one.
    if (body.conversationId) {
      const data = sendMessageSchema.parse(body);
      const convo = await prisma.conversation.findFirst({
        where: { id: data.conversationId, clinicId: ctx.clinicId },
      });
      if (!convo) return ok({ error: "Conversation not found" }, 404);

      const provider = getMessagingProvider();
      const msg = await provider.send({
        to: convo.patientPhone ?? "",
        body: data.body,
        channel: convo.channel as "SMS" | "WHATSAPP" | "EMAIL",
      });

      const message = await prisma.message.create({
        data: {
          conversationId: convo.id,
          patientId: convo.patientId,
          channel: convo.channel,
          direction: "outbound",
          body: data.body,
          status: msg.status,
          senderKind: data.senderKind,
        },
      });
      await prisma.conversation.update({
        where: { id: convo.id },
        data: { lastMessageAt: new Date(), unread: 0 },
      });
      return ok(message, 201);
    }

    // New conversation
    const data = createMessageSchema.parse(body);
    const provider = getMessagingProvider();
    const msg = await provider.send({
      to: data.patientPhone ?? "",
      body: data.body,
      channel: data.channel,
    });

    const convo = await prisma.conversation.create({
      data: {
        clinicId: ctx.clinicId,
        patientId: data.patientId ?? null,
        patientName: data.patientName,
        patientPhone: data.patientPhone,
        channel: data.channel,
        lastMessageAt: new Date(),
      },
    });
    const message = await prisma.message.create({
      data: {
        conversationId: convo.id,
        patientId: data.patientId ?? null,
        channel: data.channel,
        direction: "outbound",
        body: data.body,
        status: msg.status,
        senderKind: "staff",
      },
    });
    return ok({ conversation: convo, message }, 201);
  } catch (e) {
    return handleZodError(e);
  }
}