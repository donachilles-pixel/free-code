# Focus Code 技能大市场 - 设计文档

## 1. 项目概述

### 1.1 目标
构建一个独立的 Web 应用，自动从互联网收集 Claude Code / Focus Code 的 skill，汇总成一个可检索、可安装的技能大市场。

### 1.2 核心功能
- **自动发现**：从 GitHub、社区论坛、官方渠道等自动抓取和索引 skill
- **智能检索**：支持关键词搜索、分类浏览、标签筛选
- **一键安装**：通过 CLI 命令或 Web 界面直接安装 skill 到 Focus Code
- **社区评分**：用户评论、评分、使用统计

### 1.3 目标用户
- 普通用户：需要简单易用的界面发现和安装技能
- 开发者：需要搜索和安装技能来提升工作效率
- AI 工具开发者：需要发布和管理自己的技能

---

## 2. 架构设计

```
┌─────────────────────────────────────────────────────────────┐
│                     前端 (Next.js App Router)                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │ 首页推荐  │ │ 搜索页   │ │ 详情页   │ │ 管理后台 │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                     后端 API (Next.js API Routes)            │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │ Skill CRUD│ │ 搜索API  │ │ 安装API  │ │ 爬虫调度 │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                     数据层                                    │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                     │
│  │ PostgreSQL│ │ Redis    │ │ 文件存储 │                     │
│  │ (主数据库)│ │ (缓存)   │ │ (Skill内容)│                    │
│  └──────────┘ └──────────┘ └──────────┘                     │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                     爬虫系统 (定时任务)                        │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │GitHub爬虫 │ │论坛爬虫  │ │官方渠道  │ │用户提交  │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. 数据模型

### 3.1 Skill（技能）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | String (UUID) | 唯一标识 |
| name | String | 技能名称 |
| slug | String (unique) | URL 友好的标识 |
| description | String | 描述 |
| content | Text | 技能内容（Markdown） |
| source | Enum | 来源：github / forum / official / user |
| sourceUrl | String | 原始链接 |
| author | String | 作者 |
| authorAvatar | String | 作者头像 URL |
| tags | String[] | 标签数组 |
| categoryId | String | 分类 ID |
| installCount | Int | 安装次数 |
| rating | Float | 平均评分 |
| reviewCount | Int | 评论数量 |
| version | String | 版本号 |
| isPublished | Boolean | 是否已发布 |
| isFeatured | Boolean | 是否推荐 |
| createdAt | DateTime | 创建时间 |
| updatedAt | DateTime | 更新时间 |

### 3.2 Category（分类）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | String (UUID) | 唯一标识 |
| name | String | 分类名称 |
| slug | String (unique) | URL 友好的标识 |
| description | String | 描述 |
| icon | String | 图标名称 |
| sortOrder | Int | 排序顺序 |
| skillCount | Int | 技能数量 |

### 3.3 Review（评论）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | String (UUID) | 唯一标识 |
| skillId | String | 关联技能 ID |
| userName | String | 用户名称 |
| userAvatar | String | 用户头像 |
| rating | Int | 评分（1-5） |
| comment | Text | 评论内容 |
| createdAt | DateTime | 创建时间 |

### 3.4 CrawlJob（爬虫任务）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | String (UUID) | 唯一标识 |
| source | Enum | 来源类型 |
| status | Enum | 状态：pending / running / completed / failed |
| startedAt | DateTime | 开始时间 |
| completedAt | DateTime | 完成时间 |
| itemsFound | Int | 发现数量 |
| itemsAdded | Int | 新增数量 |
| error | Text | 错误信息 |

---

## 4. 核心功能模块

### 4.1 自动发现系统

#### GitHub 爬虫
- 搜索关键词：`claude-code skill`、`focus-code skill`、`claude skill`
- 监控仓库：star 数、更新时间的增长
- 解析 README：提取 skill 内容
- 频率：每日一次

#### 论坛监控
- Reddit：r/ClaudeAI、r/LocalLLaMA 等子版块
- Discord：Claude 官方 Discord 的 skill 分享频道
- V2EX：AI 相关节点
- 频率：每 6 小时一次

#### 官方渠道
- Anthropic 官方文档
- Anthropic 博客
- Focus Code 官方仓库
- 频率：每日一次

#### 用户提交
- 提供提交表单
- 管理员审核后发布
- 支持 Markdown 编辑器

### 4.2 搜索与检索

#### 全文搜索
- 基于 PostgreSQL 的 `tsvector` 全文搜索
- 支持标题、描述、标签、内容搜索
- 搜索结果按相关度排序

#### 智能推荐
- 热门技能：按安装量排序
- 最新发布：按创建时间排序
- 编辑推荐：标记为 `isFeatured`
- 相关推荐：基于标签相似度

#### 筛选器
- 分类筛选
- 来源筛选
- 评分筛选（4星以上、3星以上等）
- 时间筛选（本周、本月、今年）

### 4.3 安装系统

#### Web 端安装
1. 用户浏览技能市场，找到需要的 skill
2. 点击"安装"按钮
3. 系统生成命令：`focus-code install skill-name`
4. 用户复制命令到终端执行

#### CLI 端安装（未来扩展）
1. `focus-code marketplace` 打开市场
2. `focus-code install skill-name` 直接安装

### 4.4 社区功能

#### 评分系统
- 1-5 星评分
- 计算平均分
- 显示评分分布

#### 评论系统
- 用户评论和回复
- 支持 Markdown
- 管理员可删除不当评论

#### 收藏功能
- 用户收藏感兴趣的 skill
- 需要登录（未来版本）

#### 分享功能
- 生成分享链接
- 支持 Twitter、微信等社交平台分享

---

## 5. 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| 前端框架 | Next.js 14 | App Router |
| UI 组件 | Tailwind CSS + shadcn/ui | 现代化 UI |
| 数据库 | PostgreSQL | Neon 或 Supabase |
| ORM | Prisma | 类型安全的数据库访问 |
| 缓存 | Redis | Upstash |
| 搜索 | Meilisearch | 开源搜索引擎 |
| 部署 | Vercel | 边缘部署 |
| 定时任务 | Vercel Cron Jobs | 爬虫调度 |
| 文件存储 | Vercel Blob | 静态资源存储 |

---

## 6. 页面设计

### 6.1 页面清单

| 页面 | 路径 | 功能 |
|------|------|------|
| 首页 | `/` | 推荐技能、热门标签、最新发布 |
| 搜索页 | `/search` | 搜索结果、筛选器 |
| 分类页 | `/categories` | 分类浏览 |
| 分类详情 | `/category/[slug]` | 分类下的技能列表 |
| 技能详情 | `/skill/[slug]` | 技能内容、评分、评论、安装 |
| 提交技能 | `/submit` | 用户提交新技能 |
| 管理后台 | `/admin` | 审核、爬虫管理、数据统计 |

### 6.2 首页布局

```
┌─────────────────────────────────────────┐
│  Logo          搜索框        提交技能    │
├─────────────────────────────────────────┤
│                                         │
│           推荐技能轮播                    │
│                                         │
├─────────────────────────────────────────┤
│  分类导航                                │
│  [开发] [测试] [调试] [文档] [其他]      │
├─────────────────────────────────────────┤
│  热门技能              查看全部 →        │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐      │
│  │Skill│ │Skill│ │Skill│ │Skill│      │
│  └─────┘ └─────┘ └─────┘ └─────┘      │
├─────────────────────────────────────────┤
│  最新发布              查看全部 →        │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐      │
│  │Skill│ │Skill│ │Skill│ │Skill│      │
│  └─────┘ └─────┘ └─────┘ └─────┘      │
├─────────────────────────────────────────┤
│  热门标签                                │
│  #git #react #python #debug ...         │
├─────────────────────────────────────────┤
│  Footer                                 │
└─────────────────────────────────────────┘
```

### 6.3 技能详情页布局

```
┌─────────────────────────────────────────┐
│  Logo          搜索框        提交技能    │
├─────────────────────────────────────────┤
│                                         │
│  [返回]                                 │
│                                         │
│  技能名称                    [安装按钮]  │
│  ★★★★★ (4.5)  123 次安装  作者：xxx   │
│                                         │
│  标签：#git #commit #workflow           │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  技能内容（Markdown 渲染）               │
│                                         │
│  ```markdown                            │
│  # Git Commit Helper                    │
│                                         │
│  这个技能帮助你生成规范的 commit message │
│  ...                                    │
│  ```                                    │
│                                         │
├─────────────────────────────────────────┤
│  安装方式                               │
│  ```bash                                │
│  focus-code install git-commit-helper   │
│  ```                                    │
│  [复制命令]                             │
├─────────────────────────────────────────┤
│  评论 (23)                              │
│  ┌─────────────────────────────────┐   │
│  │ ★★★★★ 用户名称                  │   │
│  │ 评论内容...                      │   │
│  │ 2026-04-22                       │   │
│  └─────────────────────────────────┘   │
│  ...                                    │
├─────────────────────────────────────────┤
│  相关推荐                               │
│  ┌─────┐ ┌─────┐ ┌─────┐              │
│  │Skill│ │Skill│ │Skill│              │
│  └─────┘ └─────┘ └─────┘              │
├─────────────────────────────────────────┤
│  Footer                                 │
└─────────────────────────────────────────┘
```

---

## 7. API 设计

### 7.1 Skill API

```
GET    /api/skills              获取技能列表（支持分页、筛选、排序）
GET    /api/skills/[slug]       获取单个技能详情
POST   /api/skills              创建新技能（需要审核）
PUT    /api/skills/[slug]       更新技能
DELETE /api/skills/[slug]       删除技能
POST   /api/skills/[slug]/install  记录安装
```

### 7.2 Search API

```
GET /api/search?q=keyword&category=dev&sort=popular&page=1
```

### 7.3 Review API

```
GET    /api/skills/[slug]/reviews   获取评论列表
POST   /api/skills/[slug]/reviews   创建评论
```

### 7.4 Crawler API

```
POST /api/admin/crawler/run        手动触发爬虫
GET  /api/admin/crawler/jobs       获取爬虫任务列表
GET  /api/admin/crawler/stats      获取爬虫统计
```

---

## 8. 爬虫策略

### 8.1 GitHub 爬虫

```typescript
interface GitHubCrawlerConfig {
  searchQueries: string[];
  minStars: number;
  checkInterval: number; // 24 hours
  maxResultsPerQuery: number;
}

