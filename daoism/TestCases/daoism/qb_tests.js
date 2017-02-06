/* globals $ */
/* eslint-env node, dirigible */
"use strict";

var statements = require('daoism/statements').get();

//CREATE TABLE'
console.info('---> ' + 'CREATE TABLE');
var qb = statements.builder().createTable('TBL_A')
		.fieldDef({
			name: 'ID',
			type: 'INTEGER',
			pk: true
		})
		.fieldDef({
			name: 'TEXT',
			type: 'VARCHAR',
			size: 100
		}); 
console.info(qb.toString());
//INSERT
console.info('---> ' + 'INSERT');
qb = statements.builder().insert().into('TBL_A')
		.set({
			name: 'id',
			dbName:'ID',
			type: 'Int'
		})
		.set({
			name: 'text',
			dbName:'TEXT',
			type: 'String'
		}, 'abc');
console.info(qb.toString());
console.info('parametric fields: ' + qb.toParams().parameters);

//UPDATE
console.info('---> ' + 'UPDATE');
qb = statements.builder()
		.update().table('TBL_A')
		.set({
			name: 'name',
			dbName:'NAME',
			type: 'Int'
		})
		.set({
			name: 'text',
			dbName:'TEXT',
			type: 'String'
		}, "TEXT+1").where('ID=?', [{name: 'id', dbName: 'ID', type: 'Int'}]);
console.info(qb.toString());
console.info('parametric fields '+ qb.toParams().parameters);

//DELETE
console.info('---> ' + 'DELETE');
qb = statements.builder()
	.delete().from('TBL_A').where('ID=?', [{name: 'id', dbName: 'ID', type: 'Int'}]);
console.info(qb.toString());
console.info('parametric fields: '+ qb.toParams().parameters);

//SELECT
console.info('---> ' + 'SELECT');
qb = statements.builder()
	.select().from('TBL_A')
	.field('ID', 'id')
	.field('NAME')
	.where('TEXT LIKE %%?', [{name:'text', dbName:'TEXT'}])
	.where('TEXT IS NOT NULL')
	.order('TEXT')
	.order('NAME', false)
	.left_join('ID', 'd', 'd.id=b.id')
	.left_join('OTHER_ID', 'c', 'c.id=b.id')	
	.limit(10).offset(0);
console.info(qb.toString());
console.info('parametric fields: '+ qb.toParams().parameters);

//COUNT
console.info('---> ' + 'COUNT');
qb = statements.builder()
	.select().from('TBL_A')
	.field('COUNT(*)');
console.info(qb.toString());

//DROP
console.info('---> ' + 'DROP');
qb = statements.builder()
	.dropTable().table('TBL_A');
console.info(qb.toString());

//End-to-end scenario: create -> select-> drop
console.info('End-to-end scenario: drop -> create -> select-> drop');

var ds = require("db/database").getDatasource();
statements = require('daoism/statements').get();

qb = statements.builder().dropTable().table('TBL_A');
var conn = ds.getConnection();
try{
	statements.execute(qb, conn);
} catch(err){
	console.error(err);
}finally{
	conn.close();
}

qb = statements.builder()
	.createTable().table('TBL_A')
	.fieldDef({
		name: 'ID',
		type: 'INTEGER',
		pk: true
	})
	.fieldDef({
		name: 'TEXT',
		type: 'VARCHAR',
		size: 100
	}); 
conn = ds.getConnection();
try{
	statements.execute(qb, conn);
} finally{
	conn.close();
}

qb = statements.builder().select().from('TBL_A').where('TEXT=?', [{name:'text', dbName: 'TEXT', type: 'String'}]).limit(10).offset(0);
var params = {};
params['text'] = "abc";
conn = ds.getConnection();
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

qb = statements.builder().dropTable().table('TBL_A');
conn = ds.getConnection();
try{
	statements.execute(qb, conn);
} finally{
	conn.close();
}