

var w=$(window).width();
var h=$(window).height();

var circleWidth=2;

var force = d3.layout.force()
				.charge(-10)
				.gravity(0.2)
				.linkDistance(3)
				.size([w, h])
				.on('tick', tick)

var svg = d3.select('#chart')
				.append('svg')
				.attr({
					'width' : w,
					'height' : h
				});
var svg_g = svg.append('g')
					.attr('id', 'svg_g');

var nodes_dict = {};

var node = svg.selectAll('circle'),
	link = svg.selectAll('line')

sendWrapper(null, 'http://en.wikipedia.org/wiki/JavaScript');

function sendWrapper(parent_var, url_var) {
	sendRequest('http://localhost:1337', 'url=' + url_var, function() {
		var data_arr = this.data.split('\n');

		var parent_node;
		if (parent_var == null) {
			parent_node = {
				name: url_var,
				parent: [null],
				root: true
			}
			nodes_dict[parent_node.name] = parent_node;
		}
		else parent_node = parent_var;

		for (var i in data_arr) {
			if (data_arr[i] in nodes_dict && nodes_dict[data_arr[i]].parent.indexOf(parent_node) == -1) {
				nodes_dict[data_arr[i]].parent.push(parent_node);
			}
			else {
				nodes_dict[data_arr[i]] = {
					name: data_arr[i],
					parent: [parent_node]
				}
			}
		}

		var nodes=[], links=[];
		for(var i in nodes_dict) {
			nodes.push(nodes_dict[i])
		}
		for(var i in nodes) {
			if(nodes[i].parent) {
				for(var k in nodes[i].parent) {
					if(nodes[i].parent[k]) {
						links.push({
							source: nodes[i],
							target: nodes[i].parent[k]
						})
					}
				}
			}
		}

		// for (var i in nodes) {
		// 	if(nodes[i].parent) {
		// 		links.push({
		// 			source: nodes[i],
		// 			target: nodes[i].parent
		// 		})
		// 	}
		// }

		// link.remove();
		// link = svg_g.selectAll('line')
		// 			.data(links)
		// 			.enter().append('line')
		// 				.attr('stroke', palette.gray)

		node.remove();
		node = svg_g.selectAll('circle')
					.data(nodes)
					.enter().append('g')
						.append('circle')
							.attr({
								'r' : circleWidth,
								'fill' : function(d) {
									if(d.root == true) return palette.pink;
									return palette.blue;
								}
							})
							.on('mouseover', function(d) {
								$('#info').text('url: ' + d.name)
							})
							.on('click', function(d) {
								d.root = true;

								// for (var i in nodes) {
								// 	nodes[i].fixed = true;
								// }

								sendWrapper(d, d.name);
							})

		force.nodes(nodes).links(links).start()
	})
}

function sendRequest(host, post_data, callback) {
	var xmlHttp = new XMLHttpRequest();
	xmlHttp.open('POST', host, true);
	xmlHttp.setRequestHeader('Content-type','text/plain');
	xmlHttp.send(post_data);

	xmlHttp.onreadystatechange=function() {

	  	if (xmlHttp.readyState==4 && xmlHttp.status==200) {
	    	this.data = xmlHttp.responseText;
	    	callback.bind(this)();
	    }
	}
}

function tick() {
	node
		.attr('transform', function(d, i) {
			return 'translate(' + d.x + ', ' + d.y + ')';
		})

	link
		.attr('x1', function(d) {return d.source.x; })
        .attr('y1', function(d) {return d.source.y; })
        .attr('x2', function(d) {return d.target.x; })
        .attr('y2', function(d) {return d.target.y; })
}


