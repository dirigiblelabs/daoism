/* globals $ */
/* eslint-env node, dirigible */
var userLib = require("net/http/user");
var DAO = require('daoism/orm').DAO;

var orm = {
	dbName: "DIS_BOARD",
	properties: [
		{
			name: "id",
			dbName: "DISB_ID",
			id: true,
			required: true,
			type: "Long"
		},{
			name: "shortText",
			dbName: "DISB_SHORT_TEXT",
			type: "String"
		},{
			name: "description",
			dbName: "DISB_DESCRIPTION",
			type: "String"
		},{
			name: "publishTime",
			dbName: "DISB_PUBLISH_TIME",
			required: true,
			type: "Long",
			dbValue: function(entity, properties, property){
				return new Date(entity.publishTime).getTime();
			},
			value: function(dbValue){
				return new Date(dbValue).toISOString();
			}
		},{
			name: "lastModifiedTime",
			dbName: "DISB_LASTMODIFIED_TIME",
			type: "Long",
			dbValue: function(entity, properties, property){
				return new Date(entity.lastModifiedTime).getTime();
			},
			value: function(dbValue){
				if(dbValue!==null)
    				return new Date(dbValue).toISOString();
    			return null;
			}
		},{
			name: "status",
			dbName: "DISB_STATUS",
			type: "String"
		},{
			name: "locked",
			dbName: "DISB_LOCKED",
			type: "Short",
			dbValue: function(entity, properties, property){
				return entity.locked?1:0;
			},
			value: function(dbValue){
				return dbValue>0?true:false;
			}
		},{
			name: "user",
			dbName: "DISB_USER",
			type: "String"
		}
	],
	associationSets: associations
};

var associations = {
	comments: {
		dao: require("discussion_boards/lib/comment_dao"),
		joinKey: "boardId"
	},
	tags: {
		dao: require("discussion_boards/lib/board_tags"),
		joinKey: "boardId"
	}
};


var dao = new DAO(orm);
dao.afterInsert = function(entity){
	console.error('>>>>>>>>');
}
var entity = {
	shortText: "aaa",
	publishTime: Date.now(),
	user: require("net/http/user").getName()
};

/*var database = require("db/database");
var datasource = database.getDatasource();
var sqlCreateTable = "CREATE TABLE TEST_DAOISM_A" +
                   "(id INTEGER not NULL, " +
                   " first VARCHAR(255), " + 
                   " last VARCHAR(255), " + 
                   " age INTEGER, " + 
                   " PRIMARY KEY ( id ))
*/

entity.id = dao.insert(entity);
entity.publishTime = Date.now();
console.info(dao.find(entity.id));
console.info(dao.list({
	limit:10,
	offset:0
}));
dao.count();
dao.update(entity);
dao.remove(entity.id);
