import {describe, expect, it} from 'vitest';
import {formatDate} from '../lib/data';
describe('date presentation',()=>{
  it('formats as British English at UTC',()=>expect(formatDate('2026-11-07T01:00:00Z')).toBe('7 Nov 2026'));
  it('labels unknown source data',()=>expect(formatDate(null)).toBe('Unavailable'));
});
