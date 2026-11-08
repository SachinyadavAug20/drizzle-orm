import { describe, expect, it } from 'vitest';
import { sql } from '~/sql/sql.ts';
import { customType, pgTable, text } from '~/pg-core/index.ts';
import { PgDialect } from '~/pg-core/dialect.ts';

const customLower = customType<{ data: string }>({
	dataType() {
		return 'text';
	},
	selectFromDb(column) {
		return sql`lower(${column})`;
	},
});

const testTable = pgTable('test_table', {
	id: text('id').primaryKey(),
	title: customLower('title'),
});

describe('customType selectFromDb SQL wrapping', () => {
	it('wraps column in custom SQL on select in PgDialect', () => {
		const dialect = new PgDialect();
		const querySql = dialect.buildSelectQuery({
			table: testTable,
			fields: {
				id: testTable.id,
				title: testTable.title,
			},
			fieldsFlat: [
				{ path: ['id'], field: testTable.id },
				{ path: ['title'], field: testTable.title },
			],
		});

		const query = dialect.sqlToQuery(querySql);
		expect(query.sql).toContain('lower("title") as "title"');
	});
});
