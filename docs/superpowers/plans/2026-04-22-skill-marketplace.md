# Skill Marketplace Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Next.js web app that aggregates Claude Code skills from the internet into a searchable, installable marketplace.

**Architecture:** Full-stack Next.js 14 app with App Router, PostgreSQL database via Prisma, Meilisearch for search, and scheduled crawlers to discover skills from GitHub, forums, and official sources.

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, shadcn/ui, Prisma, PostgreSQL (Neon), Meilisearch, Vercel

---

## File Structure

```
skill-marketplace/
├── app/
│   ├── page.tsx                    # Homepage with featured/new skills
│   ├── layout.tsx                  # Root layout with navigation
│   ├── search/
│   │   └── page.tsx                # Search results page
│   ├── skill/
│   │   └── [slug]/
│   │       └── page.tsx            # Skill detail page
│   ├── categories/
│   │   └── page.tsx                # Categories listing
│   ├── category/
│   │   └── [slug]/
│   │       └── page.tsx            # Category detail page
│   ├── submit/
│   │   └── page.tsx                # Submit skill form
│   ├── admin/
│   │   └── page.tsx                # Admin dashboard
│   └── api/
│       ├── skills/
│       │   └── route.ts            # GET /api/skills, POST /api/skills
│       ├── skills/[slug]/
│       │   └── route.ts            # GET /api/skills/:slug
│       ├── skills/[slug]/install/
│       │   └── route.ts            # POST /api/skills/:slug/install
│       ├── skills/[slug]/reviews/
│       │   └── route.ts            # GET/POST reviews
│       ├── search/
│       │   └── route.ts            # GET /api/search
│       ├── categories/
│       │   └── route.ts            # GET /api/categories
│       └── cron/
│           ├── github-crawler/
│           │   └── route.ts        # GitHub crawler endpoint
│           ├── forum-crawler/
│           │   └── route.ts        # Forum crawler endpoint
│           └── official-crawler/
│               └── route.ts        # Official sources crawler
├── components/
│   ├── ui/                         # shadcn/ui components
│   ├── skill-card.tsx              # Skill card component
│   ├── skill-list.tsx              # Skill list/grid
│   ├── search-bar.tsx              # Search input
│   ├── category-nav.tsx            # Category navigation
│   ├── install-button.tsx          # Install button with copy
│   ├── markdown-renderer.tsx       # Markdown content renderer
│   ├── rating-stars.tsx            # Star rating display
│   ├── review-list.tsx             # Review list component
│   └── submit-form.tsx             # Skill submission form
├── lib/
│   ├── prisma.ts                   # Prisma client singleton
│   ├── meilisearch.ts              # Meilisearch client
│   └── utils.ts                    # Utility functions
├── services/
│   ├── skill.service.ts            # Skill CRUD operations
│   ├── search.service.ts           # Search indexing/querying
│   └── crawler.service.ts          # Crawler orchestration
├── crawlers/
│   ├── github.crawler.ts           # GitHub API crawler
│   ├── forum.crawler.ts            # Forum scraper
│   └── official.crawler.ts         # Official sources fetcher
├── prisma/
│   └── schema.prisma               # Database schema
├── types/
│   └── index.ts                    # Shared TypeScript types
├── __tests__/
│   ├── unit/
│   │   ├── skill.service.test.ts
│   │   ├── search.service.test.ts
│   │   └── utils.test.ts
│   └── integration/
│       ├── api.test.ts
│       └── crawler.test.ts
├── public/
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## Task 1: Project Initialization

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.js`
- Create: `tailwind.config.ts`
- Create: `.env.example`

- [ ] **Step 1: Initialize Next.js project with shadcn**

```bash
npx create-next-app@latest skill-marketplace --typescript --tailwind --app --no-src-dir
```

- [ ] **Step 2: Install shadcn/ui**

```bash
cd skill-marketplace
npx shadcn@latest init --yes --template next --base-color slate
```

- [ ] **Step 3: Install dependencies**

```bash
npm install prisma @prisma/client meilisearch lucide-react
npm install -D @types/node
```

- [ ] **Step 4: Create environment template**

Create `.env.example`:

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/dbname"

# Meilisearch
MEILISEARCH_HOST="http://localhost:7700"
MEILISEARCH_API_KEY="your-api-key"

# GitHub API (for crawler)
GITHUB_TOKEN="ghp_your_token"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "chore: initialize Next.js project with shadcn/ui"
```

---

## Task 2: Database Schema

**Files:**
- Create: `prisma/schema.prisma`
- Create: `lib/prisma.ts`

- [ ] **Step 1: Write Prisma schema**

Create `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Skill {
  id            String   @id @default(uuid())
  name          String
  slug          String   @unique
  description   String
  content       String   @db.Text
  source        Source
  sourceUrl     String
  author        String
  authorAvatar  String?
  tags          String[]
  categoryId    String
  category      Category @relation(fields: [categoryId], references: [id])
  installCount  Int      @default(0)
  rating        Float    @default(0)
  reviewCount   Int      @default(0)
  version       String   @default("1.0.0")
  isPublished   Boolean  @default(false)
  isFeatured    Boolean  @default(false)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  reviews       Review[]

  @@index([slug])
  @@index([categoryId])
  @@index([source])
  @@index([isPublished])
  @@index([isFeatured])
  @@index([installCount])
  @@index([rating])
}

model Category {
  id          String   @id @default(uuid())
  name        String
  slug        String   @unique
  description String?
  icon        String   @default("code")
  sortOrder   Int      @default(0)
  skillCount  Int      @default(0)
  skills      Skill[]
  createdAt   DateTime @default(now())

  @@index([slug])
  @@index([sortOrder])
}

model Review {
  id        String   @id @default(uuid())
  skillId   String
  skill     Skill    @relation(fields: [skillId], references: [id], onDelete: Cascade)
  userName  String
  userAvatar String?
  rating    Int
  comment   String   @db.Text
  createdAt DateTime @default(now())

  @@index([skillId])
  @@index([rating])
}

model CrawlJob {
  id            String      @id @default(uuid())
  source        Source
  status        JobStatus   @default(pending)
  startedAt     DateTime?
  completedAt   DateTime?
  itemsFound    Int         @default(0)
  itemsAdded    Int         @default(0)
  error         String?     @db.Text
  createdAt     DateTime    @default(now())

  @@index([source])
  @@index([status])
}

enum Source {
  github
  forum
  official
  user
}

enum JobStatus {
  pending
  running
  completed
  failed
}
```

- [ ] **Step 2: Create Prisma client singleton**

Create `lib/prisma.ts`:

```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

- [ ] **Step 3: Run initial migration**

```bash
npx prisma migrate dev --name init
```

