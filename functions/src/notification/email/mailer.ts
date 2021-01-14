import sendgrid from '@sendgrid/mail';

import { env } from '../../constants';
import { getSecret } from '../../settings';

const SENDGRID_APIKEY = 'SENDGRID_APIKEY';

const setApiKey = async () => {
  const apiKey = await getSecret(SENDGRID_APIKEY);
  sendgrid.setApiKey(apiKey);
  env.mail.SENDGRID_API_KEY = apiKey;
}

export const sendMail = async (dest: string, subject: string, message: string, from = env.mail.sender, bcc = null): Promise<void> => {
  // if SENDGRID_API_KEY has the default value of production SENDGRID_API_KEY, get key and save in env
  env.mail.SENDGRID_API_KEY === 'SG.Gxxxxx' && await setApiKey();  

  await sendgrid.send({
    to: dest,
    from,
    bcc,
    subject,
    text: message,
    html: message
  });
};