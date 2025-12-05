import * as path from "path";
import { createRest } from "@modular-rest/server";
import { permissionGroups } from "./permissions";

// Load .env file
require("dotenv").config({
  path: path.resolve(__dirname, "../.env"),
});

const uploadPath = path.join(__dirname, "..", "uploads");
const backupPath = path.join(__dirname, "..", "backups");

console.log("uploadPath", uploadPath);
console.log("ADMIN_EMAIL:", process.env.ADMIN_EMAIL || "NOT SET");
console.log(
  "ADMIN_PASSWORD:",
  process.env.ADMIN_PASSWORD ? "***SET***" : "NOT SET"
);

// Create the rest server configuration
const restConfig: any = {
  port: 8081,
  modulesPath: path.join(__dirname, "..", "dist", "modules"),
  uploadDirectoryConfig: {
    directory: uploadPath,
  },
  staticPaths: [
    {
      urlPath: "/backup-files",
      directory: backupPath,
    },
  ],
  mongo: {
    mongoBaseAddress: process.env.MONGODB_URL || "mongodb://mongo:27017",
    dbPrefix: "goranee_",
  },
  onBeforeInit: (app: any) => {
    // Add Health cheker route
    let Router = require("koa-router");
    let healthCheck = new Router();
    healthCheck.get("/health", (ctx: any) => (ctx.body = "success"));
    app.use(healthCheck.routes());
  },
  permissionGroups: permissionGroups,
  // TODO: Add verification code generator method
  verificationCodeGeneratorMethod: function () {
    return "123456";
  },
};

// Only add adminUser if both email and password are provided
if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
  restConfig.adminUser = {
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
  };
  console.log(
    "Admin user will be created with email:",
    process.env.ADMIN_EMAIL
  );
} else {
  console.log("Admin user configuration skipped - email or password not set");
}

// Create the rest server
const app = createRest(restConfig);
