import { HttpBuilder, Http } from 'openapi-ts-sdk';
import { HeaderBuilder, StreamGatewayClient } from 'gateway-ts-sdk';
/**
 * Gateway SDK HTTP Builder 实现
 */
export declare class GatewayHttpBuilder extends HttpBuilder {
    private client;
    private headerBuilder;
    constructor(url: string, client: StreamGatewayClient, headerBuilder: HeaderBuilder);
    build(): Http;
}
//# sourceMappingURL=gateway-http-builder.d.ts.map