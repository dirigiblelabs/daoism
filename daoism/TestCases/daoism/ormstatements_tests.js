/* globals $ */
/* eslint-env node, dirigible */

var assert = require('core/assert');

require('log/loggers').setLevel(6);

var orm = {
	dbName: "TBL_A",
	properties: [
		{
			name: "id",
			dbName: "A_ID",
			id: true,
			required: true,
			type: "Long"
		},{
			name: "text",
			dbName: "A_TEXT",
			type: "String"
		},{
			name: "locked",
			dbName: "A_LOCKED",
			type: "Short",
			dbValue: function(entity, properties, property){
				return entity.locked?1:0;
			},
			value: function(dbValue){
				return dbValue>0?true:false;
			}
		},{
			name: "child",
			dbName: "A_CHILD",
			type: "Int"
		}
	],
	associationSets: {
		"children": {
			joinKey: "child",
			associationType: "one-to-many"
		}
	}
};

console.info('-----> Starting ormstatements_tests test suite');

var ormLib = require("daoism/orm").get(orm);
var ds = require("db/database").getDatasource();
var ormstatements = require('daoism/ormstatements').forDatasource(ormLib, ds);

try{
	console.info('-----> Test insert');
	var stmnts = ormstatements.insert();
	assert.assertTrue(stmnts !== undefined, "Failed ormstatements.insert()!==undefined check");
	assert.assertEquals("INSERT INTO TBL_A(A_ID, A_TEXT, A_LOCKED, A_CHILD) VALUES(?, ?, ?, ?)", stmnts.toString(), "Failed should be euqal to INSERT INTO TBL_A(A_ID, A_TEXT, A_LOCKED, A_CHILD) VALUES(?, ?, ? , ?)");
	assert.assertTrue(stmnts.toParams().parameters.length === 4, "Failed ormstatements.insert().parameters.length === 4 check");
} catch(err){
	console.error(err.message, err);
}
try{
	console.info('-----> Test update');
	var entity = {
		text: 'bbb'
	};
	var stmnts = ormstatements.update(entity);
	assert.assertTrue(stmnts !== undefined, "Failed ormstatements.update()!==undefined check");
	assert.assertEquals("UPDATE TBL_A SET A_TEXT=? WHERE A_ID=?", stmnts.toString(), "Failed should be equal to UPDATE TBL_A SET A_TEXT=? WHERE A_ID=?");
	assert.assertTrue(stmnts.toParams().parameters.length === 2, "Failed ormstatements.update(entity).toParams().parameters.length === 2 check");
} catch(err){
	console.error(err.message, err);
}
try{
	console.info('-----> Test find');
	var stmnts = ormstatements.find();
	assert.assertTrue(stmnts !== undefined, "Failed ormstatements.find()!==undefined check");
	assert.assertEquals("SELECT * FROM TBL_A WHERE A_ID=?", stmnts.toString(), "Failed should be equal to SELECT * FROM TBL_A WHERE A_ID=?");
	assert.assertTrue(stmnts.toParams().parameters.length === 1, "Failed ormstatements.find().toParams().parameters.length === 1 check");
} catch(err){
	console.error(err.message, err);
}
try{
	console.info('-----> Test count');
	var stmnts = ormstatements.count();
	assert.assertTrue(stmnts !== undefined, "Failed ormstatements.count()!==undefined check");
	assert.assertEquals("SELECT COUNT(*) FROM TBL_A", stmnts.toString() , "Failed should be equal to SELECT COUNT(*) FROM TBL_A");
	assert.assertTrue(stmnts.toParams().parameters === undefined, "Failed ormstatements.count().toParams().parameters.length === undefined check");
} catch(err){
	console.error(err.message, err);
}
try{
	console.info('-----> Test list all');
	var stmnts = ormstatements.list({});
	assert.assertTrue(stmnts !== undefined, "Failed ormstatements.list()!==undefined check");
	assert.assertEquals("SELECT * FROM TBL_A", stmnts.toString() , "Failed should be equal to SELECT * FROM TBL_A");
	assert.assertTrue(stmnts.toParams().parameters === undefined, "Failed ormstatements.list().toParams().parameters.length === undefined check");
} catch(err){
	console.error(err.message, err);
}
try{
	console.info('-----> Test list with filter');
	var stmnts = ormstatements.list({
		text: 'abc'
	});
	assert.assertEquals("SELECT * FROM TBL_A WHERE A_TEXT=?", stmnts.toString() , "Failed should be equal to SELECT * FROM TBL_A WHERE A_TEXT=?");
	assert.assertTrue(stmnts.toParams().parameters.length === 1, "Failed ormstatements.list().toParams().parameters.length === 1 check");	
} catch(err){
	console.error(err.message, err);
}
try{
	console.info('-----> Test list with filter');
	var stmnts = ormstatements.list({
		'child': 1
	});
	assert.assertEquals("SELECT * FROM TBL_A WHERE A_CHILD=?",stmnts.toString() , "Failed should be equal to SELECT * FROM TBL_A WHERE A_CHILD=?");
	assert.assertTrue(stmnts.toParams().parameters.length === 1, "Failed ormstatements.list().toParams().parameters.length === 1 check");

} catch(err){
	console.error(err.message, err);
}
try{
	console.info('-----> Test remove');
	var stmnts = ormstatements.remove();
	assert.assertTrue(stmnts !== undefined, "Failed ormstatements.delete()!==undefined check");
	assert.assertEquals("DELETE FROM TBL_A WHERE A_ID=?", stmnts.toString(), "Failed should be equal to DELETE FROM TBL_A WHERE A_ID=?");
	assert.assertTrue(stmnts.toParams().parameters.length === 1, "Failed ormstatements.delete().toParams().parameters.length === 1 check");
} catch(err){
	console.error(err.message, err);
}

console.info('-----> ormstatements_tests test suite finished');