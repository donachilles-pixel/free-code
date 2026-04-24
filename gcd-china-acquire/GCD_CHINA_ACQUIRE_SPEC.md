# GCD China Acquire Specification

Last updated: 2026-04-24

## 1. Product summary

GCD China Acquire is the second-stage China acquisition product.

Positioning:

```text
面向中国 AI 工具和轻量 SaaS 的 AI 内容获客与私域集客智能体。
```

Customer-facing promise:

```text
持续生成高意向内容、活动和承接入口，把公域流量导入可转化的私域链路。
```

Primary funnel:

```text
选题/活动 -> 内容/落地页/二维码 -> 公域曝光 -> 私域承接 -> 试用/注册
```

Portfolio role:

```text
GCD Platform -> GCD China Acquire
```

Recommended launch timing:

```text
After GCD China Convert proves private-domain conversion and payment recovery.
```

This product owns China-side content acquisition and public-to-private traffic capture. It should not own private-domain conversion after contact capture; that belongs to GCD China Convert.

## 2. ICP

Best-fit customers:

- 有内容渠道但产能不足的 AI 工具团队
- 有社群和私域但缺少持续获客机制的团队
- 依赖小红书、抖音、公众号、视频号、微信群的轻量产品
- 希望把内容和转化链路打通的团队

Ideal customer profile:

- 每月至少发布 20 条内容或愿意建立内容节奏
- 有明确目标人群
- 有可展示的案例、模板、效果图或教程
- 已经使用或计划使用 GCD China Convert

Bad fit:

- 完全没有内容素材或案例
- 希望系统自动制造夸张营销承诺
- 不愿意人工审核内容
- 依赖平台灰色玩法
- 产品价值无法在内容中快速展示

Primary buyer:

- 创始人
- 增长负责人
- 内容负责人
- 运营负责人

Primary user:

- 内容运营
- 私域运营
- 增长
- 创始人

## 3. Jobs to be done

Primary jobs:

- 从产品功能和案例中提炼内容选题
- 生成适合不同平台的内容草稿
- 生成活动页、领取页和二维码承接路径
- 把内容来源和私域用户绑定
- 根据后续激活和付款数据优化选题
- 帮运营团队知道哪些内容带来真正付费

Customer language:

```text
我们能做内容，但不知道什么内容带来付费，也没有系统把内容流量接住。
```

## 4. MVP scope

v0.1 must include:

- 内容选题库
- 平台内容 brief
- 内容草稿生成
- 案例/模板素材库
- 活动落地页或领取页生成
- 渠道二维码和参数管理
- 内容到私域到付款归因
- 与 GCD China Convert 打通
- 人工审核发布流程

v0.1 should not include:

- 自动登录平台发布
- 自动批量私信
- 群控
- 刷量
- 自动评论区营销
- 无审核广告投放
- 违规采集竞品用户

## 5. Core features

### 5.1 选题 Agent

Responsibilities:

- 分析产品功能
- 分析历史内容表现
- 分析用户问题
- 分析付费用户来源
- 生成选题 backlog
- 按渠道和 ICP 排优先级

Topic types:

- 痛点型
- 教程型
- 案例型
- 对比型
- 模板型
- 活动型
- 价格/套餐解释型
- 行业场景型

### 5.2 内容 Agent

Responsibilities:

- 根据平台生成不同内容结构
- 生成标题、正文、脚本、封面文案
- 生成 CTA 和私域承接话术
- 生成评论区 FAQ
- 控制合规和夸张承诺
- 保持品牌语气

Channel variants:

- 小红书笔记
- 抖音短视频脚本
- 视频号脚本
- 公众号文章
- 微信群活动文案
- 知识星球/社群文案
- H5 活动页文案

### 5.3 活动/领取 Agent

Responsibilities:

- 创建领取页或活动页
- 生成渠道二维码
- 绑定来源参数
- 配置领取后的 Convert playbook
- 生成试用权益
- 生成支付转化路径

Example flow:

```text
小红书笔记 -> 关键词/二维码 -> H5 领取页 -> 加企微 -> 自动发模板 -> 试用 -> 付款
```

### 5.4 归因 Agent

Responsibilities:

- 记录内容来源
- 记录二维码和活动参数
- 追踪私域阶段
- 追踪付款和续费
- 识别真正带来付费的内容
- 反向推荐下一批选题

## 6. Screens

Required screens:

