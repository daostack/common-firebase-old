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
  let { template, subject } = templates[templateKey];

  if(!template) {
    throw new Error(`The requested template (${templateKey}) cannot be found`);
  }

  console.log(payload);

  if(payload.emailStubs) {
    for(const stub in payload.emailStubs) {
      template = template.replace(`{{${stub}}}`, payload.emailStubs[stub])
    }
  }

  if(payload.subjectStubs) {
    for(const stub in payload.subjectStubs) {
      subject = subject.replace(`{{${stub}}}`, payload.subjectStubs[stub])
    }
  }

  return {
    template,
    subject
  };
}

module.exports = {
  getTemplatedEmail
}
