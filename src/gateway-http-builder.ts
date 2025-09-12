import { HttpBuilder, Http } from 'openapi-ts-sdk';
import { HeaderBuilder, StreamGatewayClient, HttpMethod } from 'gateway-ts-sdk';

/**
 * Gateway SDK HTTP Builder 实现
 */
export class GatewayHttpBuilder extends HttpBuilder {
  private client: StreamGatewayClient;
  private headerBuilder: HeaderBuilder;

  constructor(url: string, client: StreamGatewayClient, headerBuilder: HeaderBuilder) {
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

          // 准备请求数据
          let requestData: object = {};
          if (this.content_) {
            try {
              requestData = JSON.parse(this.content_);
            } catch {
              // 如果不是 JSON，包装为对象
              requestData = { data: this.content_ };
            }
          }

          // 使用 Gateway 客户端发送请求
          const result = await this.client.send(
            'API/Proxy', 
            requestData, 
            String,
            proxyHeaders
          );
          
          return [result as string, null];
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
