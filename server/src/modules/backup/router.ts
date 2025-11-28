import Router from "koa-router";
import { reply } from "@modular-rest/server";
import * as service from "./service";

const name = "backup";

let backup = new Router();

backup.get("/", async (ctx) => {
  await service
    .createBackup()
    .then((_) => {
      ctx.body = reply.create("s");
    })
    .catch((error) => {
      console.log(error);
      ctx.status = 500;
      ctx.body = reply.create("f", {
        message: "Backup request failed, please inform the administrative.",
      });
    });
});

backup.get("/list", async (ctx) => {
  try {
    ctx.body = reply.create("s", {
      list: await service.getBackupList(),
    });
  } catch (error: any) {
    ctx.status = 500;
    ctx.body = reply.create("f", error);
  }
});

backup.delete("/:fileName", (ctx) => {
  let fileName = ctx.params.fileName;
  service.removeBackupFile(fileName);

  ctx.body = reply.create("s");
});

backup.post("/", async (ctx: any) => {
  let file = ctx.request.files ? ctx.request.files.file : null;
  let result;

  if (!file) {
    ctx.status = 412;
    result = reply.create("f", {
      message: "file field required",
    });
  } else {
    await service
      .insertBackup(file)
      .then((_) => {
        result = reply.create("s", {
          message: "Backup inserted",
        });
      })
      .catch((_) => {
        ctx.status = 500;
        result = reply.create("f", _);
      });
  }

  ctx.body = result;
});

backup.post("/restore", async (ctx) => {
  const { fileName } = ctx.body as any;

  if (!fileName) {
    ctx.status = 400;
    ctx.body = reply.create("f", {
      message: '"fileName" parameter is required.',
    });
    return; // Added return to avoid continuation
  }

  await service
    .restore(fileName)
    .then((_) => {
      ctx.body = reply.create("s");
    })
    .catch((_) => {
      ctx.status = 400;
      ctx.body = reply.create("f", _);
    });
});

module.exports.name = name;
module.exports.main = backup;
