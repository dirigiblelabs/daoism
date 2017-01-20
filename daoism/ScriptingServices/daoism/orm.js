/* globals $ */
/* eslint-env node, dirigible */
"use strict";

var database = require("db/database");
var datasource = database.getDatasource();


var DAO = function(orm){
	this.orm = orm;
};

DAO.prototype.$log = require("logging/logger").logger;
DAO.prototype.$log.ctx = 'DAO';

DAO.prototype.notify = function(event){
	var func = this[event];
	if(!this[event])
		return;
	if(typeof func !== 'function')
		throw Error('Illegal argument. Not a function: ' + func);
	var args = [].slice.call(arguments);
	func.apply(this, args.slice(2));
};
	
DAO.prototype.sql = {
	insert: function(){
	 	var sql = "INSERT INTO "+this.orm.dbName+" (";
	 	for(var i=0; i<this.orm.properties.length; i++){
	 		sql += this.orm.properties[i].dbName + ", ";
	 	}
	 	sql = sql.substring(0, sql.length-2);
	 	sql += ") VALUES(";
	 	for(var i=0; i<this.orm.properties.length; i++){
	 		sql += "?, ";
	 	}
	 	sql = sql.substring(0, sql.length-2);
        sql += ")";
        return sql;
	},
	update: function(entity){
		var updFieldDefs = this.orm.properties.filter(function(property){
			return Object.keys(entity).indexOf(property.name)>-1;
		});
		var sql = "UPDATE " + this.orm.dbName + " SET ";
		for(var i=0; i<updFieldDefs.length; i++){
			if(!updFieldDefs[i].id)
				sql+= updFieldDefs[i].dbName + "=?, ";
		}
		sql = sql.substring(0, sql.length-2);
		sql += " WHERE "+this.getPrimaryKey().dbName+" = ?";
		return sql;
},
	"delete": function(){
		var sql = "DELETE FROM " + this.orm.dbName;
	 	/*if(id.constructor !== Array){*/
	 		sql += " WHERE " + this.getPrimaryKey().dbName + "=?";
	 	/*} else {
	 		sql += " WHERE " + this.getPrimaryKey.dbName + " IN (";
	 		for(var i=0;i<id.length;i++){
	 			sql+="?, ";
	 		}
	 		sql = sql.substring(0,sql.length-2);
	 		sql += ")";
	 	}*/
	 	return sql;
	},
	find: function(){
		return "SELECT * FROM "+this.orm.dbName+" WHERE " + this.getPrimaryKey().dbName + "=?";
	},
	count: function(){
		return 'SELECT COUNT(*) FROM ' + this.orm.dbName;
	},
	list: function(settings){
		var limit = settings.limit;
		var offset = settings.offset;
		var sort = settings.sort;	
		var order = settings.order;
		var sql = "SELECT";
        if (limit !== undefined && offset !== undefined) {
            sql += " " + datasource.getPaging().genTopAndStart(limit, offset);
        }
        sql += " * FROM " + this.orm.dbName;
        if (sort !== undefined) {
            sql += " ORDER BY " + sort;
        }
        if (sort !== undefined && order !== undefined) {
            sql += " " + order;
        }
        if (limit !== undefined && offset !== undefined) {
            sql += " " + datasource.getPaging().genLimitAndOffset(limit, offset);
        }
        return sql;
	}
};

DAO.prototype.getPrimaryKey = function(){
	if(!this.idProperty){
		if(!this.orm.properties || !this.orm.properties.length)
			throw Error('Invalid orm configuration - no properties are defined');
		var id = this.orm.properties.filter(function(property){
			return property.id;
		});
		if(!id.length)
			throw Error('Invalid orm configuration - no id property is defined');
		this.idProperty = id[0];
	}
	return this.idProperty;
};

DAO.prototype.getMandatoryProperties = function(){
	if(!this.mandatoryProperties){
		if(!this.orm.properties || !this.orm.properties.length)
			throw Error('Invalid orm configuration - no properties are defined');
		var mandatories = this.orm.properties.filter(function(property){
			return property.required;
		});
		this.mandatoryProperties = mandatories;
	}
	return this.mandatoryProperties;
};

DAO.prototype.getOptionalProperties = function(){
	if(!this.optionalProperties){
		if(!this.orm.properties || !this.orm.properties.length)
			throw Error('Invalid orm configuration - no properties are defined');
		var mandatories = this.orm.properties.filter(function(property){
			return !property.required;
		});
		this.optionalProperties = mandatories;
	}
	return this.optionalProperties;
};

