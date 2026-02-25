import { AppModule } from "@/src/app.module";
import { NestFactory } from "@nestjs/core";
import { TemporalWorkerService } from "./temporal-worker.service";

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const worker = app.get(TemporalWorkerService);
  await worker.start();
}

bootstrap().catch((err) => {
  console.error('Unexpected error in bootstrap', err);
  process.exit(1);
});