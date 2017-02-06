/* globals $ */
/* eslint-env node, dirigible */
"use strict";
var database = require("db/database");
var QueryBuilder = function(datasource, dialect){
	this.datasource = datasource || database.getDatasource();
	this.dialect = dialect;
};

QueryBuilder.prototype.insert = function(){
	this.operation = "INSERT";
	return this;
};
QueryBuilder.prototype.update = function(){
	this.operation = "UPDATE";
	return this;
};
QueryBuilder.prototype.remove = QueryBuilder.prototype['delete'] = function(){
	this.operation = "DELETE";
	return this;
};
QueryBuilder.prototype.select = function(){
	this.operation = "SELECT";
	return this;
};
QueryBuilder.prototype.createTable = function(tableName){
	this.tableName = tableName;
	this.operation = "CREATETABLE";
	return this;
};
QueryBuilder.prototype.dropTable = function(tableName){
	this.tableName = tableName;
	this.operation = "DROPTABLE";
	return this;
};
QueryBuilder.prototype.from = function(tableName, alias){
	if(!this.tables){
		this.tables = [];//why array? Get ready for future support of multiple table operations
	}
	this.tables.push({
		name: tableName,
		alias: alias
	});
	return this;
};
QueryBuilder.prototype.into = QueryBuilder.prototype.table = function(tableName){
	if(!this.tables){
		this.tables = [];//why array? Get ready for future support of multiple table operations
	}
	this.tables.push({
		name: tableName
	});
	return this;
};
QueryBuilder.prototype.order = function(orderField, asc){
	if(!this.orderFields){
		this.orderFields = [];//why array? Get ready for future support of multiple table operations
	}
	this.orderFields.push({
		name: orderField,
		order: asc===undefined || asc===true ? true : false
	});
	return this;
};
QueryBuilder.prototype.limit = function (_limit){

	this._limit = _limit;
	return this;	
};
QueryBuilder.prototype.offset = function (_offset){
	this._offset = _offset;
	return this;	
};
QueryBuilder.prototype.where = function(filter, parameterizedFields){
	if(!this.filters){
		this.filters = [];
	}
	this.filters.push(filter);
	if(!this.fieldSet)
		this.fieldSet = [];
	if(parameterizedFields && parameterizedFields.constructor!==Array){
		parameterizedFields = [parameterizedFields];
	}		
	if(parameterizedFields){
		if(!this.parameterizedFields)
			this.parameterizedFields = [];
		this.parameterizedFields = this.parameterizedFields.concat(parameterizedFields);
/*		if(!this.fieldValueSet)
			this.fieldValueSet = [];
		this.fieldSet = this.fieldSet.concat(parameterizedFields);*/
		if(!this.fieldValueSet)
			this.fieldValueSet = [];
		this.fieldValueSet = this.fieldValueSet
								.concat(parameterizedFields
										.map(function(){ 
											return '?'; 
										}));
	}
	return this;
};
QueryBuilder.prototype.left_join = function(table, tableAlias, joinStatement, parameterizedFields){
	if(!this.leftJoins){
		this.leftJoins = [];
	}
	this.leftJoins.push({
		table: table,
		alias: tableAlias,
		statement: joinStatement
	});	
	if(parameterizedFields && parameterizedFields.constructor!==Array){
		parameterizedFields = [parameterizedFields];
	}	
	if(parameterizedFields){
		if(!this.parameterizedFields)
			parameterizedFields = [];
		this.parameterizedFields = this.parameterizedFields.concat(parameterizedFields);
/*		if(!this.fieldValueSet)
			this.fieldValueSet = [];
		this.fieldSet = this.fieldSet.concat(parameterizedFields);*/
		if(!this.fieldValueSet)
			this.fieldValueSet = [];
		this.fieldValueSet = this.fieldValueSet
								.concat(parameterizedFields
											.map(function(){
												return '?'; 
											}));	
	}
	return this;
};
QueryBuilder.prototype.set = function(fieldDef, value){
	if(!this.updFieldSet)
		this.updFieldSet = [];
	this.updFieldSet.push(fieldDef);
	if(value===undefined){
		if(!this.parameterizedFields)
			this.parameterizedFields = [];
		this.parameterizedFields.push(fieldDef);
	}
/*	if(!this.fieldSet)
		this.fieldSet = [];
	if(!value)
		this.fieldSet.push(fieldDef);*/
	if(!this.fieldValueSet)
		this.fieldValueSet = [];
	this.fieldValueSet.push(value!==undefined?value:'?');
	return this;
};
QueryBuilder.prototype.field = function(fieldName, alias){
	if(!this.selectFields)
		this.selectFields = [];
	this.selectFields.push({
		name: fieldName,
		alias: alias
	});
	return this;
};
QueryBuilder.prototype.fieldDef = function(fieldDef){
	if(!this.fieldSet)
		this.fieldSet = [];
	this.fieldSet.push({
		name: fieldDef.name,
		type: fieldDef.type,
		size: fieldDef.size,
		reuqired: fieldDef.reuqired || true,
		pk: fieldDef.pk || false,
		defaultValue: fieldDef.defaultValue || null
	});
	return this;
};


