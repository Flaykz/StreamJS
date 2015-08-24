var fs = require('fs');

var walkVideo = function(dir, done) {
	var results = [];
        fs.readdir(dir, function(err, list) {
                if (err) return done(err);
                var pending = list.length;
                if (!pending) return done(null, results);
                list.forEach(function(file) {
                        file = dir + '/' + file;
                        fs.stat(file, function(err, stat) {
                                if (stat && stat.isDirectory()) {
                                        walkVideo(file, function(err, res) {
                                                results = results.concat(res);
                                                if (!--pending) done(null, results);
                                        });
                                } else {
                                        if (stat.isFile()) {
                                                var ext = file.split('.').pop();
                                                if (ext == 'mp4' || ext == 'avi' || ext == 'mkv') {
                                                        results.push(file);
                                                }
                                        }
                                        if (!--pending) done(null, results);
                                }
                        });
                });
        });
	return results;
};

var walkFile = function(dir, done) {
        var results = [];
        fs.readdir(dir, function(err, list) {
                if (err) return done(err);
                var pending = list.length;
                if (!pending) return done(null, results);
                list.forEach(function(file) {
                        file = dir + '/' + file;
                        fs.stat(file, function(err, stat) {
                                if (stat && stat.isDirectory()) {
                                        walkFile(file, function(err, res) {
                                                results = results.concat(res);
                                                if (!--pending) done(null, results);
                                        });
                                } 
				else {
                                        if (stat.isFile()) {
                                        	results.push(file);
                                        }
                                        if (!--pending) done(null, results);
                                }
                        });
                });
        });
	return results;
};

var walkDir = function(dir, done) {
        var results = [];
        fs.readdir(dir, function(err, list) {
                if (err) return done(err);
                var pending = list.length;
                if (!pending) return done(null, results);
                list.forEach(function(file) {
                        file = dir + '/' + file;
			fs.stat(file, function(err, stat) {
				if (stat.isDirectory()) {
					file = file + '/';
					results.push(file);
					if (!--pending) done(null, results);
				}
				else {
					results.push(file);
					if (!--pending) done(null, results);
				}
			});			
                });
        });
	return results;
};

var walkDirSync = function(dir, done) {
	var results = [];
	fs.readdir(dir, function(err, list) {
		if (err) return done(err);
		var i = 0;
		(function next() {
			var file = list[i++];
			if (!file) return done(null, results);
			file = dir + '/' + file;
			fs.stat(file, function(err, stat) {
				if (stat.isDirectory()) {
					file = file + '/';
					results.push(file);
					next();
				}
				else {
					results.push(file);
					next();
				}
			});
		})();
	});
};

var mime = function(ext) {
	var mimeTypes = {
		"swf": "application/x-shockwave-flash",
		"flv": "video/x-flv",
		"f4v": "video/mp4",
		"f4p": "video/mp4",
		"mp4": "video/mp4",
		"asf": "video/x-ms-asf",
		"asr": "video/x-ms-asf",
		"asx": "video/x-ms-asf",
		"avi": "video/x-msvideo",
		"mkv": "video/x-matroska",
		"mpa": "video/mpeg",
		"mpe": "video/mpeg",
		"mpeg": "video/mpeg",
		"mpg": "video/mpeg",
		"mpv2": "video/mpeg",
		"mov": "video/quicktime",
		"movie": "video/x-sgi-movie",
		"mp2": "video/mpeg",
		"qt": "video/quicktime",
		"mp3": "audio/mpeg",
		"wav": "audio/x-wav",
		"aif": "audio/x-aiff",
		"aifc": "audio/x-aiff",
		"aiff": "audio/x-aiff",
		"jpe": "image/jpeg",
		"jpeg": "image/jpeg",
		"jpg": "image/jpeg",
		"png" : "image/png",
		"svg": "image/svg+xml",
		"tif": "image/tiff",
		"tiff": "image/tiff",
		"gif": "image/gif",
		"txt": "text/plain",
		"xml": "text/xml",
		"css": "text/css",
		"htm": "text/html",
		"html": "text/html",
		"pdf": "application/pdf",
		"doc": "application/msword",
		"vcf": "text/x-vcard",
		"vrml": "x-world/x-vrml",
		"zip": "application/zip",
		"webm": "video/webm",
		"m3u8": "application/x-mpegurl",
		"ts": "video/mp2t",
		"ogg": "video/ogg"
	};
	return mimeTypes[ext.toLowerCase()];
};

exports.walkVideo = walkVideo;
exports.walkFile = walkFile;
exports.walkDir = walkDir;
exports.walkDirSync = walkDirSync;
exports.mime = mime;
