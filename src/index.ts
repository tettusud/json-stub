import http=require('http');
import fs= require('fs');
import url=require('url');
import path=require('path');

import {reverseProxy} from "./util";

function endsWith(suffix: string, str: string) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

/***
 *
 */
class JsonStub {

    static jsonStub: JsonStub;

    private routes: any;

    /**
     *
     */
    constructor() {
        try {
            let root = path.resolve(__dirname, './');
            let _routes = path.join(root, 'routes.json');
            let data = fs.readFileSync(_routes, 'utf8');
            this.routes = JSON.parse(data);
        } catch (e) {
            console.error('routes.json file not found ,please pass it with --routes option', e);
            throw e;
        }
    }

    /**
     *
     * @returns {JsonStub}
     */
    static getInstance() {
        if (!JsonStub.jsonStub) {
            JsonStub.jsonStub = new JsonStub();
        }
        return new JsonStub();
    }


    send(request, response) {

        console.log('sending request');

        let _route = url.parse(request.url).pathname;

        if (!this.routes) {
            return this.error(response, 'unable to find routes.json, please initialize using --routes options');
        }


        //let _path: string = this.routes[_route];

        let _path = reverseProxy(this.routes,_route);

        if (!_path) {
            return this.error(response, 'Looks like no json file is configured in routes.json file for the route ,may be you missed' +
                'the leading \ for example {\"/hello/world\"}' + _route);
        }
        _path = _path.trim();

        let _filepath = path.join(__dirname, _path).trim();

        if (!endsWith(".json", _filepath)) {
            _filepath = _filepath + ".json";
        }

        fs.readFile(_filepath, 'UTF-8', function (err, data) {

            if (err) {
                return this.error(response, err);
            } else {
                response.writeHeader(200, {"Content-Type": "application/json"});
                response.write(data, "UTF-8");
                response.end();
            }

        });
    }

    error(response, err) {
        response.writeHeader(500, {"Content-Type": "application/json"});
        response.write(err + "\n");
        response.end();
    }

}


/**
 *
 */
function init(port?: number) {

    http.createServer((request, response) => {
        let jsonStub = JsonStub.getInstance();
        jsonStub.send(request, response);

    }).listen(port | 3001);
}

init();