QueryBuilder.prototype.builders = {
	"createtable": function(){
		var tableName = this.tableName || this.tables
									.map(function(table){
										return table.name;
									})[0];
		this.sql = 'CREATE TABLE ' + tableName;
		this.sql+= '(';
		for(var i in this.fieldSet){
			var field =this.fieldSet[i];
			var notNullConstraint = field.required===false || field.pk===true ? ' NOT NULL' : '';
			var sizeConstraint = field.size!==undefined?'('+field.size+')' : '';
			if(!sizeConstraint&&field.type==='VARCHAR'){
				sizeConstraint = '(255)';
			}
			this.sql += field.name+' '+field.type + sizeConstraint + notNullConstraint+', ';
		}
		this.sql = this.sql.substring(0, this.sql.length-2);
		this.sql+= ')';
		return this.sql;
	},
	"droptable": function(){
		var tableName = this.tableName || this.tables
									.map(function(table){
										return table.name;
									})[0];	
		this.sql = 'DROP TABLE ' + tableName;
		return this.sql;
	},	
	"insert": function(){
		this.sql = 'INSERT INTO ' + this.tables
									.map(function(table){
										return table.name;
									}).join(',');
		this.sql+= '(';
		for(var i in this.updFieldSet){
			this.sql += this.updFieldSet[i].dbName+', ';
		}
		this.sql = this.sql.substring(0, this.sql.length-2);
		this.sql+= ') VALUES(';
		for(var i in this.fieldValueSet){
			var val = this.fieldValueSet[i];
			if(val!=='?' && this.updFieldSet[i].type==='String')
				val="'"+val+"'";
			this.sql += val+', ';
		}
		this.sql = this.sql.substring(0, this.sql.length-2);
		this.sql+= ')';	
		return this.sql;
	},
	"update": function(){
		this.sql = 'UPDATE ' + this.tables
								.map(function(table){
									return table.name;
								}).join(',') + ' SET ';
		if(this.updFieldSet){
			for(var i in this.updFieldSet){
				//var val = this.updValueSet[i];
				this.sql += this.updFieldSet[i].dbName+'='+this.fieldValueSet[i]+', ';
			}
			this.sql = this.sql.substring(0, this.sql.length-2);
		}
		if(this.filters){
			this.sql += ' WHERE ' + this.filters.join(' AND ');
		}			
		return this.sql;		
	},
	"delete": function(){
		this.sql = 'DELETE FROM ' + this.tables
								.map(function(table){
									return table.name + (table.alias?' as '+ table.alias:'');
								}).join(',');
		if(this.filters){
			this.sql += ' WHERE ' + this.filters.join(' AND ');
		}								
		return this.sql;
	},
	"select": function(){
		this.sql = 'SELECT';
		if(!this.selectFields){
			this.sql += ' *';
		} else {
			this.sql += ' ' + this.selectFields
			.map(function(field){
				return field.alias?field.name + ' AS ' + field.alias: field.name;
			}).join(', ');
		}

		if(this._limit!==undefined && this._offset!==undefined){
	        this.sql += ' ' + this.datasource.getPaging().genTopAndStart(this._limit, this._offset);
	    }
		
		this.sql += ' FROM ' + this.tables
								.map(function(table){
									return table.name + (table.alias?' as '+ table.alias:'');
								}).join(',');
		if(this.leftJoins){
			this.sql += this.leftJoins
						.map(function(join){
							return ' LEFT JOIN ' + join.table + (join.alias?' \''+join.alias+'\'':'') + ' ON ' + join.statement;
						}).join(' ');
		}
		if(this.filters){
			this.sql += ' WHERE ' + this.filters.join(' AND ');
		}
		if(this.orderFields){
			this.sql += ' ORDER BY ' + this.orderFields
						.map(function(field){
							return field.name + ' ' + (field.order?'ASC':'DESC');
						})
						.join(', ');
		}
		if (this._limit!==undefined && this._offset!==undefined) {
	        this.sql += " " + this.datasource.getPaging().genLimitAndOffset(this._limit, this._offset);
	    }
		return this.sql;
	}
};
QueryBuilder.prototype.toString = function(){
	return this.builders[this.operation.toLowerCase()].apply(this);
};
QueryBuilder.prototype.toParams = function(){
	return {
		sql: this.toString(),
		parameters: this.parameterizedFields
	};
};

