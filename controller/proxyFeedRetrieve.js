const 	db 			=	require("../core/db");
const 	request		=	require("request");
const	util 		=	require('util');
var 	fs 			= 	require('fs');
var		csv			=	require('fast-csv');	
const 	path 		= 	require('path');
const 	reqPath 	= 	path.join(__dirname, '../');
const 	Feed 		= 	require('feed').Feed;
var 	orm     	= 	require('orm');
var 	http 		= 	require("http");


//Read the data from the PROXY URL
exports.Proxy_Feed_Data_Push 	=	function(callback){
	//Get All The URL from the DB Table and fetch the data
	db.GetProviders(function(data){

		for(var urlCount=0; urlCount<data.length; urlCount++)
		{
			var url 			= data[urlCount].PROVIDER;
			var itemProcessed	=	0;

			if(url == "https://proxy11.com/api/proxy.json?key=MTQxMQ.Xu3k6g.zdVDfx1FCbVLOhkwSjtshsvgAA4")
			{
				request(url, function(error,response,body){
					var pageData		=	JSON.parse(body);	

					
					var ProxyData 		=	[];

					for(var itemCount=0; itemCount<pageData.data.length; itemCount++)
					{
						var country 	=	pageData.data[itemCount].country;
						var ip 			=	pageData.data[itemCount].ip;
						var port 		=	pageData.data[itemCount].port;
						var createdAt	=	pageData.data[itemCount].createdAt;
						var updatedAt	=	pageData.data[itemCount].updatedAt;
						var live 		=	'';
						var proxy 		=	'http://'+ip+':'+port;

						request({
							'url':'google.com',
								'method': "GET",
								'proxy': proxy
						},function (error, response, body) {

							if (!error && response.statusCode == 200) {
								live 	=	'Yes';
								ProxyData.push({
									'country'		: 	country,
									'ip' 			: 	ip,
									'port'			: 	port,
									'createdAt' 	: 	createdAt,
									'updatedAt' 	: 	updatedAt,
									'provider'		: 	'proxy11.com',
									'live' 			: 	live
								});
								
								itemProcessed++;

								if(itemProcessed == pageData.data.length)
								{

									var 	sql 	=	" INSERT INTO TBL_PROXY (IP, COUNTRY, PORT, CREATED_DT_TM, UPDATE_DT_TM, PROVIDER, LIVE) VALUES ";
									
									for(var item=0; item<ProxyData.length; item++)
									{
										sql         +=	util.format(" ('%s', '%s', '%s', '%s', '%s', '%s', '%s') ", ProxyData[item].ip, ProxyData[item].country, ProxyData[item].port, ProxyData[item].createdAt, ProxyData[item].updatedAt, ProxyData[item].provider, ProxyData[item].live)+',';
									}

									sql 	=	sql.slice(0, sql.length-1);

									db.Proxy_Feed_Data_Push(sql, function(data){
										callback(data);
									});
								}
						  	}
						  	else
						  	{

						  		live 	=	'No';
						  		ProxyData.push({
									'country'		: 	country,
									'ip' 			: 	ip,
									'port'			: 	port,
									'createdAt' 	: 	createdAt,
									'updatedAt' 	: 	updatedAt,
									'provider'		: 	'proxy11.com',
									'live' 			: 	live
								});
								itemProcessed++;

								if(itemProcessed == pageData.data.length)
								{

									var 	sql 	=	" INSERT INTO TBL_PROXY (IP, COUNTRY, PORT, CREATED_DT_TM, UPDATE_DT_TM, PROVIDER, LIVE) VALUES ";
									
									for(var item=0; item<ProxyData.length; item++)
									{
										sql         +=	util.format(" ('%s', '%s', '%s', '%s', '%s', '%s', '%s') ", ProxyData[item].ip, ProxyData[item].country, ProxyData[item].port, ProxyData[item].createdAt, ProxyData[item].updatedAt, ProxyData[item].provider, ProxyData[item].live)+',';
									}

									sql 	=	sql.slice(0, sql.length-1);

									db.Proxy_Feed_Data_Push(sql, function(data){
										callback(data);
									});
								}
						  	}
						});
					}
				});
			}
			else if(url == "https://api.getproxylist.com/proxy")
			{
				request(url, function(error,response,body){

					if(JSON.parse(body).error)
					{
						console.log("Daily Limit has been Exceeded for ProxyList");
					}
					else
					{

						var pageData	=	JSON.parse(body);
						var ProxyData 	=	[];
						var country 	=	pageData.country;
						var ip 			=	pageData.ip;
						var port 		=	pageData.port;
						var createdAt	=	"";
						var updatedAt	=	"";
						var proxy 		=	'http://'+ip+':'+port;

						ProxyData.push({
							'country'		: 	country,
							'ip' 			: 	ip,
							'port'			: 	port,
							'createdAt' 	: 	createdAt,
							'updatedAt' 	: 	updatedAt,
							'provider'		: 	'api.getproxylist.com',
							'live'			: 	'No'
						});

						var 	sql 	=	" INSERT INTO TBL_PROXY (IP, COUNTRY, PORT, PROVIDER, LIVE) VALUES ";

						for(var item=0; item<ProxyData.length; item++)
						{
							sql         +=	util.format(" ('%s', '%s', '%s', '%s', '%s') ", ProxyData[item].ip, ProxyData[item].country, ProxyData[item].port, ProxyData[item].provider, ProxyData[item].live)+',';			
						}

						sql 	=	sql.slice(0, sql.length-1);

						db.Proxy_Feed_Data_Push(sql, function(data){
						});
					}
				});
			}
			else if(url == "https://byteproxies.com/api.php?key=free&amount=1&type=http&anonymity=elite")
			{
				console.log(url);
				request(url, function(error,response,body){
					var pageData	=	JSON.parse(body);
					var ProxyData 	=	[];

					var country 	=	pageData[0].response.country;
					var ip 			=	pageData[0].response.ip;
					var port 		=	pageData[0].response.port;
					var createdAt	=	"";
					var updatedAt	=	pageData[0].response.checked;

					ProxyData.push({
						'country'		: 	country,
						'ip' 			: 	ip,
						'port'			: 	port,
						'createdAt' 	: 	createdAt,
						'updatedAt' 	: 	updatedAt,
						'provider'		: 	'byteproxies.com',
						'live'			: 	'No'
					});

					var 	sql 	=	" INSERT INTO TBL_PROXY (IP, COUNTRY, PORT, PROVIDER, UPDATE_DT_TM, LIVE) VALUES ";

					for(var item=0; item<ProxyData.length; item++)
					{
						sql         +=	util.format(" ('%s', '%s', '%s', '%s', '%s', '%s') ", ProxyData[item].ip, ProxyData[item].country, ProxyData[item].port, ProxyData[item].provider, ProxyData[item].updatedAt, ProxyData[item].live)+',';			
					}

					sql 	=	sql.slice(0, sql.length-1);

					db.Proxy_Feed_Data_Push(sql, function(data){

					});
				});
			}
			else if(url == "http://pubproxy.com/api/proxy")
			{
				
				request(url, function(error,response,body){

					if(response.body != 'You reached the maximum 50 requests for today. Get your API to make unlimited requests at http://pubproxy.com/#premium')
					{
						var pageData	=	JSON.parse(body);
						var ProxyData 	=	[];

						var country 	=	pageData.data[0].country;
						var ip 			=	pageData.data[0].ip;
						var port 		=	pageData.data[0].port;
						var createdAt	=	"";
						var updatedAt	=	pageData.data[0].last_checked;

						ProxyData.push({
							'country'		: 	country,
							'ip' 			: 	ip,
							'port'			: 	port,
							'createdAt' 	: 	createdAt,
							'updatedAt' 	: 	updatedAt,
							'provider'		: 	'pubproxy.com',
							'live'			: 	'No'
						});

						var 	sql 	=	" INSERT INTO TBL_PROXY (IP, COUNTRY, PORT, PROVIDER, UPDATE_DT_TM, LIVE) VALUES ";

						for(var item=0; item<ProxyData.length; item++)
						{
							sql         +=	util.format(" ('%s', '%s', '%s', '%s', '%s', '%s') ", ProxyData[item].ip, ProxyData[item].country, ProxyData[item].port, ProxyData[item].provider, ProxyData[item].updatedAt, ProxyData[item].live)+',';			
						}

						sql 	=	sql.slice(0, sql.length-1);

						db.Proxy_Feed_Data_Push(sql, function(data){
						});
					}
					else
					{
						console.log("Pubproxy Daily limit exceeded");
					}

				});
			}
		}
	});
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

//Check if there is 10 mins gap
exports.TimeChecker			=	function(callback){
	db.TimeChecker(function(data){
		callback(data);
	});
}

//Add a new URL to DB
exports.ADD_NEW_URL			=	function(Provider_URL,callback){
	db.ADD_NEW_URL(Provider_URL,function(data){
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