const config: GitHubCrawlerConfig = {
  searchQueries: [
    'claude-code skill',
    'focus-code skill',
    'claude skill marketplace',
  ],
  minStars: 5,
  checkInterval: 24 * 60 * 60 * 1000,
  maxResultsPerQuery: 100,
};
```

### 8.2 论坛爬虫

```typescript
interface ForumCrawlerConfig {
  sources: {
    reddit: string[];    // subreddit names
    discord: string[];   // channel IDs
    v2ex: string[];      // node names
  };
  checkInterval: number; // 6 hours
  keywords: string[];
}

const config: ForumCrawlerConfig = {
  sources: {
    reddit: ['ClaudeAI', 'LocalLLaMA'],
    discord: ['skill-sharing'],
    v2ex: ['ai', 'programming'],
  },
  checkInterval: 6 * 60 * 60 * 1000,
  keywords: ['skill', 'prompt', 'claude code'],
};
```

### 8.3 去重策略

- URL 去重：基于 sourceUrl 字段
- 内容去重：基于内容哈希（SHA256）
- 相似度检测：基于标题和描述的相似度计算

---

## 9. 安装流程

### 9.1 Web 端安装流程

```
用户点击"安装"按钮
    ↓
系统生成安装命令
    ↓
显示命令：`focus-code install <skill-slug>`
    ↓
