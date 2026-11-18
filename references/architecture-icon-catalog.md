# 架构图标索引

用组件名称确认具体含义，再用图标帮助识别类别。例如 PostgreSQL 可用 `relational-database`，Redis 作为缓存时用 `cache`，作为内存数据存储时可用 `in-memory-store`。把图标键传给 `createArchitectureIcon`，绘制方法见 [系统架构图构图指南](architecture-composition.md)。

## 基础图标

| 用途 | 图标键与含义 |
|---|---|
| 人员与客户端 | `person` 人物、`browser` 浏览器、`mobile` 手机 |
| 接入与运行 | `gateway` 网关、`service` 服务、`agent` 智能体、`plug` 集成、`cloud` 云服务 |
| 数据与消息 | `database` 数据库、`storage` 对象存储、`cache` 缓存、`queue` 消息队列 |
| 工程与运维 | `terminal` 命令行、`config` 配置、`clock` 定时任务、`monitoring` 监控、`lock` 认证与权限 |
| 资料与结构 | `document` 文档、`image` 图片、`layers` 分层 |

## 按场景查找

| 场景 | 图标键与含义 |
|---|---|
| 人员与渠道 | `team` 团队、`organization` 组织、`admin` 管理员、`desktop` 桌面端、`tablet` 平板、`web-page` 网页、`email` 邮件、`chat` 聊天、`phone` 电话、`notification` 通知 |
| 网络与集成 | `load-balancer` 负载均衡、`router` 路由器、`switch` 交换机、`dns` DNS、`cdn` CDN、`proxy` 代理、`vpn` VPN、`firewall` 防火墙、`webhook` Webhook、`api` API 接口 |
| 云与部署 | `container` 容器、`pod` Pod、`cluster` 集群、`virtual-machine` 虚拟机、`serverless` 无服务器函数、`region` 地域、`availability-zone` 可用区、`deployment` 部署、`registry` 镜像仓库、`edge-node` 边缘节点 |
| 数据与存储 | `relational-database` 关系数据库、`document-database` 文档数据库、`vector-database` 向量数据库、`graph-database` 图数据库、`data-warehouse` 数据仓库、`data-lake` 数据湖、`file-storage` 文件存储、`in-memory-store` 内存数据存储、`backup` 备份、`data-pipeline` 数据管道 |
| 消息与并发 | `event` 事件、`topic` 消息主题、`publisher` 发布者、`subscriber` 订阅者、`stream` 数据流、`broker` 消息代理、`dead-letter-queue` 死信队列、`worker` 后台执行器、`thread-pool` 线程池、`batch-job` 批处理任务 |
| 安全与治理 | `shield` 安全防护、`key` 密钥、`certificate` 证书、`identity-provider` 身份提供方、`single-sign-on` 单点登录、`multi-factor-auth` 多因素认证、`secrets-vault` 密钥保管库、`policy` 策略、`audit-log` 审计日志、`data-mask` 数据脱敏 |
| 可观测性与容错 | `logs` 日志、`metrics` 指标、`trace` 调用追踪、`alert` 告警、`health-check` 健康检查、`dashboard` 仪表盘、`error` 错误、`retry` 重试、`circuit-breaker` 熔断器、`rate-limit` 限流 |
| 研发与发布 | `git-repo` Git 仓库、`branch` 分支、`commit` 提交、`pull-request` 合并请求、`ci` 持续集成、`test` 测试、`build` 构建、`artifact` 构建产物、`release` 发布、`rollback` 回滚 |
| AI 与检索 | `model` 模型、`prompt` 提示词、`embedding` 向量嵌入、`rag` 检索增强生成、`search` 搜索、`rerank` 重排、`vector-index` 向量索引、`tool-call` 工具调用、`human-review` 人工复核、`evaluation` 评估 |
| 产品与业务流程 | `form` 表单、`workflow` 工作流、`decision` 判断、`approval` 审批、`ticket` 工单、`calendar` 日历、`payment` 支付、`shopping-cart` 购物车、`order` 订单、`inventory` 库存 |
