# daoism
DAOISM is a framework mapping persistent records to application (JSON) entities to provide customizable common data operations for this entity.

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

var dao = require('daoism/dao').get(orm);

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
