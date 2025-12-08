import { smtpTransport } from "./nodemailer";

function getRandomString(length: number): string {
  var result = "";
  var characters = "abcdefghijklmnopqrstuvwxyz1234567890";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

function sendMail(email: string, code: string): Promise<any> {
  let message = "کد تایید ایمیل شما: ";

  let mailOption = {
    to: email,
    subject: "goranee.ir - تایید ایمیل",
    text: message + code,
  };

  // console.table(mailOption);

  return new Promise((done, reject) => {
    // TODO: Fix this type error
    // @ts-ignore
    smtpTransport.sendMail(mailOption, (error, info) => {
      if (error) reject(error);
      else done(info);
    });
  });
}

export const generateVerificationCode = (
  id: string,
  idType?: string
): string => {
  const code = getRandomString(5);

  sendMail(id, code);

  return code;
};
