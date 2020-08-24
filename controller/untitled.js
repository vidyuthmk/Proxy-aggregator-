const 	db 			=	require("../core/db");
const 	request		=	require("request");
const	util 		=	require('util');
var 	fs 			= 	require('fs');
var		csv			=	require('fast-csv');	
const 	path 		= 	require('path');
const 	reqPath 	= 	path.join(__dirname, '../');
const 	Feed 		= 	require('feed').Feed;
var 	orm     	= 	require('orm');

//Read the data from the PROXY URL
exports.Proxy_Feed_Data_Push 	=	function(callback){

	var url			=	"https://proxy11.com/api/proxy.json?key=MTQxMQ.Xu3k6g.zdVDfx1FCbVLOhkwSjtshsvgAA4";
	var ProxyData 	=	[];

	request(url, function(error,response,body){
		var pageData		=	JSON.parse(body);
		var itemProcessed	=	0;

		for(var itemCount=0; itemCount<pageData.data.length; itemCount++)
		{
			var country 	=	pageData.data[itemCount].country;
			var ip 			=	pageData.data[itemCount].ip;
			var port 		=	pageData.data[itemCount].port;
			var createdAt	=	pageData.data[itemCount].createdAt;
			var updatedAt	=	pageData.data[itemCount].updatedAt;

			ProxyData.push({
				'country'		: 	country,
				'ip' 			: 	ip,
				'port'			: 	port,
				'createdAt' 	: 	createdAt,
				'updatedAt' 	: 	updatedAt,
				'provider'		: 	'proxy11.com'
			});

			itemProcessed++;

			if(itemProcessed == pageData.data.length)
			{	
				var url			=	"https://api.getproxylist.com/proxy";

				request(url, function(error,response,body){
					var pageData	=	JSON.parse(body);

					var country 	=	pageData.country;
					var ip 			=	pageData.ip;
					var port 		=	pageData.port;
					var createdAt	=	"";
					var updatedAt	=	"";

					ProxyData.push({
						'country'		: 	country,
						'ip' 			: 	ip,
						'port'			: 	port,
						'createdAt' 	: 	createdAt,
						'updatedAt' 	: 	updatedAt,
						'provider'		: 	'api.getproxylist.com'
					});

					var 	sql 	=	" INSERT INTO TBL_PROXY (IP, COUNTRY, PORT, CREATED_DT_TM, UPDATE_DT_TM, PROVIDER) VALUES ";

					for(var item=0; item<ProxyData.length; item++)
					{
						sql         +=	util.format(" ('%s', '%s', '%s', '%s', '%s', '%s') ", ProxyData[item].ip, ProxyData[item].country, ProxyData[item].port, ProxyData[item].createdAt, ProxyData[item].updatedAt, ProxyData[item].provider)+',';			
					}

					sql 	=	sql.slice(0, sql.length-1);

					db.Proxy_Feed_Data_Push(sql, function(data){
						callback(data);
					});
				});
			}


		}
	})
}

//Fetch the data from the DB and displaz in jqGrid
exports.Proxy_Feed_Data_Pull	=	function(callback){
	db.Proxy_Feed_Data_Pull(function(data){
		callback(data);
	})
}

//Fetch teh Providers data from the DB disaplz into the jqgrid
exports.Provider_Info = function(callback){
	db.Provider_Info(function(data){
		console.log(data);
		callback(data);
	})	
};


//write the refresh time into the table
exports.Refresh_Time_Write	=	function(callback){
	db.Refresh_Time_Write(function(data){
		callback(data);
	});
}


 //Function to get information about the Last refresh time
exports.Last_Refresh_Time	=	function(callback){
	db.Last_Refresh_Time(function(data){
		callback(data);
	});
}

////Check if there is 10 mins gap
exports.TimeChecker			=	function(callback){
	db.TimeChecker(function(data){
		callback(data);
	});
}

//Export the data to excel
exports.Export_Proxy_Data	=	function(req,res){
	var columnHeader		=	"ID,IP,PORT,CREATED_DT_TM,UPDATE_DT_TM,PROVIDER \n";
	var Web_Feed_File		= 	"Proxy_Data.csv";
	var sql 				=	" SELECT * FROM TBL_PROXY ORDER BY ACTIVITY_DT_TM DESC ";

	db.Export_Proxy_Data(sql,function(data,err){
		var itemsProcessed	=	1;
		var csv_data		=	"";

		fs.writeFile(Web_Feed_File,columnHeader,(err)=>{
			if (err)
		    {
		    	console.log("Error While Adding the CSV Header");
		        console.log(err);
		    }
		    else
		    {
				data.recordset.forEach((item, index, array) => {
					data.recordset[index].CREATED_DT_TM 	 	= data.recordset[index].CREATED_DT_TM.replace(/,/g, '');
					data.recordset[index].UPDATE_DT_TM 	 		= data.recordset[index].UPDATE_DT_TM.replace(/,/g, '');
					data.recordset[index].PROVIDER 	 			= data.recordset[index].PROVIDER.replace(/,/g, '');

					csv_data = csv_data	 + itemsProcessed + "," + data.recordset[index].IP + "," + data.recordset[index].PORT + "," + data.recordset[index].CREATED_DT_TM + "," + data.recordset[index].UPDATE_DT_TM + "," + data.recordset[index].PROVIDER + "\n";
					
					itemsProcessed++;
					if(itemsProcessed-1 === data.recordset.length)
					{
						fs.appendFile(Web_Feed_File,csv_data, (err) => {
							if (err)
						    {
						    	console.log("Error While Creating and Downloading the File");
						        console.log(err);
						    }
						    else
						    {
						    	const FilePath = reqPath+'\Proxy_Data.csv';
			        			res.download(FilePath);
						    }
						});
			      	}
				});
		    }
		});
	});
}









