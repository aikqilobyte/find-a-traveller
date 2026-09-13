export interface PaymentProvider {
  /** Name shown in the UI and stored on payments.payment_method. */
  readonly method: string;
  /** True when this provider is actually configured and safe to use. */
  isConfigured(): boolean;
}
