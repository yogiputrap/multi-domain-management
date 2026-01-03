# Cloudflare DNS Integration Guide

## Overview

IFITB MULTIDOMAIN now supports **real Cloudflare DNS provisioning** alongside the mock DNS system. The platform automatically switches between Cloudflare and Mock DNS based on domain configuration.

---

## 🎯 Features

### ✅ **Automatic Provider Selection**
- **Cloudflare DNS**: Used when domain has API credentials configured
- **Mock DNS**: Used as fallback or for domains without Cloudflare setup
- **Seamless Switching**: No code changes needed, automatic detection

### ✅ **Cloudflare Integration**
- Create DNS records (A and CNAME)
- Update existing DNS records
- Delete DNS records
- Verify credentials
- List all DNS records for a zone

### ✅ **Error Handling**
- Comprehensive error parsing
- User-friendly error messages
- Automatic fallback to Mock DNS on failure
- Detailed logging for debugging

---

## 📋 Setup Instructions

### 1. **Get Cloudflare Credentials**

#### **API Token**
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/profile/api-tokens)
2. Click "Create Token"
3. Use "Edit zone DNS" template
4. Select your zone (domain)
5. Copy the generated token

#### **Zone ID**
1. Go to your domain's overview page in Cloudflare
2. Scroll down to "API" section on the right sidebar
3. Copy the "Zone ID"

### 2. **Add Domain with Cloudflare Credentials**

#### **Via Admin Panel**
1. Login as Admin
2. Go to **Domains** page
3. Click **"Add Domain"**
4. Fill in:
   - **Root Domain**: `example.com`
   - **Cloudflare API Token**: `your-api-token-here`
   - **Cloudflare Zone ID**: `your-zone-id-here`
5. Click **"Add Domain"**

#### **Via API**
```bash
curl -X POST http://localhost:3001/api/admin/domains \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "rootDomain": "example.com",
    "cloudflareApiToken": "your-api-token-here",
    "cloudflareZoneId": "your-zone-id-here"
  }'
```

### 3. **Verify Credentials (Optional)**

You can verify credentials programmatically:

```javascript
const dnsService = require('./src/services/dns.service');

const result = await dnsService.verifyCloudflareCredentials(
  'your-api-token',
  'your-zone-id'
);

if (result.success) {
  console.log('✅ Credentials valid!');
  console.log('Zone:', result.zone.name);
} else {
  console.log('❌ Error:', result.error);
}
```

---

## 🚀 Usage

### **Creating Subdomains**

When a user creates a subdomain, the system automatically:

1. **Checks domain configuration**
   - If Cloudflare credentials exist → Use Cloudflare
   - If no credentials → Use Mock DNS

2. **Creates DNS record**
   - Cloudflare: Real DNS record via API
   - Mock: Database-only record

3. **Stores record**
   - Saves subdomain in database
   - Stores Cloudflare record ID (if applicable)

### **Example Flow**

```javascript
// User creates subdomain
const result = await dnsService.createSubdomain(
  userId,
  domainId,
  'blog',      // subdomain name
  'A',         // record type
  '192.0.2.1'  // target IP
);

// Result includes provider info
console.log(result.provider); // 'cloudflare' or 'mock'
console.log(result.message);  // Success message
```

### **Console Logs**

The system logs DNS operations:

```
[DNS] Using Cloudflare for blog.example.com
[DNS] ✅ Cloudflare record created: abc123xyz
```

Or with fallback:

```
[DNS] Using Cloudflare for test.example.com
[DNS] ⚠️ Cloudflare failed, using Mock: Invalid API Token
[DNS] Using Mock DNS for test.example.com
```

---

## 🔧 Architecture

### **Service Layer**

```
dns.service.js (Unified DNS Service)
├── cloudflare.service.js (Cloudflare API)
└── dns.mock.service.js (Mock DNS)
```

### **Flow Diagram**

