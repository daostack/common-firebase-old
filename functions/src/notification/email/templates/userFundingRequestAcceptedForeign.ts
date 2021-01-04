const template = `
Hello {{userName}},
<br /><br />
Congratulations! <br />
Your proposal {{proposal}} to {{commonName}} has been approved. To receive the funds ({{fundingAmount}}) you will need to provide your bank account details, as well as some identification information.
We will reach out soon with further instructions on how to submit those details.
When submitted we will be able to initiate the transaction. It may take up to 10 days for the funds to be transfered. 
<br /><br /><br /><br />
Please note that funds are sent via an international bank wire. Your bank might charge fees for receipt of wires, currency conversion or other applicable fees. Due to those fees, the amount you’ll receive may be lower than the original requested amount.
To ensure transparency, after receiving the funds and paying for the proposed products or services, you will be required to submit Invoices and/or receipts for the payments made.
For more information you can contact us any time by replying to this email.
<br /><br />
For more information you can contact us any time by replying to this email.
<br /><br />
Common,<br />
Collaborative Social Action.
`;

const emailStubs = {
  userName: {
    required: true
  },
  proposal: {
    required: true
  },
  fundingAmount: {
    required: true
  },
  commonName: {
    required: true
  },
  supportChatLink: {
    required: true
  }
};

export const userFundingRequestAcceptedForeign = {
  subject: 'Your funding proposal was approved',
  emailStubs,
  template
};
