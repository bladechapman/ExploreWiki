// network optimization: event based recalculation? (send request and continue dijkstra's. When request is received, redo calc if not found)

var start = 'http://en.wikipedia.org/wiki/Wikipedia:Wiki_Game';
// var end = 'http://en.wikipedia.org/wiki/Wikipedia';
var end = 'http://en.wikipedia.org/wiki/Flammability'

var connections = [];

var loaded = {};
var unvisited = {};	// ensure these sets are exclusive
var visited = {};

var found = false;

initialize(start, end)

function initialize(start, end) {
	this.addEventListener('data_received', iterate)
	loaded = {};
	unvisited = {};
	visited = {};
	found = false;

	// initialize
	sendWrapper(start);
}


function iterate() {
	var min_node = findMinDistNode(unvisited);

	visited[min_node.name] = min_node;
	delete unvisited[min_node.name];

	if (min_node.name == end) {
		console.log('---------- FOUND ----------');
		found = true;
		this.removeEventListener('data_received', iterate);
		console.log(findPath(min_node));
		return;
	}

	console.log('-------- MIN NODE --------')
	console.log(min_node)

	console.log('-------- NEIGHBORS --------');

	for (var i in min_node.neighbors) {
		tent_dist = min_node.dist + 1;
		if (tent_dist < min_node.neighbors[i].dist) {
			console.log('-------- MINIFIED --------');
			min_node.neighbors[i].dist = tent_dist;
			min_node.neighbors[i].prev = min_node;
			console.log(min_node.neighbors[i])
		}

		if (!min_node.neighbors[i].loaded) sendWrapper(min_node.neighbors[i].name);
	}

	if (!isEmpty(unvisited)) iterate();
}

function addData(url_to_load) {
	if (found) return;

	var data_arr = this.data.split('\n');
	data_arr.push(url_to_load);
	for (var i in data_arr) {
		if (!valid_address(data_arr[i])) continue;

		if (data_arr[i] in visited) {
			unvisited[data_arr[i]] = visited[data_arr[i]];
			delete visited[data_arr[i]];

			console.log('------REPEAT------')
			console.log(unvisited[data_arr[i]]);
			continue;
		}

		if (!(data_arr[i] in unvisited)) {	// not in visited join unvisited
			unvisited[data_arr[i]] = {
				name: data_arr[i],
				prev: null,
				dist: (data_arr[i] == url_to_load) ? 0 : Number.MAX_SAFE_INTEGER,
				neighbors: {},
				loaded: data_arr[i] == url_to_load
			}
			if (unvisited[data_arr[i]].loaded) {loaded[data_arr[i]] = true}
		}
	}
	var parent_node = unvisited[url_to_load];

	for (var i in data_arr) {
		if (!valid_address(data_arr[i])) continue;
		var node = unvisited[data_arr[i]];

		if (node == parent_node) {
			for (var k in data_arr) {
				if (!valid_address(data_arr[k])) continue;
				if (data_arr[k] != parent_node.name && !(parent_node in unvisited[data_arr[k]].neighbors))
					node.neighbors[unvisited[data_arr[k]].name] = unvisited[data_arr[k]];
			}
		}
		else if(!(parent_node in node.neighbors)) {
			node.neighbors[parent_node.name] = parent_node;
		}
	}

	console.log('--------DATA LOADED--------')
	console.log(loaded);
	console.log(visited);
	console.log(unvisited);

	var event = new CustomEvent('data_received', {'detail' : {'loaded_url' : url_to_load}});
	this.dispatchEvent(event);
}

function sendWrapper(url_var) {
	console.log('-------- SEND --------');
	sendPostRequest('http://localhost:1337', 'url=' + url_var, addData, url_var)
}

function sendPostRequest(host, post_data, callback) {
	var xmlHttp = new XMLHttpRequest();
	xmlHttp.open('POST', host, true);
	xmlHttp.setRequestHeader('Content-type','text/plain');
	xmlHttp.send(post_data);
	connections.push(xmlHttp);
	this.arguments = arguments;
	xmlHttp.onreadystatechange=function() {
	  	if (xmlHttp.readyState==4 && xmlHttp.status==200) {
	    	this.data = xmlHttp.responseText;
	    	var sliced = Array.prototype.slice.call(this.arguments, 3);
	    	callback.bind(this).apply(this, sliced);
	    }
	}.bind(this)
}

function valid_address(address) {
	return !(address == "" || address.indexOf('en.wikipedia.org/') == -1 || address.indexOf('/wiki') == -1 || address.indexOf('#') != -1)
}

function findMinDistNode(nodes) {
	var min_dist = Number.MAX_SAFE_INTEGER;
	var min_node = {};
	for (var i in nodes) {
		if (nodes[i].dist <= min_dist) {
			min_dist = nodes[i].dist;
			min_node = nodes[i];
		}
	}
	return min_node;
}

function isEmpty(obj) {
	for(var prop in obj) {
	    if(obj.hasOwnProperty(prop))
	        return false;
	}

	return true;
}

function findPath(node) {
	var ret = [];
	while (node != null) {
		ret.push(node);
		node = node.prev;
	}

	return ret;
}