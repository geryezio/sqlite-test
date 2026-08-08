import { prisma } from '../lib/prisma';

async function main() {
    console.log('=== Demonstration of SQLite operations with Prisma ===\n');

    // 1. Clean up existing data for a fresh run
    await prisma.user.deleteMany({});
    console.log('1. Cleared existing users from database.');

    // 2. CREATE - Add new users
    console.log('\n2. Creating test users...');
    const user1 = await prisma.user.create({
        data: {
            name: 'Budi Santoso',
            email: 'budi@example.com',
            role: 'ADMIN',
        },
    });

    const user2 = await prisma.user.create({
        data: {
            name: 'Siti Aminah',
            email: 'siti@example.com',
            role: 'USER',
        },
    });

    console.log('Created User 1:', user1);
    console.log('Created User 2:', user2);

    // 3. READ - Find all users and find unique user
    console.log('\n3. Reading users from SQLite database...');
    const allUsers = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
    });
    console.log(`Total users found: ${allUsers.length}`);
    console.table(allUsers);

    // 4. UPDATE - Modify user details
    console.log('\n4. Updating Budi\'s role to SUPERADMIN...');
    const updatedUser = await prisma.user.update({
        where: { id: user1.id },
        data: { role: 'SUPERADMIN' },
    });
    console.log('Updated user:', updatedUser);

    // 5. DELETE - Remove a user
    console.log('\n5. Deleting Siti from database...');
    const deletedUser = await prisma.user.delete({
        where: { id: user2.id },
    });
    console.log('Deleted user:', deletedUser);

    // 6. FINAL STATE
    console.log('\n6. Remaining users in database:');
    const finalUsers = await prisma.user.findMany();
    console.table(finalUsers);

    console.log('\n=== SQLite Test Completed Successfully! ===');
}

main()
    .catch((e) => {
        console.error('Error running SQLite test:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
