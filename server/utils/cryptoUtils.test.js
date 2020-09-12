const {saltHashPassword} = require('./cryptoUtils');

test("Create password with salt", () => {
  const input = 'password';
  const passwordData = saltHashPassword(input);

  expect(passwordData.salt.length).toBe(16);

  // 512 bits in hexa digest
  expect(passwordData.hexdigest.length).toBe(128);
});
