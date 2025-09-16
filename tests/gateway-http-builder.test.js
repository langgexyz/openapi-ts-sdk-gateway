// Gateway HTTP Builder 单元测试
const { GatewayHttpBuilder } = require('../dist/index');
const { HttpMethod } = require('openapi-ts-sdk');
const { HeaderBuilder, GatewayClient } = require('gateway-ts-sdk');

console.log('=== Gateway HTTP Builder 测试 ===');

// Mock Gateway 客户端
class MockGatewayClient {
  async send(command, data, responseType, headers) {
    return JSON.stringify({
      message: 'gateway mock response',
      command: command,
      data: data,
      headers: Array.from(headers?.entries() || []),
      timestamp: new Date().toISOString()
    });
  }
}

// 失败的 Gateway 客户端
class FailingGatewayClient {
  async send(command, data, responseType, headers) {
    const error = new Error('Gateway connection failed');
    error.code = 'GATEWAY_ERROR';
    throw error;
  }
}

// Mock Header Builder
class MockHeaderBuilder {
  constructor() {
    this.headers = new Map();
  }
  
  setProxy(url, method) {
    this.headers.set('X-Proxy-URL', url);
    this.headers.set('X-Proxy-Method', method);
    return this;
  }
  
  build() {
    return this.headers;
  }
}

// 1. 测试 GatewayHttpBuilder 构建
console.log('\n1. GatewayHttpBuilder 构建测试:');
try {
  const gatewayClient = new MockGatewayClient();
  const headerBuilder = new MockHeaderBuilder();
  const builder = new GatewayHttpBuilder('https://api.example.com', gatewayClient, headerBuilder);
  
  const http = builder
    .setUri('/api/users')
    .setMethod(HttpMethod.POST)
    .addHeader('Content-Type', 'application/json')
    .addHeader('X-Custom-Header', 'custom-value')
    .setContent('{"name": "Charlie", "role": "user"}')
    .build();
    
  if (!http || typeof http.send !== 'function') {
    throw new Error('GatewayHttpBuilder 应该返回包含 send 方法的对象');
  }
  
  console.log('✅ GatewayHttpBuilder 构建成功');
} catch (error) {
  console.error('❌ GatewayHttpBuilder 构建失败:', error.message);
}

// 2. 测试 Gateway 代理请求
console.log('\n2. Gateway 代理请求测试:');
try {
  const gatewayClient = new MockGatewayClient();
  const headerBuilder = new MockHeaderBuilder();
  const builder = new GatewayHttpBuilder('https://api.example.com', gatewayClient, headerBuilder);
  
  const http = builder
    .setUri('/api/proxy-test')
    .setMethod(HttpMethod.PUT)
    .addHeader('Authorization', 'Bearer gateway-token')
    .setContent('{"action": "update", "data": {"id": 123}}')
    .build();
    
  http.send().then(([response, error]) => {
    if (error) {
      console.error('❌ Gateway 代理请求失败:', error.message);
    } else {
      const data = JSON.parse(response);
      if (data.message === 'gateway mock response' && data.command === 'API/Proxy') {
        console.log('✅ Gateway 代理请求成功');
      } else {
        console.error('❌ Gateway 代理响应格式错误');
      }
    }
  }).catch(err => {
    console.error('❌ Gateway 代理请求异常:', err.message);
  });
} catch (error) {
  console.error('❌ Gateway 代理请求测试失败:', error.message);
}

// 3. 测试 Header Builder 集成
console.log('\n3. Gateway Header Builder 集成测试:');
try {
  const gatewayClient = new MockGatewayClient();
  const headerBuilder = new MockHeaderBuilder();
  const builder = new GatewayHttpBuilder('https://target-api.com', gatewayClient, headerBuilder);
  
  const http = builder
    .setUri('/api/external')
    .setMethod(HttpMethod.GET)
    .build();
    
  http.send().then(([response, error]) => {
    if (error) {
      console.error('❌ Gateway Header Builder 集成失败:', error.message);
    } else {
      const data = JSON.parse(response);
      // 检查代理头部是否正确设置
      const headers = new Map(data.headers);
      if (headers.has('X-Proxy-URL') && headers.has('X-Proxy-Method')) {
        console.log('✅ Gateway Header Builder 集成成功');
      } else {
        console.error('❌ Gateway 代理头部设置错误');
      }
    }
  }).catch(err => {
    console.error('❌ Gateway Header Builder 集成异常:', err.message);
  });
} catch (error) {
  console.error('❌ Gateway Header Builder 集成测试失败:', error.message);
}

// 4. 测试 Gateway 错误处理
console.log('\n4. Gateway 错误处理测试:');
try {
  const failingClient = new FailingGatewayClient();
  const headerBuilder = new MockHeaderBuilder();
  const builder = new GatewayHttpBuilder('https://api.example.com', failingClient, headerBuilder);
  
  const http = builder
    .setUri('/api/failing')
    .setMethod(HttpMethod.POST)
    .setContent('{"test": "data"}')
    .build();
    
  http.send().then(([response, error]) => {
    if (error) {
      if (error.message.includes('Gateway connection failed') && error.code === 'GATEWAY_ERROR') {
        console.log('✅ Gateway 错误处理正确');
      } else {
        console.error('❌ Gateway 错误信息格式错误:', error.message);
      }
    } else {
      console.error('❌ Gateway 应该返回错误');
    }
  }).catch(err => {
    console.error('❌ Gateway 错误处理测试异常:', err.message);
  });
} catch (error) {
  console.error('❌ Gateway 错误处理测试失败:', error.message);
}

