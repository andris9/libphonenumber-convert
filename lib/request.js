"use strict";

var http = require("http");

/**
 * Returns URL contents as a Buffer
 *
 * @param {String} url Url to be retrieved
 * @param {Function} callback Callback function with the possible error object and url contents
 */
module.exports = function(url, callback){
    var responseSent = false, req;

    req = http.get(url, function(res){
        var chunks = [], chunkLength = 0;

        if(res.statusCode >= 300){
            return callback(new Error("Invalid status code " + res.statusCode));
        }

        res.on("error", function(err){
            if(responseSent){
                return;
            }
            responseSent = true;
            return callback(err);
        });

        res.on("data", function(chunk){
            if(chunk && chunk.length){
                chunks.push(chunk);
                chunkLength += chunk.length;
            }
        });

        res.on("end", function(){
            if(responseSent){
                return;
            }
            responseSent = true;
            return callback(null, Buffer.concat(chunks, chunkLength));
        });
    });

    req.on("error", function(err){
        if(responseSent){
            return;
        }
        responseSent = true;
        callback(err);
    });
};