//Prepare a JSON object for insert into DB
DAO.prototype.createSQLEntity = function(entity) {
	var persistentItem = {};
	var mandatories = this.getMandatoryProperties();
	for(var i=0; i<mandatories.length; i++){
		if(mandatories[i].dbValue){
			persistentItem[mandatories[i].name] = mandatories[i].dbValue.apply(this, [entity, this.orm.properties, mandatories[i]]);
		} else {
			persistentItem[mandatories[i].name] = entity[mandatories[i].name];
		}
	}
	var optionals = this.getOptionalProperties();
	for(var i=0; i<optionals.length; i++){
		if(entity[optionals[i].name] !== undefined){
			if(optionals[i].dbValue){
				persistentItem[optionals[i].name] = optionals[i].dbValue.apply(this, [entity, this.orm.properties, optionals[i]]);
			} else {
				persistentItem[optionals[i].name] = entity[optionals[i].name];
			}
		} else {
			persistentItem[optionals[i].name] = null;
		}
	}
	var msgIdSegment = persistentItem[this.getPrimaryKey().name]?"["+persistentItem[this.getPrimaryKey().name]+"]":"";
	this.$log.info("Transformation to " + this.orm.dbName + msgIdSegment + " DB JSON object finished");
	return persistentItem;
};

//create entity as JSON object from ResultSet current Row
DAO.prototype.createEntity = function(resultSet) {
    var entity = {};
    for(var i=0; i<this.orm.properties.length; i++){
    	var prop = this.orm.properties[i];
    	entity[prop.name] = resultSet['get'+prop.type](prop.dbName);
    	if(prop.value){
    		entity[prop.name] = prop.value(entity[prop.name]);
    	}
    }
    
    for(var key in Object.keys(entity)){
		if(entity[key] === null)
			entity[key] = undefined;
	}

    this.$log.info("Transformation from "+this.orm.dbName+"["+entity[this.getPrimaryKey().name]+"] DB JSON object finished");
    return entity;
};

DAO.prototype.validateEntity = function(entity, skip){
	if(entity === undefined || entity === null){
		throw new Error('Illegal argument: entity is ' + entity);
	}
	if(skip){
		if(skip.constructor !== Array){
			skip = [skip];
		}
		for(var j=0; j<skip.length; j++){
			skip[j];
		}
	}	
	var mandatories = this.getMandatoryProperties();
	for(var i = 0; i< mandatories.length; i++){
		var propName = mandatories[i].name;
		if(skip && skip.indexOf(propName)>-1)
			continue;
		var propValue = entity[propName];
		if(propValue === undefined || propValue === null){
			throw new Error('Illegal ' + propName + ' attribute value in '+this.orm.dbName+' entity: ' + propValue);
		}
	}
};

DAO.prototype.insert = function(entity){
	this.$log.info('Inserting '+this.orm.dbName+' entity');
	
	this.validateEntity(entity, [this.getPrimaryKey().name]);

    var dbEntity = this.createSQLEntity(entity);

    var connection = datasource.getConnection();
    try {
        var sql = this.sql.insert.apply(this);
		this.$log.info('Prepare statement: ' + sql);
        var statement = connection.prepareStatement(sql);
        
        for(var i=0; i<this.orm.properties.length; i++){
	 		var property = this.orm.properties[i];
	 		var val = dbEntity[property.name];
	 		if(property.id){
	 			val = datasource.getSequence(this.orm.dbName+'_'+this.getPrimaryKey.name.toUpperCase()).next();
	 			dbEntity[this.getPrimaryKey().name] = val;
	 		}
	 		this.$log.info('Binding to parameter[' + (i+1) + ']:' + val);
	 		statement['set'+property.type](i+1, val);
	 	}
	 	
        statement.executeUpdate();
		
		this.notify('afterInsert', dbEntity);
		this.notify('beforeInsertAssociationSets', dbEntity);
		if(this.orm.associationSets && this.orm.associationSets.length){
			//Insert dependencies if any are provided inline with this entity
			this.$log.info('Inserting association sets for '+this.orm.dbName + '['+dbEntity[this.getPrimaryKey().name]+']');
			for(var idx in Object.keys(this.orm.associationSets)){
				var associationName = Object.keys(this.ormassociations)[idx];
				if(dbEntity[associationName] && dbEntity[associationName].length>0){
					var associationDAO = this.ormassociations[associationName].dao;
					this.notify('beforeInsertAssociationSet', dbEntity[associationName], dbEntity);
					for(var j=0; j<dbEntity[associationName].length; j++){
		        		var associatedEntity = dbEntity[associationName][j];
		        		var associatedEntityJoinKey = this.ormassociations[associationName].joinKey;
		        		associatedEntity[associatedEntityJoinKey] = dbEntity[this.getPrimaryKey().name];
		        		this.notify('beforeInsertAssociationSetEntity', dbEntity[associationName], dbEntity);
						associationDAO.insert(associatedEntity);
		    		}
		    		this.notify('afterInsertAssociationSet', dbEntity[associationName], dbEntity);
				}
			}		
		}
		
        this.$log.info(this.orm.dbName+'[' +  dbEntity[this.getPrimaryKey().name] + '] entity inserted');

        return dbEntity[this.getPrimaryKey().name];

    } catch(e) {
    	this.$log.error(undefined, e.message);
    	console.error(e.stack);
    	this.$log.info('Rolling back changes after failed '+this.orm.dbName+'[' +  dbEntity[this.getPrimaryKey().name] + '] insert. ');
		if(dbEntity[this.getPrimaryKey().name]){
			try{
				this.remove(dbEntity[this.getPrimaryKey().name]);
			} catch(err) {
				this.$log.error('Could not rollback changes after failed '+this.orm.dbName+'[' +  dbEntity[this.getPrimaryKey().name] + '] insert. ' + err);
			}
		}
		e.errContext = sql;		
		throw e;
    } finally {
        connection.close();
    }
};

