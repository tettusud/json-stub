




/***
 *
 * @param key
 * @returns {any}
 */
export function getArgValue(key:string):any{
    let nextItem;
    let index = process.argv.indexOf(key);
    if(index >= 0 && index < process.argv.length - 1)
        nextItem =  process.argv[index + 1];
    return nextItem;
}


/**
 * it will checkif str2 string is substring of str1 and also it starts at the beginning
 */
export function startsWithRegex(str1:string,str2:string){
    /**
     * match beginning of the string with ^
     *
     */
    var expression = "^" + str2;
    var rx = new RegExp(expression, 'g');
    return  rx.test(str1);
}

export function _obj(msg:string){
    return new JsonObject(msg);
}

class JsonObject {

    message:string;

    constructor(message:string){
        this.message=message;
    }

}