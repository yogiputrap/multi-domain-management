const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seed...\n');

    // Create default admin user
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@ifitb.site';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';

    const existingAdmin = await prisma.user.findUnique({
        where: { email: adminEmail }
    });

    if (existingAdmin) {
        console.log('✅ Admin user already exists:', adminEmail);
    } else {
        const passwordHash = await bcrypt.hash(adminPassword, 12);

        const admin = await prisma.user.create({
            data: {
                email: adminEmail,
                passwordHash: passwordHash,
                role: 'ADMIN'
            }
        });

        console.log('✅ Admin user created:', admin.email);
    }

    // Create sample domains
    const sampleDomains = [
        { rootDomain: 'ifitb.site', status: 'active' },
        { rootDomain: 'example.id', status: 'active' },
        { rootDomain: 'demo.cloud', status: 'active' }
    ];

    for (const domainData of sampleDomains) {
        const existingDomain = await prisma.domain.findUnique({
            where: { rootDomain: domainData.rootDomain }
        });

        if (!existingDomain) {
            await prisma.domain.create({
                data: domainData
            });
            console.log('✅ Domain created:', domainData.rootDomain);
        } else {
            console.log('ℹ️  Domain exists:', domainData.rootDomain);
        }
    }

    // Create sample user
    const sampleUserEmail = 'user@example.com';
    const sampleUserPassword = 'User@123';

    const existingUser = await prisma.user.findUnique({
        where: { email: sampleUserEmail }
    });

    let sampleUser;
    if (!existingUser) {
        const passwordHash = await bcrypt.hash(sampleUserPassword, 12);
        sampleUser = await prisma.user.create({
            data: {
                email: sampleUserEmail,
                passwordHash: passwordHash,
                role: 'USER'
            }
        });
        console.log('✅ Sample user created:', sampleUser.email);
    } else {
        sampleUser = existingUser;
        console.log('ℹ️  Sample user exists:', sampleUserEmail);
    }

    // Assign domains to sample user
    const domains = await prisma.domain.findMany();

    for (const domain of domains.slice(0, 2)) {
        const existingAssignment = await prisma.domainUser.findFirst({
            where: {
                domainId: domain.id,
                userId: sampleUser.id
            }
        });

        if (!existingAssignment) {
            await prisma.domainUser.create({
                data: {
                    domainId: domain.id,
                    userId: sampleUser.id
                }
            });
            console.log('✅ Assigned domain to user:', domain.rootDomain, '->', sampleUser.email);
        }
    }

    // Create sample subdomains
    const ifitbDomain = domains.find(d => d.rootDomain === 'ifitb.site');
    if (ifitbDomain) {
        const sampleSubdomains = [
            { name: 'api', type: 'A', target: '192.168.1.100', status: 'active' },
            { name: 'blog', type: 'CNAME', target: 'hosting.provider.com', status: 'active' },
            { name: 'dev', type: 'A', target: '192.168.1.101', status: 'pending' }
        ];

        for (const subData of sampleSubdomains) {
            const existingSub = await prisma.subdomain.findFirst({
                where: {
                    name: subData.name,
                    domainId: ifitbDomain.id
                }
            });

            if (!existingSub) {
                await prisma.subdomain.create({
                    data: {
                        name: subData.name,
                        fullDomain: `${subData.name}.${ifitbDomain.rootDomain}`,
                        domainId: ifitbDomain.id,
                        userId: sampleUser.id,
                        type: subData.type,
                        target: subData.target,
                        status: subData.status
                    }
                });
                console.log('✅ Subdomain created:', `${subData.name}.${ifitbDomain.rootDomain}`);
            }
        }
    }

    console.log('\n✨ Seed completed successfully!');
    console.log('\n📋 Default Credentials:');
    console.log('   Admin: admin@ifitb.site / Admin@123');
    console.log('   User:  user@example.com / User@123');
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
