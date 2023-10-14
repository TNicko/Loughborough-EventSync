function createICalObject(events: string): string {
    return `
    BEGIN:VCALENDAR
    VERSION:2.0
    PRODID:-//czuhajster, tnicko//NONSGML loughborough-eventsync v0.1.0//EN
    ${events}
    END:VCALENDAR
    `
}

function createEvent(event: object): string {
    const dtstamp = createICalDateTime();
    return `
    BEGIN:VEVENT
    UID:${createUID()}
    DTSTAMP:${dtstamp}
    DTSTART:${event.start}
    DTEND:${event.end}
    SUMMARY:${event.summary}
    COMMENT:${event.comment}
    LOCATION:${event.location}
    END:VEVENT
    `
}

function createUID(): string {
    const datetime = createICalDateTime();
    const uuid = self.crypto.randomUUID();
    const UID = `${datetime}-${uuid}@loughborough-eventsync.com`
    return UID;
}

function createICalDateTime(): string {
    const date = new Date();
    const datetime = date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    return datetime
}