var 	sqlDb 		=	require('mssql');
var 	settings	=	require('../settings');

//Get All The URL from the DB Table and fetch the data
exports.GetProviders	=	function(callback){
	var 	sql 	=	" SELECT PROVIDER FROM PROVIDERS ";
	var conn			=	new sqlDb.ConnectionPool(settings.dbConfig);
	conn.connect().then(function(){
		var req 		=	new sqlDb.Request(conn);
		req.query(sql).then(function(data,err){
			var jsonArr 		= [];
			var itemsProcessed 	= 0;
			data.recordset.forEach((item, index, array) => {
				jsonArr.push({
					PROVIDER 				: data.recordset[index].PROVIDER
				});
				itemsProcessed++;
				if(itemsProcessed === array.length)
				{
	  				callback(jsonArr);
	  			}
			});
		}).catch(function(err){
			callback(err)
		})
	}).catch(function(err){
		callback(err);
	});
}

//Add a new URL to DB
exports.ADD_NEW_URL			=	function(Provider_URL,callback){

	var conn				=	new sqlDb.ConnectionPool(settings.dbConfig);
	var sql 				=	" INSERT INTO PROVIDERS(PROVIDER) VALUES ('" + Provider_URL+"')";
	conn.connect().then(function(){
		var req 		=	new sqlDb.Request(conn);
		req.query(sql).then(function(data,err){
			if(data.rowsAffected == "1")
			{
				var jsonArr = {"status":200};
				callback(jsonArr);
			}
			else
			{
				var jsonArr = {"status":303};
				callback(jsonArr);
			}
			
		}).catch(function(err){
			callback(err)
		})
	}).catch(function(err){
		callback(err);
	});
}


//Read the data from the PROXY URL
exports.Proxy_Feed_Data_Push	= 	function(sql, callback){
	var conn			=	new sqlDb.ConnectionPool(settings.dbConfig);
	conn.connect().then(function(){
		var req 		=	new sqlDb.Request(conn);
		req.query(sql).then(function(recordset){
			callback(recordset)
		}).catch(function(err){
			callback(err)
		})
	}).catch(function(err){
		callback(err);
	});
}

//Fetch the data from the DB and displaz in jqGrid
exports.Proxy_Feed_Data_Pull	= function(callback){
	var conn			=	new sqlDb.ConnectionPool(settings.dbConfig);
	conn.connect().then(function(){
		var req 		=	new sqlDb.Request(conn);
		var sql 		=	" SELECT ID, IP, PORT, COUNTRY, CREATED_DT_TM, UPDATE_DT_TM, PROVIDER, ACTIVITY_DT_TM, LIVE FROM TBL_PROXY ORDER BY ACTIVITY_DT_TM DESC"
		req.query(sql).then(function(data,err){
			if(err)
			{
				console.log("Error While Getting the Data");
			}
			else
			{
				var jsonArr 		= [];
				var itemsProcessed 	= 0;
				if(data.recordset.length > 0)
				{
					data.recordset.forEach((item, index, array) => {
						jsonArr.push({
							ID 				: data.recordset[index].ID,
							IP 				: data.recordset[index].IP,
							PORT 			: data.recordset[index].PORT,
							COUNTRY			: data.recordset[index].COUNTRY,
							CREATED_DT_TM	: data.recordset[index].CREATED_DT_TM,
							UPDATE_DT_TM	: data.recordset[index].UPDATE_DT_TM,
							PROVIDER		: data.recordset[index].PROVIDER,
							ACTIVITY_DT_TM	: data.recordset[index].ACTIVITY_DT_TM,
							LIVE			: data.recordset[index].LIVE
						});
						itemsProcessed++;
						if(itemsProcessed === array.length)
						{
		      				callback(jsonArr);
		      			}
					});
				}
				else
				{
					jsonArr.push({});
					callback(jsonArr);
				}
			}
		}).catch(function(err){
			callback(err)
		})
	}).catch(function(err){
		callback(err);
	});
}

exports.Provider_Info = function(callback){
	var conn			=	new sqlDb.ConnectionPool(settings.dbConfig);

	conn.connect().then(function(){
		var req 		=	new sqlDb.Request(conn);
		var sql 		=	" SELECT PROVIDER, LAST_REFRESH_TIME FROM PROVIDERS ";
		req.query(sql).then(function(data,err){
			if(err)
			{
				console.log("Error While Getting the Data");
			}
			else
			{
				var jsonArr 		= [];
				var itemsProcessed 	= 0;
				if(data.recordset.length > 0)
				{
					data.recordset.forEach((item, index, array) => {
						jsonArr.push({
							PROVIDER 				: data.recordset[index].PROVIDER,
							LAST_REFRESH_TIME 		: data.recordset[index].LAST_REFRESH_TIME
						});
						itemsProcessed++;
						if(itemsProcessed === array.length)
						{
		      				callback(jsonArr);
		      			}
					});
				}
				else
				{
					jsonArr.push({});
					callback(jsonArr);
				}
			}
		}).catch(function(err){
			callback(err)
		})
	}).catch(function(err){
		callback(err);
	});
};

//write the refresh time into the table
exports.Refresh_Time_Write	=	function(callback){
	var conn			=	new sqlDb.ConnectionPool(settings.dbConfig);
	var sql 			=	" INSERT INTO REFRESH_TIME(LAST_REFRESH_TIME)(SELECT DATEADD(HOUR,2,GETDATE())) ";

	conn.connect().then(function(){
		var req 		=	new sqlDb.Request(conn);
		req.query(sql).then(function(recordset){
			callback(recordset)
		}).catch(function(err){
			callback(err)
		})
	}).catch(function(err){
		callback(err);
	});
}

 //Function to get information about the Last refresh time
exports.Last_Refresh_Time	=	function(callback){
	var conn			=	new sqlDb.ConnectionPool(settings.dbConfig);
	var sql 			=	" SELECT TOP 1 LAST_REFRESH_TIME FROM REFRESH_TIME ORDER BY LAST_REFRESH_TIME DESC ";

	conn.connect().then(function(){
		var req 		=	new sqlDb.Request(conn);
		req.query(sql).then(function(recordset){
			callback(recordset)
		}).catch(function(err){
			callback(err)
		})
	}).catch(function(err){
		callback(err);
	});
}


//Check if there is 10 mins gap
exports.TimeChecker		=	function(callback){
	var conn			=	new sqlDb.ConnectionPool(settings.dbConfig);
	var sql 			=	" SELECT DATEDIFF(mi, (SELECT TOP 1 LAST_REFRESH_TIME FROM REFRESH_TIME ORDER BY LAST_REFRESH_TIME DESC),(SELECT DATEADD(HOUR,2,GETDATE()))) AS DATEDIFF ";

	conn.connect().then(function(){
		var req 		=	new sqlDb.Request(conn);
		req.query(sql).then(function(recordset){
			callback(recordset)
		}).catch(function(err){
			callback(err)
		})
	}).catch(function(err){
		callback(err);
	});
}


//Export the data to excel
exports.Export_Proxy_Data	=	function(sql,callback){

	var conn				=	new sqlDb.ConnectionPool(settings.dbConfig);
	
	conn.connect().then(function(){
		var req 		=	new sqlDb.Request(conn);
		req.query(sql).then(function(recordset){
			callback(recordset);
		}).catch(function(err){
			callback(err)
		})
	}).catch(function(err){
		callback(err);
	});
}





