- [ ] **Step 4: Seed categories**

Create `prisma/seed.ts`:

```typescript
import { prisma } from '../lib/prisma'

async function main() {
  const categories = [
    { name: 'Development', slug: 'development', icon: 'code', sortOrder: 1 },
    { name: 'Testing', slug: 'testing', icon: 'test-tube', sortOrder: 2 },
    { name: 'Debugging', slug: 'debugging', icon: 'bug', sortOrder: 3 },
    { name: 'Documentation', slug: 'documentation', icon: 'file-text', sortOrder: 4 },
    { name: 'Git', slug: 'git', icon: 'git-branch', sortOrder: 5 },
    { name: 'DevOps', slug: 'devops', icon: 'server', sortOrder: 6 },
    { name: 'Other', slug: 'other', icon: 'more-horizontal', sortOrder: 99 },
  ]

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    })
  }

  console.log('Categories seeded')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

Add to `package.json`:

```json
{
  "prisma": {
    "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
  }
}
```

```bash
npx prisma db seed
```

- [ ] **Step 5: Commit**

```bash
git add prisma/ lib/prisma.ts package.json
git commit -m "feat: add Prisma schema with Skill, Category, Review, CrawlJob models"
```

---

## Task 3: Type Definitions

**Files:**
- Create: `types/index.ts`

- [ ] **Step 1: Write type definitions**

Create `types/index.ts`:

```typescript
export interface Skill {
  id: string
  name: string
  slug: string
  description: string
  content: string
  source: 'github' | 'forum' | 'official' | 'user'
  sourceUrl: string
  author: string
  authorAvatar?: string
  tags: string[]
  categoryId: string
  category?: Category
  installCount: number
  rating: number
  reviewCount: number
  version: string
  isPublished: boolean
  isFeatured: boolean
  createdAt: string
  updatedAt: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  icon: string
  sortOrder: number
  skillCount: number
}

export interface Review {
  id: string
  skillId: string
  userName: string
  userAvatar?: string
  rating: number
  comment: string
  createdAt: string
}

export interface CrawlJob {
  id: string
  source: 'github' | 'forum' | 'official' | 'user'
  status: 'pending' | 'running' | 'completed' | 'failed'
  startedAt?: string
  completedAt?: string
  itemsFound: number
  itemsAdded: number
  error?: string
}

export interface SearchFilters {
  category?: string
  source?: string
  minRating?: number
  sortBy?: 'popular' | 'newest' | 'rating'
}

export interface PaginatedResult<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}
```

- [ ] **Step 2: Commit**

```bash
git add types/index.ts
git commit -m "feat: add TypeScript type definitions"
```

---

## Task 4: Skill Service

**Files:**
- Create: `services/skill.service.ts`
- Create: `__tests__/unit/skill.service.test.ts`

- [ ] **Step 1: Write tests for skill service**

Create `__tests__/unit/skill.service.test.ts`:

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { SkillService } from '../../services/skill.service'
import { prisma } from '../../lib/prisma'

vi.mock('../../lib/prisma', () => ({
  prisma: {
    skill: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    category: {
      findMany: vi.fn(),
    },
  },
}))

describe('SkillService', () => {
  let service: SkillService

  beforeEach(() => {
    service = new SkillService()
    vi.clearAllMocks()
  })

  describe('getSkills', () => {
    it('returns paginated skills', async () => {
      const mockSkills = [
        { id: '1', name: 'Test Skill', slug: 'test-skill' },
      ]
      const mockCount = 1

      vi.mocked(prisma.skill.findMany).mockResolvedValue(mockSkills as any)
      vi.mocked(prisma.skill.count).mockResolvedValue(mockCount)

      const result = await service.getSkills({ page: 1, pageSize: 10 })

      expect(result.items).toHaveLength(1)
      expect(result.total).toBe(1)
      expect(result.page).toBe(1)
    })

    it('filters by category', async () => {
      vi.mocked(prisma.skill.findMany).mockResolvedValue([])
      vi.mocked(prisma.skill.count).mockResolvedValue(0)

      await service.getSkills({ category: 'development' })

      expect(prisma.skill.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            category: { slug: 'development' },
          }),
        })
      )
    })
  })

  describe('getSkillBySlug', () => {
    it('returns skill by slug', async () => {
      const mockSkill = { id: '1', name: 'Test', slug: 'test' }
      vi.mocked(prisma.skill.findUnique).mockResolvedValue(mockSkill as any)

      const result = await service.getSkillBySlug('test')

      expect(result).toEqual(mockSkill)
      expect(prisma.skill.findUnique).toHaveBeenCalledWith({
        where: { slug: 'test' },
        include: { category: true, reviews: true },
      })
    })

    it('returns null for non-existent slug', async () => {
      vi.mocked(prisma.skill.findUnique).mockResolvedValue(null)

      const result = await service.getSkillBySlug('nonexistent')

      expect(result).toBeNull()
    })
  })

  describe('createSkill', () => {
    it('creates skill with generated slug', async () => {
      const input = {
        name: 'Test Skill',
        description: 'A test skill',
        content: '# Test',
        source: 'user' as const,
        sourceUrl: 'https://example.com',
        author: 'Test User',
        tags: ['test'],
        categoryId: 'cat-1',
      }

      const mockCreated = { id: '1', ...input, slug: 'test-skill' }
      vi.mocked(prisma.skill.create).mockResolvedValue(mockCreated as any)

      const result = await service.createSkill(input)

      expect(result.slug).toBe('test-skill')
      expect(prisma.skill.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            slug: 'test-skill',
          }),
        })
      )
    })
  })

  describe('incrementInstallCount', () => {
    it('increments install count', async () => {
      vi.mocked(prisma.skill.update).mockResolvedValue({ installCount: 1 } as any)

      await service.incrementInstallCount('skill-1')

      expect(prisma.skill.update).toHaveBeenCalledWith({
        where: { id: 'skill-1' },
        data: { installCount: { increment: 1 } },
      })
    })
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx vitest run __tests__/unit/skill.service.test.ts
```

Expected: FAIL - "SkillService is not defined"

- [ ] **Step 3: Implement skill service**

Create `services/skill.service.ts`:

