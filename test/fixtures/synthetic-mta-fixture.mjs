export function createSyntheticFixture() {
  return Object.freeze({
    detainee: {
      id: 'SYN-DET-0001',
      status: 'ACTIVE',
      classification: 'OPERATIONAL',
      provenance: { sourceType: 'MANUAL', verified: true },
    },
    placement: {
      blockId: 'SYN-BLOCK-A',
      roomId: 'SYN-ROOM-01',
      bedId: 'SYN-BED-01',
      active: true,
    },
    exit: {
      id: 'SYN-EXIT-0001',
      state: 'REQUESTED',
      expiresAt: '2099-12-31T23:59:59Z',
    },
    actors: {
      rap: { actorId: 'SYN-RAP-01', role: 'OPERATOR', domain: 'RAP' },
      kamtib: { actorId: 'SYN-KAMTIB-01', role: 'OPERATOR', domain: 'KAMTIB' },
      tu: { actorId: 'SYN-TU-01', role: 'OPERATOR', domain: 'SUBBAG_TU' },
      leadership: { actorId: 'SYN-HEAD-01', role: 'HEAD_RUDENIM', domain: 'LEADERSHIP' },
      perkes: { actorId: 'SYN-PERKES-01', role: 'MEDICAL', domain: 'PERKES' },
    },
  });
}
