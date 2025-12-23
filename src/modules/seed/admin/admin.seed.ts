import { NestFactory } from '@nestjs/core';
import { AdminSeederModule } from './admin.module';
import { AdminSeederService } from './service/admin.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AdminSeederModule);

  try {
    const seederService = app.get(AdminSeederService);
    await seederService.seed();
    console.log('Admin seeding completed successfully');
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  } finally {
    await app.close();
    process.exit(0);
  }
}

bootstrap().catch((error) => {
  console.error('Error during bootstrap:', error);
  process.exit(1);
});
