# Anti-Patterns to Avoid

❌ **Business logic in UI components** - Keep components presentational, move logic to services  
❌ **Direct database access in API routes** - Use service layer  
❌ **Repeated validation logic** - Use Zod schemas  
❌ **God objects** - Keep services focused on single responsibility  
❌ **Circular dependencies** - Maintain clear layer boundaries  
❌ **Hardcoded configuration** - Use environment variables  
❌ **Ignoring error handling** - Always use try/catch and return ApiResponse  
❌ **Skipping audit logs** - Log all sensitive operations  

---
