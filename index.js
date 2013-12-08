"use strict";

var parseString = require('xml2js').parseString,
    request = require("./lib/request");

/**
 * Downloads the libphonenumber xml file from provided location
 * and returns a JavaScript file with converted data
 *
 * @param {String} xmlUrl URL to libphonenumber xml
 * @param {Function} callback Callback function with the error object and JavaScript file
 */
module.exports = function(xmlUrl, callback){
    request(xmlUrl, function(err, xml){
        if(err){
            return callback(err);
        }
        convert(xml, callback);
    });
};

module.exports.convert = convert;

function convert(xml, callback){
    parseString(xml, function(err, result){
        if(err){
            return callback(err);
        }
        convertTerritories(result, function(err, data){
            if(err){
                return callback(err);
            }
            return callback(null, formatJS(data));
        });
    });
}

function nodeToText(str){
    return (str || "").toString().replace(/\s/g, "") || null;
}

function convertTerritories(data, callback){
    var metadata = {},
        territories = [].concat(data && data.phoneNumberMetadata && data.phoneNumberMetadata.territories || []).shift(),
        territoryArray = territories && territories.territory;

    if(!Array.isArray(territoryArray)){
        return callback(new Error("Invalid XML content, 'territories' not found"));
    }

    var mainCountriesForCode = {};
    territoryArray.forEach(function(territory){
        if(!territory || !territory.$ || !territory.$.countryCode){
            return; // skip invalid value
        }
        if(!metadata.hasOwnProperty(territory.$.countryCode)){
            metadata[territory.$.countryCode] = [];
        }
        metadata[territory.$.countryCode].push(formatTerritory(territory));
        if(territory.$.mainCountryForCode == "true"){
            mainCountriesForCode[territory.$.countryCode] = territory.$.id;
        }
    });

    // Sort the array, so the main country would always be the first array item
    Object.keys(mainCountriesForCode).forEach(function(countryCode){
        metadata[countryCode].sort(function(a, b){
            if(a[0] == mainCountriesForCode[countryCode]){
                return -1;
            }
            if(b[0] == mainCountriesForCode[countryCode]){
                return 1;
            }
            return 0;
        });
    });

    // Convert country info to JSON
    Object.keys(metadata).forEach(function(countryCode){
        metadata[countryCode] = metadata[countryCode].map(function(country){
            return JSON.stringify(country);
        });
    });

    callback(null, metadata);
}

function formatTerritory(territory){
    var res = [],
        generalDesc = [].concat(territory.generalDesc || []).shift();

    res.push(territory.$.id);
    res.push(territory.$.internationalPrefix);
    res.push(territory.$.nationalPrefix);

    res.push(
        territory.$.id != "BR" ?
            nodeToText(territory.$.nationalPrefixForParsing) :
            "(?:0|90)(?:(1[245]|2[135]|[34]1)(\\d{10,11}))?");

    res.push(territory.$.nationalPrefixTransformRule);
    res.push(territory.$.nationalPrefixFormattingRule);
    res.push([].concat(generalDesc && generalDesc.possibleNumberPattern || []).shift());
    res.push(nodeToText([].concat(generalDesc && generalDesc.nationalNumberPattern || []).shift()));

    // enumerate territory.availableFormats[0].numberFormat[]
    res.push([].concat(([].concat(territory.availableFormats || []).shift() || {}).numberFormat || []).
        map(function(format){
        return [
            format.$.pattern,
            [].concat(format.format || []).shift(),
            nodeToText([].concat(format.leadingDigits || []).shift()) || "",
            format.$.nationalPrefixFormattingRule,
            Array.isArray(format.intlFormat) && format.intlFormat.length == 1 ? format.intlFormat[0] : undefined
        ];
    }));

    return res;
}

function formatJS(data){
    return "/* Automatically generated. Do not edit. */\n"+
           "var PHONE_NUMBER_META_DATA = " + JSON.stringify(data) + ";\n";
}
