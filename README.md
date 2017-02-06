# daoism
DAOISM is a framework that maps persistent records to appliciaton (JSON) entities and provides customizable common data operations on top of this mapping.
In short: 
<pre>
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
		}
	]
};
var DAO = require('daoism/dao').DAO;
var dao = new DAO(orm);

var id = dao.insert({
              shortText: "aaa"
            });
var entity = dao.find(id);            
var numberOfrecords = dao.count();
var entities = dao.list();
dao.update({
      shortText: "bbb"
    });
dao.remove(id);
</pre>
