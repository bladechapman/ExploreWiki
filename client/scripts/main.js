

var w=3*$(window).width();
var h=3*$(window).height();

var circleWidth=3;

var force = d3.layout.force()
				.charge(-100)
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
	link = svg.selectAll('line')

sendWrapper(null, 'http://en.wikipedia.org/wiki/JavaScript');

// REFACTOR THIS
function refreshNodes(data_arr, nodes, links, parent_var, url_var) {
	var parent_node;
	if (parent_var == null) {
		parent_node = {
			name: url_var,
			parent: [],
			not_visible: false,
			root: true
		}
		nodes_dict[parent_node.name] = parent_node;
	}
	else parent_node = parent_var;

	for (var i in data_arr) {
		if (data_arr[i] == "" || data_arr[i].split('/').indexOf('en.wikipedia.org') == -1) continue;
		if (data_arr[i] in nodes_dict) {
			if (nodes_dict[data_arr[i]].parent.indexOf(parent_node) == -1) {
				nodes_dict[data_arr[i]].parent.push(parent_node);
			}
		}
		else {
			nodes_dict[data_arr[i]] = {
				name: data_arr[i],
				parent: [parent_node],
				not_visible: false
			}
		}
	}

	for(var i in nodes_dict) {
		if(!nodes_dict[i].not_visible) nodes.push(nodes_dict[i])
	}
	for (var i in nodes) {
		if(nodes[i].parent) {
			for (var k in nodes[i].parent) {
					links.push({
					source: nodes[i],
					target: nodes[i].parent[k]
				})
			}
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
							console.log('click')

							if(d.root == true) {
								for(var i in nodes_dict) {
									if (nodes_dict[i].parent.indexOf[d] != -1) {
										console.log('test')
										nodes_dict[i].not_visible = false;
									}
								}
								refreshSim(d);
							} else {
								d.root = true;
								d.not_visible = false;

								for(var i in nodes_dict) {
									if (!nodes_dict[i].root) nodes_dict[i].not_visible = true;
								}
								sendWrapper(d, d.name);
							}

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


