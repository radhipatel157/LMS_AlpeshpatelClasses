import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create roles
  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: { name: 'ADMIN' },
  });

  const teacherRole = await prisma.role.upsert({
    where: { name: 'TEACHER' },
    update: {},
    create: { name: 'TEACHER' },
  });

  const studentRole = await prisma.role.upsert({
    where: { name: 'STUDENT' },
    update: {},
    create: { name: 'STUDENT' },
  });

  console.log('✅ Roles created:', { adminRole, teacherRole, studentRole });

  // Create default admin user
  const adminPassword = await bcrypt.hash('Admin@123456', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@myclass.in' },
    update: {},
    create: {
      email: 'admin@myclass.in',
      passwordHash: adminPassword,
      name: 'System Admin',
      phone: '+91-9999999999',
      roleId: adminRole.id,
      isActive: true,
    },
  });

  console.log('✅ Admin user created:', admin.email);

  // Create sample standards
  const standards = await Promise.all([
    prisma.standard.upsert({
      where: { id: 'std-class-9' },
      update: {},
      create: { id: 'std-class-9', name: 'Class 9', order: 1 },
    }),
    prisma.standard.upsert({
      where: { id: 'std-class-10' },
      update: {},
      create: { id: 'std-class-10', name: 'Class 10', order: 2 },
    }),
    prisma.standard.upsert({
      where: { id: 'std-class-11' },
      update: {},
      create: { id: 'std-class-11', name: 'Class 11', order: 3 },
    }),
    prisma.standard.upsert({
      where: { id: 'std-class-12' },
      update: {},
      create: { id: 'std-class-12', name: 'Class 12', order: 4 },
    }),
  ]);

  console.log('✅ Standards created:', standards.map((s) => s.name));

  // Create default system settings
  await prisma.setting.upsert({
    where: { key: 'site_name' },
    update: {},
    create: { key: 'site_name', value: 'MyClass LMS' },
  });

  await prisma.setting.upsert({
    where: { key: 'max_file_size_mb' },
    update: {},
    create: { key: 'max_file_size_mb', value: '10' },
  });

  console.log('✅ Settings configured');
  console.log('\n🎉 Seed complete!');
  console.log('📧 Admin login: admin@myclass.in');
  console.log('🔑 Admin password: Admin@123456');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