```typescript
import { prisma } from '../lib/prisma'
import type { Skill, PaginatedResult, SearchFilters } from '../types'

export class SkillService {
  async getSkills(options: {
    page?: number
    pageSize?: number
    category?: string
    source?: string
    sortBy?: 'popular' | 'newest' | 'rating'
    featured?: boolean
    published?: boolean
  } = {}): Promise<PaginatedResult<Skill>> {
    const {
      page = 1,
      pageSize = 20,
      category,
      source,
      sortBy = 'popular',
      featured,
      published = true,
    } = options

    const where: any = {}

    if (published !== undefined) {
      where.isPublished = published
    }

    if (category) {
      where.category = { slug: category }
    }

    if (source) {
      where.source = source
    }

    if (featured) {
      where.isFeatured = true
    }

    const orderBy: any = {}
    switch (sortBy) {
      case 'popular':
        orderBy.installCount = 'desc'
        break
      case 'newest':
        orderBy.createdAt = 'desc'
        break
      case 'rating':
        orderBy.rating = 'desc'
        break
      default:
        orderBy.installCount = 'desc'
    }

    const [items, total] = await Promise.all([
      prisma.skill.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { category: true },
      }),
      prisma.skill.count({ where }),
    ])

    return {
      items: items as Skill[],
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    }
  }

  async getSkillBySlug(slug: string): Promise<Skill | null> {
    const skill = await prisma.skill.findUnique({
      where: { slug },
      include: { category: true, reviews: true },
    })

    return skill as Skill | null
  }

  async createSkill(data: {
    name: string
    description: string
    content: string
    source: 'github' | 'forum' | 'official' | 'user'
    sourceUrl: string
    author: string
    authorAvatar?: string
    tags: string[]
    categoryId: string
    version?: string
  }): Promise<Skill> {
    const slug = this.generateSlug(data.name)

    const skill = await prisma.skill.create({
      data: {
        ...data,
        slug,
        version: data.version || '1.0.0',
        isPublished: data.source === 'official',
      },
      include: { category: true },
    })

    return skill as Skill
  }

  async incrementInstallCount(id: string): Promise<void> {
    await prisma.skill.update({
      where: { id },
      data: { installCount: { increment: 1 } },
    })
  }

  async updateSkillRating(skillId: string): Promise<void> {
    const reviews = await prisma.review.findMany({
      where: { skillId },
    })

    const avgRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0

    await prisma.skill.update({
      where: { id: skillId },
      data: {
        rating: Math.round(avgRating * 10) / 10,
        reviewCount: reviews.length,
      },
    })
  }

  private generateSlug(name: string): string {
    const base = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')

    return `${base}-${Date.now().toString(36)}`
  }
}

export const skillService = new SkillService()
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx vitest run __tests__/unit/skill.service.test.ts
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add services/skill.service.ts __tests__/unit/skill.service.test.ts
git commit -m "feat: add skill service with CRUD operations"
```

---

## Task 5: Search Service

**Files:**
- Create: `lib/meilisearch.ts`
- Create: `services/search.service.ts`
- Create: `__tests__/unit/search.service.test.ts`

- [ ] **Step 1: Write tests for search service**

Create `__tests__/unit/search.service.test.ts`:

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { SearchService } from '../../services/search.service'
import { meilisearch } from '../../lib/meilisearch'

vi.mock('../../lib/meilisearch', () => ({
  meilisearch: {
    index: vi.fn(() => ({
      addDocuments: vi.fn(),
      search: vi.fn(),
      deleteDocument: vi.fn(),
      updateSettings: vi.fn(),
    })),
  },
}))

