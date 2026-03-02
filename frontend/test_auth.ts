import "dotenv/config";
import { auth } from "./lib/auth";

async function test() {
  try {
    const user = await auth.api.signUpEmail({
      body: {
        email: "test@example.com",
        password: "password123",
        name: "Test User",
      },
    });
    console.log("Success:", user);
  } catch (err) {
    console.error("Error creating user:", err);
  }
}

test();
