/* globals $ */
/* eslint-env node, dirigible */
var assert = require('core/assert');

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

var ormTest = require('daoism/orm').get(orm);
console.info('------> Starting orm_tests test suite');
try{
	assert.assertTrue(ormTest.getPrimaryKey()!==undefined, "Failed orm.getPrimaryKey()!==undefined should be true");
	assert.assertTrue(ormTest.getPrimaryKey().name === 'id', "Failed orm.getPrimaryKey().name should be 'id'");
	assert.assertTrue(ormTest.getProperty('text') !== 'undefined', "Failed orm.getProperty()!==undefined should be true");
	assert.assertTrue(ormTest.getMandatoryProperties() !== undefined, "Failed orm.getMandatoryProperties()!==undefined should be true");
	assert.assertTrue(ormTest.getMandatoryProperties().length === 1, "Failed orm.getMandatoryProperties().length===1 should be true");
	assert.assertTrue(ormTest.getOptionalProperties() !== undefined, "Failed orm.getOptionalProperties()!==undefined should be true");
	assert.assertTrue(ormTest.getOptionalProperties().length === 3, "Failed orm.getOptionalProperties().length===3 should be true");
} catch(err){
	console.error(err.message, err);
}

try{
	assert.assertTrue(ormTest.statements.insert() !== undefined, "Failed ormTest.statements.insert()!==undefined check");
	assert.assertEquals("INSERT INTO TBL_A(A_ID, A_TEXT, A_LOCKED, A_CHILD) VALUES(?, ?, ?, ?)", ormTest.statements.insert().toString(), "Failed should be euqal to INSERT INTO TBL_A(A_ID, A_TEXT, A_LOCKED, A_CHILD) VALUES(?, ?, ? , ?)");
	assert.assertTrue(ormTest.statements.insert().toParams().parameters.length === 4, "Failed ormTest.statements.insert().parameters.length === 4 check");
} catch(err){
	console.error(err.message, err);
}
try{
	var entity = {
		text: 'bbb'
	};
	assert.assertTrue(ormTest.statements.update(entity) !== undefined, "Failed ormTest.statements.update()!==undefined check");
	assert.assertEquals("UPDATE TBL_A SET A_TEXT=? WHERE A_ID=?", ormTest.statements.update(entity).toString(), "Failed should be equal to UPDATE TBL_A SET A_TEXT=? WHERE A_ID=?");
	assert.assertTrue(ormTest.statements.update(entity).toParams().parameters.length === 2, "Failed ormTest.statements.update(entity).toParams().parameters.length === 2 check");
} catch(err){
	console.error(err.message, err);
}
try{
	assert.assertTrue(ormTest.statements.delete() !== undefined, "Failed ormTest.statements.delete()!==undefined check");
	assert.assertEquals("DELETE FROM TBL_A WHERE A_ID=?", ormTest.statements.delete().toString(), "Failed should be equal to DELETE FROM TBL_A WHERE A_ID=?");
	assert.assertTrue(ormTest.statements.delete().toParams().parameters.length === 1, "Failed ormTest.statements.delete().toParams().parameters.length === 1 check");
} catch(err){
	console.error(err.message, err);
}
try{
	assert.assertTrue(ormTest.statements.find() !== undefined, "Failed ormTest.statements.find()!==undefined check");
	assert.assertEquals("SELECT * FROM TBL_A WHERE A_ID=?", ormTest.statements.find().toString(), "Failed should be equal to SELECT * FROM TBL_A WHERE A_ID=?");
	assert.assertTrue(ormTest.statements.find().toParams().parameters.length === 1, "Failed ormTest.statements.find().toParams().parameters.length === 1 check");
} catch(err){
	console.error(err.message, err);
}
try{
	assert.assertTrue(ormTest.statements.count() !== undefined, "Failed ormTest.statements.count()!==undefined check");
	assert.assertEquals("SELECT COUNT(*) FROM TBL_A", ormTest.statements.count().toString() , "Failed should be equal to SELECT COUNT(*) FROM TBL_A");
	assert.assertTrue(ormTest.statements.count().toParams().parameters === undefined, "Failed ormTest.statements.count().toParams().parameters.length === undefined check");
} catch(err){
	console.error(err.message, err);
}
try{
	var settings = {};
	assert.assertTrue(ormTest.statements.list(settings) !== undefined, "Failed ormTest.statements.list()!==undefined check");
	assert.assertEquals("SELECT * FROM TBL_A", ormTest.statements.list(settings).toString() , "Failed should be equal to SELECT * FROM TBL_A");
	assert.assertTrue(ormTest.statements.list(settings).toParams().parameters === undefined, "Failed ormTest.statements.list().toParams().parameters.length === undefined check");
} catch(err){
	console.error(err.message, err);
}
try{
	var settings = {
		text: 'abc'
	};
	assert.assertEquals("SELECT * FROM TBL_A WHERE A_TEXT=?", ormTest.statements.list(settings).toString() , "Failed should be equal to SELECT * FROM TBL_A WHERE A_TEXT=?");
	assert.assertTrue(ormTest.statements.list(settings).toParams().parameters.length === 1, "Failed ormTest.statements.list().toParams().parameters.length === 1 check");	
} catch(err){
	console.error(err.message, err);
}
try{
	var settings = {
		'child': 1
	};
	assert.assertEquals("SELECT * FROM TBL_A WHERE A_CHILD=?", ormTest.statements.list(settings).toString() , "Failed should be equal to SELECT * FROM TBL_A WHERE A_CHILD=?");
	assert.assertTrue(ormTest.statements.list(settings).toParams().parameters.length === 1, "Failed ormTest.statements.list().toParams().parameters.length === 1 check");

} catch(err){
	console.error(err.message, err);
}
console.info('------> orm_tests test suite execution finsihed.');