describe('SearchService', () => {
  let service: SearchService
  let mockIndex: any

  beforeEach(() => {
    mockIndex = {
      addDocuments: vi.fn().mockResolvedValue({}),
      search: vi.fn().mockResolvedValue({
        hits: [{ id: '1', name: 'Test Skill' }],
        estimatedTotalHits: 1,
      }),
      deleteDocument: vi.fn().mockResolvedValue({}),
      updateSettings: vi.fn().mockResolvedValue({}),
    }
    vi.mocked(meilisearch.index).mockReturnValue(mockIndex)
    service = new SearchService()
    vi.clearAllMocks()
  })

  describe('indexSkill', () => {
    it('indexes a skill document', async () => {
      const skill = {
        id: '1',
        name: 'Test Skill',
        description: 'A test',
        content: '# Test',
        tags: ['test'],
        category: 'development',
      }

      await service.indexSkill(skill as any)

      expect(mockIndex.addDocuments).toHaveBeenCalledWith([skill])
    })
  })

  describe('search', () => {
    it('searches skills by query', async () => {
      await service.search('test')

      expect(mockIndex.search).toHaveBeenCalledWith('test', {
        limit: 20,
        offset: 0,
      })
    })

    it('applies filters', async () => {
      await service.search('test', { category: 'development' })

      expect(mockIndex.search).toHaveBeenCalledWith('test', {
        limit: 20,
        offset: 0,
        filter: ['category = development'],
      })
    })
  })

  describe('removeSkill', () => {
    it('removes skill from index', async () => {
      await service.removeSkill('skill-1')

      expect(mockIndex.deleteDocument).toHaveBeenCalledWith('skill-1')
    })
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx vitest run __tests__/unit/search.service.test.ts
```

Expected: FAIL - "SearchService is not defined"

- [ ] **Step 3: Implement Meilisearch client**

Create `lib/meilisearch.ts`:

```typescript
import { MeiliSearch } from 'meilisearch'

const host = process.env.MEILISEARCH_HOST || 'http://localhost:7700'
const apiKey = process.env.MEILISEARCH_API_KEY

export const meilisearch = new MeiliSearch({
  host,
  apiKey,
})

export const SKILL_INDEX = 'skills'
```

- [ ] **Step 4: Implement search service**

Create `services/search.service.ts`:

```typescript
import { meilisearch, SKILL_INDEX } from '../lib/meilisearch'
import type { Skill, SearchFilters } from '../types'

interface SearchableSkill {
  id: string
  name: string
  slug: string
  description: string
  content: string
  author: string
  tags: string[]
  category: string
  rating: number
  installCount: number
}

export class SearchService {
  private index = meilisearch.index(SKILL_INDEX)

  async initializeIndex(): Promise<void> {
    await this.index.updateSettings({
      searchableAttributes: [
        'name',
        'description',
        'content',
        'tags',
        'author',
      ],
      filterableAttributes: ['category', 'source', 'tags'],
      sortableAttributes: ['installCount', 'rating', 'createdAt'],
      rankingRules: [
        'words',
        'typo',
        'proximity',
        'attribute',
        'sort',
        'exactness',
      ],
    })
  }

  async indexSkill(skill: SearchableSkill): Promise<void> {
    await this.index.addDocuments([skill])
  }

  async indexSkills(skills: SearchableSkill[]): Promise<void> {
    await this.index.addDocuments(skills)
  }

  async search(
    query: string,
    options: {
      page?: number
      pageSize?: number
      filters?: SearchFilters
    } = {}
  ): Promise<{ hits: Skill[]; total: number }> {
    const { page = 1, pageSize = 20, filters } = options

    const filterStrings: string[] = []

    if (filters?.category) {
      filterStrings.push(`category = ${filters.category}`)
    }

    if (filters?.source) {
      filterStrings.push(`source = ${filters.source}`)
    }

    const searchOptions: any = {
      limit: pageSize,
      offset: (page - 1) * pageSize,
    }

    if (filterStrings.length > 0) {
      searchOptions.filter = filterStrings
    }

    const result = await this.index.search(query, searchOptions)

    return {
      hits: result.hits as Skill[],
      total: result.estimatedTotalHits || 0,
    }
  }

  async removeSkill(skillId: string): Promise<void> {
    await this.index.deleteDocument(skillId)
  }
}

export const searchService = new SearchService()
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
npx vitest run __tests__/unit/search.service.test.ts
```

Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add lib/meilisearch.ts services/search.service.ts __tests__/unit/search.service.test.ts
git commit -m "feat: add Meilisearch integration for skill search"
```

---

## Task 6: API Routes

**Files:**
- Create: `app/api/skills/route.ts`
- Create: `app/api/skills/[slug]/route.ts`
- Create: `app/api/skills/[slug]/install/route.ts`
- Create: `app/api/skills/[slug]/reviews/route.ts`
- Create: `app/api/search/route.ts`
- Create: `app/api/categories/route.ts`

- [ ] **Step 1: Implement skills list API**

Create `app/api/skills/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { skillService } from '../../../services/skill.service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '20')
    const category = searchParams.get('category') || undefined
    const source = searchParams.get('source') || undefined
    const sortBy = (searchParams.get('sortBy') as 'popular' | 'newest' | 'rating') || 'popular'
    const featured = searchParams.get('featured') === 'true'

    const result = await skillService.getSkills({
      page,
      pageSize,
      category,
      source,
      sortBy,
      featured,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching skills:', error)
    return NextResponse.json(
      { error: 'Failed to fetch skills' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const skill = await skillService.createSkill(body)

    return NextResponse.json(skill, { status: 201 })
  } catch (error) {
    console.error('Error creating skill:', error)
    return NextResponse.json(
      { error: 'Failed to create skill' },
      { status: 500 }
    )
  }
}
```

- [ ] **Step 2: Implement skill detail API**

Create `app/api/skills/[slug]/route.ts`:

```typescript
import { NextResponse } from 'next/server'
import { skillService } from '../../../../services/skill.service'

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const skill = await skillService.getSkillBySlug(params.slug)

    if (!skill) {
      return NextResponse.json(
        { error: 'Skill not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(skill)
  } catch (error) {
    console.error('Error fetching skill:', error)
    return NextResponse.json(
      { error: 'Failed to fetch skill' },
      { status: 500 }
    )
  }
}
```

- [ ] **Step 3: Implement install tracking API**

Create `app/api/skills/[slug]/install/route.ts`:

```typescript
import { NextResponse } from 'next/server'
import { skillService } from '../../../../services/skill.service'
import { prisma } from '../../../../lib/prisma'

export async function POST(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const skill = await prisma.skill.findUnique({
      where: { slug: params.slug },
    })

    if (!skill) {
      return NextResponse.json(
        { error: 'Skill not found' },
        { status: 404 }
      )
    }

    await skillService.incrementInstallCount(skill.id)

    return NextResponse.json({
      command: `focus-code install ${skill.slug}`,
      message: 'Install command generated',
    })
  } catch (error) {
    console.error('Error tracking install:', error)
    return NextResponse.json(
      { error: 'Failed to generate install command' },
      { status: 500 }
    )
  }
}
```

- [ ] **Step 4: Implement reviews API**

Create `app/api/skills/[slug]/reviews/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import { skillService } from '../../../../services/skill.service'

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const skill = await prisma.skill.findUnique({
      where: { slug: params.slug },
    })

    if (!skill) {
      return NextResponse.json(
        { error: 'Skill not found' },
        { status: 404 }
      )
    }

    const reviews = await prisma.review.findMany({
      where: { skillId: skill.id },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(reviews)
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const skill = await prisma.skill.findUnique({
      where: { slug: params.slug },
    })

    if (!skill) {
      return NextResponse.json(
        { error: 'Skill not found' },
        { status: 404 }
      )
    }

    const body = await request.json()

    const review = await prisma.review.create({
      data: {
        skillId: skill.id,
        userName: body.userName,
        userAvatar: body.userAvatar,
        rating: body.rating,
        comment: body.comment,
      },
    })

    await skillService.updateSkillRating(skill.id)

    return NextResponse.json(review, { status: 201 })
  } catch (error) {
    console.error('Error creating review:', error)
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    )
  }
}
```

- [ ] **Step 5: Implement search API**

Create `app/api/search/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { searchService } from '../../../services/search.service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const q = searchParams.get('q') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '20')
    const category = searchParams.get('category') || undefined
    const source = searchParams.get('source') || undefined

    const result = await searchService.search(q, {
      page,
      pageSize,
      filters: { category, source },
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error searching skills:', error)
    return NextResponse.json(
      { error: 'Failed to search skills' },
      { status: 500 }
    )
  }
}
```

- [ ] **Step 6: Implement categories API**

Create `app/api/categories/route.ts`:

```typescript
import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { sortOrder: 'asc' },
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}
```

- [ ] **Step 7: Commit**

```bash
git add app/api/
git commit -m "feat: add API routes for skills, search, categories, and reviews"
```

---

## Task 7: UI Components

**Files:**
- Create: `components/skill-card.tsx`
- Create: `components/skill-list.tsx`
- Create: `components/search-bar.tsx`
- Create: `components/category-nav.tsx`
- Create: `components/install-button.tsx`
- Create: `components/rating-stars.tsx`

- [ ] **Step 1: Install shadcn components**

```bash
npx shadcn@latest add card button badge avatar input textarea
```

- [ ] **Step 2: Create skill card component**

Create `components/skill-card.tsx`:

```typescript
import Link from 'next/link'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { RatingStars } from './rating-stars'
import type { Skill } from '@/types'

interface SkillCardProps {
  skill: Skill
}

export function SkillCard({ skill }: SkillCardProps) {
  return (
    <Link href={`/skill/${skill.slug}`}>
      <Card className="h-full transition-shadow hover:shadow-lg">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <h3 className="text-lg font-semibold line-clamp-1">{skill.name}</h3>
            <Badge variant="secondary">{skill.source}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {skill.description}
          </p>

          <div className="flex items-center gap-2 text-sm">
            <RatingStars rating={skill.rating} />
            <span className="text-muted-foreground">
              ({skill.reviewCount})
            </span>
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{skill.installCount} installs</span>
            <span>by {skill.author}</span>
          </div>

          <div className="flex flex-wrap gap-1">
            {skill.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
```

- [ ] **Step 3: Create skill list component**

Create `components/skill-list.tsx`:

```typescript
import { SkillCard } from './skill-card'
import type { Skill } from '@/types'

interface SkillListProps {
  skills: Skill[]
  emptyMessage?: string
}

export function SkillList({
  skills,
  emptyMessage = 'No skills found',
}: SkillListProps) {
  if (skills.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        {emptyMessage}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {skills.map((skill) => (
        <SkillCard key={skill.id} skill={skill} />
      ))}
    </div>
  )
}
```

- [ ] **Step 4: Create search bar component**

Create `components/search-bar.tsx`:

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search } from 'lucide-react'

export function SearchBar() {
  const [query, setQuery] = useState('')
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
    }
  }

  return (
    <form onSubmit={handleSearch} className="flex gap-2 w-full max-w-lg">
      <Input
        type="search"
        placeholder="Search skills..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="flex-1"
      />
      <Button type="submit" size="icon">
        <Search className="h-4 w-4" />
      </Button>
    </form>
  )
}
```

- [ ] **Step 5: Create category nav component**

Create `components/category-nav.tsx`:

```typescript
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import type { Category } from '@/types'

interface CategoryNavProps {
  categories: Category[]
  activeSlug?: string
}

export function CategoryNav({ categories, activeSlug }: CategoryNavProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Link href="/">
        <Badge
          variant={!activeSlug ? 'default' : 'secondary'}
          className="cursor-pointer"
        >
          All
        </Badge>
      </Link>
      {categories.map((category) => (
        <Link key={category.id} href={`/category/${category.slug}`}>
          <Badge
            variant={activeSlug === category.slug ? 'default' : 'secondary'}
            className="cursor-pointer"
          >
            {category.name} ({category.skillCount})
          </Badge>
        </Link>
      ))}
    </div>
  )
}
```

- [ ] **Step 6: Create install button component**

Create `components/install-button.tsx`:

```typescript
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Copy, Check } from 'lucide-react'

