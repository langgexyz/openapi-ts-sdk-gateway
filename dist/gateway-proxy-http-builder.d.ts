import { HttpBuilder, Http } from 'openapi-ts-sdk';
import { HeaderBuilder, StreamGatewayClient } from 'gateway-ts-sdk';
/**
 * Gateway 代理 HTTP Builder 实现
 * 专门用于通过 Gateway 代理转发 HTTP 请求到外部服务
 */
export declare class GatewayProxyHttpBuilder extends HttpBuilder {
    private client;
    private headerBuilder;
    constructor(url: string, client: StreamGatewayClient, headerBuilder?: HeaderBuilder);
    build(): Http;
}
//# sourceMappingURL=gateway-proxy-http-builder.d.ts.map