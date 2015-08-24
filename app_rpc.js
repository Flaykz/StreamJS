var http = require('http'),
	fs = require('fs'),
	url = require('url'),
	events = require('events'),
	path = require('path'),
	lib = require('./res/lib');

var port = 8086;

var films = [];
var filmsId = [];
var series = [];
var seriesId = [];
var filmsPath = '/media/odroid/Multimedia/Films';
var seriesPath = '/media/odroid/Multimedia 2/Series';
var handler = new events.EventEmitter();
var ressources = 'res/'

var jsonVersion = '2.0';
var jsonMethod = 'VideoLibrary.GetMovies';
var jsonParams = {};
var jsonId = jsonMethod;

if (JSON.stringify(jsonParams) != '{}') {
	var jsonReq = {
		'jsonrpc': jsonVersion,
		'method': jsonMethod,
		'params': jsonParams,
		'id': jsonId
	};
}
else {
	var jsonReq = {
		'jsonrpc': jsonVersion,
		'method': jsonMethod,
		'id': jsonId
	};
}

jsonReq = '/jsonrpc?request=' + encodeURIComponent(JSON.stringify(jsonReq));

var options = {
	host: '127.0.0.1',
	port: 8085,
	path: jsonReq,
	method: 'GET',
};

http.request(options, function(response) {
	var str = '';
	response.on('data', function(chunk) {
		str += chunk;
	});
	response.on('end', function() {
		jsonRes = JSON.parse(str);
		if (jsonRes.error) {
			console.log('Erreur : ' + jsonRes.error.message);
		}
		else if (jsonRes.id == 'VideoLibrary.GetMovies') {
			for (var i = 0; i < jsonRes.result.movies.length; i++) {
				films.push(jsonRes.result.movies[i]['label']);
				filmsId.push(jsonRes.result.movies[i]['movieid']);
			}
		}
		var jsonVersion = '2.0';
		var jsonMethod = 'VideoLibrary.GetTVShows';
		var jsonParams = {};
		var jsonId = jsonMethod;
		if (JSON.stringify(jsonParams) != '{}') {
			var jsonReq = {
				'jsonrpc': jsonVersion,
				'method': jsonMethod,
				'params': jsonParams,
				'id': jsonId
			};
		}
		else {
			var jsonReq = {
				'jsonrpc': jsonVersion,
				'method': jsonMethod,
				'id': jsonId
			};
		}
		jsonReq = '/jsonrpc?request=' + encodeURIComponent(JSON.stringify(jsonReq));
		var options = {
			host: '127.0.0.1',
			port: 8085,
			path: jsonReq,
			method: 'GET',
		};
		http.request(options, function(response) {
			var str = '';
			response.on('data', function(chunk) {
				str += chunk;
			});
			response.on('end', function() {
				jsonRes = JSON.parse(str);
				if (jsonRes.error) {
					console.log('Erreur : ' + jsonRes.error.message);
				}
				else if (jsonRes.id == 'VideoLibrary.GetTVShows') {
					for (var i = 0; i < jsonRes.result.tvshows.length; i++) {
						series.push(jsonRes.result.tvshows[i]['label']);
						seriesId.push(jsonRes.result.tvshows[i]['tvshowid']);
					}
				}
				var server = http.createServer(function(request, response) {
					var page = url.parse(request.url).pathname;
					if (page == '/') {
						console.log('Page d\'accueil');
						response.writeHead(200, {'Content-Type': 'text/html'});
						response.end("<!DOCTYPE html><html lang=\"en\">" +
							"<head><title>Bienvenue</title><link rel=\"stylesheet\" type=\"text/css\" href=\"/css/style.css\"></head>" +
							"<body class=\"acceuil\">" +
							"<h1>Que voulez vous regarder ?</h1>" +
							"<div class=\"divBouton\">" +
							"<a href=\"/Films\" class=\"Bouton\">Films</a>" +
							"<a href=\"/Series\" class=\"Bouton\">Series</a>" +
							"</div>" +
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
							"<div class=\"divBouton\">" +
							"<a href=\"/Films\" class=\"Bouton\" id=\"films\">Films</a>" +
							"<a href=\"/Series\" class=\"Bouton\">Series</a>" +
							"</div>" +
							"<div class=\"cover\">");
						for (i = 0; i < films.length; i++) {
							response.write("<div class=\"floatableMovieCover\"><div class=\"imgWrapper\"><div class=\"inner\">" +
								"<a href=\"/stream/films/" + filmsId[i] + "\">" + "<img src=\"/images/films/" + filmsId[i] + "\"></a>" +
								"</div></div>" +
								"<p class=\"album\">" + films[i] + "</p></br>" +
								"</div>");
						}
						response.write("</div></body></html>");
						response.end();
					}
					else if (page == '/Series') {
						console.log('Page Series');
						response.writeHead(200, {'Content-Type': 'text/html'});
						response.write("<!DOCTYPE html><html lang=\"en\">" +
							"<head><title>Bienvenue</title><link rel=\"stylesheet\" type=\"text/css\" href=\"/css/style.css\"></head>" +
							"<body>" +
							"<div class=\"divBouton\">" +
							"<a href=\"/Films\" class=\"Bouton\">Films</a>" +
							"<a href=\"/Series\" class=\"Bouton\" id=\"series\">Series</a>" +
							"</div>" +
							"<div class=\"cover\">");
						for (i = 0; i < series.length; i++) {
							response.write("<div class=\"floatableTVShowCover\"><div class=\"imgWrapper\"><div class=\"inner\">" +
								"<a href=\"/Saisons/" + seriesId[i] + "\">" + "<img src=\"/images/series/" + seriesId[i] + "\"></a>" +
								"</div></div>" +
								"<p class=\"album\">" + series[i] + "</p></br>" +
								"</div>");
						}
						response.write("</div></body></html>");
						response.end();
					}
					else if (page.split('/')[1] == 'Saisons') {
						console.log('Page Saisons');
						var serieId = parseInt(page.replace('/Saisons/', ''));
						var jsonVersion = '2.0';
						var jsonMethod = 'VideoLibrary.GetSeasons';
						var jsonParams = {'tvshowid': serieId};
						var jsonId = jsonMethod;
						var jsonReq = {
							'jsonrpc': jsonVersion,
							'method': jsonMethod,
							'params': jsonParams,
							'id': jsonId
						};
						jsonReq = '/jsonrpc?request=' + encodeURIComponent(JSON.stringify(jsonReq));
						var options = {
							host: '127.0.0.1',
							port: 8085,
							path: jsonReq,
							method: 'GET',
						};
						http.request(options, function(res) {
							var str = '';
							res.on('data', function(chunk) {
								str += chunk;
							});
							res.on('end', function() {
								jsonRes = JSON.parse(str);
								if (jsonRes.error) {
									console.log('Erreur : ' + jsonRes.error.message);
								}
								else if (jsonRes.id == jsonId) {
									console.log('Listing des saisons terminé');
									response.writeHead(200, {'Content-Type': 'text/html'});
									response.write("<!DOCTYPE html><html lang=\"en\">" +
										"<head><title>Bienvenue</title><link rel=\"stylesheet\" type=\"text/css\" href=\"/css/style.css\"></head>" +
										"<body>" +
										"<h1>Saisons</h1>");
									for (var i = 0; i < jsonRes.result.seasons.length; i++) {
										response.write("<div class=\"floatableTVShowCover\"><div class=\"imgWrapper\"><div class=\"inner\">" +
											"<a href=\"/Episodes/" + serieId + "/" + (i+1) + "\">" + "<img src=\"/images/series/" + serieId + "\"></a>" +
											"</div></div>" +
											"<p class=\"album\">" + jsonRes.result.seasons[i]['label'] + "</p></br>" +
											"</div>");
									}
									response.write("</body></html>");
									response.end();
								}
							});
						}).end();
					}
					else if (page.split('/')[1] == 'Episodes') {
						console.log('Page Episodes');
						var serieId = parseInt(page.replace('/Episodes/', '').split('/')[0]);
						var seasonId = parseInt(page.replace('/Episodes/', '').split('/')[1]);
						var jsonVersion = '2.0';
						var jsonMethod = 'VideoLibrary.GetEpisodes';
						var jsonParams = {'tvshowid': serieId, 'season': seasonId};
						var jsonId = jsonMethod;
						var jsonReq = {
							'jsonrpc': jsonVersion,
							'method': jsonMethod,
							'params': jsonParams,
							'id': jsonId
						};
						jsonReq = '/jsonrpc?request=' + encodeURIComponent(JSON.stringify(jsonReq));
						var options = {
							host: '127.0.0.1',
							port: 8085,
							path: jsonReq,
							method: 'GET',
						};
						http.request(options, function(res) {
							var str = '';
							res.on('data', function(chunk) {
								str += chunk;
							});
							res.on('end', function() {
								jsonRes = JSON.parse(str);
								if (jsonRes.error) {
									console.log('Erreur : ' + jsonRes.error.message);
								}
								else if (jsonRes.id == jsonId) {
									console.log('Listing des épisodes terminé');
									response.writeHead(200, {'Content-Type': 'text/html'});
									response.write("<!DOCTYPE html><html lang=\"en\">" +
										"<head><title>Bienvenue</title><link rel=\"stylesheet\" type=\"text/css\" href=\"/css/style.css\"></head>" +
										"<body>" +
										"<h1>Episodes</h1>");
									for (var i = 0; i < jsonRes.result.episodes.length; i++) {
										response.write("<div class=\"floatableTVShowCover\"><div class=\"imgWrapper\"><div class=\"inner\">" +
											"<a href=\"/stream/series/" + jsonRes.result.episodes[i]['episodeid'] + "\">" + "<img src=\"/images/series/" + serieId + "\"></a>" +
											"</div></div>" +
											"<p class=\"album\">" + jsonRes.result.episodes[i]['label'] + "</p></br>" +
											"</div>");
									}
									response.write("</body></html>");
									response.end();
								}
							});
						}).end();
					}
					else if (page == '/favicon.ico') {
						console.log('Page favicon');
						var filePath =  ressources + '/kodi.ico';
							if (filePath) {
								fs.exists(filePath, function(exists) {
									fs.readFile(filePath, function(err, content) {
										if (err) throw err;
										response.writeHead(200, { 'Content-Length': content.length, 'Content-Type': lib.mime(page.split('.').pop()) });
										response.end(content);
									});
								});
							}
					}
					else if (page.split('/')[1] == 'stream') {
						console.log('Page Stream');
						var jsonVersion = '2.0';
						if (page.split('/')[2] == 'films') {
							filmId = parseInt(page.replace('/stream/films/', ''));
							var jsonMethod = 'VideoLibrary.GetMovieDetails';
							var jsonParams = {'movieid': filmId, 'properties':['file']};
							var jsonId = jsonMethod;
							var jsonReq = {
								'jsonrpc': jsonVersion,
								'method': jsonMethod,
								'params': jsonParams,
								'id': jsonId
							};
							jsonReq = '/jsonrpc?request=' + encodeURIComponent(JSON.stringify(jsonReq));
							var options = {
								host: '127.0.0.1',
								port: 8085,
								path: jsonReq,
								method: 'GET',
							};
							http.request(options, function(res) {
								var str = '';
								res.on('data', function(chunk) {
									str += chunk;
								});
								res.on('end', function() {
									jsonRes = JSON.parse(str);
									if (jsonRes.error) {
										console.log('Erreur : ' + jsonRes.error.message);
									}
									else if (jsonRes.id == jsonId) {
										var filePath = jsonRes.result.moviedetails['file'];
										if (filePath) {
 											var stat = fs.statSync(filePath);
											var total = stat.size;
											//var mime = stat.mime;
											var mime = 'video/x-matroska';
											try {
												if (!stat.isFile()) {
													handler.emit('badFile', response);
												}
											} 
											catch (e) {
												handler.emit('badFile', response, e);
											}
											if (request.headers['range']) {
												var date = new Date();
												var range = request.headers.range;
												var parts = range.replace(/bytes=/, "").split("-");
												var partialstart = parts[0];
												var partialend = parts[1];
												var start = parseInt(partialstart, 10);
												var end = partialend ? parseInt(partialend, 10) : total-1;
												var chunksize = (end-start)+1;
												console.log('RANGE: ' + start + ' - ' + end + ' = ' + chunksize);
												response.writeHead(206, { 
													'Date': date.toUTCString(),
													'Connection': 'close',
													'Cache-Control': 'private',
													'Content-Type': mime,
													'Content-Length': chunksize,
													'Content-Range': 'bytes ' + start + '-' + end + '/' + total, 
													'Accept-Ranges': 'bytes', 
													'Server': 'app_rpc.js',
													'Transfer-Encoding': 'chunked',
													});
												fs.createReadStream(filePath, {flags: 'r', start: start, end: end}).pipe(response);
												//fs.createReadStream(filePath, {start: start, end: end}+'0').pipe(response);
											} 
											else {
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
								});
								res.on('close', function() {
									console.log('close');
								});
							}).end();
						}
						else  if (page.split('/')[2] == 'series') {
							var episodeId = parseInt(page.replace('/stream/series/', ''));
							var jsonMethod = 'VideoLibrary.GetEpisodeDetails';
							var jsonParams = {'episodeid': episodeId, 'properties':['file']};
							var jsonId = jsonMethod;
							var jsonReq = {
								'jsonrpc': jsonVersion,
								'method': jsonMethod,
								'params': jsonParams,
								'id': jsonId
							};
							jsonReq = '/jsonrpc?request=' + encodeURIComponent(JSON.stringify(jsonReq));
							var options = {
								host: '127.0.0.1',
								port: 8085,
								path: jsonReq,
								method: 'GET',
							};
							http.request(options, function(res) {
								var str = '';
								res.on('data', function(chunk) {
									str += chunk;
								});
								res.on('end', function() {
									jsonRes = JSON.parse(str);
									if (jsonRes.error) {
										console.log('Erreur : ' + jsonRes.error.message);
									}
									else if (jsonRes.id == jsonId) {
										var filePath =  jsonRes.result.episodedetails['file'];
										if (filePath) {
											var stat = fs.statSync(filePath);
											var total = stat.size;
											//var mime = stat.mime;
											var mime = 'video/x-matroska';
											try {
												if (!stat.isFile()) {
													handler.emit('badFile', response);
												}
											} 
											catch (e) {
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
												response.writeHead(206, { 'Content-Range': 'bytes ' + start + '-' + end + '/' + total, 'Accept-Ranges': 'bytes', 'Content-Length': chunksize, 'Content-Type': mime });
												fs.createReadStream(filePath, {start: start, end: end}).pipe(response);
											} 
											else {
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
								});
								res.on('close', function() {
									console.log('close');
								});
							}).end();
						}
					}
					else if (page.split('/')[1] == 'images') {
						console.log('Page Images');
						var jsonVersion = '2.0';
						if (page.split('/')[2] == 'films') {
							filmId = parseInt(page.replace('/images/films/', ''));
							var jsonMethod = 'VideoLibrary.GetMovieDetails';
							var jsonParams = {'movieid': filmId, 'properties':['thumbnail']};
							var jsonId = jsonMethod;
							var jsonReq = {
								'jsonrpc': jsonVersion,
								'method': jsonMethod,
								'params': jsonParams,
								'id': jsonId
							};
							jsonReq = '/jsonrpc?request=' + encodeURIComponent(JSON.stringify(jsonReq));
							var options = {
								host: '127.0.0.1',
								port: 8085,
								path: jsonReq,
								method: 'GET',
							};
							http.request(options, function(res) {
								var str = '';
								res.on('data', function(chunk) {
									str += chunk;
								});
								res.on('end', function() {
									jsonRes = JSON.parse(str);
									if (jsonRes.error) {
										console.log('Erreur : ' + jsonRes.error.message);
									}
									else if (jsonRes.id == jsonId) {
										var filePath =  decodeURIComponent(jsonRes.result.moviedetails['thumbnail'].replace('image://','').replace('jpg/','jpg'));
										if (filePath) {
											fs.exists(filePath, function(exists) {
												if (!exists) {
													filePath = ressources + 'folder.png';
												}
												fs.readFile(filePath, function(err, content) {
													if (err) throw err;
													response.writeHead(200, { 'Content-Length': content.length, 'Content-Type': lib.mime(page.split('.').pop()) });
													response.end(content);
												});
											});
										}
									}
								});
							}).end();
						}
						else if (page.split('/')[2] == 'series') {
							serieId = parseInt(page.replace('/images/series/', ''));
							var jsonMethod = 'VideoLibrary.GetTVShowDetails';
							var jsonParams = {'tvshowid': serieId, 'properties':['thumbnail']};
							var jsonId = jsonMethod;
							var jsonReq = {
								'jsonrpc': jsonVersion,
								'method': jsonMethod,
								'params': jsonParams,
								'id': jsonId
							};
							jsonReq = '/jsonrpc?request=' + encodeURIComponent(JSON.stringify(jsonReq));
							var options = {
								host: '127.0.0.1',
								port: 8085,
								path: jsonReq,
								method: 'GET',
							};
							http.request(options, function(res) {
								var str = '';
								res.on('data', function(chunk) {
									str += chunk;
								});
								res.on('end', function() {
									jsonRes = JSON.parse(str);
									if (jsonRes.error) {
										console.log('Erreur : ' + jsonRes.error.message);
									}
									else if (jsonRes.id == jsonId) {
										var filePath =  decodeURIComponent(jsonRes.result.tvshowdetails['thumbnail'].replace('image://','').replace('jpg/','jpg'));
										if (filePath) {
											fs.exists(filePath, function(exists) {
												if (!exists) {
													filePath = ressources + 'folder.png';
												}
												fs.readFile(filePath, function(err, content) {
													if (err) throw err;
													response.writeHead(200, { 'Content-Length': content.length, 'Content-Type': lib.mime(page.split('.').pop()) });
													response.end(content);
												});
											});
										}
									}
								});
							}).end();
						}
						else {
							var filePath =  ressources + page.replace('/images/', '');
							if (filePath) {
								fs.exists(filePath, function(exists) {
									if (!exists) {
										filePath = ressources + 'folder.png';
									}
									fs.readFile(filePath, function(err, content) {
										if (err) throw err;
										response.writeHead(200, { 'Content-Length': content.length, 'Content-Type': lib.mime(page.split('.').pop()) });
										response.end(content);
									});
								});
							}
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
			});
		}).end();
	});
}).end();