// update entity from a JSON object. Returns the id of the updated entity.
DAO.prototype.update = function(entity) {

	this.$log.info('Updating '+this.orm.dbName+'[' + entity!==undefined?entity[this.getPrimaryKey().name]:entity + '] entity');

	if(entity === undefined || entity === null){
		throw new Error('Illegal argument: entity is ' + entity);
	}	
	
	this.validateEntity(entity);
    
    var sql = this.sql.update.apply(this, [entity]);
	var updFieldDefs = this.orm.properties.filter(function(property){
		return !property.id && Object.keys(entity).indexOf(property.name)>-1;
	});

	var dbEntity = this.createSQLEntity(entity);

    var connection = datasource.getConnection();
    try {
        var statement = connection.prepareStatement(sql);
    	for(var idx=1; idx<updFieldDefs.length+1; idx++){
    		if(!updFieldDefs[idx-1].id)
    			statement['set'+updFieldDefs[idx-1].type](idx, dbEntity[updFieldDefs[idx-1].name]);
    	}
        var id = dbEntity[this.getPrimaryKey().name];
        statement['set'+this.getPrimaryKey().type](idx, id);
        this.notify('beforeUpdateEntity', dbEntity);
        statement.executeUpdate();
            
        this.$log.info(this.orm.dbName+'[' + id + '] entity updated');
        
        return this;
        
    } catch(e) {
    	console.error(e.message);
    	console.error(e.stack);
		e.errContext = sql;
		throw e;
    } finally {
        connection.close();
    }
};

// delete entity by id. Returns the id of the deleted entity.
DAO.prototype.remove = function(id) {

	this.$log.info('Deleting '+this.orm.dbName+'[' + id + '] entity');

	if(id === undefined || id === null){
		throw new Error('Illegal argument for id parameter:' + id);
	}

    var connection = datasource.getConnection();
    try {
    
    	var sql = this.sql["delete"].apply(this);
        var statement = connection.prepareStatement(sql);
       	statement['set'+this.getPrimaryKey().type](1, id);
       	
       	this.notify('beforeRemoveEntity', id);
        statement.executeUpdate();
        
        if(this.orm.associationSets && this.orm.associationSets.length){
			//Remove associated dependencies
			for(var idx in Object.keys(this.orm.associationSets)){
				var associationName = Object.keys(this.orm.associationSets)[idx];
				var associationDAO = this.orm.associationSets[associationName].dao;
				var settings = {};
				settings[this.orm.associationSets[associationName].joinKey] = id;
				var associatedEntities;
				if(this.orm.associationSets[associationName].manyToMany){
					settings.associationType = "manyToMany";
				}
				associatedEntities = exports.select(associationName, settings);
				this.$log.info('Deleting '+this.orm.dbName+'['+id+'] entity\'s '+associatedEntities.length+' dependent ' + associationName);
				
				this.notify('beforeRemoveAssociationSet', associatedEntities, id);
				
				for(var j=0; j<associatedEntities.length; j++){
					var associatedEntity = associatedEntities[j];
					
					this.notify('beforeRemoveAssociationSetEntity', associatedEntity, associatedEntities, id);
					
					associationDAO.remove(associatedEntity.id);
				}
			} 
			this.$log.info(this.orm.dbName+'[' + id + '] entity and dependencies deleted');
        }
		this.$log.info(this.orm.dbName+'[' + id + '] entity deleted');
        return this;

    } catch(e) {
        console.error(e.message);
    	console.error(e.stack);
		e.errContext = sql;
		throw e;
    } finally {
        connection.close();
    }
    
};

