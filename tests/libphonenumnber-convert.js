"use strict";

var fs = require("fs"),
    vm = require('vm'),
    http = require('http'),
    libphonenumberConvert = require("../index"),
    fixturePath = __dirname + "/fixtures/PhoneNumberMetadata.xml",
    fixture = fs.readFileSync(fixturePath);

var HTTP_PORT = 1434;

module.exports["Convert XML to JS"] = function(test){
    libphonenumberConvert.convert(fixture, function(err, js){
        test.ifError(err);
        var sandbox = {};
        vm.runInNewContext(js, sandbox, 'PhoneNumberMetadata.js');
        test.ok(sandbox.PHONE_NUMBER_META_DATA);
        test.equal(typeof sandbox.PHONE_NUMBER_META_DATA, "object");
        test.done();
    });
}

module.exports["Convert to JS"] = {

    setUp: function(next){
        var that = this;
        libphonenumberConvert.convert(fixture, function(err, js){
            var sandbox = {};
            vm.runInNewContext(js, sandbox, 'PhoneNumberMetadata.js');
            that.PHONE_NUMBER_META_DATA = sandbox.PHONE_NUMBER_META_DATA;
            next();
        });
    },

    "Only numeric properties": function(test){
        test.ok(this.PHONE_NUMBER_META_DATA);
        Object.keys(this.PHONE_NUMBER_META_DATA).forEach(function(key){
            test.ok(!isNaN(key));
        });

        test.done();
    },

    "372": function(test){
        var expected = [
            "EE",
            "00",
            null,
            null,
            null,
            null,
            "\\d{4,10}",
            "1\\d{3,4}|[3-9]\\d{6,7}|800\\d{6,7}",
            [
                [
                    "([3-79]\\d{2})(\\d{4})",
                    "$1 $2",
                    "[369]|4[3-8]|5(?:[0-2]|5[0-478]|6[45])|7[1-9]",
                    null,
                    null
                ],
                [
                    "(70)(\\d{2})(\\d{4})",
                    "$1 $2 $3",
                    "70",
                    null,
                    null
                ],
                [
                    "(8000)(\\d{3})(\\d{3})",
                    "$1 $2 $3",
                    "800",
                    null,
                    null
                ],
                [
                    "([458]\\d{3})(\\d{3,4})",
                    "$1 $2",
                    "40|5|8(?:00|[1-5])",
                    null,
                    null
                ]
            ]
        ];

        test.equal(typeof this.PHONE_NUMBER_META_DATA["372"], "string");

        test.deepEqual(JSON.parse(this.PHONE_NUMBER_META_DATA["372"]), expected);
        test.done();
    }

};

module.exports["Download and Convert"] = {
    setUp: function(next){
        this.server = http.createServer(function (req, res) {
            res.writeHead(200, {'Content-Type': 'text/xml'});
            res.end(fixture);
        }).listen(HTTP_PORT, '127.0.0.1');
        next();
    },

    tearDown: function(next){
        this.server.close(next);
    },

    convert: function(test){
        libphonenumberConvert("http://localhost:" + HTTP_PORT + "/", function(err, js){
            test.ifError(err);
            test.equal(typeof js["372"], "string");
            test.done();
        });
    }
};

