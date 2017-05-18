/* globals $ */
/* eslint-env node, dirigible */

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
			type: "String",
			size: 100
		},{
			name: "dateCreated",
			dbName: "CREATED_AT",
			type: "Timestamp"
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
			name: "testNull",
			dbName: "A_LG",
			type: "Long"
		}
	]
};
var DAO = require('daoism/dao').DAO;
var dao = new DAO(orm, 'Test DAO Ctx', require("db/database").getDatasource());

try{
	dao.dropTable();
} catch(err){
}

dao.createTable();

var entity = {
	text: "aaa",
	locked: false,
	testNull: undefined,
	dateCreated: new Date()
};

console.info('-----> Starting DAO tests suite');

try{

	var assert = require('core/assert');

	try{	
		console.info('-----> Test insert');
		entity.id = dao.insert(entity);
		assert.assertTrue(entity.id !== undefined, "Failed entity.id!==undefined should be true");
	} catch(err){
		console.error(err.message+'\r\n'+ err.stack);
	}
	
	try{	
		console.info('-----> Test find('+entity.id+')');
		var _entity = dao.find(entity.id)
		console.info(_entity);
		assert.assertTrue(_entity !== undefined, "Failed _entity!==undefined should be true");
	} catch(err){
		console.error(err.message+'\r\n'+ err.stack);
	}
	
	try{	
		console.info('-----> Test list({limit:10, offset:0})');
		var _entities = dao.list({
						limit:10,
						offset:0
					});
					
		console.info(_entities);
		assert.assertTrue(_entities !== undefined, "Failed _entity!==undefined should be true");
		assert.assertTrue(_entities.length=1, "Failed _entities.length===1 should be true");			
	} catch(err){
		console.error(err.message+'\r\n'+ err.stack);
	}
	
	try{	
		console.info('-----> Test list({limit:10, offset:0, testNull: null})');
		var _entities = dao.list({
						limit:10,
						offset:0,
						testNull: undefined
					});
					
		console.info(_entities);
		assert.assertTrue(_entities !== undefined, "Failed _entity!==undefined should be true");
		assert.assertTrue(_entities.length=1, "Failed _entities.length===1 should be true");			
	} catch(err){
		console.error(err.message+'\r\n'+ err.stack);
	}
	
	try{	
		console.info('-----> Test count()');
		var _count = dao.count();
		assert.assertTrue(_count !== undefined && _count===1, "Failed _count!==undefined && _count===1 should be true");
	} catch(err){
		console.error(err.message+'\r\n'+ err.stack);
	}	

	try{	
		console.info('-----> Test update(...)');
		entity.text = 'bbb';
		dao.update(entity);
		var _entity = dao.find(entity.id);
		console.info(_entity);
		assert.assertTrue(_entity.id === entity.id , "Failed _entity.id === entity.id should be true");
		assert.assertTrue(_entity.text === _entity.text , "Failed _entity.text === _entity.text should be true");		
	} catch(err){
		console.error(err.message+'\r\n'+ err.stack);
	}

	try{	
		console.info('-----> Test remove()');
		dao.remove(entity.id);
		var _entity = dao.find(entity.id);
		assert.assertTrue(_entity===undefined, "Failed _entity===undefined should be true");
	} catch(err){
		console.error(err.message+'\r\n'+ err.stack);
	}	
	
}finally {
	dao.dropTable();
	console.info('-----> Finished DAO tests suite');
}