- 获客总览：内容、线索、试用、付款
- 选题库：优先级、目标人群、渠道、状态
- 内容工作台：草稿、版本、审批、发布记录
- 素材库：案例、模板、截图、证明、禁用话术
- 活动页：领取页、二维码、参数、转化路径
- 渠道归因：内容 -> 私域 -> 激活 -> 付款
- 内容复盘：表现、转化、建议
- 品牌和合规规则：语气、禁用词、审核流程

## 7. APIs and data

Core objects:

- `topic`
- `content_brief`
- `content_draft`
- `content_asset`
- `campaign_page`
- `qr_code`
- `source_binding`
- `approval`
- `publish_record`

Example topic:

```json
{
  "topic_id": "topic_123",
  "channel": "xiaohongshu",
  "icp": "solo_creator",
  "angle": "template",
  "title": "用 AI 10 分钟生成小红书选题库",
  "target_action": "claim_template",
  "linked_playbook": "trial_claimed_to_activation"
}
```

Example source binding:

```json
{
  "source_id": "src_123",
  "channel": "xiaohongshu",
  "content_id": "content_123",
  "qr_code_id": "qr_123",
  "campaign": "creator_template_week",
  "convert_playbook": "template_claim_activation"
}
```

Required endpoints:

```http
POST /v1/china/acquire/topics
POST /v1/china/acquire/content-drafts
POST /v1/china/acquire/campaign-pages
POST /v1/china/acquire/source-bindings
POST /v1/china/acquire/approvals
```

Required acquisition events:

- `topic_created`
- `content_brief_created`
- `content_draft_created`
- `content_approved`
- `content_published`
- `campaign_page_created`
- `qr_code_created`
- `source_binding_created`
- `private_domain_contact_created`
- `trial_claimed_from_content`
- `payment_order_paid_from_content`

## 8. Integrations

v0.1 integrations:

- GCD China Convert
- H5 page generator or export
- QR code generator
- webhook
- spreadsheet export

v0.2 integrations:

- 飞书文档 / 多维表格
- 公众号草稿箱
- 小程序活动页
- 内容数据导入
- 广告平台 report import

## 9. Compliance defaults

Default compliance requirements:

- 所有内容发布前默认人工审核
- 品牌承诺、价格承诺、效果承诺必须来自 approved claims
- 禁止自动批量私信、自动评论区营销、群控和刷量
- 禁止违规采集竞品用户或平台用户
- 渠道二维码和来源绑定必须可审计
- 内容素材库必须支持禁用话术和敏感词规则

Default rule:

```text
GCD China Acquire 可以生成内容和承接入口，但不自动绕过平台规则触达陌生用户。
```

## 10. Pricing

Recommended packaging:

- Add-on to GCD China Convert: ¥499/month
- Standalone: ¥999/month
- Pro: ¥2,999/month
- optional content strategy setup service

Usage metric:

- generated topics
- active campaign pages
- active QR codes
- content drafts
- attribution records

Outcome fee should be avoided at first because content attribution in China is noisy and often multi-touch.

## 11. Success metrics

North-star metric:

```text
由 GCD 内容和活动链路带来的有效试用和新增付费
```

Operating metrics:

- 内容到私域转化率
- 私域到试用转化率
- 试用到付款转化率
- 每个内容资产带来的付费金额
- 每个渠道的付费 ROI
- 内容生产周期
- 高质量内容复用率

## 12. Engineering kickoff checklist

First implementation slice:

1. Define `topic`, `content_brief`, `content_draft`, `content_asset`, `campaign_page`, `qr_code`, `source_binding`, `approval`, and `publish_record` tables.
2. Build content topic backlog.
3. Build product/ICP/case/material input screens.
4. Build content brief and draft generation.
5. Build manual approval workflow.
6. Build campaign page and QR source-binding generator.
7. Connect source bindings to GCD China Convert.
8. Build content-to-private-domain-to-payment attribution.
9. Build content review dashboard.
10. Add brand rules, forbidden claims, sensitive word controls, and audit log.

Handoff prompt for a new engineering model:

```text
Read GCD_CHINA_ACQUIRE_SPEC.md first.

Build GCD China Acquire v0.1: an AI 内容获客与私域集客智能体 for China-side low-ticket AI tools and lightweight SaaS.
Start with topic backlog, content brief/draft generation, material library, manual approval workflow, campaign/claim page generation, QR/source binding, and attribution into GCD China Convert.
Do not build auto-posting, cold messaging, group-control, scraping, paid ad automation, or public-platform gray-hat features.
```

