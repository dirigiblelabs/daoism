# DAOism
When you face the need to persist your application model entities, you inevitably end up with persistence routines for the common _Create_, _Read_, _Update_ and _Delete_ (CRUD) type of operations. And before long you will realize that these are actually quite similar between different entities, i.e. they are very generic in nature if you start thinking in a little higher level abstractions such as types and identifiers, instead of concrete entities and properties. JavaScript happens to be very good at realizing this into application model. So, instead of copying the same routine for each entity, it's natural to abstract into a framework that can handle entities persistence into data records and back to entities in a generic way. That's what **DAOism** is about.

In a nutshell, **DAOism** knows how to handle the CRUD operations on an entity, plus some extras, based on a minimal configuration that you feed it to specify, which are the persistent entity properties and how they map to data records. You can also customize it on different levels to get your favorite style of DAOs. 

Example: 
<pre>
//DAO configuration
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

//Get a DAO instance with this configuration
var dao = require('daoism/dao').get(orm);

//Invoke CRUD ops on the DAO instance
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
