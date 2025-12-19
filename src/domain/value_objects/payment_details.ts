import { ClassProps } from "src/shared/types/class_props";

export class PaymentDetails {
  public readonly paymentReferenceId: string;
  public readonly paymentUrl: string;
  public readonly paymentMethod: string | null;
  public readonly paidAt: Date | null;

  private constructor(props: ClassProps<PaymentDetails>) {
    this.paymentReferenceId = props.paymentReferenceId;
    this.paymentUrl = props.paymentUrl;
    this.paymentMethod = props.paymentMethod;
    this.paidAt = props.paidAt;
  }

  public static create(
    paymentReferenceId: string,
    paymentUrl: string,
  ): PaymentDetails {
    return new PaymentDetails({
      paymentReferenceId,
      paymentUrl,
      paymentMethod: null,
      paidAt: null,
    });
  }

  public static fromPersistence(
    props: ClassProps<PaymentDetails>,
  ): PaymentDetails {
    return new PaymentDetails(props);
  }

  public withPaymentCompleted(
    paymentMethod: string,
    paidAt: Date,
  ): PaymentDetails {
    return new PaymentDetails({
      paymentReferenceId: this.paymentReferenceId,
      paymentUrl: this.paymentUrl,
      paymentMethod,
      paidAt,
    });
  }
}
