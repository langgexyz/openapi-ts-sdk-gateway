import { HttpBuilder, Http } from 'openapi-ts-sdk';
import { HeaderBuilder, StreamGatewayClient, HttpMethod } from 'gateway-ts-sdk';

/**
 * Gateway 代理 HTTP Builder 实现
 * 专门用于通过 Gateway 代理转发 HTTP 请求到外部服务
 */
export class GatewayProxyHttpBuilder extends HttpBuilder {
  private client: StreamGatewayClient;
  private headerBuilder: HeaderBuilder;

  constructor(url: string, client: StreamGatewayClient, headerBuilder: HeaderBuilder = new HeaderBuilder()) {
    super(url);
    this.client = client;
    this.headerBuilder = headerBuilder;
  }

  public build(): Http {
    return {
      send: async (): Promise<[string, Error | null]> => {
        try {
          // 使用 Gateway SDK 的代理功能
          const proxyHeaders = this.headerBuilder
            .setProxy(`${this.baseUrl_}${this.uri_}`, this.method_ as HttpMethod)
            .build();

          // 合并自定义头部
          for (const [key, value] of this.headers_) {
            proxyHeaders.set(key, value);
          }

          // 使用 sendRaw 方法直接发送 content
          const result = await this.client.sendRaw(
            'API/Proxy',
            this.content_ || '{}',
            proxyHeaders
          );

          return [result, null];
        } catch (error: any) {
          const httpError = new Error(error.message || 'Gateway proxy request failed');

          // 添加更多错误信息
          if (error.code) {
            (httpError as any).code = error.code;
          }

          return ['', httpError];
        }
      }
    };
  }
}