用户复制命令
    ↓
在终端执行
    ↓
Focus Code 下载并安装 skill
    ↓
安装完成，更新安装计数
```

### 9.2 Skill 存储格式

```typescript
interface SkillPackage {
  name: string;
  version: string;
  description: string;
  author: string;
  content: string;      // Markdown 内容
  tags: string[];
  category: string;
  installPath: string;  // 安装到 ~/.claude/skills/
}
```

---

## 10. 安全与审核

### 10.1 内容审核
- 自动审核：关键词过滤、敏感内容检测
- 人工审核：管理员审核用户提交的内容
- 举报机制：用户可举报不当内容

### 10.2 爬虫安全
- 遵守 robots.txt
- 控制请求频率，避免被封禁
- 使用代理池（可选）

### 10.3 数据安全
- 数据库连接使用 SSL
- API 接口有速率限制
- 敏感操作需要认证（未来版本）

---

## 11. 部署方案

### 11.1 Vercel 部署

```bash
# 1. 创建项目
npx create-next-app@latest skill-marketplace

# 2. 配置环境变量
# DATABASE_URL
# REDIS_URL
# MEILISEARCH_HOST
# MEILISEARCH_API_KEY
# GITHUB_TOKEN

# 3. 部署
vercel --prod
```

### 11.2 数据库迁移

```bash
npx prisma migrate deploy
```

### 11.3 定时任务配置

```json
{
  "crons": [
    {
      "path": "/api/cron/github-crawler",
      "schedule": "0 2 * * *"
    },
    {
      "path": "/api/cron/forum-crawler",
      "schedule": "0 */6 * * *"
    },
    {
      "path": "/api/cron/official-crawler",
      "schedule": "0 3 * * *"
    }
  ]
}
```

---

## 12. 未来扩展

### 12.1 用户系统
- GitHub OAuth 登录
- 用户个人主页
- 技能收藏夹

### 12.2 CLI 集成
- `focus-code marketplace` 命令
- `focus-code install <skill>` 命令
- `focus-code search <keyword>` 命令

### 12.3 版本管理
- Skill 版本历史
- 版本对比
- 自动更新通知

### 12.4 统计分析
- 热门技能排行榜
- 安装趋势图表
- 用户行为分析

---

## 13. 项目结构

```
skill-marketplace/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # 首页
│   ├── search/
│   │   └── page.tsx              # 搜索页
│   ├── skill/
│   │   └── [slug]/
│   │       └── page.tsx          # 技能详情页
│   ├── categories/
│   │   └── page.tsx              # 分类页
│   ├── category/
│   │   └── [slug]/
│   │       └── page.tsx          # 分类详情页
│   ├── submit/
│   │   └── page.tsx              # 提交技能页
│   ├── admin/
│   │   └── page.tsx              # 管理后台
│   ├── api/
│   │   ├── skills/
│   │   │   └── route.ts          # Skill API
│   │   ├── search/
│   │   │   └── route.ts          # 搜索 API
│   │   └── cron/
│   │       ├── github-crawler/
│   │       │   └── route.ts      # GitHub 爬虫
│   │       ├── forum-crawler/
│   │       │   └── route.ts      # 论坛爬虫
│   │       └── official-crawler/
│   │           └── route.ts      # 官方渠道爬虫
│   └── layout.tsx                # 根布局
├── components/                   # 组件
│   ├── ui/                       # UI 组件
│   ├── skill-card.tsx            # 技能卡片
│   ├── skill-list.tsx            # 技能列表
│   ├── search-bar.tsx            # 搜索框
│   ├── category-nav.tsx          # 分类导航
│   └── install-button.tsx        # 安装按钮
├── lib/                          # 工具函数
│   ├── prisma.ts                 # Prisma 客户端
│   ├── search.ts                 # 搜索客户端
│   └── utils.ts                  # 工具函数
├── services/                     # 服务层
│   ├── skill.service.ts          # Skill 服务
│   ├── crawler.service.ts        # 爬虫服务
│   └── search.service.ts         # 搜索服务
├── crawlers/                     # 爬虫实现
│   ├── github.crawler.ts         # GitHub 爬虫
│   ├── forum.crawler.ts          # 论坛爬虫
│   └── official.crawler.ts       # 官方渠道爬虫
├── prisma/
│   └── schema.prisma             # 数据库模型
├── types/
│   └── index.ts                  # TypeScript 类型
├── public/                       # 静态资源
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

*文档版本：1.0*
*创建日期：2026-04-22*
*最后更新：2026-04-22*
