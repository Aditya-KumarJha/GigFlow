export const generateOTP = (length = 6, expiryMinutes = 10) => {
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;

  const otp = Math.floor(min + Math.random() * (max - min + 1)).toString();

  const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

  return {
    code: otp,
    expiresAt,
  };
};