exports.QueryBuilder = QueryBuilder;

var dialects = exports.QueryBuilder.dialects = {
	sql: {
		typeFor: function(name, size){
			if(name==='Int'){
				return 'INTEGER';
			}
			if(name==='String'){
				if(size === undefined || size<256)
					return 'VARCHAR';
				if(size>255)
					return 'LONGVARCHAR';				
				//TODO	
			}
			if(name==='Long'){
					return 'BIGINT';
			}
			if(name==='Boolean'){
				return 'BIT';
			}
			if(name==='Float'){
				return 'REAL';
			}
			if(name==='Short'){
				return 'SMALLINT';
			}
			if(name==='Timestamp'){
				return 'TIMESTAMP';
			}
		}
	}
};

var getQueryBuilder = exports.getQueryBuilder = function(datasource, dialect){
	return new QueryBuilder(datasource, dialect|| dialects.sql);
};

var Statements = exports.Statements = function(){
	this.$log = require('log/loggers').get('daoism/statements');
};
exports.get = function(){
	return new Statements();
};

Statements.prototype.builder = getQueryBuilder;

Statements.prototype.execute = function(queryBuilder, connection, entity){
	if(queryBuilder.constructor !== QueryBuilder)
		throw Error('Expected QueryBuilder argument but was: ' + (typeof queryBuilder));
	var parametricQuery = queryBuilder.toParams();
	var sql = parametricQuery.sql;
	this.$log.info('Executing SQL Statement: '+ sql);
	var statement, result;
 	statement = connection.prepareStatement(sql);
 	var parametricFields = parametricQuery.parameters;
 	if(parametricFields){
	 	for(var i=0; i<parametricFields.length; i++){
	 		var val = entity ? entity[parametricFields[i].name] : undefined;
	 		this.$log.info('Binding to parameter['+(i+1)+']: '+ val);
	 		statement['set'+parametricFields[i].type](i+1, val);
	 	} 	
 	}
 	if(queryBuilder.operation){
 		if(queryBuilder.operation.toLowerCase()!=='select'){
 			result = statement.executeUpdate();
 		} else {
 			result = statement.executeQuery();
 		}
 	}
 	return result;
};
