"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GatewayHttpBuilder = void 0;
const openapi_ts_sdk_1 = require("openapi-ts-sdk");
/**
 * Gateway SDK HTTP Builder 实现
 */
class GatewayHttpBuilder extends openapi_ts_sdk_1.HttpBuilder {
    constructor(url, client, headerBuilder) {
        super(url);
        this.client = client;
        this.headerBuilder = headerBuilder;
    }
    build() {
        return {
            send: async () => {
                try {
                    // 使用 Gateway SDK 的代理功能
                    const proxyHeaders = this.headerBuilder
                        .setProxy(`${this.baseUrl_}${this.uri_}`, this.method_)
                        .build();
                    // 合并自定义头部
                    for (const [key, value] of this.headers_) {
                        proxyHeaders.set(key, value);
                    }
                    // 准备请求数据
                    let requestData = {};
                    if (this.content_) {
                        try {
                            requestData = JSON.parse(this.content_);
                        }
                        catch {
                            // 如果不是 JSON，包装为对象
                            requestData = { data: this.content_ };
                        }
                    }
                    // 使用 Gateway 客户端发送请求
                    const result = await this.client.send('API/Proxy', requestData, String, proxyHeaders);
                    return [result, null];
                }
                catch (error) {
                    const httpError = new Error(error.message || 'Gateway request failed');
                    // 添加更多错误信息
                    if (error.code) {
                        httpError.code = error.code;
                    }
                    return ['', httpError];
                }
            }
        };
    }
}
exports.GatewayHttpBuilder = GatewayHttpBuilder;
//# sourceMappingURL=gateway-http-builder.js.map