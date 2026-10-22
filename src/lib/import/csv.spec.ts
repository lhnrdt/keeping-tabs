import { describe, expect, it } from 'vitest';
import { parseCsv } from './csv';

describe('parseCsv', () => {
	it('reads plain and quoted fields', () => {
		expect(parseCsv('a,b\r\n"c, d","say ""hi"""\n')).toEqual([
			['a', 'b'],
			['c, d', 'say "hi"']
		]);
	});

	it('keeps line breaks inside quotes, empty fields and a last line without newline', () => {
		expect(parseCsv('﻿"x\ny",,z\n\nlast')).toEqual([['x\ny', '', 'z'], [''], ['last']]);
	});
});
