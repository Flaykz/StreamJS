var http = require('http'),
    	fs = require('fs'),
	url = require('url'),
    	events = require('events'),
    	path = require('path'),
	lib = require('./res/lib');

var port = 8086;

var films = [];
var series = [];
var filmsPath = '/media/odroid/Multimedia/Films';
var seriesPath = '/media/odroid/Multimedia 2/Series';
var handler = new events.EventEmitter();
var ressources = 'res/'

lib.walkDir(seriesPath, function (err, results) {
        if (err) throw err;
       	series  = results;
       	console.log('Listing des series terminé');
});

lib.walkVideo(filmsPath, function (err, results) {
	if (err) throw err;
        films = results;
        console.log('Listing des films terminé');
});

var server = http.createServer(function(request, response) {
	var page = url.parse(request.url).pathname;
	if (page == '/') {
		console.log('Page d\'accueil');
		response.writeHead(200, {'Content-Type': 'text/html'});
		response.end("<!DOCTYPE html><html lang=\"en\">" +
                        "<head><title>Bienvenue</title></head>" +
                        "<body>" +
                        "<h1>Que voulez vous regarder ?</h1>" +
                        "<a href=\"/Films\">Films</a>" +
			"</br>" +
			"<a href=\"/Series\">Series</a>" +
                        "</body></html>");
	}
	else if (page.split('/')[1] == 'css') {
		console.log('css');
		var filePath = ressources + decodeURIComponent(page.replace('/css/', ''));
		fs.readFile(filePath, function (err, data) {
			if (err) throw err;
			response.writeHead(200, {'Content-Type': lib.mime(page.split('.').pop()), 'Content-Length': data.length });
                	response.end(data);
		});
	}
	else if (page == '/Films') {
		console.log('Page Films');
		response.writeHead(200, {'Content-Type': 'text/html'});
		response.write("<!DOCTYPE html><html lang=\"en\">" +
                        "<head><title>Bienvenue</title><link rel=\"stylesheet\" type=\"text/css\" href=\"/css/style.css\"></head>" +
                        "<body>" +
                        "<h1>Films</h1>");
		for (i = 0; i < films.length; i++) {
			response.write("<div class=\"floatableMovieCover\"><div class=\"imgWrapper\"><div class=\"inner\">" +
				"<a href=\"/stream" + films[i] + "\">" + "<img src=\"/images" + films[i].replace('.' + films[i].split('.').pop(), '') + "-poster.jpg\"></a>" +
				"</div></div>" +
				"<p class=\"album\">" + films[i].split('/')[6] + "</p></br>" +
				"</div>");
		}
		response.write("</body></html>");
		response.end();
	}
	else if (page == '/Series') {
		console.log('Page Series');
		response.writeHead(200, {'Content-Type': 'text/html'});
		response.write("<!DOCTYPE html><html lang=\"en\">" +
                        "<head><title>Bienvenue</title><link rel=\"stylesheet\" type=\"text/css\" href=\"/css/style.css\"></head>" +
                        "<body>" +
                        "<h1>Series</h1>");
                for (i = 0; i < series.length; i++) {
			if (series[i].substring((series[i].length - 1), series[i].length) == '/') {                        
				response.write("<div class=\"floatableTVShowCover\"><div class=\"imgWrapper\"><div class=\"inner\">" +
                                	"<a href=\"/Saisons" + series[i].substring(0, series[i].length - 1) + "\">" + "<img src=\"/images" + series[i] + "poster.jpg\"></a>" +
                                	"</div></div>" +
					"<p class=\"album\">" + series[i].split('/')[5] + "</p></br>" +
                                	"</div>");
			}
			else {
				if (lib.mime(series[i].split('.').pop()) == 'undefined') {
					response.write("<div class=\"floatableTVShowCover\"><div class=\"imgWrapper\"><div class=\"inner\">" +
                                	        "<a href=\"/stream" + series[i] + "\"></a>" +
                                	        "</div></div>" +
						"<p class=\"album\">" + series[i].split('/')[5] + "</p></br>" +
                                	        "</div>");
				}
			}
                }
                response.write("</body></html>");
                response.end();
	}
	else if (page.split('/')[1] == 'Saisons') {
		console.log('Page Saisons');
		lib.walkDir(decodeURIComponent(page.replace('/Saisons','')), function (err, results) {
        		if (err) throw err;
        		series  = results;
        		console.log('Listing des saisons terminé');
			response.writeHead(200, {'Content-Type': 'text/html'});
	                response.write("<!DOCTYPE html><html lang=\"en\">" +
	                        "<head><title>Bienvenue</title><link rel=\"stylesheet\" type=\"text/css\" href=\"/css/style.css\"></head>" +
	                        "<body>" +
	                        "<h1>Saisons</h1>");
	                for (i = 0; i < series.length; i++) {
	                        if (series[i].split('/')[6].split(' ')[0] == 'Saison') {
	                                response.write("<div class=\"floatableTVShowCover\"><div class=\"imgWrapper\"><div class=\"inner\">" +
	                                       	"<a href=\"/Episodes" + series[i].substring(0, series[i].length - 1) + "\">" + "<img src=\"/images" + series[i] + "season-all-poster.jpg\"></a>" +
	                                       	"</div></div>" +
	                                       	"<p class=\"album\">" + series[i].split('/')[6] + "</p></br>" +
	                                       	"</div>");
        	                }
        	        }
        	        response.write("</body></html>");
        	        response.end();
		});
	}
	else if (page.split('/')[1] == 'Episodes') {
		console.log('Page Episodes');
		lib.walkVideo(decodeURIComponent(page.replace('/Episodes','')), function (err, results) {
        		if (err) throw err;
        		series = results;
        		console.log('Listing des épisodes terminé');
			response.writeHead(200, {'Content-Type': 'text/html'});
                		response.write("<!DOCTYPE html><html lang=\"en\">" +
                        	"<head><title>Bienvenue</title><link rel=\"stylesheet\" type=\"text/css\" href=\"/css/style.css\"></head>" +
                        	"<body>" +
                        	"<h1>Episodes</h1>");
                	for (i = 0; i < series.length; i++) {
                	        response.write("<div class=\"floatableTVShowCover\"><div class=\"imgWrapper\"><div class=\"inner\">" +
                	                "<a href=\"/stream" + series[i] + "\"><img src=\"/images" + series[i].replace('.' + series[i].split('.').pop(), '') + "-thumb.jpg\"></a>" +
                	                "</div></div>" +
                	                "<p class=\"album\">" + series[i].split('/')[7] + "</p></br>" +
                	                "</div>");
                	}
                	response.write("</body></html>");
                	response.end();
		});
	}
	else if (page == '/favicon.ico') {
		console.log('Page favicon');
	}
	else if (page.split('/')[1] == 'stream') {
		console.log('Page Stream');
		var filePath = decodeURIComponent(page.replace('/stream', ''));
		if (filePath) {
			var stat = fs.statSync(filePath);
			var total = stat.size;
			//var mime = stat.mime;
			var mime = 'video/x-matroska';
        		try {
                		if (!stat.isFile()) {
                	        	handler.emit('badFile', response);
                		}
        		} catch (e) {
                		handler.emit('badFile', response, e);
        		}
	
 			if (request.headers['range']) {
    				var range = request.headers.range;
    				var parts = range.replace(/bytes=/, "").split("-");
    				var partialstart = parts[0];
    				var partialend = parts[1];
	
			    	var start = parseInt(partialstart, 10);
    				var end = partialend ? parseInt(partialend, 10) : total-1;
    				var chunksize = (end-start)+1;
    				console.log('RANGE: ' + start + ' - ' + end + ' = ' + chunksize);
			
				var file = fs.createReadStream(filePath, {start: start, end: end});
    				response.writeHead(206, { 'Content-Range': 'bytes ' + start + '-' + end + '/' + total, 'Accept-Ranges': 'bytes', 'Content-Length': chunksize, 'Content-Type': mime });
    				file.pipe(response);
  			} else {
    				console.log('Lancement en streaming de : ' + filePath);
    				response.writeHead(200, { 'Content-Length': total, 'Content-Type': mime });
    				fs.createReadStream(filePath).pipe(response);
  			}
	
		        handler.on("badFile", function (res, e) {
		                errorHeader(res, 404);
	        	        res.end("<!DOCTYPE html><html lang=\"en\">" +
	        	                "<head><title>404 Not found</title></head>" +
	        	                "<body>" +
	        	                "<h1>Ooh dear</h1>" +
	        	                "<p>Sorry, I can't find that file. Could you check again?</p>" +
	        	                "</body></html>");
	        	        console.error("404 Bad File - " + (e ? e.message : ""));
	        	});
		}
	}
	else if (page.split('/')[1] == 'images') {
		console.log('Page Images');
		var filePath = decodeURIComponent(page.replace('/images', ''));
                if (filePath) {
			fs.exists(filePath, function(exists) {
				if (!exists) {
					filePath = ressources + 'folder.png'
				}
                        fs.readFile(filePath, function(err, content) {
				if (err) throw err;
				response.writeHead(200, { 'Content-Length': content.length, 'Content-Type': lib.mime(page.split('.').pop()) });
                        	response.end(content);
				});
			});
		}
	}
	else {
		console.log('Page non gérée : ' + page);
	}
}).listen(port);

console.log('Démarrage du serveur Web sur le port ' + port + '...');

server.on('close', function () {
        console.log('Fermeture du seveur Web');
});

server.on('connection', function (socket) {
        console.log(socket.remoteAddress + ' vient de se connecter via le port ' + socket.remotePort);
});

server.on('clientError', function (exception, socket) {
        console.log('Erreur du client ' + socket.remoteAddress + ':' + socket.remotePort + ' : ' + exception);
});
