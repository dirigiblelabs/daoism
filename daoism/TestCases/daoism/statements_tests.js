/* globals $ */
/* eslint-env node, dirigible */
"use strict";

require('log/loggers').setLevel(6);

var statements = require('daoism/statements').get();

var conn, databaseName;
try{
	conn = require("db/database").getDatasource().getConnection();
	databaseName = conn.internalConnection.getMetaData().getDatabaseProductName();
} finally {
	conn.close();
}
var dialect = require("daoism/dialects/dialects").get().getDialect(databaseName);

//CREATE TABLE'
console.info('---> ' + 'CREATE TABLE');
var stmnt = statements.builder(dialect)
			.createTable('TBL_A')
			.fieldDef({
				dbName: 'A_ID',
				type: 'Int',
				pk: true
			})
			.fieldDef({
				dbName: 'A_NAME',
				type: 'String',
				size: 500
			})		
			.fieldDef({
				dbName: 'A_TEXT',
				type: 'String',
				size: 100
			}); 
console.info(stmnt.toString());
//INSERT
console.info('---> ' + 'INSERT');
stmnt = statements.builder(dialect).insert().into('TBL_A')
		.set({
			name: 'id',
			dbName:'A_ID',
			type: 'Int'
		})
		.set({
			name: 'text',
			dbName:'A_NAME',
			type: 'String'
		})		
		.set({
			name: 'text',
			dbName:'A_TEXT',
			type: 'String'
		}, 'abc');
console.info(stmnt.toString());
console.info('parametric fields: ' + stmnt.toParams().parameters);

//UPDATE
console.info('---> ' + 'UPDATE');
stmnt = statements.builder(dialect)
		.update().table('TBL_A')
		.set({
			name: 'name',
			dbName:'A_NAME',
			type: 'Int'
		})
		.set({
			name: 'text',
			dbName:'A_TEXT',
			type: 'String'
		}, "TEXT+1").where('ID=?', [{name: 'id', dbName: 'A_ID', type: 'Int'}]);
console.info(stmnt.toString());
console.info('parametric fields '+ stmnt.toParams().parameters);

//DELETE
console.info('---> ' + 'DELETE');
stmnt = statements.builder(dialect)
	.delete().from('TBL_A').where('A_ID=?', [{name: 'id', dbName: 'A_ID', type: 'Int'}]);
console.info(stmnt.toString());
console.info('parametric fields: '+ stmnt.toParams().parameters);

//SELECT
console.info('---> ' + 'SELECT');
stmnt = statements.builder(dialect)
	.select().from('TBL_A')
	.field('A_ID', 'id')
	.field('A_NAME')
	.where('A_TEXT LIKE %%?', [{name:'text', dbName:'A_TEXT'}])
	.where('A_TEXT IS NOT NULL')
	.order('A_TEXT')
	.order('A_NAME', false)
	.left_join('A_ID', 'd', 'd.DA_ID=a.A_ID')
	.left_join('OTHER_ID', 'c', 'c.CA_ID=a.A_ID')	
	.limit(10).offset(0);
console.info(stmnt.toString());
console.info('parametric fields: '+ stmnt.toParams().parameters);

//COUNT
console.info('---> ' + 'COUNT');
stmnt = statements.builder(dialect)
	.select().from('TBL_A')
	.field('COUNT(*)');
console.info(stmnt.toString());

//DROP
console.info('---> ' + 'DROP');
stmnt = statements.builder(dialect)
	.dropTable().table('TBL_A');
console.info(stmnt.toString());


//End-to-end statements.execute scenario: create -> select-> drop
console.info('End-to-end scenario: drop -> create -> select-> drop');

var ds = require("db/database").getDatasource();
statements = require('daoism/statements').get();

//cleanup
stmnt = statements.builder(dialect).dropTable().table('TBL_A');
conn = ds.getConnection();
try{
	statements.execute(stmnt, conn);
} catch(err){
	console.error(err);
} finally{
	conn.close();
}

stmnt = statements.builder(dialect).createTable('TBL_A')
		.fieldDef({
			dbName: 'A_ID',
			type: 'Int',
			pk: true
		})
		.fieldDef({
			dbName: 'A_TEXT',
			type: 'String',
			size: 100
		});  
conn = ds.getConnection();
try{
	statements.execute(stmnt, conn);
	console.info('---> Table TBL_A created');
} finally{
	conn.close();
}

stmnt = statements.builder(dialect).select().from('TBL_A').where('A_TEXT LIKE ?', [{name:'text', dbName: 'A_TEXT', type: 'String'}]).limit(10).offset(0);
var params = {};
params['text'] = "abc";
conn = ds.getConnection();
var rs;
try{
	rs = statements.execute(stmnt, conn, params);
	if(rs){
		while(rs.next()){
			console.info(rs.getInt(1));	
		}
	}
} finally{
	if(rs)
		rs.close();
	conn.close();
}

stmnt = statements.builder(dialect).dropTable().table('TBL_A');
conn = ds.getConnection();
try{
	statements.execute(stmnt, conn);
	console.info('---> Table TBL_A dropped');
} finally{
	conn.close();
}
