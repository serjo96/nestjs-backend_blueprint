import { MigrationInterface, QueryRunner } from "typeorm";

export class InitMigration1705767141673 implements MigrationInterface {
    name = 'InitMigration1705767141673'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "forgotten-password" ("id" uuid NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "token" character varying NOT NULL, "timestamp" TIMESTAMP NOT NULL, "userId" uuid, CONSTRAINT "REL_8444f972aa88860f65faa5239f" UNIQUE ("userId"), CONSTRAINT "PK_692554284d39999f8624d8debc2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."users_roles_enum" AS ENUM('guest', 'user', 'moderator', 'admin')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "password" character varying NOT NULL, "email" character varying NOT NULL, "login" character varying, "roles" "public"."users_roles_enum" NOT NULL DEFAULT 'user', "confirmed" boolean DEFAULT false, CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "profiles" ("id" uuid NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "name" character varying, "userId" uuid NOT NULL, CONSTRAINT "REL_315ecd98bd1a42dcf2ec4e2e98" UNIQUE ("userId"), CONSTRAINT "PK_8e520eb4da7dc01d0e190447c8e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_315ecd98bd1a42dcf2ec4e2e98" ON "profiles" ("userId") `);
        await queryRunner.query(`CREATE TABLE "email-verification" ("id" uuid NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "email" character varying NOT NULL, "emailToken" character varying NOT NULL, "timestamp" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_10e4ba7091f9d293d5f34d87286" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "forgotten-password" ADD CONSTRAINT "FK_8444f972aa88860f65faa5239fc" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "profiles" ADD CONSTRAINT "FK_315ecd98bd1a42dcf2ec4e2e985" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "profiles" DROP CONSTRAINT "FK_315ecd98bd1a42dcf2ec4e2e985"`);
        await queryRunner.query(`ALTER TABLE "forgotten-password" DROP CONSTRAINT "FK_8444f972aa88860f65faa5239fc"`);
        await queryRunner.query(`DROP TABLE "email-verification"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_315ecd98bd1a42dcf2ec4e2e98"`);
        await queryRunner.query(`DROP TABLE "profiles"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_roles_enum"`);
        await queryRunner.query(`DROP TABLE "forgotten-password"`);
    }

}
