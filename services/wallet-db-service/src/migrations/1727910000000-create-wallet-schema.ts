import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateWalletSchema1727910000000 implements MigrationInterface {
  public readonly name = 'CreateWalletSchema1727910000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'customers',
        columns: [
          {
            name: 'id',
            type: 'char',
            length: '36',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: '(UUID())',
          },
          {
            name: 'document',
            type: 'varchar',
            length: '20',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'full_name',
            type: 'varchar',
            length: '160',
            isNullable: false,
          },
          {
            name: 'email',
            type: 'varchar',
            length: '160',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'phone',
            type: 'varchar',
            length: '20',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            precision: 6,
            default: 'CURRENT_TIMESTAMP(6)',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            precision: 6,
            default: 'CURRENT_TIMESTAMP(6)',
            onUpdate: 'CURRENT_TIMESTAMP(6)',
          },
        ],
        indices: [
          {
            name: 'IDX_customers_document_phone',
            columnNames: ['document', 'phone'],
          },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'wallets',
        columns: [
          {
            name: 'id',
            type: 'char',
            length: '36',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: '(UUID())',
          },
          {
            name: 'customer_id',
            type: 'char',
            length: '36',
            isNullable: false,
          },
          {
            name: 'balance',
            type: 'decimal',
            precision: 14,
            scale: 2,
            default: '0.00',
          },
          {
            name: 'created_at',
            type: 'timestamp',
            precision: 6,
            default: 'CURRENT_TIMESTAMP(6)',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            precision: 6,
            default: 'CURRENT_TIMESTAMP(6)',
            onUpdate: 'CURRENT_TIMESTAMP(6)',
          },
        ],
        indices: [
          {
            name: 'IDX_wallets_customer_id',
            columnNames: ['customer_id'],
            isUnique: true,
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'wallets',
      new TableForeignKey({
        name: 'FK_wallets_customer_id',
        columnNames: ['customer_id'],
        referencedTableName: 'customers',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'top_ups',
        columns: [
          {
            name: 'id',
            type: 'char',
            length: '36',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: '(UUID())',
          },
          {
            name: 'wallet_id',
            type: 'char',
            length: '36',
            isNullable: false,
          },
          {
            name: 'amount',
            type: 'decimal',
            precision: 14,
            scale: 2,
            isNullable: false,
          },
          {
            name: 'metadata',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            precision: 6,
            default: 'CURRENT_TIMESTAMP(6)',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            precision: 6,
            default: 'CURRENT_TIMESTAMP(6)',
            onUpdate: 'CURRENT_TIMESTAMP(6)',
          },
        ],
        indices: [
          {
            name: 'IDX_top_ups_wallet_id',
            columnNames: ['wallet_id'],
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'top_ups',
      new TableForeignKey({
        name: 'FK_top_ups_wallet_id',
        columnNames: ['wallet_id'],
        referencedTableName: 'wallets',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'payment_sessions',
        columns: [
          {
            name: 'id',
            type: 'char',
            length: '36',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: '(UUID())',
          },
          {
            name: 'wallet_id',
            type: 'char',
            length: '36',
            isNullable: false,
          },
          {
            name: 'session_id',
            type: 'char',
            length: '36',
            isNullable: false,
          },
          {
            name: 'amount',
            type: 'decimal',
            precision: 14,
            scale: 2,
            isNullable: false,
          },
          {
            name: 'token_hash',
            type: 'varchar',
            length: '128',
            isNullable: false,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['PENDING', 'CONFIRMED', 'CANCELLED', 'EXPIRED'],
            default: "'PENDING'",
          },
          {
            name: 'expires_at',
            type: 'timestamp',
            precision: 6,
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            precision: 6,
            default: 'CURRENT_TIMESTAMP(6)',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            precision: 6,
            default: 'CURRENT_TIMESTAMP(6)',
            onUpdate: 'CURRENT_TIMESTAMP(6)',
          },
        ],
        indices: [
          {
            name: 'IDX_payment_sessions_wallet_id',
            columnNames: ['wallet_id'],
          },
          {
            name: 'IDX_payment_sessions_status',
            columnNames: ['status'],
          },
          {
            name: 'IDX_payment_sessions_session_id',
            columnNames: ['session_id'],
            isUnique: true,
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'payment_sessions',
      new TableForeignKey({
        name: 'FK_payment_sessions_wallet_id',
        columnNames: ['wallet_id'],
        referencedTableName: 'wallets',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'payments',
        columns: [
          {
            name: 'id',
            type: 'char',
            length: '36',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: '(UUID())',
          },
          {
            name: 'wallet_id',
            type: 'char',
            length: '36',
            isNullable: false,
          },
          {
            name: 'session_id',
            type: 'char',
            length: '36',
            isNullable: false,
          },
          {
            name: 'amount',
            type: 'decimal',
            precision: 14,
            scale: 2,
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            precision: 6,
            default: 'CURRENT_TIMESTAMP(6)',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            precision: 6,
            default: 'CURRENT_TIMESTAMP(6)',
            onUpdate: 'CURRENT_TIMESTAMP(6)',
          },
        ],
        indices: [
          {
            name: 'IDX_payments_wallet_id',
            columnNames: ['wallet_id'],
          },
          {
            name: 'IDX_payments_session_id',
            columnNames: ['session_id'],
            isUnique: true,
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKeys('payments', [
      new TableForeignKey({
        name: 'FK_payments_wallet_id',
        columnNames: ['wallet_id'],
        referencedTableName: 'wallets',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      }),
      new TableForeignKey({
        name: 'FK_payments_session_id',
        columnNames: ['session_id'],
        referencedTableName: 'payment_sessions',
        referencedColumnNames: ['session_id'],
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('payments', 'FK_payments_session_id');
    await queryRunner.dropForeignKey('payments', 'FK_payments_wallet_id');
    await queryRunner.dropTable('payments');

    await queryRunner.dropForeignKey('payment_sessions', 'FK_payment_sessions_wallet_id');
    await queryRunner.dropTable('payment_sessions');

    await queryRunner.dropForeignKey('top_ups', 'FK_top_ups_wallet_id');
    await queryRunner.dropTable('top_ups');

    await queryRunner.dropForeignKey('wallets', 'FK_wallets_customer_id');
    await queryRunner.dropTable('wallets');

    await queryRunner.dropTable('customers');
  }
}
