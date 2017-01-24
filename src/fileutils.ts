/****
   File utitlity to load routes and other json files
 ****/


import fs= require('fs');
import path=require('path');
import {getArgValue} from './utils';

//current working directory
const root =  process.cwd();
const REGEX_WITH_HASH_PARAM=new RegExp("#");

//it can be changed by passing cmd line arg by -stub data
var defaultDir =  getArgValue('-stub') || 'stubs';


function endsWith(suffix: string, str: string) {

    return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

function getPath(fpath:string){
    return path.join(root,defaultDir,fpath);
}

export function read(fpath:string ,done){

    console.log('fileutils#read ',fpath);

    let parts;
    /*
      This is to handle multiple responses in same json file
      for eg   india@helloworld
      it will look for file helloworld.json   and search for india as key and returns its value
     */
    if(REGEX_WITH_HASH_PARAM.test(fpath)){
        parts=fpath.split('@');
        fpath=parts[1];
    }

    if (!endsWith(".json", fpath)) {
        fpath = fpath + ".json";
    }
    try{
        let _path=getPath(fpath);
        fs.readFile(_path, 'utf-8', function (err:any, data:any) {


            if(err){
                throw err;
            }

            if(parts){
                done(data[parts[0]]);
            }else {
                done(data);
            }
        });
    }catch(e){
        console.error('Error reading file from the path ',fpath);
        throw e;
    }
}