/*
	settings: limit, offset, sort, order, expanded, boardId
*/
DAO.prototype.select = function(associationName, settings){
	if(!associationName || !this.orm.associationSets[associationName])
		return;
	var associationSet;
	if(settings.associationType&&settings.associationType==="manyToMany")
		associationSet = this.orm.associationSets[associationName].dao.listJoins.apply(this, [settings||{}]);
	else
		associationSet = this.orm.associationSets[associationName].dao.list.apply(this, [settings||{}]);
	return associationSet;
};

/* 
	Reads a single entity by id, parsed into JSON object. 
	If requested as expanded (=true) the returned entity will comprise associated (dependent) entities too. 
*/
DAO.prototype.find = function(id, select) {

	this.$log.info('Finding '+this.orm.dbName+'[' +  id + '] entity');

	if(id === undefined || id === null){
		throw new Error('Illegal argument for id parameter:' + id);
	}

    var connection = datasource.getConnection();
    try {
        var entity;
        var sql = this.sql.find.apply(this);     
        var statement = connection.prepareStatement(sql);
        
        statement['set'+this.getPrimaryKey().type](1, id);

        var resultSet = statement.executeQuery();
        if (resultSet.next()) {
        	entity = this.createEntity(resultSet);
			if(entity){
            	this.$log.info(this.orm.dbName+'[' +  id + '] entity found');
				if(select!==undefined){
					select = select.split(',');
					for(var idx in Object.keys(this.orm.associationSets)){
						var associationName = Object.keys(this.orm.associationSets)[idx];
						if(select.indexOf(associationName)>-1){
							entity[associationName] = exports.select(associationName, {boardId:entity.id});
						}
					}
				}		
        	} else {
	        	this.$log.info(this.orm.dbName+'[' +  id + '] entity not found');
        	}
        } 
        return entity;
    } catch(e) {
        console.error(e.message);
    	console.error(e.stack);
		e.errContext = sql;
		throw e;
    } finally {
        connection.close();
    }
};

DAO.prototype.count = function() {

	this.$log.info('Counting '+this.orm.dbName+' entities');

    var count = 0;
    var connection = datasource.getConnection();
    try {
    	var sql = this.sql.count.apply(this);
        var statement = connection.prepareStatement(sql);
        var rs = statement.executeQuery();
        if (rs.next()) {
            count = rs.getInt(1);
        }
    } catch(e) {
        console.error(e.message);
    	console.error(e.stack);
		e.errContext = sql;
		throw e;
    } finally {
        connection.close();
    }
    
    this.$log.info('' + count + ' '+this.orm.dbName+' entities counted');

    return count;
};

DAO.prototype.list = function(settings) {
	var limit = settings.limit;
	var offset = settings.offset;
	var sort = settings.sort;	
	var order = settings.order;
	var expanded = settings.expanded;
	var select = settings.select;
	if(expanded || select){
		if(select){
			var s = String(new java.lang.String(""+select));
	   		select = s.split();
		} else {
			select = Object.keys(this.orm.associationSets);
		}        		
	}	
	var entityName = settings.entityName;
	
	this.$log.info('Listing '+this.orm.dbName+' entity collection expanded['+expanded+'] with list operators: limit['+limit+'], offset['+offset+'], sort['+sort+'], order['+order+'], entityName['+entityName+']');
	
    var connection = datasource.getConnection();
    try {
        var entities = [];
        settings.select = select;
        var sql = this.sql.list.apply(this,[settings]);

        var statement = connection.prepareStatement(sql);
        var resultSet = statement.executeQuery();
        
        while (resultSet.next()) {
        	var entity = this.createEntity(resultSet);
        	if((expanded || select) && this.orm.associationSets && this.orm.associationSets.length){
				for(var idx in Object.keys(this.orm.associationSets)){
					var associationName = Object.keys(this.orm.associationSets)[idx];
					if(select.indexOf(associationName)>-1){
						entity[associationName] = exports.select(associationName, {boardId:entity.id});
					}
				}
        	}
            entities.push(entity);
        }
        
        this.$log.info('' + entities.length +' '+this.orm.dbName+' entities found');
        
        return entities;
    }  catch(e) {
        console.error(e.message);
    	console.error(e.stack);
		e.errContext = sql;
		throw e;
    } finally {
        connection.close();
    }
};

exports.DAO = DAO;
