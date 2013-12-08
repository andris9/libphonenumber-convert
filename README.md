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

## Tests

Tests are handled by nodeunit. There are not much tests, only some basics to test if the thing even works or not.

Clone the repository, install dependencies and run tests with `npm test`:

    git clone git://github.com/andris9/libphonenumber-convert.git
    cd libphonenumber-convert
    npm install
    npm test

## License

**Apache 2.0**