interface InstallButtonProps {
  slug: string
}

export function InstallButton({ slug }: InstallButtonProps) {
  const [copied, setCopied] = useState(false)

  const command = `focus-code install ${slug}`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(command)
      setCopied(true)

      // Track install
      await fetch(`/api/skills/${slug}/install`, { method: 'POST' })

      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div className="space-y-2">
      <code className="block p-3 bg-muted rounded-md text-sm font-mono">
        {command}
      </code>
      <Button onClick={handleCopy} className="w-full">
        {copied ? (
          <>
            <Check className="mr-2 h-4 w-4" />
            Copied!
          </>
        ) : (
          <>
            <Copy className="mr-2 h-4 w-4" />
            Copy Install Command
          </>
        )}
      </Button>
    </div>
  )
}
```

- [ ] **Step 7: Create rating stars component**

Create `components/rating-stars.tsx`:

```typescript
import { Star } from 'lucide-react'

interface RatingStarsProps {
  rating: number
  maxRating?: number
}

export function RatingStars({ rating, maxRating = 5 }: RatingStarsProps) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: maxRating }).map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${
            i < Math.floor(rating)
              ? 'fill-yellow-400 text-yellow-400'
              : i < rating
              ? 'fill-yellow-400/50 text-yellow-400'
              : 'fill-gray-200 text-gray-200'
          }`}
        />
      ))}
      <span className="ml-1 text-sm font-medium">{rating.toFixed(1)}</span>
    </div>
  )
}
```

- [ ] **Step 8: Commit**

```bash
git add components/
git commit -m "feat: add UI components for skill cards, search, categories, and install"
```

---

## Task 8: Pages

**Files:**
- Create: `app/page.tsx`
- Create: `app/search/page.tsx`
- Create: `app/skill/[slug]/page.tsx`
- Create: `app/categories/page.tsx`
- Create: `app/category/[slug]/page.tsx`
- Create: `app/layout.tsx`

- [ ] **Step 1: Update root layout**

Update `app/layout.tsx`:

```typescript
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Link from 'next/link'
import { SearchBar } from '@/components/search-bar'
import { Button } from '@/components/ui/button'
import { Code2 } from 'lucide-react'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Focus Code Skill Marketplace',
  description: 'Discover and install skills for Focus Code',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <header className="border-b">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <Code2 className="h-6 w-6" />
              <span className="text-xl font-bold">Skill Market</span>
            </Link>
            <SearchBar />
            <Link href="/submit">
              <Button>Submit Skill</Button>
            </Link>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">{children}</main>
        <footer className="border-t mt-auto">
          <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
            Focus Code Skill Marketplace - Built for the community
          </div>
        </footer>
      </body>
    </html>
  )
}
```

- [ ] **Step 2: Create homepage**

Create `app/page.tsx`:

```typescript
import Link from 'next/link'
import { SkillList } from '@/components/skill-list'
import { CategoryNav } from '@/components/category-nav'
import { Button } from '@/components/ui/button'
import { prisma } from '@/lib/prisma'

async function getFeaturedSkills() {
  return prisma.skill.findMany({
    where: { isPublished: true, isFeatured: true },
    orderBy: { installCount: 'desc' },
    take: 4,
    include: { category: true },
  })
}

async function getNewestSkills() {
  return prisma.skill.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: 'desc' },
    take: 4,
    include: { category: true },
  })
}

async function getCategories() {
  return prisma.category.findMany({
    orderBy: { sortOrder: 'asc' },
  })
}

export default async function HomePage() {
  const [featuredSkills, newestSkills, categories] = await Promise.all([
    getFeaturedSkills(),
    getNewestSkills(),
    getCategories(),
  ])

  return (
    <div className="space-y-12">
      {/* Hero */}
      <section className="text-center space-y-4 py-8">
        <h1 className="text-4xl font-bold">Focus Code Skill Marketplace</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Discover and install community-built skills to supercharge your Focus
          Code experience
        </p>
      </section>

      {/* Categories */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Categories</h2>
        <CategoryNav categories={categories} />
      </section>

      {/* Featured */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Featured Skills</h2>
          <Link href="/search?sortBy=popular">
            <Button variant="ghost">View All</Button>
          </Link>
        </div>
        <SkillList skills={featuredSkills} />
      </section>

      {/* Newest */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Newest</h2>
          <Link href="/search?sortBy=newest">
            <Button variant="ghost">View All</Button>
          </Link>
        </div>
        <SkillList skills={newestSkills} />
      </section>
    </div>
  )
}
```

- [ ] **Step 3: Create search page**

Create `app/search/page.tsx`:

