import * as fs from "fs";
import * as path from "path";

const logFilePath = path.join(__dirname, "../..", "request_logs.txt");

export const requestLogger = async (ctx: any, next: any) => {
  if (ctx.url.includes("/file")) {
    const logEntry = {
      type: "REQUEST",
      timestamp: new Date().toISOString(),
      method: ctx.method,
      url: ctx.url,
      headers: ctx.headers,
      query: ctx.query,
      // We check request.body and request.files (populated by koa-body)
      body: ctx.request.body,
      files: ctx.request.files
        ? Object.keys(ctx.request.files).map((key) => ({
            key,
            name:
              ctx.request.files[key].name ||
              ctx.request.files[key].originalFilename,
            size: ctx.request.files[key].size,
            type: ctx.request.files[key].type || ctx.request.files[key].mimetype,
          }))
        : [],
    };

    fs.appendFileSync(
      logFilePath,
      JSON.stringify(logEntry, null, 2) + "\n---\n"
    );
  }

  await next();

  if (ctx.url.includes("/file")) {
    const responseLog = {
      type: "RESPONSE",
      timestamp: new Date().toISOString(),
      url: ctx.url,
      status: ctx.status,
      body: ctx.body,
    };
    fs.appendFileSync(
      logFilePath,
      JSON.stringify(responseLog, null, 2) + "\n====================\n"
    );
  }
};
