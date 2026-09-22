// Calendar provider abstraction.
// Implementations: MockCalendarProvider (default), GoogleCalendarProvider (stub).

export interface CalendarEvent {
  id: string;
  start: string;
  end: string;
  summary: string;
}

export interface CalendarProvider {
  readonly name: string;
  listEvents(opts: { calendarId?: string; from?: Date; to?: Date }): Promise<CalendarEvent[]>;
  createEvent(opts: {
    calendarId?: string;
    start: Date;
    end: Date;
    summary: string;
    description?: string;
  }): Promise<CalendarEvent>;
  updateEvent(id: string, patch: Partial<CalendarEvent>): Promise<CalendarEvent>;
  deleteEvent(id: string): Promise<void>;
}

export function getCalendarProvider(): CalendarProvider {
  const provider = (process.env.CALENDAR_PROVIDER || "mock").toLowerCase();
  switch (provider) {
    case "google":
      // return new GoogleCalendarProvider();
      return new MockCalendarProvider();
    default:
      return new MockCalendarProvider();
  }
}

export class MockCalendarProvider implements CalendarProvider {
  readonly name = "mock";
  private events = new Map<string, CalendarEvent>();

  async listEvents(): Promise<CalendarEvent[]> {
    return Array.from(this.events.values());
  }

  async createEvent(opts: {
    start: Date;
    end: Date;
    summary: string;
    description?: string;
  }): Promise<CalendarEvent> {
    const id = `evt_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const ev: CalendarEvent = {
      id,
      start: opts.start.toISOString(),
      end: opts.end.toISOString(),
      summary: opts.summary,
    };
    this.events.set(id, ev);
    return ev;
  }

  async updateEvent(id: string, patch: Partial<CalendarEvent>): Promise<CalendarEvent> {
    const ev = this.events.get(id);
    if (!ev) throw new Error("Event not found");
    const updated = { ...ev, ...patch };
    this.events.set(id, updated);
    return updated;
  }

  async deleteEvent(id: string): Promise<void> {
    this.events.delete(id);
  }
}