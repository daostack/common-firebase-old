const template = `
Notice to Admin
New common created and pending approval.

<a href="{{commonLink}}">{{commonLink}}</a>

User Full Name: {{userName}}
User ID: {{userId}}
User Email: {{userEmail}}
Created on: {{commonCreatedOn}}
Log/info:

{{log}}

Common Id: {{commonId}}
Common name: {{commonName}}
Short Description: {{description}}
About: {{about}}
Payment type: {{paymentType}}
Min. contribution: {{minContribution}}
`;

const emailStubs = {
  commonLink: {
    required: true
  },
  userName: {
    required: true
  },
  userId: {
    required: true
  },
  userEmail: {
    required: true
  },
  commonCreatedOn: {
    required: true
  },
  log: {
    required: true
  },
  commonId: {
    required: true
  },
  commonName: {
    required: true
  },
  description: {
    required: true
  },
  about: {
    required: true
  },
  paymentType: {
    required: true
  },
  minContribution: {
    required: true
  }
};

module.exports = {
  subject: 'New Common pending approval',
  emailStubs,
  template
};
