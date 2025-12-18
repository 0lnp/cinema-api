import { Module } from "@nestjs/common";
import { BcryptPasswordHasher } from "../securities/bcrypt_password_hasher";
import { JoseTokenGenerator } from "../identities/jose_token_generator";
import { CryptoTokenHasher } from "../securities/crypto_token_hasher";
import { PasswordHasher } from "src/domain/ports/password_hasher";
import { TokenGenerator } from "src/domain/ports/token_generator";
import { TokenHasher } from "src/domain/ports/token_hasher";
import { TokenBlacklistManager } from "src/domain/ports/token_blacklist_manager";
import { RedisTokenBlacklistManager } from "../identities/redis_token_blacklist_management";
import { PaymentGateway } from "src/domain/ports/payment_gateway";
import { XenditPaymentAdapter } from "../providers/xendit_payment_adapter";
import { ObjectStorage } from "src/domain/ports/object_storage";
import { MinioStorageAdapter } from "../providers/minio_storage_adapter";
import { TicketGenerator } from "src/domain/ports/ticket_generator";
import { PdfTicketGeneratorAdapter } from "../providers/pdf_ticket_generator_adapter";
import { EmailSender } from "src/domain/ports/email_sender";
import { SmtpEmailAdapter } from "../providers/smtp_email_adapter";
import { InfraModule } from "./infra_module";

@Module({
  imports: [InfraModule],
  providers: [
    {
      provide: PasswordHasher.name,
      useClass: BcryptPasswordHasher,
    },
    {
      provide: TokenGenerator.name,
      useClass: JoseTokenGenerator,
    },
    {
      provide: TokenHasher.name,
      useClass: CryptoTokenHasher,
    },
    {
      provide: TokenBlacklistManager.name,
      useClass: RedisTokenBlacklistManager,
    },
    {
      provide: PaymentGateway.name,
      useClass: XenditPaymentAdapter,
    },
    {
      provide: ObjectStorage.name,
      useClass: MinioStorageAdapter,
    },
    {
      provide: TicketGenerator.name,
      useClass: PdfTicketGeneratorAdapter,
    },
    {
      provide: EmailSender.name,
      useClass: SmtpEmailAdapter,
    },
  ],
  exports: [
    PasswordHasher.name,
    TokenGenerator.name,
    TokenHasher.name,
    TokenBlacklistManager.name,
    PaymentGateway.name,
    ObjectStorage.name,
    TicketGenerator.name,
    EmailSender.name,
  ],
})
export class PortModule {}
