import { Event } from "../types";

export function createICalObject(events: Event[]): string {
    let eventsString = ""
    for (let i = 0; i < events.length; i++) {
        eventsString += `${createEvent(events[i])}`;
    }
    return `
    BEGIN:VCALENDAR
    VERSION:2.0
    PRODID:-//czuhajster, tnicko//NONSGML loughborough-eventsync v0.1.0//EN
    ${eventsString}
    END:VCALENDAR
    `
}

function createEvent(event: Event): string {
    const dtstamp = createICalDateTime();
    return `
    BEGIN:VEVENT
    UID:${createUID()}
    DTSTAMP:${dtstamp}
    DTSTART:${formatICalDateTime(event.start)}
    DTEND:${formatICalDateTime(event.end)}
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
    const datetime = formatICalDateTime(date);
    return datetime
}

function formatICalDateTime(date: Date): string {
    const datetime = date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    return datetime
}

export function downloadFile(iCalObject: string, fileName: string = "loughborough-timetable.ics"): void {    
    const contentType = "text/calendar";
    const blob = new Blob([ iCalObject ], { type: contentType });

    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
}