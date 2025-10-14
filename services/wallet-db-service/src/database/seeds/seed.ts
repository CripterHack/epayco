import 'reflect-metadata';
import { config as loadEnv } from 'dotenv';
import { existsSync } from 'fs';
import { join } from 'path';
import dataSource from '../data-source';
import { CustomerEntity } from '../../modules/customers/entities/customer.entity';
import { WalletEntity } from '../../modules/wallets/entities/wallet.entity';

const envCandidates = ['.env.local', '.env'];
const envPath = envCandidates
  .map((file) => join(process.cwd(), file))
  .find((candidate) => existsSync(candidate));

if (envPath) {
  loadEnv({ path: envPath });
} else {
  loadEnv();
}

async function run(): Promise<void> {
  await dataSource.initialize();
  try {
    await dataSource.runMigrations();

    const document = '9999999999';
    const customerRepository = dataSource.getRepository(CustomerEntity);
    const walletRepository = dataSource.getRepository(WalletEntity);

    let customer = await customerRepository.findOne({ where: { document } });

    if (!customer) {
      customer = customerRepository.create({
        document,
        fullName: 'Cliente Demo',
        email: 'demo.wallet@example.com',
        phone: '3000000000',
      });
      customer = await customerRepository.save(customer);
      // create wallet skeleton for the customer immediately after creation
      const wallet = walletRepository.create({ customerId: customer.id, balance: '0.00' });
      await walletRepository.save(wallet);
      console.info('Seeded customer and wallet for document', document);
    } else {
      const existingWallet = await walletRepository.findOne({ where: { customerId: customer.id } });
      if (!existingWallet) {
        const wallet = walletRepository.create({ customerId: customer.id, balance: '0.00' });
        await walletRepository.save(wallet);
        console.info('Created missing wallet for existing demo customer');
      } else {
        console.info('Demo customer and wallet already seeded');
      }
    }
  } finally {
    await dataSource.destroy();
  }
}

run().catch((error) => {
  console.error('Seed execution failed', error);
  process.exitCode = 1;
});
