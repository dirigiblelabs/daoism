# DAOism
When you face the need to persist your appliciaton modle entities, you inevitably end up with persistency routines for the common Create, Read, Update and Delete (CRUD) type of operations. And before long you will realize that these are actually quite similiar between different entities, i.e. they are quite generic in nature if you start thinking in a little higher level abstractions such as types and identifiers, instead of concrete entities and properties. JavaScript happens to be very good at it. So, instead of copying the same routine for each entity, it's natural to abstract into a framework that can handle entities persistence into data records and back to entities in a generic way. That's what DAOism is about.

In a nutshell, DAOism knows how to handle the CRUD operations on an entity, plus some extras, based on a minimal configuration that you feed it to specify, which are the persistent entity properties and how they map to data records. 

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
