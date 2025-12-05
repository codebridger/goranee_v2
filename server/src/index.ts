import * as path from "path";
import { createRest } from "@modular-rest/server";
import { permissionGroups } from "./permissions";

// Load .env file
require("dotenv").config({
  path: path.resolve(__dirname, "../.env"),
});

const uploadPath = path.join(__dirname, "..", "uploads");

console.log("uploadPath", uploadPath);

// Create the rest server
// The createRest function returns a promise
const app = createRest({
  port: 8081,
  modulesPath: path.join(__dirname, "..", "dist", "modules"),
  staticPath: {
    path: "/assets",
    actualPath: uploadPath,
  },
  mongo: {
    mongoBaseAddress: "mongodb://localhost:27017",
    dbPrefix: "goranee_",
  },
  onBeforeInit: (app) => {
    // Add Health cheker route
    let Router = require("koa-router");
    let healthCheck = new Router();
    healthCheck.get("/health", (ctx: any) => (ctx.body = "success"));
    app.use(healthCheck.routes());

    // Add static dirs
    // TODO: Add static dirs for backups
    // app.use(
    //   koaStatic({
    //     rootDir: join(__dirname, "backups"),
    //     rootPath: "/backup-files/",
    //   })
    // );
  },
  adminUser: {
    email: process.env.ADMIN_EMAIL || "admin@changeme.com",
    password: process.env.ADMIN_PASSWORD || "changeme123",
  },
  permissionGroups: permissionGroups,
  // TODO: Add verification code generator method
  verificationCodeGeneratorMethod: function () {
    return "123456";
  },
});