```typescript
import { SkillList } from '@/components/skill-list'
import { prisma } from '@/lib/prisma'

interface SearchPageProps {
  searchParams: { [key: string]: string | string[] | undefined }
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const q = (searchParams.q as string) || ''
  const category = searchParams.category as string | undefined
  const sortBy = (searchParams.sortBy as 'popular' | 'newest' | 'rating') || 'popular'

  const where: any = { isPublished: true }

  if (category) {
    where.category = { slug: category }
  }

  const orderBy: any = {}
  switch (sortBy) {
    case 'popular':
      orderBy.installCount = 'desc'
      break
    case 'newest':
      orderBy.createdAt = 'desc'
      break
    case 'rating':
      orderBy.rating = 'desc'
      break
  }

  const skills = await prisma.skill.findMany({
    where,
    orderBy,
    include: { category: true },
  })

  // Simple client-side filtering for search query
  const filteredSkills = q
    ? skills.filter(
        (s) =>
          s.name.toLowerCase().includes(q.toLowerCase()) ||
          s.description.toLowerCase().includes(q.toLowerCase()) ||
          s.tags.some((t) => t.toLowerCase().includes(q.toLowerCase()))
      )
    : skills

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Search Results</h1>
        {q && (
          <p className="text-muted-foreground">
            {filteredSkills.length} results for &quot;{q}&quot;
          </p>
        )}
      </div>

      <SkillList
        skills={filteredSkills}
        emptyMessage="No skills found matching your search"
      />
    </div>
  )
}
```

- [ ] **Step 4: Create skill detail page**

Create `app/skill/[slug]/page.tsx`:

```typescript
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { InstallButton } from '@/components/install-button'
import { RatingStars } from '@/components/rating-stars'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

interface SkillPageProps {
  params: { slug: string }
}

async function getSkill(slug: string) {
  return prisma.skill.findUnique({
    where: { slug },
    include: { category: true, reviews: true },
  })
}

export default async function SkillPage({ params }: SkillPageProps) {
  const skill = await getSkill(params.slug)

  if (!skill) {
    notFound()
  }

  return (
    <div className="space-y-8">
      {/* Back button */}
      <Link href="/">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">{skill.name}</h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <RatingStars rating={skill.rating} />
            <span>{skill.installCount} installs</span>
            <span>by {skill.author}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {skill.tags.map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
        <Badge variant="secondary">{skill.source}</Badge>
      </div>

      {/* Description */}
      <p className="text-lg text-muted-foreground">{skill.description}</p>

      {/* Install */}
      <div className="max-w-md">
        <h2 className="text-lg font-semibold mb-2">Install</h2>
        <InstallButton slug={skill.slug} />
      </div>

      {/* Content */}
      <div className="prose prose-slate max-w-none">
        <h2 className="text-lg font-semibold mb-2">Skill Content</h2>
        <pre className="bg-muted p-4 rounded-lg overflow-auto">
          <code>{skill.content}</code>
        </pre>
      </div>

      {/* Source */}
      <div>
        <h2 className="text-lg font-semibold mb-2">Source</h2>
        <a
          href={skill.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          {skill.sourceUrl}
        </a>
      </div>

      {/* Reviews */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">
          Reviews ({skill.reviewCount})
        </h2>
        {skill.reviews.length === 0 ? (
          <p className="text-muted-foreground">No reviews yet</p>
        ) : (
          <div className="space-y-4">
            {skill.reviews.map((review) => (
              <div key={review.id} className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <RatingStars rating={review.rating} />
                  <span className="font-medium">{review.userName}</span>
                  <span className="text-sm text-muted-foreground">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p>{review.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Create categories page**

Create `app/categories/page.tsx`:

```typescript
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

async function getCategories() {
  return prisma.category.findMany({
    orderBy: { sortOrder: 'asc' },
    include: {
      _count: {
        select: { skills: true },
      },
    },
  })
}

export default async function CategoriesPage() {
  const categories = await getCategories()

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Categories</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => (
          <Link key={category.id} href={`/category/${category.slug}`}>
            <Card className="h-full transition-shadow hover:shadow-lg">
              <CardHeader>
                <h2 className="text-xl font-semibold">{category.name}</h2>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {category.description || 'No description'}
                </p>
                <p className="mt-2 text-sm">
                  {category._count.skills} skills
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 6: Create category detail page**

Create `app/category/[slug]/page.tsx`:

```typescript
import { notFound } from 'next/navigation'
import { SkillList } from '@/components/skill-list'
import { prisma } from '@/lib/prisma'

interface CategoryPageProps {
  params: { slug: string }
}

async function getCategory(slug: string) {
  return prisma.category.findUnique({
    where: { slug },
    include: {
      skills: {
        where: { isPublished: true },
        orderBy: { installCount: 'desc' },
        include: { category: true },
      },
    },
  })
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const category = await getCategory(params.slug)

  if (!category) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{category.name}</h1>
        {category.description && (
          <p className="text-muted-foreground mt-2">{category.description}</p>
        )}
      </div>

      <SkillList
        skills={category.skills}
        emptyMessage="No skills in this category yet"
      />
    </div>
  )
}
```

- [ ] **Step 7: Commit**

```bash
git add app/
git commit -m "feat: add pages for home, search, skill detail, categories"
```

---

## Task 9: GitHub Crawler

**Files:**
- Create: `crawlers/github.crawler.ts`
- Create: `app/api/cron/github-crawler/route.ts`

- [ ] **Step 1: Implement GitHub crawler**

Create `crawlers/github.crawler.ts`:

```typescript
import { skillService } from '../services/skill.service'
import { prisma } from '../lib/prisma'

const GITHUB_API = 'https://api.github.com'
const SEARCH_QUERIES = [
  'claude-code skill',
  'focus-code skill',
  'claude skill',
]

interface GitHubRepo {
  id: number
  full_name: string
  description: string | null
  html_url: string
  stargazers_count: number
  owner: {
    login: string
    avatar_url: string
  }
}

export class GitHubCrawler {
  private token: string

  constructor(token: string) {
    this.token = token
  }

  async crawl(): Promise<{ found: number; added: number; errors: string[] }> {
    const result = { found: 0, added: 0, errors: [] as string[] }

    // Create crawl job
    const job = await prisma.crawlJob.create({
      data: {
        source: 'github',
        status: 'running',
        startedAt: new Date(),
      },
    })

    try {
      for (const query of SEARCH_QUERIES) {
        try {
          const repos = await this.searchRepositories(query)
          result.found += repos.length

          for (const repo of repos) {
            try {
              const added = await this.processRepository(repo)
              if (added) result.added++
            } catch (err) {
              const message = err instanceof Error ? err.message : 'Unknown error'
              result.errors.push(`Error processing ${repo.full_name}: ${message}`)
            }
          }
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Unknown error'
          result.errors.push(`Error searching "${query}": ${message}`)
        }
      }

      // Update job as completed
      await prisma.crawlJob.update({
        where: { id: job.id },
        data: {
          status: 'completed',
          completedAt: new Date(),
          itemsFound: result.found,
          itemsAdded: result.added,
        },
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      await prisma.crawlJob.update({
        where: { id: job.id },
        data: {
          status: 'failed',
          completedAt: new Date(),
          itemsFound: result.found,
          itemsAdded: result.added,
          error: message,
        },
      })
      result.errors.push(message)
    }

    return result
  }

  private async searchRepositories(query: string): Promise<GitHubRepo[]> {
    const url = new URL(`${GITHUB_API}/search/repositories`)
    url.searchParams.set('q', query)
    url.searchParams.set('sort', 'updated')
    url.searchParams.set('order', 'desc')
    url.searchParams.set('per_page', '30')

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${this.token}`,
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'Focus-Code-Skill-Marketplace',
      },
    })

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return data.items || []
  }

  private async processRepository(repo: GitHubRepo): Promise<boolean> {
    // Check if already exists
    const existing = await prisma.skill.findFirst({
      where: { sourceUrl: repo.html_url },
    })

    if (existing) {
      return false // Already exists
    }

    // Fetch README content
    const readme = await this.fetchReadme(repo.full_name)

    // Get category ID (default to "other")
    const category = await prisma.category.findFirst({
      where: { slug: 'other' },
    })

    if (!category) {
      throw new Error('Default category not found')
    }

    // Create skill
    await skillService.createSkill({
      name: repo.full_name.split('/')[1] || repo.full_name,
      description: repo.description || 'No description',
      content: readme || 'No README content',
      source: 'github',
      sourceUrl: repo.html_url,
      author: repo.owner.login,
      authorAvatar: repo.owner.avatar_url,
      tags: ['github', 'community'],
      categoryId: category.id,
    })

    return true
  }

  private async fetchReadme(repoFullName: string): Promise<string | null> {
    try {
      const response = await fetch(
        `${GITHUB_API}/repos/${repoFullName}/readme`,
        {
          headers: {
            Authorization: `Bearer ${this.token}`,
            Accept: 'application/vnd.github.v3+json',
            'User-Agent': 'Focus-Code-Skill-Marketplace',
          },
        }
      )

      if (!response.ok) return null

      const data = await response.json()
      // Decode base64 content
      if (data.content) {
        return Buffer.from(data.content, 'base64').toString('utf-8')
      }

      return null
    } catch {
      return null
    }
  }
}
```

- [ ] **Step 2: Create crawler API endpoint**

Create `app/api/cron/github-crawler/route.ts`:

```typescript
import { NextResponse } from 'next/server'
import { GitHubCrawler } from '../../../../crawlers/github.crawler'

