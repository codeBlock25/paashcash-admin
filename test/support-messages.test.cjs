const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const file = path.resolve(__dirname, '../lib/support-messages.ts');
const compiled = new Module(file, module);
compiled._compile(
  ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
  }).outputText,
  file,
);
const { mergeMessages, confirmMessage } = compiled.exports;
const pending = {
  id: 'client',
  clientMessageId: 'client',
  body: 'Hello',
  senderKind: 'visitor',
  createdAt: '2026-10-25T10:00:02.000Z',
  delivery: 'sending',
};
const sent = { ...pending, id: 'server', delivery: undefined, readAt: null };
test('a realtime echo arriving before HTTP confirmation replaces the pending bubble once', () => {
  const echoed = mergeMessages([pending], [sent]);
  assert.equal(echoed.length, 1);
  const read = [{ ...echoed[0], readAt: '2026-10-25T10:00:03.000Z' }];
  assert.deepEqual(confirmMessage(read, 'client', sent), read);
});
test('a refresh keeps pending and failed bubbles until the server echoes them', () => {
  const failed = {
    ...pending,
    id: 'failed',
    clientMessageId: 'failed',
    delivery: 'failed',
  };
  const result = mergeMessages([pending, failed], []);
  assert.equal(result.length, 2);
  assert(result.some((m) => m.delivery === 'sending'));
  assert(result.some((m) => m.delivery === 'failed'));
});
test('HTTP confirmation moves sending to sent without waiting for realtime', () => {
  const result = confirmMessage([pending], 'client', sent);
  assert.equal(result[0].id, 'server');
  assert.equal(result[0].delivery, undefined);
});
test('stale HTTP history cannot erase a newer message or older paginated history', () => {
  const older = {
    ...sent,
    id: 'older',
    clientMessageId: null,
    createdAt: '2026-10-25T10:00:01.000Z',
  };
  const newer = {
    ...sent,
    id: 'newer',
    clientMessageId: null,
    createdAt: '2026-10-25T10:00:03.000Z',
  };
  const result = mergeMessages([older, newer], [sent]);
  assert.deepEqual(
    result.map((m) => m.id),
    ['older', 'server', 'newer'],
  );
});
test('a realtime read receipt updates the existing sent bubble', () => {
  const result = mergeMessages(
    [sent],
    [{ ...sent, readAt: '2026-10-25T10:00:03.000Z' }],
  );
  assert.equal(result.length, 1);
  assert(result[0].readAt);
});

test('a stale history response cannot undo a realtime read receipt', () => {
  const read = { ...sent, readAt: '2026-10-25T10:00:03.000Z' };
  assert.equal(mergeMessages([read], [sent])[0].readAt, read.readAt);
});
