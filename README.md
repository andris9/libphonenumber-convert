# libphonenumber-convert

Fetches and converts libphonenumber XML file to a JavaScript file

## Install

    npm install libphonenumber-convert

## Usage

    var converter = require("libphonenumber-convert");
    var fs = require("fs");
    var url = "http://..."; // url to libphonenumber XML file
    converter(url, function(err, js){
        if(err){
            throw err;
        }
        fs.writeFile("MetaData.js", js);
    });

## License

**Apache 2.0**
