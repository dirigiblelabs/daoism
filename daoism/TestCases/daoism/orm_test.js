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
			dbValue: function(val, entity){
				return val?1:0;
			},
			value: function(dbValue){
				return dbValue>0?true:false;
			}
		},{
			name: "child",
			dbName: "A_CHILD",
			type: "Int",
			unique: true
		}
	],
	associations: [{
		name: "children",
		joinKey: "child",
		type: "one-to-many"
	}]
};

var ormTest = require('daoism/orm').get(orm);
console.info('------> Starting orm_tests test suite');
try{
	console.info('-----> Test validate');
	assert.assertTrue(ormTest.validate()===undefined, "Failed orm.validate() should not throw errors");
} catch(err){
	console.error(err.message, err);
}
try{	
	console.info('-----> Test getPrimaryKey');
	assert.assertTrue(ormTest.getPrimaryKey()!==undefined, "Failed orm.getPrimaryKey()!==undefined should be true");
	assert.assertTrue(ormTest.getPrimaryKey().name === 'id', "Failed orm.getPrimaryKey().name should be 'id'");
} catch(err){
	console.error(err.message, err);
}	
try{	
	console.info('-----> Test getProperty');
	assert.assertTrue(ormTest.getProperty('text') !== 'undefined', "Failed orm.getProperty()!==undefined should be true");
} catch(err){
	console.error(err.message, err);
}		
try{	
	console.info('-----> Test getMandatoryProperties');
	assert.assertTrue(ormTest.getMandatoryProperties() !== undefined, "Failed orm.getMandatoryProperties()!==undefined should be true");
	assert.assertTrue(ormTest.getMandatoryProperties().length === 1, "Failed orm.getMandatoryProperties().length===1 should be true");
} catch(err){
	console.error(err.message, err);
}		
try{	
	console.info('-----> Test getOptionalProperties');
	assert.assertTrue(ormTest.getOptionalProperties() !== undefined, "Failed orm.getOptionalProperties()!==undefined should be true");
	assert.assertTrue(ormTest.getOptionalProperties().length === 3, "Failed orm.getOptionalProperties().length===3 should be true");
} catch(err){
	console.error(err.message, err);
}		
try{	
	console.info('-----> Test getUniqueProperties');
	assert.assertTrue(ormTest.getUniqueProperties() !== undefined, "Failed orm.getUniqueProperties()!==undefined should be true");
	assert.assertTrue(ormTest.getUniqueProperties().length === 1, "Failed orm.getUniqueProperties().length===1 should be true");	
} catch(err){
	console.error(err.message, err);
}	
try{	
	console.info('-----> Test getAssociationNames');
	assert.assertTrue(ormTest.getAssociationNames().length === 1, "Failed orm.getAssociationNames().length===1 should be true");
} catch(err){
	console.error(err.message, err);
}
try{	
	console.info('-----> Test getAssociation');
	assert.assertTrue(ormTest.getAssociation('children') !== undefined, "Failed orm.getAssociation('children')!==undefined should be true");
} catch(err){
	console.error(err.message, err);
}

console.info('------> orm_tests test suite execution finsihed.');
