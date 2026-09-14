const STATES = new Set(['PENDING', 'PROCESSING', 'SUCCEEDED', 'RETRY', 'DEAD_LETTER', 'CANCELLED']);

export class OutboxStore {
  #events = new Map();

  enqueue(event) {
    if (!event.eventId?.trim()) throw new Error('OUTBOX_EVENT_ID_REQUIRED');
    if (!event.eventType?.trim() || !event.aggregateType?.trim() || !event.aggregateId?.trim()) throw new Error('OUTBOX_EVENT_CONTRACT_INVALID');
    if (!event.correlationId?.trim() || !event.payloadVersion?.trim()) throw new Error('OUTBOX_METADATA_REQUIRED');
    if (this.#events.has(event.eventId)) return { status: 'DUPLICATE', event: this.#events.get(event.eventId) };
    const record = Object.freeze({ ...event, status: 'PENDING', attemptCount: 0, availableAt: event.availableAt ?? Date.now(), createdAt: event.createdAt ?? new Date().toISOString(), leaseUntil: null, leaseOwner: null });
    this.#events.set(event.eventId, record);
    return { status: 'ENQUEUED', event: record };
  }

  claim(workerId, now = Date.now(), leaseMs = 30_000) {
    for (const event of this.#events.values()) {
      const leaseExpired = event.status === 'PROCESSING' && event.leaseUntil !== null && event.leaseUntil <= now;
      const available = event.status === 'PENDING' || event.status === 'RETRY' || leaseExpired;
      if (!available || event.availableAt > now) continue;
      const claimed = Object.freeze({ ...event, status: 'PROCESSING', attemptCount: event.attemptCount + 1, leaseOwner: workerId, leaseUntil: now + leaseMs });
      this.#events.set(event.eventId, claimed);
      return claimed;
    }
    return null;
  }

  complete(eventId, workerId) {
    const event = this.#events.get(eventId);
    if (!event) throw new Error('OUTBOX_EVENT_NOT_FOUND');
    if (event.status !== 'PROCESSING' || event.leaseOwner !== workerId) throw new Error('OUTBOX_LEASE_REQUIRED');
    const completed = Object.freeze({ ...event, status: 'SUCCEEDED', leaseUntil: null, leaseOwner: null });
    this.#events.set(eventId, completed);
    return completed;
  }

  retry(eventId, availableAt, workerId) {
    const event = this.#events.get(eventId);
    if (!event) throw new Error('OUTBOX_EVENT_NOT_FOUND');
    if (event.status !== 'PROCESSING' || event.leaseOwner !== workerId) throw new Error('OUTBOX_LEASE_REQUIRED');
    const retry = Object.freeze({ ...event, status: 'RETRY', availableAt, leaseUntil: null, leaseOwner: null });
    this.#events.set(eventId, retry);
    return retry;
  }

  deadLetter(eventId, reason, workerId) {
    const event = this.#events.get(eventId);
    if (!event) throw new Error('OUTBOX_EVENT_NOT_FOUND');
    if (event.status !== 'PROCESSING' || event.leaseOwner !== workerId) throw new Error('OUTBOX_LEASE_REQUIRED');
    const dead = Object.freeze({ ...event, status: 'DEAD_LETTER', failureReason: reason, leaseUntil: null, leaseOwner: null });
    this.#events.set(eventId, dead);
    return dead;
  }

  get(eventId) { return this.#events.get(eventId) ?? null; }
  states() { return [...this.#events.values()].map((event) => event.status); }
  static isValidState(state) { return STATES.has(state); }
}
