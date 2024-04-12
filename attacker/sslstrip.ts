import * as http from "http";
import * as https from "https";

const onRequest = (req: http.IncomingMessage, res: http.ServerResponse) => {
    console.log(`[server] got request, need to serve: ${req.headers.host}${req.url}`);
    
    const requestURL = new URL(req.url, `http://${req.headers.host}`);
    const options = {
        host: requestURL.host,
	port: 443,
	path: requestURL.pathname,
	method: req.method,
	headers: req.headers
    };

    const proxy = https.request(options, (requestRes: http.IncomingMessage) => {
        console.log(`[proxy] proxy request got response, writing back to client...`);
        res.writeHead(requestRes.statusCode, requestRes.headers);
        requestRes.pipe(res, {
            end: true
        });
    });

    proxy.on('error', (e: Error) => {
        console.log(`[server] error in proxying request: ${e}`);
        res.writeHead(500, { 'Content-Type': 'application/json' })
           .end(JSON.stringify({ message: "internal server error" }));
    });

    req.pipe(proxy, {
        end: true
    });
}

http.createServer(onRequest).listen(8080, () => {
    console.log(`[server] SSLStrip server started`);
});
