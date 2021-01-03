const template = `
Hello {{userName}},
<br /><br />
Congratulations! <br />
Your proposal "{{proposal}}" to {{commonName}} has been approved. To send you the funds ({{fundingAmount}}), we first need you to complete some missing information.
<br /><br />
Please include the following details in a return email:
Street address, town/city, state, country, zip code.
<br /><br />
Once received, we will send you another email with instructions on how to proceed and get the funds.
<br /><br />
For more information you can contact us any time using our  <a href="{{supportChatLink}}">support chat</a>
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

export const userFundingRequestAcceptedUnknown = {
  subject: 'Your funding proposal was approved',
  emailStubs,
  template
};
