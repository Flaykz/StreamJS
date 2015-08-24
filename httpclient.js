var http = require('http');

jsonVersion = '2.0';

//jsonMethod = 'Player.GetActivePlayers';
//jsonParams = {};

//jsonMethod = 'Player.GetItem';
//playerId = 1;
//jsonParams = {'playerid': playerId};

//jsonMethod = 'Player.GetProperties';
//playerId = 1;
//jsonParams = {'playerid': playerId, 'properties':['time','type','partymode','percentage','totaltime','playlistid','position','repeat','shuffled','canseek','canchangespeed','canmove','canzoom','canrotate','canshuffle','canrepeat','currentaudiostream','audiostreams','subtitleenabled','currentsubtitle','subtitles','live']};

//jsonMethod = 'VideoLibrary.GetMovies';
//jsonParams = {};

//jsonMethod = 'VideoLibrary.GetMovieDetails';
//movieId = 1;
//jsonParams = {'movieid': movieId, 'properties':['imdbnumber','thumbnail']};

//jsonMethod = 'VideoLibrary.GetTVShows';
//jsonParams = {};

//jsonMethod = 'VideoLibrary.GetTVShowDetails';
//tvShowId = 54;
//jsonParams = {'tvshowid': tvShowId, 'properties':['imdbnumber','thumbnail']};

//jsonMethod = 'VideoLibrary.GetSeasons';
//tvShowId = 54;
//jsonParams = {'tvshowid': tvShowId};

//jsonMethod = 'VideoLibrary.GetEpisodes';
//tvShowId = 54;
//seasonId = 2;
//jsonParams = {'tvshowid': tvShowId, 'season': seasonId};

jsonMethod = 'VideoLibrary.GetEpisodeDetails';
episodeId = 1911;
jsonParams = {'episodeid': episodeId, 'properties':['thumbnail', 'file']};

jsonId = jsonMethod;

if (JSON.stringify(jsonParams) != '{}') {
	jsonReq = {'jsonrpc': jsonVersion, 'method': jsonMethod, 'params': jsonParams, 'id': jsonId}
}
else {
	jsonReq = {'jsonrpc': jsonVersion, 'method': jsonMethod, 'id': jsonId}
}

jsonReq = '/jsonrpc?request=' + encodeURIComponent(JSON.stringify(jsonReq));

var options = {
	host: '127.0.0.1',
	port: 8085,
	path: jsonReq,
	method: 'GET',
	/*headers: {
		'Content-Type': 'application/json',
		}*/
};

http.request(options, function(response) {
        var str = '';
        response.on('data', function (chunk) {
                str += chunk;
        });
        response.on('end', function() {
                jsonRes = JSON.parse(str);
                if (jsonRes.error) {
                        console.log('Erreur : ' + jsonRes.error.message);
                }
		else if (jsonRes.id == 'Player.GetActivePlayers') {
			if (JSON.stringify(jsonRes.result) == '[]') {
				console.log('Aucun player actif pour le moment');
			}
			else {
				console.log('Player');
			}
		}
		else if (jsonRes.id == 'Player.GetItem') {
			console.log(jsonRes.result.item['label'] + ' id: ' + jsonRes.result.item['id'] + ' type: ' + jsonRes.result.item['type']);
		}
                else if (jsonRes.id == 'VideoLibrary.GetMovies') {
                        for (var i = 0; i < jsonRes.result.movies.length; i++) {
                                console.log(jsonRes.result.movies[i]['label'] + ' id: ' + jsonRes.result.movies[i]['movieid']);
                        }
                }
		else if (jsonRes.id == 'VideoLibrary.GetTVShows') {
			for (var i = 0; i < jsonRes.result.tvshows.length; i++) {
				console.log(jsonRes.result.tvshows[i]['label'] + ' id: ' + jsonRes.result.tvshows[i]['tvshowid']);
			}
		}
		else if (jsonRes.id == 'VideoLibrary.GetSeasons') {
			for (var i = 0; i < jsonRes.result.seasons.length; i++) {
				console.log(jsonRes.result.seasons[i]['label'] + ' id: ' + jsonRes.result.seasons[i]['seasonid']);
			}
		}
		else if (jsonRes.id == 'VideoLibrary.GetEpisodes') {
			for (var i = 0; i < jsonRes.result.episodes.length; i++) {
				console.log(jsonRes.result.episodes[i]['label'] + ' id: ' + jsonRes.result.episodes[i]['episodeid']);
			}
		}
		else if (jsonRes.id == 'VideoLibrary.GetEpisodeDetails') {
			console.log(jsonRes.result.episodedetails['label'] + ' thumbnail: ' + jsonRes.result.episodedetails['thumbnail'] + ' path : ' + jsonRes.result.episodedetails['file']);
		}
                else {
                        console.log(str);
                }
        });
}).end();
