const env = require('./_keys/env')
const { mangoPayApi } = require('./settings')
const axios = require('axios')
const Querystring = require('querystring')

const options = {
  auth: { username: env.mangopay.clientId, password: env.mangopay.apiKey },
  headers: {
    'Content-Type': 'application/json',
  },
}

/*

FirstName string REQUIRED
The name of the user

LastName string REQUIRED
The last name of the user

Birthday timestamp REQUIRED
The date of birth of the user - be careful to set the right timezone (should be UTC) to avoid 00h becoming 23h (and hence interpreted as the day before)

Nationality CountryIso REQUIRED
The user’s nationality. ISO 3166-1 alpha-2 format is expected

CountryOfResidence CountryIso REQUIRED
The user’s country of residence. ISO 3166-1 alpha-2 format is expected

Email string REQUIRED
The person's email address (not more than 12 consecutive numbers) - must be a valid email

*/

const createUser = async (userData) => {
  const userObject = {
    FirstName: userData.displayName.split(' ')[0],
    LastName:
      userData.displayName.split(' ').length > 0 &&
      userData.displayName.split(' ')[1],
    Birthday: -258443002,
    Nationality: 'BG',
    CountryOfResidence: 'BG',
    Email: userData.email,
  }
  try {
    const response = await axios.post(
      `${mangoPayApi}` + '/users/natural',
      userObject,
      options
    )
    return response.data
  } catch (e) {
    console.log(e)
  }
}

/*

Owners list REQUIRED
An array of userIDs of who own's the wallet. For now, you only can set up a unique owner.

Description string REQUIRED
A desciption of the wallet

Currency CurrencyIso REQUIRED
The currency - should be ISO_4217 format

Tag string OPTIONAL
Custom data that you can add to this item

*/

const walletData = {
  Owners: ['81533197'],
  Description: 'A very cool wallet',
  Currency: 'EUR',
  Tag: 'Cloud function create a wallet',
}

const createWallet = async (userId) => {
  try {
    const response = await axios.post(
      `${mangoPayApi}` + '/wallets',
      walletData,
      options
    )
    return JSON.stringify(response.data)
  } catch (e) {
    console.log(e)
  }
}

/*

UserId string REQUIRED
The object owner's UserId

Currency CurrencyIso REQUIRED
The currency - should be ISO_4217 format

CardType CardType OPTIONAL
The type of card . The card type is optional, but the default parameter is "CB_VISA_MASTERCARD" .

*/

const userCardData = {
  UserId: '81533197',
  Currency: 'EUR',
  CardType: 'CB_VISA_MASTERCARD', // optional
}

const registerCard = async (userId) => {
  try {
    const preRegData = await axios.post(
      `${mangoPayApi}` + '/CardRegistrations',
      userCardData,
      options
    )

    const {
      Id,
      PreregistrationData,
      AccessKey,
      CardRegistrationURL,
    } = preRegData.data

    console.log(preRegData.data)

    const cardInfo = Querystring['stringify']({
      data: PreregistrationData,
      accessKeyRef: AccessKey,
      cardNumber: 4970101122334422,
      cardExpirationDate: 1020,
      cardCvx: 123,
    })

    const postCardInfo = await axios.post(CardRegistrationURL, cardInfo, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })

    console.log(postCardInfo.data)

    const finalizeCardReg = await axios.put(
      `${mangoPayApi}` + `/cardregistrations/${Id}`,
      { RegistrationData: postCardInfo.data },
      options
    )

    console.log(finalizeCardReg.data)
  } catch (e) {
    console.log(e)
  }
}

/*

AuthorId string REQUIRED
A user's ID

CreditedUserId string OPTIONAL
The user ID who is credited (defaults to the owner of the wallet)

CreditedWalletId string REQUIRED
The ID of the wallet where money will be credited

DebitedFunds Money REQUIRED
Information about the funds that are being debited

Fees Money REQUIRED
Information about the fees that were taken by the client for this transaction (and were hence transferred to the Client's platform wallet)

SecureModeReturnURL string REQUIRED
This is the URL where users are automatically redirected after 3D secure validation (if activated)

CardId string REQUIRED
The ID of a card

SecureMode SecureMode OPTIONAL
The SecureMode corresponds to '3D secure' for CB Visa and MasterCard. This field lets you activate it manually. The field lets you activate it automatically with "DEFAULT" (Secured Mode will be activated from €50 or when MANGOPAY detects there is a higher risk ), "FORCE" (if you wish to specifically force the secured mode).

Billing Billing OPTIONAL
Contains every useful informations related to the user billing

StatementDescriptor string OPTIONAL
A custom description to appear on the user's bank statement. It can be up to 10 characters long, and can only include alphanumeric characters or spaces. See here for important info. Note that each bank handles this information differently, some show less or no information.

Culture CultureCode OPTIONAL
The language to use for the payment page - needs to be the ISO code of the language

Tag string OPTIONAL
Custom data that you can add to this item

*/

const PayInData = {
  AuthorId: '81533197',
  DebitedFunds: {
    Currency: 'EUR',
    Amount: 1000,
  },
  Fees: {
    Currency: 'EUR',
    Amount: 0,
  },
  CreditedWalletId: '81425984',
  SecureModeReturnURL: 'http://my_redirect_url_after_payment.com',
  SecureMode: 'DEFAULT',
  CardID: '81538712',
}

const payToDAOStackWallet = async () => {
  try {
    const payInData = await axios.post(
      `${mangoPayApi}` + '/payins/card/direct',
      PayInData,
      options
    )

    return payInData.data
  } catch (e) {
    console.log(e)
  }
}

module.exports = {
  createUser,
  createWallet,
  registerCard,
  payToDAOStackWallet,
}
