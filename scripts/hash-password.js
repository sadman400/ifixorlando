const plainTextPassword = process.argv[2];

if (!plainTextPassword) {
  console.error("Usage: node scripts/hash-password.js <password>");
  process.exit(1);
}

async function main() {
  const { default: bcrypt } = await import("bcryptjs");
  const hash = await bcrypt.hash(plainTextPassword, 12);
  console.log(hash);
}

main().catch((error) => {
  console.error("Failed to generate password hash.");
  console.error(error);
  process.exit(1);
});
