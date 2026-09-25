export type AiAcceleratorSuggestion = Readonly<{
  field: string;
  value: string;
  source: 'DETERMINISTIC';
  confidence: 1;
}>;

const EVENT_LABELS: Readonly<Record<string, string>> = Object.freeze({
  PEMERIKSAAN: 'Pemeriksaan',
  PENGAWALAN: 'Pengawalan',
  PERGERAKAN: 'Pergerakan',
  APEL_HEADCOUNT: 'Apel / Headcount',
  KUNJUNGAN: 'Kunjungan',
  KEAMANAN: 'Keamanan',
  PELAYANAN: 'Pelayanan',
  KEJADIAN: 'Kejadian',
  LAINNYA: 'Lainnya',
});

export function deterministicAiAccelerator(input: Readonly<{
  eventType: string;
  capturedAt: string;
  actorId: string;
  location?: string;
  rawNote?: string;
}>): readonly AiAcceleratorSuggestion[] {
  const eventLabel = EVENT_LABELS[input.eventType] ?? 'Lainnya';
  const suggestions: AiAcceleratorSuggestion[] = [
    { field: 'eventLabel', value: eventLabel, source: 'DETERMINISTIC', confidence: 1 },
    { field: 'capturedAt', value: input.capturedAt, source: 'DETERMINISTIC', confidence: 1 },
    { field: 'actorId', value: input.actorId, source: 'DETERMINISTIC', confidence: 1 },
  ];
  if (input.location) suggestions.push({ field: 'location', value: input.location, source: 'DETERMINISTIC', confidence: 1 });
  if (input.rawNote) suggestions.push({ field: 'narrative', value: input.rawNote.trim(), source: 'DETERMINISTIC', confidence: 1 });
  return Object.freeze(suggestions);
}
