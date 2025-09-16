import { HttpBuilder, Http } from 'openapi-ts-sdk';
import { HeaderBuilder, GatewayClient } from 'gateway-ts-sdk';

/**
 * Gateway 通用 HTTP Builder 实现
 * 直接调用 Gateway 的 API 端点，不进行代理转发
 */
export class GatewayHttpBuilder extends HttpBuilder {
  private client: GatewayClient;
  private headerBuilder: HeaderBuilder;

  constructor(baseUrl: string, client: GatewayClient, headerBuilder: HeaderBuilder = new HeaderBuilder()) {
    super(baseUrl);
    this.client = client;
    this.headerBuilder = headerBuilder;
  }

  public build(): Http {
    return {
      send: async (): Promise<[string, Error | null]> => {
        try {
          // 从 HeaderBuilder 获取基础头部
          const headers = this.headerBuilder.build();

          // 合并自定义头部
          for (const [key, value] of this.headers_) {
            headers.set(key, value);
          }

          // 使用 sendRaw 方法直接发送 content
          const result = await this.client.sendRaw(
            this.uri_ || '',
            this.content_ || '{}',
            headers
          );

          return [result, null];
        } catch (error: any) {
          const httpError = new Error(error.message || 'Gateway request failed');

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
