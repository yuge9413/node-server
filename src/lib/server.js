/**
 * node server
 */
import http from 'http';
import https from 'https';
import url from 'url';
import fs from 'fs';
import path from 'path';
import config from '../config/server-config';
import types from '../config/file-type';

class Server {
    constructor() {
        this.server = config.protocol === 'https' ? https : http;
        this.host = config.host ? config.host : '0.0.0.0';
        this.port = config.port ? config.port : 3000;
        this.rootPath = config.rootPath ? config.rootPath : './';

        const server = this.server.createServer((req, res) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/plain');
            res.end('Hello World');
        });

        server.listen(this.port, this.host, () => {
            // eslint-disable-next-line no-console
            console.log(`Server running at ${this.port}`);
        });
    }

    parsePath(req, res) {
        //获取url中的文件名
        let pathname = url.parse(req.url).pathname;
        //处理链接以'/'结尾的情况
        pathname = (pathname !== '/' && pathname) ? pathname : '/index.html';
        //将链接转换成物理路径
        const realPath = path.join(this.rootPath, path.normalize(pathname.replace(/\.\./g, '')));
        this.ext = path.extname(realPath);    
    }

    
}

export default Server;