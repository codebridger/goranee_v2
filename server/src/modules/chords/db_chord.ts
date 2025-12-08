import { defineCollection, Schema, Permission } from "@modular-rest/server";

const TableRowSchema = new Schema({
  major: { type: Schema.Types.ObjectId, ref: "chord", required: true },
  naturalMinor: { type: Schema.Types.ObjectId, ref: "chord", required: true },
  harmonicMinor: { type: Schema.Types.ObjectId, ref: "chord", required: true },
  melodicMinor: { type: Schema.Types.ObjectId, ref: "chord", required: true },
});

const TableChromaticRowSchema = new Schema({
  one: { type: Schema.Types.ObjectId, ref: "chord" },
  two: { type: Schema.Types.ObjectId, ref: "chord" },
  three: { type: Schema.Types.ObjectId, ref: "chord" },
  four: { type: Schema.Types.ObjectId, ref: "chord" },
});

export const RhythmCollection = defineCollection({
  database: "chord",
  collection: "rhythm",
  schema: new Schema({
    title: { type: String, unique: true, required: true },
    description: String,
  }),
  permissions: [
    new Permission({
      accessType: "god_access",
      write: true,
      read: true,
    }),
    new Permission({
      accessType: "anonymous_access",
      read: true,
    }),
  ],
});

export default [
  defineCollection({
    database: "chord",
    collection: "type",
    schema: new Schema({
      title: { type: String, unique: true, required: true },
      description: String,
    }),
    permissions: [
      new Permission({
        accessType: "god_access",
        write: true,
        read: true,
      }),
      new Permission({
        accessType: "anonymous_access",
        read: true,
      }),
    ],
  }),

  defineCollection({
    database: "chord",
    collection: "keysignature",
    schema: new Schema({
      minor: { type: String, unique: true, required: true },
      major: { type: String, unique: true, required: true },
      description: String,
    }),
    permissions: [
      new Permission({
        accessType: "god_access",
        write: true,
        read: true,
      }),
      new Permission({
        accessType: "anonymous_access",
        read: true,
      }),
    ],
  }),

  defineCollection({
    database: "chord",
    collection: "chord",
    schema: new Schema({
      title: { type: String, unique: true, required: true },
      type: { type: Schema.Types.ObjectId, ref: "type", required: true },
    }),
    permissions: [
      new Permission({
        accessType: "god_access",
        write: true,
        read: true,
      }),
      new Permission({
        accessType: "anonymous_access",
        read: true,
      }),
    ],
  }),

  defineCollection({
    database: "chord",
    collection: "table",
    schema: new Schema({
      keySignature: {
        type: Schema.Types.ObjectId,
        ref: "keysignature",
        required: true,
      },
      type: { type: Schema.Types.ObjectId, ref: "type", required: true },
      rows: [TableRowSchema],
      vocalRows: { type: [String], default: [] },
      chromaticRows: [TableChromaticRowSchema],
    }),
    permissions: [
      new Permission({
        accessType: "god_access",
        write: true,
        read: true,
      }),
      new Permission({
        accessType: "anonymous_access",
        read: true,
      }),
    ],
  }),

  RhythmCollection,
];
