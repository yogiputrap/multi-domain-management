// Quick test script to verify subdomain creation
// Run this in Zeabur console: node test-subdomain.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testSubdomainCreation() {
    console.log('\n🧪 Testing Subdomain Creation\n');
    console.log('='.repeat(60));

    try {
        // 1. Get a user
        console.log('\n1️⃣  Finding a USER...');
        const user = await prisma.user.findFirst({
            where: { role: 'USER' }
        });

        if (!user) {
            console.log('   ❌ No USER found! Create a user first.');
            return;
        }
        console.log(`   ✅ Found user: ${user.email} (${user.id})`);

        // 2. Get assigned domains
        console.log('\n2️⃣  Checking assigned domains...');
        const assignments = await prisma.domainUser.findMany({
            where: { userId: user.id },
            include: { domain: true }
        });

        if (assignments.length === 0) {
            console.log('   ❌ User has no domains assigned!');
            console.log('   💡 Fix: Admin must assign a domain to this user');
            return;
        }

        console.log(`   ✅ Found ${assignments.length} assigned domains:`);
        assignments.forEach(a => {
            console.log(`      - ${a.domain.rootDomain} (${a.domain.status})`);
        });

        const domain = assignments[0].domain;

        // 3. Test subdomain data
        console.log('\n3️⃣  Testing subdomain data...');
        const testData = {
            name: 'test-' + Date.now(),
            domainId: domain.id,
            type: 'A',
            target: '192.168.1.100'
        };

        console.log('   Test data:', testData);

        // 4. Validate data
        console.log('\n4️⃣  Validating data...');

        // Check name format
        const nameRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?$/;
        if (!nameRegex.test(testData.name)) {
            console.log('   ❌ Invalid subdomain name format');
            return;
        }
        console.log('   ✅ Name format valid');

        // Check domainId is UUID
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(testData.domainId)) {
            console.log('   ❌ Invalid domain ID format');
            return;
        }
        console.log('   ✅ Domain ID format valid');

        // Check type
        if (!['A', 'CNAME'].includes(testData.type)) {
            console.log('   ❌ Invalid record type');
            return;
        }
        console.log('   ✅ Record type valid');

        // Check target
        if (!testData.target || testData.target.length === 0) {
            console.log('   ❌ Target is empty');
            return;
        }
        console.log('   ✅ Target valid');

        // 5. Check availability
        console.log('\n5️⃣  Checking availability...');
        const existing = await prisma.subdomain.findFirst({
            where: {
                name: testData.name,
                domainId: testData.domainId
            }
        });

        if (existing) {
            console.log('   ❌ Subdomain already exists');
            return;
        }
        console.log('   ✅ Subdomain available');

        // 6. Create subdomain
        console.log('\n6️⃣  Creating subdomain...');
        const subdomain = await prisma.subdomain.create({
            data: {
                name: testData.name,
                fullDomain: `${testData.name}.${domain.rootDomain}`,
                domainId: testData.domainId,
                userId: user.id,
                type: testData.type,
                target: testData.target,
                status: 'active'
            }
        });

        console.log('   ✅ Subdomain created successfully!');
        console.log('   📋 Details:');
        console.log(`      - ID: ${subdomain.id}`);
        console.log(`      - Full Domain: ${subdomain.fullDomain}`);
        console.log(`      - Type: ${subdomain.type}`);
        console.log(`      - Target: ${subdomain.target}`);
        console.log(`      - Status: ${subdomain.status}`);

        console.log('\n' + '='.repeat(60));
        console.log('\n✅ Test PASSED! Subdomain creation works.\n');
        console.log('💡 If UI still fails, check:');
        console.log('   1. Browser console for errors');
        console.log('   2. Network tab for request payload');
        console.log('   3. Server logs for validation errors');

    } catch (error) {
        console.error('\n❌ Test FAILED!');
        console.error('Error:', error.message);
        console.error('Code:', error.code);
        console.error('Stack:', error.stack);
    } finally {
        await prisma.$disconnect();
    }
}

testSubdomainCreation().catch(console.error);
