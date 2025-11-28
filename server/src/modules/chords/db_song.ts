import { defineCollection, Schema, schemas, Permission } from '@modular-rest/server';

let SongChordSchema = new Schema({
    rowIndex: Number,
    column: String,
    title: String,
    table: String,
    chord: String,
    keySignature: String,
    type: { type: String, enum: ['regular', 'chromatic'], default: 'regular' },
})
let VocalNoteSchema = new Schema({
    note: String,
    index: Number,
    table: String,
})

let SongSectionSchema = new Schema({
    title: String,
    direction: String,
    lines: [{ chords: String, text: String }]
})

let MelodySchema = new Schema({
    title: String,
    file: schemas.file,
})

export default [
    defineCollection({
        database: 'tab',
        collection: 'genre',
        schema: new Schema({
            title: String,
            title_seo: { type: String },
            image: schemas.file,
        }),
        permissions: [
            new Permission({
                accessType: 'god_access',
                write: true,
                read: true,
            }),
            new Permission({
                accessType: 'anonymous_access',
                read: true,
            })
        ],
    }),

    defineCollection({
        database: 'tab',
        collection: 'artist',
        schema: new Schema({
            name: { type: String, required: true },
            name_seo: { type: String },
            chords: { type: Number, default: 0 },
            image: schemas.file,
        }),
        permissions: [
            new Permission({
                accessType: 'god_access',
                write: true,
                read: true,
            }),
            new Permission({
                accessType: 'anonymous_access',
                read: true,
            })
        ],
    }),

    defineCollection({
        database: 'tab',
        collection: 'song',
        schema: new Schema({
            title: { type: String, required: true },
            title_seo: { type: String },
            rhythm: { type: String, },
            artists: [{ type: Schema.Types.ObjectId, ref: 'artist', default: [] }],
            genres: [{ type: Schema.Types.ObjectId, ref: 'genre', default: [] }],
            chords: {
                keySignature: { type: String, enum: ['major', 'minor'] },
                vocalNote: VocalNoteSchema,
                list: [SongChordSchema]
            },
            sections: [SongSectionSchema],
            image: schemas.file,
            melodies: [MelodySchema],
        }),
        permissions: [
            new Permission({
                accessType: 'god_access',
                write: true,
                read: true,
            }),
            new Permission({
                accessType: 'anonymous_access',
                read: true,
            })
        ],
    })
]

