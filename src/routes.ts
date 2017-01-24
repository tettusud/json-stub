import {read} from './fileutils';

import {_obj} from './utils';

const REGEX_KEY_WITH_PARAM = new RegExp(":");
const REGEX_WITH_HASH_PARAM = new RegExp("#");
const REGEX_STRIP_QUERY_PARAM = new RegExp(":\\w+");
//const REGEX_STRIP_HASH_KEY=new RegExp("#\\w+");


/***
 * This function is used to reverse matches the set of routes defined in the routes configuration file
 * to that of current routes,
 * for eg  user/register
 *
 * will match user or user/register defined in json configuration
 *
 * callback accept  err and data two params
 */
export function reverseProxy(config: any, route: string,body:string, callback) {

    if (!config || !route) {
        return callback(_obj('Unknown error occured,either cofig or route is empty'));
    }

    //check for complete match

    if (config[route]) {
        console.log('\n #1 exact match')
        read(config[route], (data: any) => {
             callback(data);
             return;
        });
    }

    for (const key in config) {

        //query string match for  eg  : /hello/world/:language
        if (REGEX_KEY_WITH_PARAM.test(key)) {
            console.log('\n #2 query param')
            handleQueryParams(key, route, (result: any) => {
                console.log('#2 result')
                if (result.length > 0) {
                    let _path = config[key];

                     read(_path, (data: any) => {
                        console.log('handleQueryParams#read ');
                        //for now handling only single query parameter
                        //need to handle and iterate over keys but its way too cplx
                        data = JSON.parse(data);

                        if (result.length == 1) {
                            let _key = result[0];
                            if(!data[_key]){
                                callback(data);return;
                            }
                             callback(data[_key]);return;
                        } else {
                            //need to handle this scenerio
                            for (let k of result) {
                                //TODO
                            }
                        }
                    });
                }else{
                      callback(_obj('No data configured'));return;
                }

            });
        } else if (REGEX_WITH_HASH_PARAM.test(key)) {
            console.log('\n #3 hash param')
            let index: number = key.search(REGEX_WITH_HASH_PARAM);
            //  /hello/world#languageId
            let _key = key.substring(0, index - 1);  // /hello/world
            let match = key.substring(index + 1);    // languageId

            hasRouteMatch(_key, route, (flag: boolean) => {
                if (flag) {
                     read(config[key], (data: any) => {

                        console.log(' data from file ',data);

                        let _data;
                        if(data){
                            //match gives which key,so extract value of key and return that elemement
                            //for if key =languageId, search for launaugaeId in body , if launageId=en in body,then
                            //search for en key in the data and return that particular node

                            let _bodyKey=body[match];

                            if(_bodyKey){
                                _data=data[_bodyKey];
                            }else{
                                _data=data;
                            }

                              callback(_data);
                              return;
                        }

                    });
                } else {
                      callback(_obj("Unable to find data for key "+key));
                      return;
                }
            });
        } else {
            console.log('\n #4 part of query param')
            /**
             * match beginning of the string with ^
             *
             */
            var expression = "^" + key;
            var rx = new RegExp(expression, 'g');
            if (route.match(rx)) {
                 read(config[key], (data: any) => {
                      callback(data);
                      return;
                });
            }
        }
    }
}


/***
 * need to be documented
 * @param key ( is from routes.json )
 * @param route  (invoked url)
 * @returns {null}
 */
function handleQueryParams(key: string, route: string, callback) {
    let keys: Array<string> = key.split('/');
    let routes: Array<string> = route.split('/');
    //for later use
    let params: Array<string> = [];
    if (keys && routes) {
        let iterationLength = Math.min(keys.length, routes.length);
        for (let i = 0; i < iterationLength; i++) {
            if (REGEX_KEY_WITH_PARAM.test(keys[i])) {
                let t = {};
                //just remove leading : and put the key and corresponding value in an object
                t[keys[i].slice(1)] = routes[i];
                params.push(routes[i]);
            } else if (keys[i] !== routes[i]) {
                //pass empty to indicate its not the expected route
                return callback([]);
            }
            //i dont think we need to handle else logic keys[i]===routes[i]

            if (i === iterationLength - 1) {
                return callback(params);
            }
        }
    } else {
        return callback(null);
    }

}


/***
 * This is for post/put routes where routing decision needs to be taken depeding uponn
 * key in form body
 *
 *
 *
 */

function hasRouteMatch(key: string, route: string, callback) {
    let keys: Array<string> = key.split('/');
    let routes: Array<string> = route.split('/');

    if (keys && routes) {
        let iterationLength = Math.min(keys.length, routes.length);
        for (let i = 0; i < iterationLength; i++) {

            if (keys[i] !== routes[i]) {
                return callback(false);
            } else if (i === iterationLength - 1) {
                return callback(true);
            } else {
                continue;
            }
        }
    }

}
