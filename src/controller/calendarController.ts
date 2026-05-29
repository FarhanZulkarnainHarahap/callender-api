import type { Request, Response } from "express";
import { buildCalendar, buildDay, parseDate, saveDayDescription } from "../service/calendarService.js";

export async function healthController(_request: Request, response: Response) {
  response.json({ ok: true, service: "season-calendar-api" });
}

export async function calendarController(request: Request, response: Response) {
  const year = Number.parseInt(request.query.year?.toString() ?? "", 10);
  const month = Number.parseInt(request.query.month?.toString() ?? "", 10);
  const selectedDate = request.query.selectedDate?.toString();

  response.json(
    await buildCalendar({
      year: Number.isFinite(year) ? year : undefined,
      month: Number.isFinite(month) ? month : undefined,
      selectedDate
    })
  );
}

export async function dayController(request: Request, response: Response) {
  const date = Array.isArray(request.params.date) ? request.params.date[0] : request.params.date;
  response.json(await buildDay(parseDate(date)));
}

export async function saveDescriptionController(request: Request, response: Response) {
  const date = Array.isArray(request.params.date) ? request.params.date[0] : request.params.date;
  const content = request.body?.content;

  if (typeof content !== "string") {
    response.status(400).json({ message: "content wajib berupa string" });
    return;
  }

  if (content.length > 500) {
    response.status(400).json({ message: "content maksimal 500 karakter" });
    return;
  }

  response.json(await saveDayDescription(date, content));
}
