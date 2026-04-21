import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AuthService } from './auth/auth.service';

async function bootstrap() {
  const application = await NestFactory.createApplicationContext(AppModule);
  const authService = application.get(AuthService);

  const args = process.argv.slice(2);
  if (args.length < 3) {
    console.error('Usage: npm run create-user -- <username> <password> <role>');
    console.error('Roles: ADMIN, STAFF');
    console.error('Example: npm run create-user -- admin admin123 ADMIN');
    await application.close();
    process.exit(1);
  }

  const [username, password, roleStr] = args;
  const upperRole = roleStr.toUpperCase();
  
  if (!['ADMIN', 'STAFF'].includes(upperRole)) {
    console.error('Role must be ADMIN or STAFF');
    await application.close();
    process.exit(1);
  }

  const role = upperRole as 'ADMIN' | 'STAFF';

  try {
    const user = await authService.createUser({ username, password, role });
    console.log(`✅ User created successfully!`);
    console.log(`   Username: ${user.username}`);
    console.log(`   Role:     ${user.role}`);
    console.log(`   ID:       ${user.id}`);
  } catch (error: any) {
    console.error(`❌ Failed to create user: ${error.message}`);
  } finally {
    await application.close();
    process.exit(0);
  }
}

bootstrap();
