$(document).ready(function(){
	
    Grid_Table_Populator();
    $("#Web_Feed_Home").css('background', 'red');

	//On Load Call the function to display the table with the data
    function Populate_Proxy_Tables(){
        $.ajax({
            type        :   "GET",
            url         :   "/Proxy_Data",
            dataType    :   "json",
            success: function(data){
                Grid_Table_Populator();
            }
        })
    };

          //Add the new URL to the Array of Web Feed URL
    $("#New_URL_Click").click(function(){
        var Provider_URL    =   $("#New_Provider_URL").val();
        Provider_URL        =   Provider_URL.trim();
        if(Provider_URL == '')
        {
            alertify.alert("Error during new provider addition:","Please enter Provider URL.");
        }
        else
        {
            $.ajax({
                type: 'POST',
                url: '/ADD_NEW_URL',
                data:{Provider_URL:Provider_URL},
                dataType: 'json',
                success: function(data){
                    if(data.status === 200)
                    {
                        alertify.alert("New Provider Addition Success:", "New Provider <b>"+Provider_Name+"</b> has been added successfully.");
                        $('#New_Provider_URL').val('');
                        Reload_Provider_Grid();
                    }
                        if(data.status === 303)
                    {
                        alertify.alert("New Provider Addition Failure:", "Please Check and Try again.");
                    }
                }
            });
        }
    });

    //Providers View for addition of provider and other information
    $("#Providers").click(function(){
        $("#Web_Feed_Home").css("background-color", "");
        $("#Providers").css("background-color", "red");
        $('#proxy_feed').hide();
        $('#Provider_View').show();
        //Call the function to load JQGRID for the Providers
        Provider_Grid();
    });

    //Home of Web Feed Data view on click of logo
    $("#Web_Feed_Home").click(function(){
        $("#Providers").css("background-color", "");
        $("#Web_Feed_Home").css('background', 'red');   
        $(this).css('background', 'red');   
        $('#Provider_View').hide();
        $('#proxy_feed').show();
    });

    $("#Web_Feed_Home").click(function(){
        $("#Provider_View").hide();
        $("#proxy_feed").show();
    });

    //On Click of the refresh button Load fresh data into the Database
    $("#refresh_data").click(function(){
        $("#home_div").hide();
        $("#Refresh_Time").hide();
        $("#Loader_Logo").show();
        $.ajax({
            type: 'GET',
            url: '/Refresh_Data',
            dataType: 'json',
            success: function(data){
                if(data == "303")
                {
                    $("#Loader_Logo").hide();
                    $("#home_div").show();
                    $("#Refresh_Time").show();
                    alertify.alert("Error during DB Refresh:","Data can be refreshed once in every 10 mins. <br/> Please try again later.");
                }
                else
                {
                    Last_Refresh_time();
                    clear_search();
                    Reload_Provider_Grid(); 
                    $("#Loader_Logo").hide();
                    $("#home_div").show();
                    $("#Refresh_Time").show();
                }
             }
        });
    });

    //Function to get information about the Last refresh time
    function Last_Refresh_time()
    {
        $.ajax({
            type: 'GET',
            url: '/Last_Refresh_Time',
            dataType: 'json',
            success: function(data){
                var time    =   data.recordset[0].LAST_REFRESH_TIME.replace('Z', '').replace('T', ' ');
                $("#last_refresh").text(time);
            }
        });
    }

    //Reload the JQGRID table on the Database Refresh
    function clear_search()
    {
        $("#home_grid").jqGrid('setGridParam', {
            datatype: 'json'
        }).trigger('reloadGrid');
    }

    //Reload the PROVIDERS JQGRID table on the Addition or Modification of Providers
    function Reload_Provider_Grid(){
        $("#Provider_Grid").jqGrid('setGridParam', {
            datatype: 'json'
        }).trigger('reloadGrid');
    }
	
	//FUNCTION TO POPULATE THE TABLE WITH THE DATA
    function Grid_Table_Populator()
	{
        Last_Refresh_time();
        //Populdate the Datatable with the WEB Feed data
        $("#home_grid").jqGrid({
            url: "/GET_PROXY_DATA",
            datatype: "json",
            mtype: "GET",
            iconSet: "fontAwesome",
            colNames: ["ID", "IP", "PORT", "COUNTRY", "LIVE","CREATED DT TM", "UPDATE DT TM", "PROVIDER", "ACTIVITY_DT_TM"],
            colModel: [{
                    name: "ID",
                    align: "center",
                    search: true,
                    hidden: true
                },
                {
                    name: "IP",
                    align: "center",
                    width: "120%",
                    search: true
                },
                {
                    name: "PORT",
                    align: "center",
                    search: true,
                    width: "120%"
                },
                {
                    name: "COUNTRY",
                    align: "center",
                    width: "130%",
                    search: true
                },
                {
                    name: "LIVE",
                    align: "center",
                    search: true,
                    width: "100%"
                },
                {
                    name: "CREATED_DT_TM",
                    align: "center",
                    width: "200%",
                    sorttype    : "datetime"
                },
                {
                    name: "UPDATE_DT_TM",
                    align: "center",
                    search: true,
                    width: "200%",
                    sorttype    : "datetime"
                },
                {
                    name: "PROVIDER",
                    align: "center",
                    search: true
                },
                {
                    name: "ACTIVITY_DT_TM",
                    align: "center",
                    search: true,
                    hidden:true
                }
            ],
            pager: "#home_pager",
            loadonce: true,
            shrinkToFit: true,
            rowNum: 10,
            autoHeight: true,
            rowList: [10, 15, 20, 25, 50],
            sortable: true,
            sortname: "ACTIVITY_DT_TM",
            sortorder: "desc",
            viewrecords: true,
            toolbar: [true, "top"],
            autowidth: true,
            caption: 'Proxy Data',
            loadComplete: function(data) {
                if($('#home_grid').getGridParam('records') === 1)
                {
                    $("#home_div").hide();
                    $("#home_grid").hide();
                    $('#home_pager').hide();
                    $("#No_Result").show();
                }
                else
                {
                    $("#No_Result").hide();
                    $("#home_div").show();
                    $("#home_grid").show();
                    $('#home_pager').show();
                }
            },
            beforeClear: function() {
                $(this.grid.hDiv)
                    .find(".ui-search-toolbar .ui-search-input>select[multiple] option")
                    .each(function () {
                        // unselect all options in <select>
                        this.selected = false; 
                    }
                );

                $(this.grid.hDiv)
                    .find(".ui-search-toolbar button.ui-multiselect")
                    .each(function () {
                        // synchronize jQuery UI Multiselect with <select>
                        $(this).prev("select[multiple]").multiselect("refresh");
                    }
                ).css({
                    width: "98%",
                    marginTop: "1px",
                    marginBottom: "1px",
                    paddingTop: "3px"
                });
            },

        });

         $("#home_grid").jqGrid('filterToolbar', {
            stringResult: true,
            searchOnEnter: false,
            defaultSearch: "cn"
        });

    }

        //Function to Populate the Provider Grid and Display the Data in Providers Page
    var Provider_Name = "";
    function Provider_Grid()
    {
        $("#Provider_Grid").jqGrid({
            url: "/Provider_Info",
            datatype: "json",
            mtype: "GET",
            colNames: ["Provider URL", "Last Refresh"],
            colModel:
            [
                {
                    name    : "PROVIDER",
                    align   : "center",
                    search  : true,
                    width   : "500%"
                },
                {
                    name    : "LAST_REFRESH_TIME",
                    align   : "center",
                    search  : true,
                    width   : "400%"
                }
            ],
            pager       : "#Provider_Pager",
            loadonce    : true,
            shrinkToFit : true,
            rowNum      : 5,
            sortname    : "LAST_REFRESH_TIME",
            sortorder   : "desc",
            autoHeight  : true,
            rowList     : [5, 10, 15],
            sortable    : true,
            viewrecords : true,
            toolbar     : [true, "top"],
            autowidth   : true,
            caption     : 'Proxy Providers',
            beforeClear: function() {
                $(this.grid.hDiv)
                    .find(".ui-search-toolbar .ui-search-input>select[multiple] option")
                    .each(function () {
                        // unselect all options in <select>
                        this.selected = false; 
                    }
                );

                $(this.grid.hDiv)
                    .find(".ui-search-toolbar button.ui-multiselect")
                    .each(function () {
                        // synchronize jQuery UI Multiselect with <select>
                        $(this).prev("select[multiple]").multiselect("refresh");
                    }
                ).css({
                    width: "98%",
                    marginTop: "1px",
                    marginBottom: "1px",
                    paddingTop: "3px"
                });
            },
        });

        $("#Provider_Grid").jqGrid('filterToolbar', {
            stringResult: true,
            searchOnEnter: false,
            defaultSearch: "cn"
        });
    }


        //Re-Size the Jqgrid based on the Zoom level to the Parent DIV
    $(window).resize(function() {
        var outerwidth = $('#Home_Jqgrid').width();
        $('#home_grid').setGridWidth(outerwidth); // setGridWidth method sets a new width to the grid dynamically

    });

    $(window).unbind('resize.myEvents').bind('resize.myEvents', function() {
        var outerwidth = $('#Home_Jqgrid').width();
        $('#home_grid').setGridWidth(outerwidth);
    });

       //Change the column height
    var home_grid1 = $("#home_grid");
    //$("thead:first tr.ui-jqgrid-labels", home_grid1[0].grid.hDiv).height(27);

    //Change the Caption height
    $("div#gview_" + home_grid1[0].id + " > div.ui-jqgrid-titlebar").height(17);

    //Center the Team Title
    $("#home_grid").closest("div.ui-jqgrid-view")
        .children("div.ui-jqgrid-titlebar")
        .css("text-align", "center")
        .children("span.ui-jqgrid-title")
        .css("float", "none");

    //Footer height
    $('#home_pager').css({
        "height": "27px"
    });

    $("#Provider_Grid").jqGrid('navGrid', '#Provider_Pager', {
        view: false,
        del: false,
        add: false,
        edit: false,
        excel: true,
        search: false,
        refresh: false
    })

      //Export the Details to Excel - button
    $("#home_grid").jqGrid('navGrid', '#home_pager', {
        view: false,
        del: false,
        add: false,
        edit: false,
        excel: true,
        search: false,
        refresh: false
    })
    .navButtonAdd('#home_pager', {
        caption: '<i class="fa fa-file-excel-o" aria-hidden="true" style="font-size:15px;"></i>',
        id: "Export_Proxy_Data",
        title: "Export Excel : Proxy Data",
        onClickButton: function() {
            window.location.href = 'Export_Proxy_Data';
        },
        position: "right"
    });

    //To Remove the uparrow in the add button grid
    $("div.ui-pg-div >span").removeClass("ui-icon ui-icon-save");
    $("div.ui-pg-div >span").removeClass("fa fa-lg fa-fw fa-external-link")
});