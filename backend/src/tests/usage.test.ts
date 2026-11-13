import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createStore } from '../store/store';
import { classifyQuantity, clearEvents, ingestEvent } from '../services/usage.service';

test('classifyQuantity accepts positive numbers and numeric strings', () => {
  assert.deepEqual(classifyQuantity(500), { ok: true, quantity: 500 });
  assert.deepEqual(classifyQuantity('250'), { ok: true, quantity: 250 });
});

test('classifyQuantity rejects missing and malformed quantities', () => {
  assert.equal(classifyQuantity(undefined).ok, false);
  assert.equal(classifyQuantity('   ').ok, false);
  assert.equal(classifyQuantity('missing').ok, false);
  assert.equal(classifyQuantity('malformed_payload').ok, false);
  assert.equal(classifyQuantity(-5).ok, false);
});

test('ingestEvent is idempotent — duplicate ids are never metered twice', () => {
  const store = createStore({ persist: false });
  const meterBefore = store.data.meters.find((m) => m.id === 'api_requests')!.used;

  const first = ingestEvent(store, {
    id: 'evt_idem_1',
    customer: 'Acme',
    resource: 'API requests',
    quantity: 100,
  });
  assert.equal(first.event.status, 'Accepted');
  assert.equal(first.metered, true);

  const meterAfterFirst = store.data.meters.find((m) => m.id === 'api_requests')!.used;
  assert.equal(meterAfterFirst, meterBefore + 100);

  const second = ingestEvent(store, {
    id: 'evt_idem_1',
    customer: 'Acme',
    resource: 'API requests',
    quantity: 100,
  });
  assert.equal(second.event.status, 'Duplicate, ignored');
  assert.equal(second.metered, false);

  const meterAfterSecond = store.data.meters.find((m) => m.id === 'api_requests')!.used;
  assert.equal(meterAfterSecond, meterAfterFirst, 'meter must not advance on duplicate');
});

test('rejected events are logged but never metered', () => {
  const store = createStore({ persist: false });
  const meterBefore = store.data.meters.find((m) => m.id === 'storage')!.used;

  const result = ingestEvent(store, {
    id: 'evt_bad_1',
    customer: 'Globex',
    resource: 'Storage',
    quantity: 'not-a-number',
  });

  assert.equal(result.event.statusCategory, 'rejected');
  assert.equal(result.metered, false);
  const meterAfter = store.data.meters.find((m) => m.id === 'storage')!.used;
  assert.equal(meterAfter, meterBefore);
});

test('clearEvents resets the log but preserves idempotency history', () => {
  const store = createStore({ persist: false });
  ingestEvent(store, {
    id: 'evt_keep_1',
    customer: 'Acme',
    resource: 'API requests',
    quantity: 10,
  });

  clearEvents(store);
  assert.equal(store.data.events.length, 0);

  const replay = ingestEvent(store, {
    id: 'evt_keep_1',
    customer: 'Acme',
    resource: 'API requests',
    quantity: 10,
  });
  assert.equal(replay.event.status, 'Duplicate, ignored');
});
