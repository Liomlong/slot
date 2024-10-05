// 暂时注释掉 Redis 相关代码
// import Redis from 'ioredis';
// const redis = new Redis(process.env.REDIS_URL);
// export default redis;

// 使用一个空对象模拟 Redis 客户端
const mockRedis = {
  get: async () => null,
  set: async () => {},
  // 添加其他你可能用到的方法
};

export default mockRedis;