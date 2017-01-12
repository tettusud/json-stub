"use strict";
var http = require("http");
var fs = require("fs");
var url = require("url");
var path = require("path");
var util_1 = require("./util");
function endsWith(suffix, str) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
}
/***
 *
 */
var JsonStub = (function () {
    /**
     *
     */
    function JsonStub() {
        try {
            var root = path.resolve(__dirname, './');
            var _routes = path.join(root, 'routes.json');
            var data = fs.readFileSync(_routes, 'utf8');
            this.routes = JSON.parse(data);
        }
        catch (e) {
            console.error('routes.json file not found ,please pass it with --routes option', e);
            throw e;
        }
    }
    /**
     *
     * @returns {JsonStub}
     */
    JsonStub.getInstance = function () {
        if (!JsonStub.jsonStub) {
            JsonStub.jsonStub = new JsonStub();
        }
        return new JsonStub();
    };
    JsonStub.prototype.send = function (request, response) {
        console.log('sending request');
        var _route = url.parse(request.url).pathname;
        if (!this.routes) {
            return this.error(response, 'unable to find routes.json, please initialize using --routes options');
        }
        //let _path: string = this.routes[_route];
        var _path = util_1.reverseProxy(this.routes, _route);
        if (!_path) {
            return this.error(response, 'Looks like no json file is configured in routes.json file for the route ,may be you missed' +
                'the leading \ for example {\"/hello/world\"}' + _route);
        }
        _path = _path.trim();
        var _filepath = path.join(__dirname, _path).trim();
        if (!endsWith(".json", _filepath)) {
            _filepath = _filepath + ".json";
        }
        fs.readFile(_filepath, 'UTF-8', function (err, data) {
            if (err) {
                return this.error(response, err);
            }
            else {
                response.writeHeader(200, { "Content-Type": "application/json" });
                response.write(data, "UTF-8");
                response.end();
            }
        });
    };
    JsonStub.prototype.error = function (response, err) {
        response.writeHeader(500, { "Content-Type": "application/json" });
        response.write(err + "\n");
        response.end();
    };
    return JsonStub;
}());
/**
 *
 */
function init(port) {
    http.createServer(function (request, response) {
        var jsonStub = JsonStub.getInstance();
        jsonStub.send(request, response);
    }).listen(port | 3001);
}
init();
//# sourceMappingURL=index.js.map