# GCD China Convert Specification

Last updated: 2026-04-24

## 1. Product summary

GCD China Convert is the recommended first China product.

Positioning:

```text
面向中国 AI 工具和轻量 SaaS 的 AI 转化运营智能体。
```

Customer-facing promise:

```text
把内容流量、私域用户和试用用户自动转成付费。
```

Primary funnel:

```text
内容/落地页/社群 -> 加企微/关注/注册 -> 领取试用 -> 用出结果 -> 微信/支付宝付款 -> 续费
```

Portfolio role:

```text
GCD Platform -> GCD China Convert
```

This product owns China-side conversion operations. It should focus on private-domain承接、试用激活、付款转化 and renewal, not content generation or public-domain acquisition.

## 2. ICP

Best-fit customers:

- 低客单价 AI 工具
- 轻量 SaaS
- 创作者工具
- 效率工具
- 面向个人或小团队的知识/工具类产品
- 有小红书、抖音、公众号、社群、企微、微信群流量
- 已经有人力做私域承接，但效率低

Ideal customer profile:

- 月新增线索 500 以上
- 月付价格 ¥29 到 ¥999
- 能通过试用、模板、案例快速展示价值
- 已有微信支付、支付宝或小程序支付
- 有运营人员愿意配置话术和流程

Bad fit:

- 大客户企业销售
- 高客单复杂项目制软件
- 需要大量人工交付才能体现价值的产品
- 完全没有内容或私域入口的团队
- 不愿意做合规授权和消息触达管理的团队

Primary buyer:

- 创始人
- 增长负责人
- 运营负责人
- 私域负责人

Primary user:

- 运营
- 社群运营
- 增长
- 创始人

## 3. Jobs to be done

Primary jobs:

- 承接来自内容平台和社群的意向用户
- 自动区分用户来源、兴趣和意图
- 自动发放试用、模板、案例和付款路径
- 根据用户行为触发跟进
- 在额度用尽、结果完成、试用到期时推动付款
- 挽回未支付、到期未续费和沉默用户

Customer language:

```text
我们不缺内容流量，但承接、跟进、转化太靠人工。
```

## 4. MVP scope

v0.1 must include:

- H5 / 落地页 SDK
- 产品事件 API
- 渠道来源识别
- 企微联系人或公众号触达集成中的一种
- 微信支付或支付宝支付事件集成中的一种
- 试用领取 playbook
- 激活提醒 playbook
- 付款转化 playbook
- 未支付挽回 playbook
- 续费提醒 playbook
- 运营看板
- 用户/contact 时间线

v0.1 should not include:

- 自动爬取平台用户
- 自动批量私信陌生人
- 自动外呼
- 完整 SCRM 替代
- 全渠道内容发布
- 群控能力
- 绕过平台规则的触达

## 5. Core features

### 5.1 承接 Agent

Responsibilities:

- 识别用户来源渠道
- 识别活动、关键词、二维码、落地页
- 标记用户意图
- 推荐最短转化路径
- 发放试用入口或产品入口
- 将用户写入正确的私域阶段

Common triggers:

- 扫二维码
- 关注公众号
- 添加企微
- 打开 H5
- 注册账号
- 点击领取试用

Common actions:

- 发送欢迎语
- 发送试用链接
- 发送案例
- 发送模板
- 发送使用路径
- 创建运营提醒

### 5.2 激活 Agent

Responsibilities:

- 判断用户是否完成首次有效使用
- 推荐最匹配模板或案例
- 帮用户完成第一步配置
- 触发一次使用提醒
- 对高意向用户创建人工跟进任务

Activation examples:

- AI 写作工具：生成第一篇可用内容
- AI 图片工具：生成第一张可下载图片
- 数据工具：导入第一份数据并生成报表
- 营销工具：创建第一个投放或落地页方案
- 知识库工具：导入第一份资料并完成问答

### 5.3 私域跟进 Agent

Responsibilities:

- 根据用户阶段发送不同内容
- 控制触达频次
- 根据用户行为停止无效跟进
- 识别需要人工介入的高价值用户
- 记录每次触达的结果

Allowed follow-up types:

- 试用提醒
- 使用案例
- 功能教程
- 限时权益
- 付款链接
- 到期提醒
- 续费提醒

Guardrails:

- 必须有明确来源和授权
- 必须支持退订或停止触达
- 不做高频打扰
- 不发送未经审核的夸张承诺
- 不基于敏感个人信息做差别待遇

### 5.4 收款/续费 Agent

Responsibilities:

- 识别付款意图
- 生成付款链接或付款二维码
- 检测订单未支付
- 检测试用到期
- 检测会员到期
- 发送续费提醒
- 推荐合适套餐

Payment triggers:

- 试用额度用完
- 用户完成高价值动作
- 用户查看价格页
- 用户点击付款但未完成
- 订单过期
- 会员到期前 3 天
- 会员到期当天
- 会员到期后 3 天

## 6. Screens

Required v0.1 screens:

