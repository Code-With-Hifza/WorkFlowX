import { getTenantContext } from '@/lib/tenant-context';

describe('Phase 3 Multi-Tenant Isolation & Authorization Tests', () => {
  it('should reject unauthenticated access to tenant context', async () => {
    // Calling tenant context without valid session cookie must return null
    const context = await getTenantContext('acme-tech');
    expect(context).toBeNull();
  });
});
