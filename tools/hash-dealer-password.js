const bcrypt = require("bcryptjs");

async function main() {
  const password = process.argv[2];

  if (!password) {
    console.log("Usage: node tools/hash-dealer-password.js YOUR_PASSWORD");
    process.exit(1);
  }

  const hash = await bcrypt.hash(password, 10);
  console.log(hash);
}

main();