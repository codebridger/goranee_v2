import {
  defineCollection,
  Schema,
  schemas,
  Permission,
} from "@modular-rest/server";

let SongChordSchema = new Schema({
  rowIndex: Number,
  column: String,
  title: String,
  table: String,
  chord: String,
  keySignature: String,
  type: { type: String, enum: ["regular", "chromatic"], default: "regular" },
});
let VocalNoteSchema = new Schema({
  note: String,
  index: Number,
  table: String,
});

let SongSectionSchema = new Schema({
  title: String,
  direction: String,
  lines: [{ chords: String, text: String }],
});

// Language-specific content schema for songs
let SongLanguageContentSchema = new Schema(
  {
    title: { type: String, required: true },
    title_seo: { type: String },
    sections: [SongSectionSchema],
  },
  { _id: false }
); // No _id for nested documents

// Language-specific content schema for artists
let ArtistLanguageContentSchema = new Schema(
  {
    name: { type: String, required: true },
    name_seo: { type: String },
    bio: { type: String },
  },
  { _id: false }
); // No _id for nested documents

let MelodySchema = new Schema({
  title: String,
  file: schemas.file,
});

export default [
  defineCollection({
    database: "tab",
    collection: "genre",
    schema: new Schema({
      title: String,
      title_seo: { type: String },
      image: schemas.file,
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
    database: "tab",
    collection: "artist",
    schema: new Schema({
      // Language-specific content as nested object with lang codes as keys
      content: {
        "ckb-IR": ArtistLanguageContentSchema,
        "ckb-Latn": ArtistLanguageContentSchema,
        kmr: ArtistLanguageContentSchema,
        hac: ArtistLanguageContentSchema,
      },
      // Default language (for backward compatibility and fallback)
      defaultLang: {
        type: String,
        enum: ["ckb-IR", "ckb-Latn", "kmr", "hac"],
        default: "ckb-IR",
      },
      // Shared content (not language-specific)
      chords: { type: Number, default: 0 },
      image: schemas.file,
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
    database: "tab",
    collection: "song",
    schema: new Schema({
      // Language-specific content as nested object with lang codes as keys
      content: {
        "ckb-IR": SongLanguageContentSchema,
        "ckb-Latn": SongLanguageContentSchema,
        kmr: SongLanguageContentSchema,
        hac: SongLanguageContentSchema,
      },
      // Default language (for backward compatibility and fallback)
      defaultLang: {
        type: String,
        enum: ["ckb-IR", "ckb-Latn", "kmr", "hac"],
        default: "ckb-IR",
      },
      // Shared content (not language-specific)
      rhythm: { type: String },
      artists: [{ type: Schema.Types.ObjectId, ref: "artist", default: [] }],
      genres: [{ type: Schema.Types.ObjectId, ref: "genre", default: [] }],
      chords: {
        keySignature: { type: String, enum: ["major", "minor"] },
        vocalNote: VocalNoteSchema,
        list: [SongChordSchema],
      },
      image: schemas.file,
      melodies: [MelodySchema],
      // Timestamps
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now },
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
];
