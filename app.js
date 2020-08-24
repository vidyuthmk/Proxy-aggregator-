const	http 				=	require("http");
const 	express 			= 	require('express');
const	port				= 	3000;
const   bodyParser 			= 	require('body-parser');

//Required controllers
const 	proxyFeedRetrieve	=	require("./controller/proxyFeedRetrieve");

//To get the HTML page
const 	basePath 			= 	__dirname;
const 	path 				= 	require('path');
const 	reqPath 			= 	path.join(__dirname, './');
const 	fs					=	require('fs');
const 	app 				= 	express();

app.set('views', reqPath + "public/views");
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use(express.static(path.join(reqPath, 'public/views')));
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true }));


//Display the Index page when user hits the URL in browser
app.get('/', function(req,res){
	res.render('index.html');
});

//Reftesh the data based on the click
app.get('/Refresh_Data', function(req,res){
	//Check if there is 10 mins gap
	proxyFeedRetrieve.TimeChecker(function(data){
		var dateDiff 	=	data.recordset[0].DATEDIFF;
		if(dateDiff > 10)
		{
			proxyFeedRetrieve.Proxy_Feed_Data_Push(function(data){
				//After resding the proxy right the inserted time intp the the table
				proxyFeedRetrieve.Refresh_Time_Write(function(data){
					res.send(data);
				});
			});
		}
		else
		{
			var status	 =  303;
			res.status(200).send((status).toString());
		}
	});
});

 //Function to get information about the Last refresh time
 app.get('/Last_Refresh_Time', function(req,res){
	proxyFeedRetrieve.Last_Refresh_Time(function(data){
		res.send(data);
	});
 });

//Get the Proxy Data
app.get('/Proxy_Data',function(req,res){
	proxyFeedRetrieve.Proxy_Feed_Data_Push(function(data){
		res.send(data);
	})
});

//get the proxy data from db and populate the Jqgrid table
app.get('/GET_PROXY_DATA', function(req,res){
	proxyFeedRetrieve.Proxy_Feed_Data_Pull(function(data){
		res.send(data);
	});
});

//Add a new URL to DB
app.post('/ADD_NEW_URL', function(req,res){
	
	var Provider_URL	=	req.body.Provider_URL;

	proxyFeedRetrieve.ADD_NEW_URL(Provider_URL,function(data){
		res.send(data);
	});
})

//Get the Providers information
app.get('/Provider_Info',function(req,res){
	proxyFeedRetrieve.Provider_Info(function(data){
		res.send(data);
	});
});

//Export the data to excel
app.get('/Export_Proxy_Data',function(req,res){
	proxyFeedRetrieve.Export_Proxy_Data(req,res)
});

//Make NodeJS to Listen to a particular Port in Localhost
app.listen(port, function(){
	console.log(`Web Feed aggregator running at: ${port}!`)
});

