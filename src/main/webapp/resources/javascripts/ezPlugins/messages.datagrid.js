/**
 * @description 交易列表插件，只针对交易数据实现
 * @author SHENT
 * @date 2015-02-05
 * @work with jQuery & jQuery UI
 */
(function($){
	
	$.changeoptions = {
		/**
		 * @description 用于应用流数据排序的字段
		 */
		order_column_array_app : ["", "_start_at_ms",
		    "_src_ip", "_dst_ip", "_trans_id","_latency_msec"
		],
		/**
		 * @description 用于网络流数据排序的字段
		 */
		order_column_array_net : ["", "_start_at",
		    "_ipv4_src_addr", "_ipv4_dst_addr","_in_bytes","_out_bytes","_total_nw_latency_ms"
		],
		/**
		 * 网络数据表头
		 */
		net_columns : [
		    {
	 			"class":          'details-control',
	 			"orderable":      false,
	 			"data":           null,
	 			"defaultContent": '',
	 			"width": 1
	 		},
	 		{ "data": "_start_at_format_str", "class": "dt-left"  },
	 		{ "data": "_ipv4_src_addr","class": "dt-left"  },
	 		{ "data": "_ipv4_dst_addr", "class": "dt-left" },
	 		{ "data": "_in_bytes", "class": "dt-left" },
	 		{ "data": "_out_bytes", "class": "dt-right" },
	 		{ "data": "_total_nw_latency_ms", "class": "dt-right" }
	 	],
		net_columnDefs : [
		    {
	    	  "render": function ( data, type, row ) {
	    		  return data +':'+ row._l4_src_port;
	    	  },
	    	  "targets": 2
	        },
	        {
	        	"render": function ( data, type, row ) {
	        		return data +':'+ row._l4_dst_port;
	        	},
	        	"targets": 3
	        },
	        {
	        	"render": function ( data, type, row ) {
	        		return data;
	        	},
	        	"targets": 4
	        },
	        {
	        	"render": function ( data, type, row ) {
	        		return data;
	        	},
	        	"targets": 5
	        },
	        {
	        	"render": function ( data, type, row ) {
	        		return data;
	        	},
	        	"targets": 6
	        }
	    ]
	};
	
	/**
     * @description messagegrid 控件
     * @param {$.fn.messagegrid.defaults} options 参数或者调用名
     * @param {Param} param 参数
     * @return {$.fn.messagegrid}
     */
    $.fn.messagegrid = function (options, param) {
        if (typeof options == "string") {
            return $.fn.messagegrid.methods[options](this, param);
        }
        options = options || {};
        return this.each(function () {
            var state = $.data(this, "messagegrid");
            if (state) {
                $.extend(state.options, options);
            } else {
            	if(options.ajax.data.stream_type == "1"){//处理网络流
            		options.columns = $.changeoptions.net_columns;
            		options.columnDefs = $.changeoptions.net_columnDefs;
            	}
                state = $.data(this, "messagegrid", {
                    options: $.extend({}, $.fn.messagegrid.defaults, options)
                });
                init(this, state.options);
            }
        });
    };
    /**
     * @class
     * @extends external:{$.fn.messagegrid}
     * @description 默认选项
     * @return {$.fn.messagegrid.defaults} 默认数据
     */
	$.fn.messagegrid.defaults = {
		"dom":'<"ez-dataTables-area top clearfix"lf><t><"ez-dataTables-area bottom clearfix"ipr>',
		"language": {
			"lengthMenu": "每页 _MENU_ 条记录",
			"zeroRecords": "查无数据",
			"info": "_PAGE_ / _PAGES_，共 _MAX_ 条记录",
			"infoEmpty": "暂无数据",
			"infoFiltered": "(共 _MAX_ 条记录，其中未能匹配到您检索的信息)",
			"search":"检索",
			"processing":"加载中...",
			"oPaginate":{
					"sNext": ">",
					"sPrevious": "<"
				}
		},
		"scrollY": "300px",
        "scrollCollapse": true,
        "searching": false,
		"serverSide": true,
		"processing": true,
		"columns": [
	   	     {
	 			"class":          'details-control',
	 			"orderable":      false,
	 			"data":           null,
	 			"defaultContent": '',
	 			"width": 1
	 		},
	 		{ "data": "_start_at_formatted", "class": "dt-left"  },
	 		{ "data": "_src_ip","class": "dt-left"  },
	 		{ "data": "_dst_ip", "class": "dt-left" },
	 		{ "data": "_trans_id_renamePOJOs", "class": "dt-left" },
	 		{ "data": "_latency_msec", "class": "dt-right" }
	 	],
		"order": [[1, 'desc']],
		"columnDefs": [
       		{
      		  "render": function ( data, type, row ) {
      			 return data +':'+ row._sport;
      		  },
      		  "targets": 2
      		},
      		{
      		  "render": function ( data, type, row ) {
      			 return data +':'+ row._dport;
      		  },
      		  "targets": 3
      		},
      		{
      		  "render": function ( data, type, row ) {
      			 if(data != null){
      				 return "<span title='"+ data.value +"'>"+data.value_rename+"</span>";
      			 }else{
      				 return "";
      			 }
      		  },
      		  "targets": 4
      		},
      		{
      		  "render": function ( data, type, row ) {
      			 return data + " ms";
      		  },
      		  "type": "numeric-comma",
      		  "targets": 5
      		}
      	]
	};
		
    /**
     * @class
     * @extends external:{$.fn.messagegrid}
     * @description messagegrid 调用方法
     */
    $.fn.messagegrid.methods = {
        /**
         * @description 获取 messagegrid 选项
         * @param {Object} jq 对象
         * @return {$.fn.messagegrid.defaults} messagegrid 选项
         */
        options: function (jq, data) {
            if (typeof data == "undefined") {
                return $.data(jq[0], "messagegrid").options;
            }
            data = data || {};
            $.data(jq[0], "messagegrid", {options: $.extend({}, $.data(jq[0], "messagegrid").options, data)});
            return $.data(jq[0], "messagegrid").options;
        },
        /**
         * @description 销毁messagegrid
         * @param {Object} jq 对象
         * @return
         */
        destroy : function(jq){
        	$(jq[0]).removeData("messagegrid");
        	$(jq[0]).unbind();
        	if($.data(jq[0], "dataTable")){
        		$.data(jq[0], "dataTable").clear();
        		$.data(jq[0], "dataTable").destroy();
        		$(jq[0]).removeData("dataTable");
        	}
        },
        /**
         * @description 重新加载数据表格
         * @param {Object} jq 对象
         * @param {Object} params 查询参数
         * @return
         */
        reload:function(jq, params){
        	var options = $.data(jq[0], "messagegrid").options;
        	options.ajax.data = params;
        	$.data(jq[0], "messagegrid", {options: options});
        	$.data(jq[0], "dataTable").ajax.reload();
        }
    };
    /**
     * @description 初始化数据表格及事件处理等
     * @param target 对象
     * @param options 初始化选项
     */
    function init(target, options){
    	$.data(target, "dataTable", $(target).DataTable(options));
		$(target).find("tbody > tr[role='row']").die("click").live("click",function () {//行点击事件
			var tr = $(this);
			var table = $.data(target, "dataTable");
			var row = table.row( tr );
			if (row.child.isShown()) {
				row.child.hide();
				tr.removeClass('shown');
				$('div.slider', row.child()).hide();
			}else {
				if(row.child()== undefined){
					var rowData = row.data();
					if(rowData != null){
						if(rowData.facility.toString() == "0"){
							row.child(appendAppChild(rowData, target, tr), 'no-padding' ).show();
						}else{
							row.child(appendNetChild(rowData, target, tr), 'no-padding' ).show();
						}
					}
				}else{
					row.child.show();
				}
				tr.addClass('shown');
				$('div.slider', row.child()).show();
			}
		});
		$(target).on('page.dt', function () {	//分页事件
		    var info = $.data(target, "dataTable").page.info();
		    var options = $.data(target, "messagegrid").options;
		    options.ajax.data.page = (info.page + 1);
		});
		$(target).on('length.dt', function ( e, settings, len ) { //切换每页条数事件
			var info = $.data(target, "dataTable").page.info();
		    var options = $.data(target, "messagegrid").options;
		    options.ajax.data.page = (info.page + 1);
		});
		$(target).on('preXhr.dt', function ( e, settings, data ) { //查询执行之前拦截事件 
			var options = $.data(target, "messagegrid").options;
			var params =  options.ajax.data;
			data.missingFields = params.missingFields;
			data.orFilters = params.orFilters;
			for(var k in params){
				data[k] = params[k];
			}
			if($.data(target, "dataTable") != null){
				var order = $.data(target, "dataTable").order();
				var index = order[0][0];
				if(params.stream_type == "0"){
					data.sort_name = $.changeoptions.order_column_array_app[index]; //排序字段
				}else{
					data.sort_name = $.changeoptions.order_column_array_net[index]; //排序字段
				}
				data.sort_type = order[0][1];			    	    //排序方式
			}
	    });
    }
	/**
	 * @description 组合应用流交易详细信息
	 * @param {Object} d 数据对象
	 * @param {Object} target
	 * @param {Object} trObj
	 */
	function appendAppChild(d, target, trObj) {
		var transIdRenamePOJOs = d._trans_id_renamePOJOs;
		var transIdValue = (transIdRenamePOJOs != null) ? transIdRenamePOJOs.value : "";
		var top_html ='<div class="slider-data-item-container">'+
					  '<span>交易代码：</span>'+
					  '<span title="参数原名：'+ transIdValue +'，点击进入多维分析">'+
					  	'<a href="javascript:void(0);" class="js-drilldown" key="_trans_id" value="'+ transIdValue +'">'+ transIdValue +'</a></span>'+
					  '</div>'+
					  '<div class="slider-data-item-container">'+
							'<span>响应时长：</span>'+
							'<span title="总时长（传输时长）">'+ d._latency_msec +' ms (' + d._trans_transfer_ms +  ' ms)</span>'+
					  '</div>'+
			 		  '<div class="slider-data-item-container">'+
					 	'<span>源：</span>'+
					 	'<span>'+d._src_ip+':'+d._sport+'</span>'+
					  '</div>'+
					  '<div class="slider-data-item-container">'+
					  	 '<span>目的：</span>'+
					  	 '<span>'+d._dst_ip+':'+d._dport+'</span>'+
					  '</div>'+
					  '<div class="slider-data-item-container">'+
						 '<span>交易时间：</span>'+
						 '<span>'+ d._start_at_formatted +'</span>'+
					  '</div>'+
					  '<div class="slider-data-item-container">'+
						   '<span>索引时间：</span>'+
						   '<span>'+ new Date(d.created_at*1000).pattern("yyyy-MM-dd HH:mm:ss.S") +'</span>'+
					  '</div>'+
					  '<div class="slider-data-item-container">'+
						  '<span>探针：</span>'+
						  '<span>'+ d._probe_name +'</span>'+
					  '</div>';
			
	  var middle_html = '<div class="slider-data-item-container">'+
							'<span>字节（包数）：</span>'+
							'<span title="in/out">'+ d._in_bytes+'/'+ d._out_bytes +' ('+ d._in_pkts+'/'+ d._out_pkts +')</span>'+
						'</div>'+
						'<div class="slider-data-item-container">'+
							'<span>重传 ：</span>'+
							'<span title="in/out">'+d._in_retran+'/'+ d._out_retran +'</span>'+
						'</div>'+
					    '<div class="slider-data-item-container">'+
							'<span>乱序：</span>'+
							'<span title="in/out">'+ d._in_ooo+'/'+ d._out_ooo +'</span>'+
						'</div>'+
						'<div class="slider-data-item-container">'+
							'<span>传播延迟(RTT)：</span>'+
							'<span>'+ d._rtt +' ms</span>'+
						'</div>'+
						'<div class="slider-data-item-container">'+
							'<span>零窗口事件：</span>'+
							'<span title="in/out">'+ d._tot_zero_client+'/'+ d._tot_zero_server +'</span>'+
						'</div>'+
						'<div class="slider-data-item-container">'+
							'<span>SYN , Fin , RST：</span>'+
							'<span title="in/out">'+ d._tot_syn+'/'+ d._tot_synack +' , '+d._tot_fin+'/'+ d._tot_fin_s +' , '
							+ d._tot_rst+'/'+ d._tot_rst_s +'</span>'+
						'</div>';
					
		var track_html = '<div class="slider-data-item-container js-trackdiv"><span>业务路径：加载中...</span></div>';
		var streams_html = '<div class="slider-data-item-container js-streamsdiv"><span>所属流：加载中...</span></div>';
		
		top_html = '<tr><td><span class="slider-inner-table-title"> 基本信息</span></td><td>'+ top_html +'</td></tr>';
		middle_html = '<tr><td><span class="slider-inner-table-title"> 网络指标</span></td><td>'+ middle_html +'</td></tr>';
		track_html = '<tr><td><span class="slider-inner-table-title"> 交易追踪</span></td><td>'+ track_html +'</td></tr>'+
					 '<tr><td><span class="slider-inner-table-title"> 所属流</span></td><td>'+ streams_html +'</td></tr>';
		bottom_html = getBottomHtml(d);
		getToposHtml(d, target, trObj);
		//钻取
		$(".js-drilldown").die("click").live("click", function(){
			drillDwonDimension($(this), target);
		});
		//交易追踪
		$(".js-message-track").die("click").live("click", function(){
			var options = $.data(target, "messagegrid").options;
	    	var params = options.ajax.data;
	    	var from = params.from;
	    	var to = params.to;
	    	var messageId = $(this).attr("messageId");
	    	var streamId = $(this).attr("streamId");
	    	var topoId = $(this).attr("topoId");
	    	goTrack(messageId, streamId, topoId, from, to);
		});
		return '<div class="slider" style="padding-left:30px; padding-right:5px;">' +
					'<table class="slider-inner-table" cellpadding="5" cellspacing="0" border="0">'+
						top_html+
				 		middle_html+
				 		track_html+
				 		bottom_html+
					'</table>'+
				'</div>';
	}
	
	/**
	 * @description 组合网络流交易详细信息
	 * @param {Object} d 数据对象
	 * @param {Object} target
	 * @param {Object} trObj
	 */
	function appendNetChild(d, target, trObj) {
		var top_html = '';
		top_html+='<div class="slider-data-item-container">'+
					 '<span>源IP(IPv4)：</span>'+
					 '<span>'+d._ipv4_src_addr+':'+d._l4_src_port+'</span>'+
				  '</div>'+
				  '<div class="slider-data-item-container">'+
				  	 '<span>目的IP(IPv4)：</span>'+
				  	 '<span>'+d._ipv4_dst_addr+':'+d._l4_dst_port+'</span>'+
				  '</div>'+
				  '<div class="slider-data-item-container">'+
					 '<span>源MAC地址：</span>'+
					 '<span>'+ d._in_src_mac +'</span>'+
				  '</div>'+
				  '<div class="slider-data-item-container">'+
					 '<span>目的MAC地址：</span>'+
					 '<span>'+ d._out_dst_mac +'</span>'+
				  '</div>'+
				  '<div class="slider-data-item-container">'+
					 '<span>输入接口的SNMP IDX：</span>'+
					 '<span>'+ d._input_snmp +'</span>'+
				  '</div>'+
				  '<div class="slider-data-item-container">'+
					 '<span>输出接口的SNMP IDX：</span>'+
					 '<span>'+ d._output_snmp +'</span>'+
				  '</div>'+
				  '<div class="slider-data-item-container">'+
					 '<span>网络协议：</span>'+
					 '<span title="协议名称:协议">'+ d._protocol_map+':'+d._protocol +'</span>'+
				  '</div>'+
				  '<div class="slider-data-item-container">'+
					 '<span>TCP标志位：</span>'+
					 '<span>'+ d._tcp_flags +'</span>'+
				  '</div>'+
				  '<div class="slider-data-item-container">'+
					 '<span>ICMP类型：</span>'+
					 '<span>'+ d._icmp_type +'</span>'+
				  '</div>'+
				  '<div class="slider-data-item-container">'+
					 '<span>通信对：</span>'+
					 '<span>'+ d._link +'</span>'+
				  '</div>'+
				  '<div class="slider-data-item-container">'+
					 '<span>通信时间：</span>'+
					 '<span>'+ d._start_at_format_str +'</span>'+
				  '</div>'+
				  '<div class="slider-data-item-container">'+
					   '<span>索引时间：</span>'+
					   '<span>'+ new Date(d.created_at*1000).pattern("yyyy-MM-dd HH:mm:ss.S") +'</span>'+
				  '</div>'+
				  '<div class="slider-data-item-container">'+
					  '<span>探针：</span>'+
					  '<span>'+ d._probe_name +'</span>'+
				  '</div>';
		
		var middle_html = 
					'<div class="slider-data-item-container">'+
						'<span>字节（包数）：</span>'+
						'<span title="in/out">'+ d._in_bytes+'/'+ d._out_bytes +' ('+ d._in_pkts+'/'+ d._out_pkts +')</span>'+
					'</div>'+
					'<div class="slider-data-item-container">'+
						'<span>重传 ：</span>'+
						'<span title="in/out">'+d._retransmitted_in_pkts+'/'+ d._retransmitted_out_pkts +'</span>'+
					'</div>'+
				    '<div class="slider-data-item-container">'+
						'<span>乱序 ：</span>'+
						'<span title="in/out">'+d._ooorder_in_pkts+'/'+ d._ooorder_out_pkts +'</span>'+
					'</div>'+
				    '<div class="slider-data-item-container">'+
						'<span>零窗口 ：</span>'+
						'<span title="in/out">'+d._tcp_win_zero_in+'/'+ d._tcp_win_zero_out +'</span>'+
					'</div>'+
					'<div class="slider-data-item-container">'+
						'<span>tcp连接建立时间：</span>'+
						'<span>'+ d._tcp_est_latency_ms +'</span>'+
					'</div>'+
		    		'<div class="slider-data-item-container">'+
						'<span>连接状态：</span>'+
						'<span>'+ d._tcp_flow_state +'</span>'+
					'</div>'+
					'<div class="slider-data-item-container">'+
						'<span>响应时间：</span>'+
						'<span>'+ d._appl_latency_ms +'</span>'+
					'</div>'+
					'<div class="slider-data-item-container">'+
						'<span>Keeplive包数：</span>'+
						'<span>'+ d._total_keepalive +'</span>'+
					'</div>'+
					'<div class="slider-data-item-container">'+
						'<span>数据包分片数：</span>'+
						'<span>'+ d._fragments +'</span>'+
					'</div>'+
					'<div class="slider-data-item-container">'+
					 '<span>0-128字节包数：</span>'+
					 '<span>'+ d._num_pkts_up_to_128_bytes +'</span>'+
				    '</div>'+
				    '<div class="slider-data-item-container">'+
					 '<span>1024-1514字节包数：</span>'+
					 '<span>'+ d._num_pkts_over_1514_bytes +'</span>'+
				    '</div>';
		top_html = '<tr><td><span class="slider-inner-table-title"> 基本信息</span></td><td>'+ top_html +'</td></tr>';
		middle_html = '<tr><td><span class="slider-inner-table-title"> 网络指标</span></td><td>'+ middle_html+'</td></tr>';

		return '<div class="slider" style="padding-left:30px; padding-right:5px;">' +
					'<table class="slider-inner-table" cellpadding="5" cellspacing="0" border="0">'+
						top_html+
				 		middle_html+
					'</table>'+
				'</div>';
	}
	
	/**
	 * @description 返回交易参数等展示信息
	 * @param d 数据
	 */
	function getBottomHtml(d){
		var _more_data = [{
			"title":"交易参数",
			"key":"_trans_ref"
		},{
			"title":"返回代码",
			"key":"_ret_code"
		},{
			"title":"返回参数",
			"key":"_ret_code_x"
		}];
		
		var _blackList = ["UUID","SERIALNUM"];
		var sqlKey = ["INSERT_SQL", "SELECT_SQL", "UPDATE_SQL", "SQL"];
        var sqlHashKey = ["INSERT_SQL_hash", "SELECT_SQL_hash", "UPDATE_SQL_hash", "SQL_hash"];
		var _getData = function(mainKey, _obj){
			var _return = '';
			if(_obj){
				for(var key in _obj){
					if(_blackList.indexOf(key) === -1 && sqlHashKey.indexOf(key) === -1){
                        var text = (_obj[key] === null ? "" :_obj[key].toString());
					    var index = sqlKey.indexOf(key);
					    var subKey = key;
                        var v = (_obj[key] === null ? "" :_obj[key].toString());
                        if(index >= 0){
                            subKey = sqlHashKey[index];
                            v = (_obj[subKey] === null ? "" :_obj[subKey].toString());
                        }
						_return +=
							'<div class="slider-data-item-container">'+
								'<span>'+ key + '：</span>'+
								'<span><a href="javascript:void(0)" class="js-drilldown" key="'+mainKey+"."+subKey+'" '+
								'value="'+ v.escapeHTML() +'" title="以此为参数进行多维分析">'+ text.escapeHTML() +'</a></span>'+
							'</div>';
					}
				}
			}
			return _return;
		};
		
		var bottom_html = '';
		for(var _item in _more_data){
			var key = _more_data[_item].key;
			var value = _getData(key, d[key]);
			if(d[_more_data[_item].key] && value != ''){
				bottom_html += 
					'<tr>'+
						'<td>'+
							'<span class="slider-inner-table-title">'+ _more_data[_item].title +'</span>'+
						'</td>'+
						'<td>'+
						 value+
						'</td>'+
					'</tr>';
			}
		}
		return bottom_html;
	}
	/**
	 * 获取交易追中需要的业务路径
	 * @param {Object} d
	 * @param {Object} target
	 * @param {Object} trObj
	 */
	function getToposHtml(d, target, trObj){
		var options = $.data(target, "messagegrid").options;
    	var params = options.ajax.data;
    	var streamIds = params.stream_id;
    	var msgStreams = d.streams;
    	$.ajax({
    		type :"get",
    		url : SUBSYSTEM_APP_NAME + "dimension/getToposForMessageTrack",
    		data : {
    			selectStreams : streamIds,
    			messageStreams : msgStreams
    		},
    		success:function(data){
    			if(data.success){
    				var track_html =  '<span>业务路径：</span>';
    				var stream_html = '<span>所属流：</span>';
    				var haveTops = false;
    				for(var i in data.obj){
	   		   			 var stream = data.obj[i];
	   		   			 if(stream != null){
	   		   				 var streamId = stream.id, streamName = stream.name;
	   		   				 stream_html += '<span class="topos-checked" style="padding-right: 8px;" title="'+streamName+'">';
	   		   				 stream_html += '<a class="js-drilldown" streamId="'+streamId+'" href="javascript:void(0);">'+streamName+'</a></span>';
	   		   				 for(var j in stream.topos){
	   		   					 var topos = stream.topos[j];
	   		   					 track_html += '<span class="topos-checked" style="padding-right: 8px;" title="'+streamName+'">';
	   		   					 track_html += '<a messageId="'+d.i+'" streamId="'+streamId+'" topoId="'+topos.id+'" ';
	   		   					 track_html += 'class="js-message-track" href="javascript:void(0);">'+topos.name+'</a></span>';
	   		   					 haveTops = true;
	   		   				 }
	   		   			 }
	   		   		}
    				trObj.next().find(".js-streamsdiv").html(stream_html);
    				if(haveTops){
    					trObj.next().find(".js-trackdiv").html(track_html);
    				}else{
    					trObj.next().find(".js-trackdiv").html('<span class="topos-checked"> 无可追踪的业务路径</span>');
    				}
    			}else{
    				trObj.next().find(".js-trackdiv").html('<span class="topos-checked"> 无可追踪的业务路径</span>');
    				trObj.next().find(".js-streamsdiv").html('<span class="topos-checked"> 无所属流</span>');
    			}
    		}
    	});
	}
	/**
	 * @description 钻取至多维分析
	 * @param {Object} obj 参数
	 * @param {Object} target 
	 */
	function drillDwonDimension(obj, target){
		var options = $.data(target, "messagegrid").options;
    	var params = options.ajax.data;
    	var paramObj = new Object();
    	var streamId = obj.attr("streamId");
		if(params.from != null){
			paramObj.from = params.from;
		}
		if(params.to != null){
			paramObj.to = params.to;
		}
		if(params.filters != null){
			var objFilter = new Object();
			for(var k in params.filters){
				objFilter[k] = params.filters[k];
			}
			paramObj.filters = objFilter;
		}else{
			paramObj.filters ={};
		}
		if(streamId != null && streamId != ""){ //流钻取
			paramObj.stream_id = streamId;
		}else{
			var key = obj.attr("key");
			var value = obj.attr("value");	//参数钻取
			if(params.stream_id != null && params.stream_id != ""){
				paramObj.stream_id = params.stream_id;
			}
			paramObj.filters[key] = value;
			paramObj.dimensionMetric = key; //选中默认分析维度
		}
		if(params.conds != null){
			paramObj.conds = params.conds;
		}
		var url = SUBSYSTEM_APP_NAME + "dimension/messageanalysis?";
		url += $.param(paramObj);
		openWindow(url, true);
	}
	/**
     * @description 跳转到交易追踪页面
     * @param {String} messageId
     * @param {String} streamId
     * @param {String} topoId
     * @param {Number} from
     * @param {Number} to
     */
    function goTrack(messageId, streamId, topoId, from, to) {
        if (messageId == "") {
            GMS.error("Message 信息 id 字段为空，不可追踪！", 3000);
            return;
        }
        //isStatisticalAllMessagesMaxSize = true 限制最大条数显示
        //isSmartFilter = false 不进行智能过滤 
        //interval = 5s  时间偏差
        //三个参数拼接到最后，且顺序保持，在 messagetrack.jsp 会进行截取进行参数修改跳转
        var url = SUBSYSTEM_APP_NAME + "messagetrack/" + messageId + "/messageTrackByTopos?";
            url += "streamid=" + streamId + "&topoid=" + topoId+"&from=" + from + "&to=" + to;
            url += "&isStatisticalAllMessagesMaxSize=true&interval=5&isSmartFilter=false";
        openWindow(url, true);
    }
})(jQuery);
