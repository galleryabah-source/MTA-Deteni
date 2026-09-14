export class OutboxStore {
  #events = new Map();

  enqueue(event) {
    if (!event.eventId?.trim()) throw new Error('OUTBOX_EVENT_ID_REQUIRED');
    if (this.#events.has(event.eventId)) return { status: 'DUPLICATE', event: this.#events.get(event.eventId) };
    const record = Object.freeze({
      ...event,
      status: 'PENDING',
      attempts: 0,
      availableAt: event.availableAt ?? Date.now(),
      leaseUntil: null,
    });
    this.#events.set(event.eventId, record);
    return { status: 'ENQUEUED', event: record };
  }

  claim(workerId, now = Date.now(), leaseMs = 30_000) {
    for (const event of this.#events.values()) {
      const leaseExpired = event.status === 'PROCESSING' && event.leaseUntil !== null && event.leaseUntil <= now;
      const available = event.status === 'PENDING' || leaseExpired;
      if (!available || event.availableAt > now) continue;
      const claimed = Object.freeze({
        ...event,
        status: 'PROCESSING',
        attempts: event.attempts + 1,
        workerId,
        leaseUntil: now + leaseMs,
      });
      this.#events.set(event.eventId, claimed);
      return claimed;
    }
    return null;
  }

  complete(eventId) {
    const event = this.#events.get(eventId);
    if (!event) throw new Error('OUTBOX_EVENT_NOT_FOUND');
    this.#events.set(eventId, Object.freeze({ ...event, status: 'DELIVERED', leaseUntil: null }));
    return this.#events.get(eventId);
  }

  retry(eventId, availableAt) {
    const event = this.#events.get(eventId);
    if (!event) throw new Error('OUTBOX_EVENT_NOT_FOUND');
    this.#events.set(eventId, Object.freeze({ ...event, status: 'PENDING', availableAt, leaseUntil: null }));
    return this.#events.get(eventId);
  }

  deadLetter(eventId, reason) {
    const event = this.#events.get(eventId);
    if (!event) throw new Error('OUTBOX_EVENT_NOT_FOUND');
    this.#events.set(eventId, Object.freeze({ ...event, status: 'DEAD_LETTER', failureReason: reason, leaseUntil: null }));
    return this.#events.get(eventId);
  }

  get(eventId) { return this.#events.get(eventId) ?? null; }
}
