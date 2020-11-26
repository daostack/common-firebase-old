export interface ICircleCreateCardResponse {
  data: {
    id: string;

    billingDetails: ICircleBillingDetails;

    metadata: {
      email: string;
      phoneNumber: string;
    }

    expMonth: number;
    expYear: number;
    network: 'VISA' | 'MASTERCARD';
    last4: string;
    createDate: Date;
    updateDate: Date;
  }
}



export interface ICircleCreateCardPayload {
  /**
   * Unique idempotency key. This key is utilized to ensure
   * exactly-once execution of mutating requests.
   */
  idempotencyKey: string;

  /**
   * Unique identifier of the public key used in encryption.
   */
  keyId: string;

  /**
   * PGP encrypted json string. The object format given here needs to
   * be stringified and PGP encrypted before it is sent to the server,
   * so encryptedData will end up as a string, rather than an object.
   */
  encryptedData: string;

  billingDetails: ICircleBillingDetails

  /**
   * Two digit number representing the card's expiration month.
   */
  expMonth: number;

  /**
   * Four digit number representing the card's expiration year.
   */
  expYear: number;


  metadata: {
    /**
     * Email of the user
     */
    email: string;

    /**
     * Hash of the session identifier; typically of the end user.
     */
    sessionId: string;

    /**
     * Single IPv4 or IPv6 address of user
     */
    ipAddress: string;
  }
}

interface ICircleBillingDetails {
  /**
   * Full name of the card or bank account holder.
   */
  name: string;

  /**
   * City portion of the address.
   */
  city: string;

  /**
   * Country portion of the address. Formatted as a
   * two-letter country code specified in ISO 3166-1 alpha-2.
   */
  country: string;

  /**
   * Line one of the street address.
   */
  line1: string;

  /**
   * Line two of the street address. Optional
   */
  line2: string;

  /**
   * State / County / Province / Region portion of the address. It is optional
   * except if the country is US or Canada district is required and
   * should use the two-letter code for the subdivision.
   */
  district?: string;

  /**
   * Postal / ZIP code of the address.
   */
  postalCode: string;
}