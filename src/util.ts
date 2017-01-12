/***
 * This function is used to reverse matches the set of routes defined in the routes configuration file
 * to that of current routes,
 * for eg  user/register
 *
 * will match user or user/register defined in json configuration
 *
 */
export function reverseProxy(config: any, route: string) {

    if (!config || !route) {
        return null;
    }

    //check for complete match

    if (config[route]) {
        return config[route];
    }

    for (const key in config) {
        //check for absolute match
        let v = config[key];
        var expression = "^" + key;
        var rx = new RegExp(expression, 'g');

        if (route.match(rx)) {
            return v;
        }
    }
}