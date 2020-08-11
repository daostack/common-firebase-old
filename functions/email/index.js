const requestToJoinSubmitted = require('./templates/requestToJoinSubmitted');

const templates = {
  requestToJoinSubmitted
}

/***
 *
 * @param {
 *  'requestToJoinSubmitted'
 * } templateKey
 *
 * @param {{
 *   emailStubs: object
 *   subjectStubs: object
 *   to: string
 * }} payload
 *
 * @return {{
 *   template: string The templated body
 *   subject: string The templated subject
 * }}
 */
const getTemplatedEmail = (templateKey, payload) => {
  let { template, subject, emailStubs, subjectStubs } = templates[templateKey];

  if(!template) {
    throw new Error(`The requested template (${templateKey}) cannot be found`);
  }

  if(payload.emailStubs) {
    for(const stub in emailStubs) {
      if(emailStubs[stub].required && !payload.emailStubs[stub]) {
        throw new Error(`Required stub ${stub} was not provided for email template`)
      }
    }

    for(const stub in payload.emailStubs) {
      template = template.replace(`{{${stub}}}`, payload.emailStubs[stub])
    }
  } else if(emailStubs && Object.keys(emailStubs).some(stub => emailStubs[stub].required)) {
    throw new Error("This email template has required stubs, but you have not provided any!");
  }

  if(payload.subjectStubs) {
    for(const stub in subjectStubs) {
      if(subjectStubs[stub].required && !payload.subjectStubs[stub]) {
        throw new Error(`Required stub ${stub} was not provided for subject template`)
      }
    }

    for(const stub in payload.subjectStubs) {
      subject = subject.replace(`{{${stub}}}`, payload.subjectStubs[stub])
    }
  } else if(subjectStubs && Object.keys(subjectStubs).some(stub => subjectStubs[stub].required)) {
    throw new Error("This subject template has required stubs, but you have not provided any!");
  }

  return {
    template,
    subject
  };
}

module.exports = {
  getTemplatedEmail
}
