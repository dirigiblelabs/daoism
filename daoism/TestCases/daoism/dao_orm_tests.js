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
			name: "locked",
			dbName: "A_LOCKED",
			type: "Short",
			dbValue: function(entity, properties, property){
				return entity.locked?1:0;
			},
			value: function(dbValue){
				return dbValue>0?true:false;
			}
		}
	]
};
var DAO = require('daoism/dao').DAO;
var dao = new DAO(orm, 'Test DAO Ctx', require("db/database").getDatasource());

dao.createTable();

var entity = {
	shortText: "aaa",
	locked: false
};

entity.id = dao.insert(entity);

console.info(dao.find(entity.id));
console.info(dao.list({
	limit:10,
	offset:0
}));

dao.count();

entity.shortText = 'bbb';
dao.update(entity);
console.info(dao.find(entity.id));

dao.remove(entity.id);

dao.dropTable();