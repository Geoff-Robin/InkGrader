import "dotenv/config";
import { auth } from "../lib/auth";

const email = process.env.SEED_USER_EMAIL || "dev@inkgrader.local";
const password = process.env.SEED_USER_PASSWORD || "password123";
const name = process.env.SEED_USER_NAME || "Dev User";

async function main() {
  try {
    const { user } = await auth.api.signUpEmail({
      body: { name, email, password },
    });
    console.log(`Seeded user: ${user.email} (id: ${user.id})`);
  } catch (err: any) {
    const message = err?.body?.message || err?.message || "";
    if (err?.status === "UNPROCESSABLE_ENTITY" || /already exists/i.test(message)) {
      console.log(`User ${email} already exists, skipping.`);
      return;
    }
    throw err;
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });
