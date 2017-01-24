import http=require('http');
import fs= require('fs');
import url=require('url');
import path=require('path');

import {getArgValue, _obj} from "./utils";
import {reverseProxy} from "./routes";
import {read} from './fileutils';

//by default app will look for routes.json and other jsons in stubs path
var port=3000;


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
            let _routes = 'routes.json';
            read(_routes,(data:any) =>{
                this.routes = JSON.parse(data);
            });
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
          return  JsonStub.jsonStub = new JsonStub();
        }
        return  JsonStub.jsonStub;
    }

    send(request, response,body?:string) {


        try{
            let _route = url.parse(request.url).pathname;

            if (!this.routes) {
                throw new Error("Unable to find routes.json, please initialize using --routes options");
            }
             reverseProxy(this.routes,_route ,body,(data)=>{
              try {
                  if (!data) {
                       this.respond(response, 200, _obj("Looks like no json file is configured in routes.json file for the route"));
                       return;
                  } else {
                        this.respond(response, 200, data);
                        return;
                  }
              }catch(e){
                    this.sendError(response, e);
                    return;
              }
            });
        }catch(e){
            console.error(' error here is ',JSON.stringify(e));
              this.sendError(response, e);
              return;
        }
    }

    sendError(response,err){
       return  this.respond(response,500,err);
    }

    respond(response, status,content) {
        console.log(' respond:method type of content  ',content);

        if(typeof content!=='string'){
            content=JSON.stringify(content);
        }
        response.writeHeader(status, {"Content-Type": "application/json"});
        response.write(content + "\n");
        response.end();
        return;
    }
}

/**
 *
 */
function init(port?: number) {
    port=getArgValue('-port') || port;

    let jsonStub = JsonStub.getInstance();

    http.createServer((request, response) => {

        let method=request.method;

        if(method==='POST' || method==='PUT'){
            let body = "";
            request.on('data', function (chunk) {
                body += chunk;
            });
            request.on('end', function () {
                jsonStub.send(request, response,body);
            });
        }else{
            jsonStub.send(request, response);
        }

    }).listen(port);

    console.log('Server started on port ',port);
}

init();