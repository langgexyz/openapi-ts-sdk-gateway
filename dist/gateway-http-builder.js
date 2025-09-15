"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GatewayHttpBuilder = void 0;
const openapi_ts_sdk_1 = require("openapi-ts-sdk");
const gateway_ts_sdk_1 = require("gateway-ts-sdk");
/**
 * Gateway 通用 HTTP Builder 实现
 * 直接调用 Gateway 的 API 端点，不进行代理转发
 */
class GatewayHttpBuilder extends openapi_ts_sdk_1.HttpBuilder {
    constructor(baseUrl, client, headerBuilder = new gateway_ts_sdk_1.HeaderBuilder()) {
        super(baseUrl);
        this.client = client;
        this.headerBuilder = headerBuilder;
    }
    build() {
        return {
            send: async () => {
                try {
                    // 从 HeaderBuilder 获取基础头部
                    const headers = this.headerBuilder.build();
                    // 合并自定义头部
                    for (const [key, value] of this.headers_) {
                        headers.set(key, value);
                    }
                    // 使用 sendRaw 方法直接发送 content
                    const result = await this.client.sendRaw(this.uri_ || '', this.content_ || '{}', headers);
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