# Life Archive

**Multi-generational family legacy preservation platform**

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:3000

### Media storage (Cloudflare R2)

Add these to `.env.local` (see `.env.example`):

```
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=life-archive
R2_PUBLIC_DOMAIN=https://life-archive.{ACCOUNT_ID}.r2.dev
```

Photos are compressed in the browser, then uploaded directly to R2 (any size). Videos also upload directly to R2 with no size cap.

## Stack

- **Frontend**: Next.js 14, React 18, TailwindCSS
- **Backend**: Supabase (PostgreSQL)
- **Storage**: Cloudflare R2
- **Deployment**: Vercel

## Milestones

- [x] Milestone 1: Repo + Auth (In Progress)
- [ ] Milestone 2: Family Setup
- [ ] Milestone 3: Timeline
- [ ] Milestone 4: Memory CRUD
- [ ] Milestone 5: Guided Prompts
- [ ] Milestone 6: Media Upload
- [ ] Milestone 7: Collections
- [ ] Milestone 8: Search
- [ ] Milestone 9: Calendar
- [ ] Milestone 10: Settings
- [ ] Milestone 11: Growth Tracking
- [ ] Milestone 12: Data Export
- [ ] Milestone 13: Offline Support
- [ ] Milestone 14: PWA + Polish

## Documentation

See `/docs` folder for complete system architecture, database design, API specs, and more.

## License

Private
