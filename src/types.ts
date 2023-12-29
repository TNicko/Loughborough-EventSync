export interface Event {
  start: Date
  end: Date
  summary: string
  comment: string
  location: string
}

export interface ScrapedEvent {
  start: string
  end: string
  summary: string
  comment: string
  location: string
}

export type EventResponse = {
  events?: ScrapedEvent[]
  error?: string
}
