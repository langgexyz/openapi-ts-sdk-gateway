import { HttpBuilder, Http } from 'openapi-ts-sdk';
import { HeaderBuilder, GatewayClient } from 'gateway-ts-sdk';
/**
 * Gateway 通用 HTTP Builder 实现
 * 直接调用 Gateway 的 API 端点，不进行代理转发
 */
export declare class GatewayHttpBuilder extends HttpBuilder {
    private client;
    private headerBuilder;
    constructor(baseUrl: string, client: GatewayClient, headerBuilder?: HeaderBuilder);
    build(): Http;
}
//# sourceMappingURL=gateway-http-builder.d.ts.map