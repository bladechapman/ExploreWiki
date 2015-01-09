

var w=$(window).width();
var h=$(window).height();

var circleWidth=5;

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

var nodes=[], links=[];

var node = svg.selectAll('circle'),
	link = svg.selectAll('line')


sendRequest('http://localhost:1337', 'url=http://wikipedia.org', function() {
	var data_arr = this.data.split('\n');
	var parent_node = {
		name: 'http://wikipedia.org',
		parent: null
	}
	for (var i in data_arr) {
		nodes.push({
			name: data_arr[i],
			parent: parent_node
		})

		links.push({
			source: nodes[i],
			target: nodes[i].parent
		})
	}
	nodes.push(parent_node)

	node = svg.selectAll('circle')
				.data(nodes)
				.enter().append('g')
					.append('circle')
						.attr({
							'r' : circleWidth,
							'fill' : function(d) {
								if(d.parent == null) return palette.pink;
								return palette.blue;
							}
						})

	force.nodes(nodes).links(links).start()
})

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