// 5. 测试不同 HTTP 方法
console.log('\n5. Gateway 不同 HTTP 方法测试:');
try {
  const gatewayClient = new MockGatewayClient();
  const headerBuilder = new MockHeaderBuilder();
  
  const methods = [
    { method: HttpMethod.GET, uri: '/api/get-test' },
    { method: HttpMethod.POST, uri: '/api/post-test' },
    { method: HttpMethod.PUT, uri: '/api/put-test' },
    { method: HttpMethod.DELETE, uri: '/api/delete-test' },
    { method: HttpMethod.PATCH, uri: '/api/patch-test' }
  ];
  
  let successCount = 0;
  
  methods.forEach(async (testCase, index) => {
    try {
      const builder = new GatewayHttpBuilder('https://api.example.com', gatewayClient, headerBuilder);
      const http = builder
        .setUri(testCase.uri)
        .setMethod(testCase.method)
        .setContent('{"test": "method"}')
        .build();
        
      const [response, error] = await http.send();
      
      if (!error) {
        const data = JSON.parse(response);
        if (data.message === 'gateway mock response') {
          successCount++;
        }
      }
      
      // 检查是否是最后一个测试
      if (index === methods.length - 1) {
        if (successCount === methods.length) {
          console.log('✅ Gateway 所有 HTTP 方法测试成功');
        } else {
          console.error(`❌ Gateway HTTP 方法测试失败: ${successCount}/${methods.length}`);
        }
      }
    } catch (methodError) {
      console.error(`❌ Gateway ${testCase.method} 方法测试失败:`, methodError.message);
    }
  });
} catch (error) {
  console.error('❌ Gateway HTTP 方法测试失败:', error.message);
}

// 6. 测试 Gateway 对真实服务（如果可用）
console.log('\n6. Gateway 真实服务测试:');
(async () => {
  try {
    const { createClient, HeaderBuilder } = require('gateway-ts-sdk');
    
    console.log('尝试连接到本地 Gateway 服务...');
    
    // 检查本地服务
    const gatewayUrl = 'ws://localhost:18443';
    const midwayUrl = 'http://localhost:7001';
    
    try {
      const gatewayClient = createClient(gatewayUrl, 'gateway-test-client');
      const realHeaderBuilder = new HeaderBuilder();
      
      // 等待连接建立
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const builder = new GatewayHttpBuilder(midwayUrl, gatewayClient, realHeaderBuilder);
      const http = builder
        .setUri('/ping')
        .setMethod(HttpMethod.GET)
        .addHeader('User-Agent', 'gateway-real-test/1.0.0')
        .build();
        
      const [realResponse, realError] = await http.send();
      
      if (realError) {
        console.error('❌ Gateway 真实服务测试失败:', realError.message);
      } else {
        console.log('✅ Gateway 真实服务测试成功');
      }
      
      gatewayClient.close();
    } catch (serviceError) {
      console.log('⚠️  本地 Gateway/Midway 服务不可用，跳过真实服务测试');
    }
    
  } catch (error) {
    if (error.code === 'MODULE_NOT_FOUND') {
      console.log('⚠️  gateway-ts-sdk 未安装，跳过真实服务测试');
    } else {
      console.error('❌ Gateway 真实服务测试失败:', error.message);
    }
  }
})();

// 7. Gateway 错误场景测试
console.log('\n7. Gateway 错误场景测试:');

// Mock 失败的 Gateway 客户端（错误场景专用）
class GatewayFailingClient {
  async send(command, data, responseType, headers) {
    const error = new Error('Gateway connection lost');
    error.code = 'GATEWAY_CONNECTION_ERROR';
    throw error;
  }
}

(async () => {
  try {
    const failingClient = new GatewayFailingClient();
    const headerBuilder = new MockHeaderBuilder();
    const builder = new GatewayHttpBuilder('https://api.example.com', failingClient, headerBuilder);
    
    const http = builder
      .setUri('/api/proxy')
      .setMethod(HttpMethod.POST)
      .setContent('{"test": "data"}')
      .build();
      
    const [response, error] = await http.send();
    
    if (error && error.message.includes('Gateway connection lost') && 
        error.code === 'GATEWAY_CONNECTION_ERROR') {
      console.log('✅ Gateway 连接错误处理正确');
    } else {
      console.error('❌ Gateway 连接错误格式错误');
    }
    
  } catch (error) {
    console.error('❌ Gateway 错误场景测试失败:', error.message);
  }
})();

// 8. Gateway 环境兼容性测试
console.log('\n8. Gateway 环境兼容性测试:');
try {
  try {
    const { createClient, HeaderBuilder } = require('gateway-ts-sdk');
    console.log('✅ gateway-ts-sdk 模块可用');
    console.log('✅ Gateway 依赖检查通过');
    
    // 测试构造函数参数验证
    try {
      const invalidBuilder = new GatewayHttpBuilder('https://api.example.com', null, null);
    } catch (validationError) {
      if (validationError.message.includes('client') || validationError.message.includes('headerBuilder')) {
        console.log('✅ Gateway 构造函数参数验证正确');
      }
    }
    
  } catch (gatewayError) {
    if (gatewayError.code === 'MODULE_NOT_FOUND') {
      console.log('⚠️  gateway-ts-sdk 未安装，位于 ../gateway-ts-sdk');
    }
  }
  
} catch (error) {
  console.error('❌ Gateway 环境兼容性测试失败:', error.message);
}

console.log('\n=== Gateway HTTP Builder 测试完成 ===');
