# Performance Considerations

## NFR001 Compliance

**Target:** 200 concurrent users, <2s page load, <10s AI response

**Strategies:**

1. **Next.js Optimizations:**
   - Server-side rendering for initial load
   - Incremental static regeneration for dashboards
   - Automatic code splitting
   - Image optimization

2. **Database Performance:**
   - Prisma connection pooling
   - Indexed foreign keys and common queries
   - SQLite WAL mode for concurrent reads
   - PostgreSQL for production scale

3. **Caching Strategy:**
   - TanStack Query for client-side caching (5-minute stale time)
   - Next.js edge caching for static assets
   - Database query result caching

4. **AI Response Time:**
   - Web-based mode: No backend latency
   - Local Ollama: <10s typical response time
   - Async processing with loading states

---
