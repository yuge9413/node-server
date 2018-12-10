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
import codeConfig from '../config/code-config';

class Server {
    constructor() {
        this.server = config.protocol === 'https' ? https : http;
        this.host = config.host ? config.host : '0.0.0.0';
        this.port = config.port ? config.port : 3000;
        this.rootPath = config.rootPath ? config.rootPath : '../dist';
        this.rootPath = path.resolve(__dirname, this.rootPath);
        this.codeConfig = codeConfig;
        this.notFound = config['404'] ? config['404'] : '/404.html';

        const server = this.server.createServer((req, res) => {
            // 处理路径
            this.parsePath(req);
            this.readFile(res);
        });

        server.listen(this.port, this.host, () => {
            // eslint-disable-next-line no-console
            console.log(`Server running at ${this.port}`);
        });
    }

    /**
     * 将url路径转换为物理路径
     * 
     * @param {Object} req requist object
     */
    parsePath(req) {
        // 获取url中的文件名
        let pathname = url.parse(req.url).pathname;
        // 处理链接以'/'结尾的情况
        pathname = (pathname !== '/' && pathname) ? pathname : '/index.html';
        // 将链接转换成物理路径
        this.realPath = path.join(this.rootPath, path.normalize(pathname.replace(/\.\./g, '')));
        this.ext = path.extname(this.realPath) ? path.extname(this.realPath).slice(1) : '';    
    }


    readFile(res, code = '200') {
        const exists = fs.existsSync(this.realPath);

        // 处理404
        if (!exists && !~this.realPath.indexOf(this.notFound)) {
            this.realPath = path.join(this.rootPath, this.notFound);
            return this.readFile(res, '404');
        }
        
        try {
            const result = fs.readFileSync(this.realPath, 'binary');

            this.responseResult(
                res,
                code,
                types[this.ext],
                result,
            );
        
        } catch(err) {
            if (err) {
                this.responseResult(
                    res,
                    '500',
                    this.codeConfig['500'].header,
                    this.codeConfig['500'].message
                );
            }
        }
    }

    responseResult(res, code, header, file) {
        res.writeHead(code, header);
        res.write(file, 'binary');
        res.end();
    }
}

export default Server;