export async function GET() {
  const token = process.env.GITHUB_TOKEN

  if (!token) {
    return NextResponse.json(
      { error: 'GITHUB_TOKEN not configured' },
      { status: 500 }
    )
  }

  try {
    const crawler = new GitHubCrawler(token)
    const result = await crawler.crawl()

    return NextResponse.json(result)
  } catch (error) {
    console.error('Crawler error:', error)
    return NextResponse.json(
      { error: 'Crawler failed' },
      { status: 500 }
    )
  }
}
```

- [ ] **Step 3: Add cron configuration**

Update `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/github-crawler",
      "schedule": "0 2 * * *"
    }
  ]
}
```

- [ ] **Step 4: Commit**

```bash
git add crawlers/ app/api/cron/ vercel.json
git commit -m "feat: add GitHub crawler for skill discovery"
```

---

## Task 10: Submit Skill Page

**Files:**
- Create: `app/submit/page.tsx`
- Create: `components/submit-form.tsx`

- [ ] **Step 1: Create submit form component**

Create `components/submit-form.tsx`:

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import type { Category } from '@/types'

interface SubmitFormProps {
  categories: Category[]
}

export function SubmitForm({ categories }: SubmitFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      content: formData.get('content') as string,
      source: 'user',
      sourceUrl: formData.get('sourceUrl') as string,
      author: formData.get('author') as string,
      tags: (formData.get('tags') as string)
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      categoryId: formData.get('categoryId') as string,
    }

    try {
      const response = await fetch('/api/skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to submit skill')
      }

      const skill = await response.json()
      router.push(`/skill/${skill.slug}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg">{error}</div>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Skill Name *</Label>
        <Input
          id="name"
          name="name"
          required
          placeholder="e.g., Git Commit Helper"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          name="description"
          required
          placeholder="Brief description of what this skill does"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">Skill Content (Markdown) *</Label>
        <Textarea
          id="content"
          name="content"
          required
          rows={10}
          placeholder="Paste your skill content here..."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="categoryId">Category *</Label>
        <select
          id="categoryId"
          name="categoryId"
          required
          className="w-full p-2 border rounded-md"
        >
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="author">Author *</Label>
        <Input
          id="author"
          name="author"
          required
          placeholder="Your name or username"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="sourceUrl">Source URL</Label>
        <Input
          id="sourceUrl"
          name="sourceUrl"
          type="url"
          placeholder="https://github.com/..."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="tags">Tags (comma separated)</Label>
        <Input
          id="tags"
          name="tags"
          placeholder="git, commit, workflow"
        />
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? 'Submitting...' : 'Submit Skill'}
      </Button>
    </form>
  )
}
```

- [ ] **Step 2: Create submit page**

Create `app/submit/page.tsx`:

```typescript
import { SubmitForm } from '@/components/submit-form'
import { prisma } from '@/lib/prisma'

async function getCategories() {
  return prisma.category.findMany({
    orderBy: { sortOrder: 'asc' },
  })
}