```
User Creates Subdomain
        ↓
Check Domain Config
        ↓
    ┌───────────────┐
    │ Has Cloudflare│
    │  Credentials? │
    └───────┬───────┘
            │
    ┌───────┴───────┐
    │               │
   YES             NO
    │               │
    ↓               ↓
Cloudflare API   Mock DNS
    │               │
    ↓               ↓
Success?         Always
    │            Success
    ↓
┌───┴───┐
│  YES  │
└───┬───┘
    │
    ↓
Store Record
```

### **Database Schema**

```prisma
model Domain {
  id                  String   @id @default(uuid())
  rootDomain          String   @unique
  status              String   @default("active")
  cloudflareApiToken  String?  // Optional
  cloudflareZoneId    String?  // Optional
  // ...
}

model Subdomain {
  id                  String   @id @default(uuid())
  name                String
  type                String   // A or CNAME
  target              String
  status              String   @default("pending")
  cloudflareRecordId  String?  // Cloudflare DNS record ID
  // ...
}
```

---

## 🛡️ Security

### **API Token Permissions**

Your Cloudflare API token should have:
- ✅ **Zone:DNS:Edit** - Required for creating/updating/deleting records
- ✅ **Zone:Zone:Read** - Required for verification

### **Token Storage**

- Tokens are stored in the database
- Use environment-based encryption for production
- Never expose tokens in client-side code
- Tokens are only used server-side

### **Best Practices**

1. **Use scoped tokens**: Create tokens with minimal permissions
2. **Rotate regularly**: Update tokens periodically
3. **Monitor usage**: Check Cloudflare audit logs
4. **Limit zones**: Only grant access to specific zones

---

## 🐛 Troubleshooting

### **Common Errors**

#### **"Invalid Cloudflare API Token"**
- **Cause**: Token is incorrect or expired
- **Solution**: Generate new token from Cloudflare Dashboard

#### **"Invalid Zone ID"**
- **Cause**: Zone ID doesn't match the domain
- **Solution**: Verify Zone ID from domain's overview page

#### **"Insufficient permissions"**
- **Cause**: Token doesn't have DNS edit permissions
- **Solution**: Recreate token with "Edit zone DNS" template

#### **"DNS record already exists"**
- **Cause**: Record already exists in Cloudflare
- **Solution**: Delete existing record or use different subdomain name

#### **"Cloudflare API rate limit exceeded"**
- **Cause**: Too many API requests
- **Solution**: Wait a few minutes, implement rate limiting

### **Debugging**

Enable detailed logging:

```javascript
// In dns.service.js
console.log('[DNS] Provider:', useCloudflare ? 'Cloudflare' : 'Mock');
console.log('[DNS] Domain:', domain.rootDomain);
console.log('[DNS] Credentials:', {
  hasToken: !!domain.cloudflareApiToken,
  hasZone: !!domain.cloudflareZoneId
});
```

Check server logs for DNS operations:
```bash
# Watch logs in real-time
npm run dev

# Look for [DNS] prefixed messages
```

---

## 📊 Monitoring

### **Check DNS Provider Usage**

Query database to see which domains use Cloudflare:

```sql
-- Domains with Cloudflare
SELECT root_domain, 
       CASE 
         WHEN cloudflare_api_token IS NOT NULL THEN 'Cloudflare'
         ELSE 'Mock'
       END as provider
FROM domains;

-- Subdomains with Cloudflare records
SELECT s.full_domain, 
       CASE 
         WHEN s.cloudflare_record_id IS NOT NULL THEN 'Cloudflare'
         ELSE 'Mock'
       END as provider
FROM subdomains s;
```

### **Success Metrics**

Track provisioning success:
- Total subdomains created
- Cloudflare vs Mock ratio
- Failed provisioning attempts
- Fallback usage rate

---

## 🔄 Migration Guide

### **Migrating from Mock to Cloudflare**

