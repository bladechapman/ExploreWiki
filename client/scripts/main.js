

var w=$(window).width();
var h=$(window).height();

var circleWidth=3;

var force = d3.layout.force()
				.charge(-50)
				.gravity(0.2)
				.linkDistance(5)
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
	link = svg.selectAll('line');

sendWrapper(null, 'http://en.wikipedia.org/wiki/JavaScript');

// REFACTOR THIS
function refreshNodes(data_arr, nodes, links, parent_var, url_var) {
	if (!data_arr || data_arr == []) return;

	var parent_node;
	if (!parent_var) {
		parent_node = {
			name: url_var,
			parent: [],
			is_visible: true,
			root: true,
			collapsed: false
		}
	}
	else {
		parent_node = parent_var;
		parent_node.root = true;
		parent_node.is_visible = true;
		parent_node.collapsed = (parent_node.collapsed) ? false : true
	}

	nodes_dict[parent_node.name] = parent_node;
	data_arr.forEach(function(data_name) {
		if(data_name == "" || data_name.indexOf('en.wikipedia.org/') == -1 || data_name.indexOf('/wiki') == -1 || data_name.indexOf('#') != -1)
			return;

		if (data_name in nodes_dict) {
			if (nodes_dict[data_name].parent.indexOf(parent_node) == -1) {
				nodes_dict[data_name].parent.push(parent_node);
				nodes_dict[data_name].is_visible = true;
			}
		}
		else {
			nodes_dict[data_name] = {
				name: data_name,
				parent: [parent_node],
				is_visible: true,
				root: false,
				collapsed: true
			}
		}
	})

	for (var i in nodes_dict) {
		if(!nodes_dict[i].root) {
			nodes_dict[i].is_visible = false;
			for (var k in nodes_dict[i].parent) {
				if (!nodes_dict[i].parent[k].collapsed) {
					nodes_dict[i].is_visible = true;
				}
			}
		}
		else {
			nodes_dict[i].is_visible = true;
		}
	}

	for (var i in nodes_dict) {
		if (nodes_dict[i].is_visible)
			nodes.push(nodes_dict[i])
	}
	for (var i in nodes) {
		for (var k in nodes[i].parent) {
			links.push({
				source: nodes[i],
				target: nodes[i].parent[k]
			})
		}
	}
}

function refreshSim(parent_var, url_var) {
	var nodes=[], links=[];
	var data_arr = this.data.split('\n');
	refreshNodes(data_arr, nodes, links, parent_var, url_var);

	link.remove();
	link = svg_g.selectAll('line')
				.data(links)
				.enter().append('line')
					.attr('stroke', function(d) {
						if(d.source.root && d.target.root) return palette.gray;
					})

	node.remove();
	node = svg_g.selectAll('circle')
				.data(nodes)
				.enter().append('g')
					.append('circle')
						.attr({
							'r' : function(d) {
								if(d.root && !d.collapsed) return 2 * circleWidth;
								return circleWidth;
							},
							'fill' : function(d) {
								if(d.root == true) return palette.pink;
								return palette.blue;
							}
						})
						.on('mouseover', function(d) {
							$('#info').text('url: ' + d.name)
						})
						.on('click', function(d) {
							console.log('click')
							sendWrapper(d, d.name);
						})

	force.nodes(nodes).links(links).start()
}

function sendWrapper(parent_var, url_var) {
	sendPostRequest('http://localhost:1337', 'url=' + url_var, refreshSim, parent_var, url_var)
}

function sendPostRequest(host, post_data, callback) {
	var xmlHttp = new XMLHttpRequest();
	xmlHttp.open('POST', host, true);
	xmlHttp.setRequestHeader('Content-type','text/plain');
	xmlHttp.send(post_data);
	this.arguments = arguments;
	xmlHttp.onreadystatechange=function() {
	  	if (xmlHttp.readyState==4 && xmlHttp.status==200) {
	    	this.data = xmlHttp.responseText;
	    	var sliced = Array.prototype.slice.call(this.arguments, 3);
	    	callback.bind(this).apply(this, sliced);
	    }
	}.bind(this)
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


