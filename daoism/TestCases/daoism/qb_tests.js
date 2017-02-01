/* globals $ */
/* eslint-env node, dirigible */
"use strict";

var statements = require('daoism/statements');

//INSERT
console.info('---> ' + 'INSERT');
var qb = statements.getQueryBuilder();
var q = qb.insert().from('TBL_A')
		.set({
			name: 'id',
			dbName:'ID'
		})
		.set({
			name: 'text',
			dbName:'TEXT'
		});
console.info(q.toString());

//UPDATE
console.info('---> ' + 'UPDATE');
qb = statements.getQueryBuilder();
q = qb.update().from('TBL_A')
	.set({
		name: 'name',
		dbName:'NAME'
	})
	.set({
		name: 'text',
		dbName:'TEXT'
	}, "text+1").where('ID=?', [{name: 'id', dbName: 'ID'}]);
console.info(q.toString());
console.info(q.toParams().parameters.length);

//DELETE
console.info('---> ' + 'DELETE');
qb = statements.getQueryBuilder();
q = qb['delete']().from('TBL_A').where('ID=?', [{name: 'id', dbName: 'ID'}]);
console.info(q.toString());
console.info(q.toParams().parameters.length);

//SELECT
console.info('---> ' + 'SELECT');
qb = statements.getQueryBuilder();
q = qb.select().from('TBL_A')
	.field('ID', 'id')
	.field('NAME')
	.where('TEXT LIKE %%?', [{name:'text', dbName:'TEXT'}])
	.where('TEXT IS NOT NULL')
	.order('TEXT')
	.order('NAME', false)
	.left_join('ID', 'd', 'd.id=b.id')
	.left_join('OTHER_ID', 'c', 'c.id=b.id')	
	.limit(10).offset(0);
console.info(q.toString());
console.info(q.toParams().parameters.length === 1);

qb = statements.getQueryBuilder();
q = qb.select().from('TBL_A')
	.field('COUNT(*)');
console.info(q.toString());

var ds = require("db/database").getDatasource();
var Statements = require('daoism/statements').Statements;
statements = new Statements();
qb = statements.builder().select().from('TBL_A').where('NAME>?', [{name:'name', dbName: 'NAME'}]).limit(10).offset(0);
var params = {};
params['name'] = 50;
var conn = ds.getConnection();
var rs;
try{
	rs = statements.execute(qb, conn, params);
	while(rs.next()){
		console.info(rs.getInt(1));	
	}
} finally{
	if(rs)
		rs.close();
	conn.close();
}