1. **Add Cloudflare credentials** to existing domain
2. **New subdomains** will automatically use Cloudflare
3. **Existing subdomains** remain in Mock (database only)

To migrate existing subdomains:
1. Manually create DNS records in Cloudflare
2. Update database with Cloudflare record IDs
3. Or recreate subdomains (delete + create)

### **Migrating from Cloudflare to Mock**

1. Remove Cloudflare credentials from domain
2. New subdomains will use Mock
3. Existing Cloudflare records remain active
4. Manually delete from Cloudflare if needed

---

## 📚 API Reference

### **Cloudflare Service Methods**

#### `createDNSRecord(domain, name, type, content)`
Create a new DNS record.

**Parameters:**
- `domain` (Object): Domain object with credentials
- `name` (String): Subdomain name
- `type` (String): Record type (A or CNAME)
- `content` (String): Target IP or domain

**Returns:**
```javascript
{
  success: true,
  record: {
    id: 'cloudflare-record-id',
    name: 'subdomain.example.com',
    type: 'A',
    content: '192.0.2.1'
  },
  provider: 'cloudflare'
}
```

#### `updateDNSRecord(domain, recordId, type, content)`
Update an existing DNS record.

#### `deleteDNSRecord(domain, recordId)`
Delete a DNS record.

#### `verifyCredentials(apiToken, zoneId)`
Verify Cloudflare credentials.

#### `listDNSRecords(domain)`
List all DNS records for a zone.

---

## 🎓 Examples

### **Example 1: Create Subdomain with Cloudflare**

```javascript
// Domain has Cloudflare credentials
const result = await dnsService.createSubdomain(
  'user-id',
  'domain-id',
  'api',
  'A',
  '192.0.2.10'
);

// Output:
// [DNS] Using Cloudflare for api.example.com
// [DNS] ✅ Cloudflare record created: abc123

console.log(result.provider); // 'cloudflare'
console.log(result.subdomain.cloudflareRecordId); // 'abc123'
```

### **Example 2: Create Subdomain with Mock**

```javascript
// Domain has NO Cloudflare credentials
const result = await dnsService.createSubdomain(
  'user-id',
  'domain-id',
  'test',
  'A',
  '192.0.2.20'
);

// Output:
// [DNS] Using Mock DNS for test.example.com

console.log(result.provider); // 'mock'
console.log(result.subdomain.cloudflareRecordId); // null
```

### **Example 3: Cloudflare Fallback**

```javascript
// Domain has INVALID Cloudflare credentials
const result = await dnsService.createSubdomain(
  'user-id',
  'domain-id',
  'blog',
  'A',
  '192.0.2.30'
);

// Output:
// [DNS] Using Cloudflare for blog.example.com
// [DNS] ⚠️ Cloudflare failed, using Mock: Invalid API Token
// [DNS] Using Mock DNS for blog.example.com

console.log(result.provider); // 'mock' (fallback)
console.log(result.subdomain.cloudflareRecordId); // null
```

---

## 🔮 Future Enhancements

### **Planned Features**
- [ ] Bulk DNS record import
- [ ] DNS record templates
- [ ] Multi-provider support (Route53, Google Cloud DNS)
- [ ] Automatic SSL certificate provisioning
- [ ] DNS analytics and monitoring
- [ ] Webhook notifications for DNS changes
- [ ] DNS record validation before creation
- [ ] TTL customization per record
- [ ] Proxied vs DNS-only toggle

### **Performance Optimizations**
- [ ] Batch DNS operations
- [ ] Caching for DNS queries
- [ ] Async background processing
- [ ] Rate limiting per domain

---

## 📞 Support

For issues or questions:
1. Check server logs for `[DNS]` messages
2. Verify Cloudflare credentials
3. Test with Mock DNS first
4. Review Cloudflare API documentation

---

## 📄 License

This integration is part of IFITB MULTIDOMAIN platform.

---

**Last Updated**: January 2, 2026  
**Version**: 1.0.0