- 运营总览：渠道、线索、激活、付款、续费
- 渠道看板：小红书、抖音、公众号、社群、落地页等来源
- 私域阶段：新增、试用、已激活、待付款、已付款、待续费、沉默
- Playbook：承接、激活、付款、续费、召回
- 用户详情：来源、标签、事件、触达、支付
- 消息审批：待发送、已发送、失败、停止触达
- 支付看板：订单、未支付、已支付、退款、续费
- 合规设置：授权、退订、敏感字段、数据留存

## 7. APIs and data

Required endpoints:

```http
POST /v1/china/events
POST /v1/china/contacts/identify
POST /v1/china/payments/orders
POST /v1/china/messages/callback
```

Example contact:

```json
{
  "contact_id": "ct_123",
  "external_id": "wecom_user_123",
  "channel": "wecom",
  "source": "xiaohongshu",
  "campaign": "ai_writer_template",
  "stage": "trial_claimed",
  "consent": {
    "marketing": true,
    "transactional": true
  },
  "tags": ["ai_writer", "creator"]
}
```

Example payment order:

```json
{
  "order_id": "ord_123",
  "contact_id": "ct_123",
  "provider": "wechat_pay",
  "amount_cny": 99,
  "status": "created",
  "product_plan": "monthly_pro",
  "expires_at": "2026-04-24T12:00:00+08:00"
}
```

Required lifecycle events:

- `page_viewed`
- `qr_code_scanned`
- `contact_added`
- `wecom_contact_added`
- `official_account_followed`
- `group_joined`
- `mini_program_opened`
- `signup_completed`
- `trial_started`
- `trial_ending_soon`
- `trial_expired`
- `activation_completed`
- `value_moment_detected`
- `usage_limit_reached`
- `payment_order_created`
- `payment_qr_viewed`
- `payment_order_paid`
- `payment_order_expired`
- `refund_requested`
- `message_sent`
- `message_opened`
- `message_clicked`
- `agent_action_taken`
- `human_handoff_created`

China-specific stages:

```text
content_viewer
qr_scanner
private_domain_contact
trial_claimed
trial_used
payment_intent
paid_member
renewal_due
silent_contact
```

## 8. Integrations

v0.1 integrations:

- H5 / web SDK
- product event API
- 企微 or 公众号
- 微信支付 or 支付宝
- webhook

v0.2 integrations:

- 小程序
- 飞书多维表格
- 有赞 or 微盟
- GrowingIO or 神策
- 短信 provider
- 更多支付渠道

## 9. Compliance defaults

Default compliance requirements:

- 保存每个 contact 的来源、授权和可触达渠道
- 营销触达必须支持退订或停止触达
- 不在未知授权状态下自动发送营销消息
- 不采集与转化目的无关的个人信息
- 不使用敏感个人信息做不合理差别待遇
- 高风险话术和付款承诺默认需要人工审批
- 所有 agent 动作必须有审计日志

Default rule:

```text
如果来源、授权、触达资格不明确，不自动触达。
```

## 10. Pricing

Recommended packaging:

- Starter: ¥499/month
- Growth: ¥999/month
- Pro: ¥1,999/month
- setup service: optional first-month implementation package

Usage metric:

- contacts managed
- messages sent
- active playbooks
- payment recovery actions

Possible success fee:

- recovered unpaid orders
- trial-to-paid conversions
- renewed users

Do not make success fee mandatory in v0.1. It may create attribution disputes before measurement is mature.

## 11. Success metrics

North-star metric:

```text
通过 GCD 影响的新增付费和续费金额
```

Operating metrics:

- 渠道线索转试用率
- 试用转激活率
- 激活转付款率
- 未支付挽回率
- 续费率
- 私域触达回复率
- 每个付费用户的 AI 和消息成本
- 每个渠道的真实 ROI

## 12. Engineering kickoff checklist

First implementation slice:

1. Define `contact`, `channel`, `campaign`, `trial`, `payment_order`, `message`, `playbook`, and `agent_action` tables.
2. Ship `/v1/china/events` and `/v1/china/contacts/identify`.
3. Build H5 SDK with source, campaign, QR, and landing-page tracking.
4. Implement China stage engine for content viewer, private-domain contact, trial, activation, payment, renewal, and silent states.
5. Integrate one messaging channel first: WeCom or Official Account.
6. Integrate one payment channel first: WeChat Pay or Alipay.
7. Build 试用领取、激活提醒、付款转化、未支付挽回、续费提醒 playbooks.
8. Build 运营总览、私域阶段、用户详情、支付看板.
9. Add message approval, suppression, and opt-out controls.
10. Add full agent action audit log.

Handoff prompt for a new engineering model:

```text
Read GCD_CHINA_CONVERT_SPEC.md first.

Build GCD China Convert v0.1: an AI 转化运营智能体 for low-ticket AI tools and lightweight SaaS in China.
Start with H5 tracking, contact identity, China stage engine, one private-domain messaging integration, one payment integration, trial activation playbooks, payment conversion playbooks, unpaid order recovery, renewal reminders, and operations dashboard.
Do not build content generation, public-domain acquisition, scraping, group-control, cold messaging, or SCRM replacement features.
```

