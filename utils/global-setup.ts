import { FullConfig } from "@playwright/test";
import dotenv from "dotenv";

async function globalSetup(config: FullConfig) {
  const testEnv = process.env.test_env || process.env.TEST_ENV || "demo";

  if (testEnv) {
    dotenv.config({
      path: `env/${testEnv}.env`,
      override: false,
    });
  }
}
export default globalSetup;
