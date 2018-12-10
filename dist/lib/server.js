'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _https = require('https');

var _https2 = _interopRequireDefault(_https);

var _url = require('url');

var _url2 = _interopRequireDefault(_url);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _serverConfig = require('../config/server-config');

var _serverConfig2 = _interopRequireDefault(_serverConfig);

var _fileType = require('../config/file-type');

var _fileType2 = _interopRequireDefault(_fileType);

var _codeConfig = require('../config/code-config');

var _codeConfig2 = _interopRequireDefault(_codeConfig);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * node server
 */
var Server = function () {
    function Server() {
        var _this = this;

        (0, _classCallCheck3.default)(this, Server);

        this.server = _serverConfig2.default.protocol === 'https' ? _https2.default : _http2.default;
        this.host = _serverConfig2.default.host ? _serverConfig2.default.host : '0.0.0.0';
        this.port = _serverConfig2.default.port ? _serverConfig2.default.port : 3000;
        this.rootPath = _serverConfig2.default.rootPath ? _serverConfig2.default.rootPath : '../dist';
        this.rootPath = _path2.default.resolve(__dirname, this.rootPath);
        this.codeConfig = _codeConfig2.default;
        this.notFound = _serverConfig2.default['404'] ? _serverConfig2.default['404'] : '/404.html';

        var server = this.server.createServer(function (req, res) {
            // 处理路径
            _this.parsePath(req);
            _this.readFile(res);
        });

        server.listen(this.port, this.host, function () {
            // eslint-disable-next-line no-console
            console.log('Server running at ' + _this.port);
        });
    }

    /**
     * 将url路径转换为物理路径
     * 
     * @param {Object} req requist object
     */


    (0, _createClass3.default)(Server, [{
        key: 'parsePath',
        value: function parsePath(req) {
            // 获取url中的文件名
            var pathname = _url2.default.parse(req.url).pathname;
            // 处理链接以'/'结尾的情况
            pathname = pathname !== '/' && pathname ? pathname : '/index.html';
            // 将链接转换成物理路径
            this.realPath = _path2.default.join(this.rootPath, _path2.default.normalize(pathname.replace(/\.\./g, '')));
            this.ext = _path2.default.extname(this.realPath) ? _path2.default.extname(this.realPath).slice(1) : '';
        }
    }, {
        key: 'readFile',
        value: function readFile(res) {
            var code = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '200';

            var exists = _fs2.default.existsSync(this.realPath);

            // 处理404
            if (!exists && !~this.realPath.indexOf(this.notFound)) {
                this.realPath = _path2.default.join(this.rootPath, this.notFound);
                return this.readFile(res, '404');
            }

            try {
                var result = _fs2.default.readFileSync(this.realPath, 'binary');

                this.responseResult(res, code, _fileType2.default[this.ext], result);
            } catch (err) {
                if (err) {
                    this.responseResult(res, '500', this.codeConfig['500'].header, this.codeConfig['500'].message);
                }
            }
        }
    }, {
        key: 'responseResult',
        value: function responseResult(res, code, header, file) {
            res.writeHead(code, header);
            res.write(file, 'binary');
            res.end();
        }
    }]);
    return Server;
}();

exports.default = Server;