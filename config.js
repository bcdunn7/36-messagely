/** Common config for message.ly */

// read .env files and make environmental variables
require("dotenv").config();

// to deal with invalid characters in password
const URI_DB_PASSWORD = `${encodeURIComponent(process.env.DB_PASSWORD)}`

const DB_URI = (process.env.NODE_ENV === "test")
    ? `postgresql://${process.env.DB_USER}:${URI_DB_PASSWORD}@localhost:${process.env.DB_PORT}/messagely_test`
    : `postgresql://${process.env.DB_USER}:${URI_DB_PASSWORD}@localhost:${process.env.DB_PORT}/messagely`;

const SECRET_KEY = process.env.SECRET_KEY || "secret";

const BCRYPT_WORK_FACTOR = 12;


module.exports = {
  DB_URI,
  SECRET_KEY,
  BCRYPT_WORK_FACTOR,
};