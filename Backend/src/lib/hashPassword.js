import bcrypt from "bcryptjs";

export const hashedPassword = async (Password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(Password, salt);
};

export const comparePassword = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};
