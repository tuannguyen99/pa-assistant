# Pattern Selection Guidelines

When implementing new features, follow these guidelines:

| Scenario | Recommended Pattern | Example |
|----------|-------------------|---------|
| **Adding new authentication method** | Strategy Pattern | LDAP, OAuth, SAML |
| **Adding new API endpoint** | Layered Architecture | API Route → Service → Prisma |
| **Complex business operation** | Facade Pattern | Wrap in Service class |
| **State transitions** | State Machine | Review workflow, Target approval |
| **Cross-cutting concerns** | Middleware/Decorator | Auth, logging, timing |
| **Database queries** | Repository (Prisma) | Type-safe data access |
| **UI components** | Composition | Modal variants, form fields |
| **Configuration management** | Strategy/Adapter | AI providers, auth providers |
| **Audit requirements** | Observer Pattern | Log after sensitive operations |

---
