#!/usr/bin/env node

/**
 * Diagnostic Script for IFITB MULTIDOMAIN
 * Run this to check system status and troubleshoot issues
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function runDiagnostics() {
    console.log('\n🔍 IFITB MULTIDOMAIN - System Diagnostics\n');
    console.log('='.repeat(60));

    try {
        // 1. Check Database Connection
        console.log('\n1️⃣  Checking Database Connection...');
        await prisma.$connect();
        console.log('   ✅ Database connected successfully');

        // 2. Check Users
        console.log('\n2️⃣  Checking Users...');
        const users = await prisma.user.findMany({
            select: { id: true, email: true, role: true }
        });
        console.log(`   ✅ Found ${users.length} users:`);
        users.forEach(user => {
            console.log(`      - ${user.email} (${user.role})`);
        });

        // 3. Check Domains
        console.log('\n3️⃣  Checking Domains...');
        const domains = await prisma.domain.findMany({
            select: {
                id: true,
                rootDomain: true,
                status: true,
                cloudflareApiToken: true,
                cloudflareZoneId: true,
                _count: {
                    select: {
                        domainUsers: true,
                        subdomains: true
                    }
                }
            }
        });
        console.log(`   ✅ Found ${domains.length} domains:`);
        domains.forEach(domain => {
            const hasCloudflare = !!(domain.cloudflareApiToken && domain.cloudflareZoneId);
            console.log(`      - ${domain.rootDomain} (${domain.status})`);
            console.log(`        Cloudflare: ${hasCloudflare ? '✅ Configured' : '❌ Not configured'}`);
            console.log(`        Assigned to: ${domain._count.domainUsers} users`);
            console.log(`        Subdomains: ${domain._count.subdomains}`);
        });

        // 4. Check Domain Assignments
        console.log('\n4️⃣  Checking Domain Assignments...');
        const assignments = await prisma.domainUser.findMany({
            include: {
                user: { select: { email: true } },
                domain: { select: { rootDomain: true } }
            }
        });
        console.log(`   ✅ Found ${assignments.length} assignments:`);
        assignments.forEach(assignment => {
            console.log(`      - ${assignment.user.email} → ${assignment.domain.rootDomain}`);
        });

        // 5. Check Subdomains
        console.log('\n5️⃣  Checking Subdomains...');
        const subdomains = await prisma.subdomain.findMany({
            include: {
                user: { select: { email: true } },
                domain: { select: { rootDomain: true } }
            }
        });
        console.log(`   ✅ Found ${subdomains.length} subdomains:`);
        subdomains.forEach(subdomain => {
            const provider = subdomain.cloudflareRecordId ? 'Cloudflare' : 'Mock';
            console.log(`      - ${subdomain.fullDomain} (${subdomain.status}) [${provider}]`);
            console.log(`        Owner: ${subdomain.user.email}`);
            console.log(`        Type: ${subdomain.type} → ${subdomain.target}`);
        });

        // 6. Check for Common Issues
        console.log('\n6️⃣  Checking for Common Issues...');

        // Check if admin exists
        const admin = users.find(u => u.role === 'ADMIN');
        if (!admin) {
            console.log('   ⚠️  WARNING: No admin user found!');
        } else {
            console.log('   ✅ Admin user exists');
        }

        // Check if users have domains assigned
        const regularUsers = users.filter(u => u.role === 'USER');
        for (const user of regularUsers) {
            const userAssignments = assignments.filter(a => a.user.email === user.email);
            if (userAssignments.length === 0) {
                console.log(`   ⚠️  WARNING: User ${user.email} has no domains assigned!`);
            }
        }

        // Check for inactive domains
        const inactiveDomains = domains.filter(d => d.status !== 'active');
        if (inactiveDomains.length > 0) {
            console.log(`   ⚠️  WARNING: ${inactiveDomains.length} inactive domains found`);
        }

        // 7. Environment Check
        console.log('\n7️⃣  Checking Environment Variables...');
        const requiredEnvVars = [
            'DATABASE_URL',
            'JWT_SECRET',
            'JWT_EXPIRES_IN',
            'PORT',
            'NODE_ENV'
        ];

        requiredEnvVars.forEach(varName => {
            const value = process.env[varName];
            if (value) {
                console.log(`   ✅ ${varName}: ${varName === 'JWT_SECRET' ? '***' : value}`);
            } else {
                console.log(`   ❌ ${varName}: NOT SET`);
            }
        });

        console.log('\n' + '='.repeat(60));
        console.log('\n✅ Diagnostics Complete!\n');

    } catch (error) {
        console.error('\n❌ Error during diagnostics:', error.message);
        console.error('Stack:', error.stack);
    } finally {
        await prisma.$disconnect();
    }
}

// Run diagnostics
runDiagnostics().catch(console.error);
