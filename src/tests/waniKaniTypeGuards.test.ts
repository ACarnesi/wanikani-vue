import { describe, expect, it } from 'vitest';
import { isStudyMaterial } from '../@types/waniKaniTypeGuards';

describe('isStudyMaterial', () =>
{
    it('returns true for a valid study material payload', () =>
    {
        const value = {
            createdAt: '2024-01-01T00:00:00.000Z',
            subjectId: 42,
            subjectType: 'kanji',
            meaningSynonyms: ['example note'],
            readingNote: 'reading note',
            meaningNote: 'synonym',
            hidden: false,
        };

        expect(isStudyMaterial(value)).toBe(true);
    });

    it('returns false when a required field is invalid', () =>
    {
        const value = {
            createdAt: '2024-01-01T00:00:00.000Z',
            subjectId: 42,
            subjectType: 'kanji',
            meaningSynonyms: 'not-an-array',
            meaningNote: 'synonym',
            readingNote: 'reading note',
        };

        expect(isStudyMaterial(value)).toBe(false);
    });
});
