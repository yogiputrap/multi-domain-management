# 🔧 Quick Fix Guide - "Failed to Create Subdomain"

## Common Causes & Solutions

### ✅ **Solution 1: User Not Assigned to Domain**

**Problem:** User trying to create subdomain on a domain they don't have access to.

**Fix:**
1. Login as **Admin**
2. Go to **Assignments** page
3. Select the **User**
4. Select the **Domain**
5. Click **"Assign Domain"**

**Verify:**
- User should see the domain in their sidebar
- User should be able to select the domain when creating subdomain

---

### ✅ **Solution 2: Invalid Cloudflare Credentials**

**Problem:** Domain has Cloudflare credentials but they're invalid.

**Symptoms:**
- Error message about Cloudflare API
- Logs show "Cloudflare failed"

**Fix:**
1. Login as **Admin**
2. Go to **Domains** page
3. Delete the domain with invalid credentials
4. Re-add the domain with correct credentials:
   - Get new API Token from [Cloudflare Dashboard](https://dash.cloudflare.com/profile/api-tokens)
   - Get Zone ID from domain overview page
   - Add domain with new credentials

**Or:** Leave Cloudflare fields empty to use Mock DNS

---

### ✅ **Solution 3: Database Connection Issue**

**Problem:** Database not accessible or schema not pushed.

**Fix in Zeabur Console:**
```bash
# Check database connection
npx prisma db pull

# Push schema
npx prisma db push --accept-data-loss

# Regenerate Prisma Client
npx prisma generate
```

---

### ✅ **Solution 4: Domain Not Active**

**Problem:** Domain status is "disabled".

**Fix:**
1. Login as **Admin**
2. Go to **Domains** page
3. Find the domain
4. Click **"Enable"** button

---

### ✅ **Solution 5: Subdomain Already Exists**

**Problem:** Trying to create a subdomain that already exists.

**Fix:**
1. Choose a different subdomain name
2. Or delete the existing subdomain first (if you own it)

---

## 🔍 **Debugging Steps**

### **Step 1: Run Diagnostics**

In Zeabur console or locally:
```bash
node diagnostics.js
```

This will show:
- ✅ Database connection status
- ✅ All users and their roles
- ✅ All domains and their status
- ✅ Domain assignments
- ✅ Existing subdomains
- ⚠️ Common issues

### **Step 2: Check Logs**

In Zeabur dashboard:
1. Go to your service
2. Click **"Logs"** tab
3. Look for `[DNS]` prefixed messages
4. Check for error details

**What to look for:**
```
[DNS] Create subdomain request: { userId, domainId, name, type, target }
[DNS] Domain found: { ... }
[DNS] Using Cloudflare for ... OR [DNS] Using Mock DNS for ...
[DNS] ✅ Cloudflare record created OR [DNS] ⚠️ Cloudflare failed
```

### **Step 3: Verify User Has Access**

```bash
# In Zeabur console or locally
npx prisma studio
```

1. Open **domainUsers** table
2. Check if there's a record with:
   - `userId` = the user's ID
   - `domainId` = the domain's ID

If not, assign the domain via admin panel.

---

## 🎯 **Quick Test Procedure**

### **Test 1: Mock DNS (No Cloudflare)**

1. **Admin:** Add domain WITHOUT Cloudflare credentials
   - Domain: `test.local`
   - Leave Cloudflare fields empty
   
2. **Admin:** Assign domain to user
   - User: select user
   - Domain: `test.local`
   
3. **User:** Create subdomain
   - Name: `api`
   - Type: `A`
   - Target: `192.168.1.1`
   
**Expected:** ✅ Success - "Subdomain created in mock mode"

### **Test 2: Cloudflare DNS**

1. **Admin:** Add domain WITH Cloudflare credentials
   - Domain: `yourdomain.com`
   - API Token: `your-valid-token`
   - Zone ID: `your-zone-id`
   
2. **Admin:** Assign domain to user
   
3. **User:** Create subdomain
   - Name: `blog`
   - Type: `A`
   - Target: `192.168.1.2`
   
**Expected:** ✅ Success - "Subdomain created and provisioned via Cloudflare"

**If fails:** Check Cloudflare credentials are valid

---

## 📋 **Checklist Before Creating Subdomain**

As **User**, verify:
- [ ] You are logged in
- [ ] You can see domains in the sidebar
- [ ] The domain you want to use is listed
- [ ] The domain status is "Active"
- [ ] The subdomain name doesn't already exist

As **Admin**, verify:
- [ ] Domain has been added
- [ ] Domain status is "Active"
- [ ] Domain has been assigned to the user
- [ ] If using Cloudflare, credentials are valid

---

## 🆘 **Still Not Working?**

### **Get Detailed Error Info:**

1. **Check Server Logs** in Zeabur:
   - Look for `[DNS]` messages
   - Look for error stack traces

2. **Run Diagnostics:**
   ```bash
   node diagnostics.js
   ```

3. **Check Database:**
   ```bash
   npx prisma studio
   ```

4. **Test Database Connection:**
   ```bash
   npx prisma db pull
   ```

### **Common Error Messages:**

| Error | Cause | Solution |
|-------|-------|----------|
| "Domain not found" | Invalid domain ID | Check domain exists and is active |
| "Domain is not active" | Domain disabled | Enable domain in admin panel |
| "Subdomain already exists" | Duplicate name | Use different name or delete existing |
| "You do not have access to this domain" | Not assigned | Admin must assign domain to user |
| "Failed to create DNS record" | Cloudflare error | Check credentials or use Mock DNS |
| "Invalid domain or user reference" | Database constraint | Check user and domain IDs are valid |

---

## 🔄 **Reset and Start Fresh**

If all else fails, reset the database:

```bash
# WARNING: This deletes all data!
npx prisma db push --force-reset
npx prisma db seed
```

Then:
1. Login as admin
2. Add domain
3. Create user (or use existing)
4. Assign domain to user
5. Login as user
6. Create subdomain

---

## 📞 **Support**

If you're still having issues:

1. Run `node diagnostics.js` and save the output
2. Check Zeabur logs for errors
3. Note the exact error message shown to user
4. Check if it's a Cloudflare issue or Mock DNS issue

**Most common fix:** Make sure user is assigned to the domain in the Assignments page!