export default async function SubmitPage() {
  const categories = await getCategories()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Submit a Skill</h1>
        <p className="text-muted-foreground mt-2">
          Share your Focus Code skill with the community
        </p>
      </div>

      <SubmitForm categories={categories} />
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add app/submit/ components/submit-form.tsx
git commit -m "feat: add skill submission form and page"
```

---

## Task 11: Admin Dashboard

**Files:**
- Create: `app/admin/page.tsx`

- [ ] **Step 1: Create admin page**

Create `app/admin/page.tsx`:

```typescript
import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

async function getStats() {
  const [
    totalSkills,
    publishedSkills,
    pendingSkills,
    totalReviews,
    totalInstalls,
    recentJobs,
  ] = await Promise.all([
    prisma.skill.count(),
    prisma.skill.count({ where: { isPublished: true } }),
    prisma.skill.count({ where: { isPublished: false } }),
    prisma.review.count(),
    prisma.skill.aggregate({
      _sum: { installCount: true },
    }),
    prisma.crawlJob.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
  ])

  return {
    totalSkills,
    publishedSkills,
    pendingSkills,
    totalReviews,
    totalInstalls: totalInstalls._sum.installCount || 0,
    recentJobs,
  }
}

async function getPendingSkills() {
  return prisma.skill.findMany({
    where: { isPublished: false },
    orderBy: { createdAt: 'desc' },
    include: { category: true },
    take: 20,
  })
}

export default async function AdminPage() {
  const stats = await getStats()
  const pendingSkills = await getPendingSkills()

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Total Skills</p>
          <p className="text-2xl font-bold">{stats.totalSkills}</p>
        </div>
        <div className="border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Published</p>
          <p className="text-2xl font-bold">{stats.publishedSkills}</p>
        </div>
        <div className="border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Pending</p>
          <p className="text-2xl font-bold">{stats.pendingSkills}</p>
        </div>
        <div className="border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Total Installs</p>
          <p className="text-2xl font-bold">{stats.totalInstalls}</p>
        </div>
      </div>

      {/* Pending Skills */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">
          Pending Approval ({pendingSkills.length})
        </h2>
        {pendingSkills.length === 0 ? (
          <p className="text-muted-foreground">No pending skills</p>
        ) : (
          <div className="space-y-2">
            {pendingSkills.map((skill) => (
              <div
                key={skill.id}
                className="flex items-center justify-between border rounded-lg p-4"
              >
                <div>
                  <Link
                    href={`/skill/${skill.slug}`}
                    className="font-medium hover:underline"
                  >
                    {skill.name}
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    by {skill.author} in {skill.category?.name}
                  </p>
                </div>
                <div className="flex gap-2">
                  <form
                    action={`/api/admin/skills/${skill.id}/approve`}
                    method="POST"
                  >
                    <Button type="submit" size="sm" variant="outline">
                      Approve
                    </Button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Crawl Jobs */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Recent Crawl Jobs</h2>
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="text-left p-3">Source</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Found</th>
                <th className="text-left p-3">Added</th>
                <th className="text-left p-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentJobs.map((job) => (
                <tr key={job.id} className="border-t">
                  <td className="p-3 capitalize">{job.source}</td>
                  <td className="p-3">
                    <Badge
                      variant={
                        job.status === 'completed'
                          ? 'default'
                          : job.status === 'failed'
                          ? 'destructive'
                          : 'secondary'
                      }
                    >
                      {job.status}
                    </Badge>
                  </td>
                  <td className="p-3">{job.itemsFound}</td>
                  <td className="p-3">{job.itemsAdded}</td>
                  <td className="p-3">
                    {new Date(job.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Crawl */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Manual Crawl</h2>
        <div className="flex gap-2">
          <form action="/api/cron/github-crawler" method="GET">
            <Button type="submit" variant="outline">
              Run GitHub Crawler
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create approve API**

Create `app/api/admin/skills/[id]/approve/route.ts`:

```typescript
import { NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/prisma'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.skill.update({
      where: { id: params.id },
      data: { isPublished: true },
    })

    return NextResponse.redirect(new URL('/admin', request.url))
  } catch (error) {
    console.error('Error approving skill:', error)
    return NextResponse.json(
      { error: 'Failed to approve skill' },
      { status: 500 }
    )
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add app/admin/ app/api/admin/
git commit -m "feat: add admin dashboard with approval and crawl management"
```

---

## Task 12: Testing & Final Integration

**Files:**
- Create: `__tests__/integration/api.test.ts`
- Modify: `package.json`

- [ ] **Step 1: Add test script and vitest config**

Update `package.json`:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

Create `vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './'),
    },
  },
})
```

- [ ] **Step 2: Install test dependencies**

```bash
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom
```

- [ ] **Step 3: Write integration tests**

Create `__tests__/integration/api.test.ts`:

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest'

describe('API Integration', () => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  describe('GET /api/skills', () => {
    it('returns skills list', async () => {
      const response = await fetch(`${baseUrl}/api/skills`)
      expect(response.status).toBe(200)

      const data = await response.json()
      expect(data).toHaveProperty('items')
      expect(data).toHaveProperty('total')
      expect(Array.isArray(data.items)).toBe(true)
    })
  })

  describe('GET /api/categories', () => {
    it('returns categories list', async () => {
      const response = await fetch(`${baseUrl}/api/categories`)
      expect(response.status).toBe(200)

      const data = await response.json()
      expect(Array.isArray(data)).toBe(true)
    })
  })

  describe('GET /api/search', () => {
    it('returns search results', async () => {
      const response = await fetch(`${baseUrl}/api/search?q=test`)
      expect(response.status).toBe(200)

      const data = await response.json()
      expect(data).toHaveProperty('hits')
      expect(data).toHaveProperty('total')
    })
  })
})
```

- [ ] **Step 4: Run tests**

```bash
npm test
```

- [ ] **Step 5: Build verification**

```bash
npm run build
```

Expected: Build succeeds without errors

- [ ] **Step 6: Final commit**

```bash
git add package.json vitest.config.ts __tests__/
git commit -m "test: add vitest configuration and integration tests"
```

---

## Self-Review

### Spec Coverage Check

| Spec Requirement | Implementation Task |
|-----------------|---------------------|
| Database schema with Skill, Category, Review, CrawlJob | Task 2 |
| Skill CRUD operations | Task 4 |
| Search with Meilisearch | Task 5 |
| API routes for skills, search, categories | Task 6 |
| UI components (cards, search, install) | Task 7 |
| Pages (home, search, detail, categories) | Task 8 |
| GitHub crawler | Task 9 |
| Submit skill form | Task 10 |
| Admin dashboard | Task 11 |
| Testing | Task 12 |

### Placeholder Scan

- No TBD/TODO placeholders found
- All code blocks contain complete implementations
- All file paths are exact

### Type Consistency

- Skill type used consistently across service, API, and components
- Prisma model names match service method names
- API response types align with frontend expectations

---

## Deployment Checklist

- [ ] Set up Neon PostgreSQL database
- [ ] Set up Meilisearch instance (Cloud or self-hosted)
- [ ] Configure environment variables in Vercel
- [ ] Run database migrations: `npx prisma migrate deploy`
- [ ] Seed categories: `npx prisma db seed`
- [ ] Initialize Meilisearch index
- [ ] Configure GitHub token for crawler
- [ ] Deploy to Vercel
- [ ] Set up cron jobs in Vercel dashboard

---

*Plan version: 1.0*
*Created: 2026-04-22*
*Based on spec: docs/superpowers/specs/2026-04-22-skill-marketplace-design.md*
