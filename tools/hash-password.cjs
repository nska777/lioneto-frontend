const bcrypt = require("bcryptjs");

const password = process.argv[2];

if (!password) {
  console.log("Usage: node tools/hash-password.cjs YOUR_PASSWORD");
  process.exit(1);
}

bcrypt
  .hash(password, 10)
  .then((hash) => {
    console.log(hash);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });