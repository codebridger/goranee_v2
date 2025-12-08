#!/usr/bin/env node

/**
 * Extract Rhythms Script: Extract unique rhythm strings from songs and insert into rhythm collection
 *
 * This script aggregates all unique rhythm strings from the songs collection
 * where rhythm is stored as a string, and inserts them into the rhythm collection
 * in the chord database.
 *
 * Usage:
 *   node scripts/extract-rhythms.js
 *
 * Environment Variables:
 *   MONGODB_URL - MongoDB connection string (default: mongodb://localhost:27017)
 *
 * Safety:
 *   - Always backup your database before running this script
 *   - Test on a staging/local environment first
 *   - Script only processes songs where rhythm is a string
 *   - Duplicates are handled gracefully (skipped if already exists)
 */

require("dotenv").config({ path: require("path").join(__dirname, "../.env") });

// Check if mongodb is available
let MongoClient;
try {
  const mongodb = require("mongodb");
  MongoClient = mongodb.MongoClient;
} catch (error) {
  console.error("❌ Error: mongodb package is not installed.");
  console.error("   Please install it by running:");
  console.error("   npm install mongodb");
  console.error("   or");
  console.error("   yarn add mongodb");
  process.exit(1);
}

// Configuration
const MONGODB_URL = process.env.MONGODB_URL || "mongodb://localhost:27017";
const DATABASE_TAB = "goranee_tab";
const DATABASE_CHORD = "goranee_chord";
const COLLECTION_SONGS = "songs";
const COLLECTION_RHYTHMS = "rhythms";

// Whitelist of valid rhythms
const RHYTHM_WHITELIST = new Set(["2/4", "3/4", "6/8", "4/4", "7/8"]);

// Mapping of incorrect formats to correct ones
const RHYTHM_MAPPING = new Map([
  // Hyphen instead of slash
  ["4-2", "2/4"], // Map to 2/4 (reversed)
  ["4-4", "4/4"],
  ["8-6", "6/8"],
  ["8-7", "7/8"],
  // Remove leading hyphen
  ["-2/4", "2/4"],
  ["-6/8", "6/8"],
  ["-4/4", "4/4"],
  // Invalid entries - map to valid rhythms
  [" _ ", "4/4"],
  ["_", "4/4"],
  // 4/2 should map to 2/4 (reversed)
  ["4/2", "2/4"],
]);

// Statistics
const stats = {
  songs: { total: 0, processed: 0, withStringRhythm: 0, updated: 0, errors: 0 },
  rhythms: { unique: 0, inserted: 0, duplicates: 0, errors: 0 },
  normalization: { split: 0, mapped: 0, filtered: 0 },
};

/**
 * Normalize a single rhythm string
 * ONLY returns rhythms that are in the whitelist
 * @param {string} rhythm - The rhythm string to normalize
 * @returns {string|null} - Normalized rhythm (must be in whitelist) or null if invalid
 */
function normalizeRhythm(rhythm) {
  if (!rhythm || typeof rhythm !== "string") {
    return null;
  }

  // Trim whitespace
  let normalized = rhythm.trim();

  // Skip empty strings
  if (normalized === "") {
    return null;
  }

  // Check direct mapping first (this should map to whitelisted values)
  if (RHYTHM_MAPPING.has(normalized)) {
    const mapped = RHYTHM_MAPPING.get(normalized);
    if (mapped === null) {
      stats.normalization.filtered++;
      return null;
    }
    normalized = mapped;
    stats.normalization.mapped++;

    // After mapping, verify it's in whitelist (should always be, but double-check)
    if (RHYTHM_WHITELIST.has(normalized)) {
      return normalized;
    }
    // If mapped value is not in whitelist, filter it out
    stats.normalization.filtered++;
    return null;
  }

  // Remove leading hyphen if present
  if (normalized.startsWith("-")) {
    normalized = normalized.substring(1);
    stats.normalization.mapped++;
  }

  // Replace hyphen with slash (e.g., "4-4" -> "4/4")
  if (normalized.includes("-") && !normalized.includes("/")) {
    normalized = normalized.replace("-", "/");
    stats.normalization.mapped++;
  }

  // STRICT CHECK: Only return if it's in whitelist
  if (RHYTHM_WHITELIST.has(normalized)) {
    return normalized;
  }

  // Not in whitelist, filter it out
  stats.normalization.filtered++;
  return null;
}

/**
 * Extract and normalize rhythms from a rhythm string
 * Splits by space to handle multiple rhythms, then normalizes each
 * @param {string} rhythmString - The rhythm string from the song
 * @returns {string[]} - Array of valid normalized rhythms
 */
function extractRhythmsFromString(rhythmString) {
  if (!rhythmString || typeof rhythmString !== "string") {
    return [];
  }

  // Split by space to handle multiple rhythms (e.g., "6/8 4/4")
  const parts = rhythmString.trim().split(/\s+/);

  if (parts.length > 1) {
    stats.normalization.split++;
  }

  const validRhythms = [];
  for (const part of parts) {
    const normalized = normalizeRhythm(part);
    if (normalized) {
      validRhythms.push(normalized);
    }
  }

  return validRhythms;
}

/**
 * Extract unique rhythm strings from songs collection
 */
async function extractUniqueRhythms(db) {
  console.log("\n🎵 Extracting unique rhythms from songs...");

  // Reset normalization stats
  stats.normalization = { split: 0, mapped: 0, filtered: 0 };

  const songsCollection = db.collection(COLLECTION_SONGS);

  // Count total songs
  stats.songs.total = await songsCollection.countDocuments();
  console.log(`   Found ${stats.songs.total} total songs`);

  if (stats.songs.total === 0) {
    console.log("   No songs to process");
    return new Set();
  }

  // Use Set to store unique rhythm strings (only whitelisted ones)
  const uniqueRhythms = new Set();

  // Process songs in batches
  const batchSize = 100;
  let processed = 0;
  let lastId = null;

  while (true) {
    // Build query for batch
    const query = lastId ? { _id: { $gt: lastId } } : {};

    // Fetch batch
    const songs = await songsCollection
      .find(query)
      .sort({ _id: 1 })
      .limit(batchSize)
      .toArray();

    if (songs.length === 0) {
      break; // No more songs
    }

    // Process each song in batch
    for (const song of songs) {
      try {
        // Only process songs where rhythm is a string
        if (
          song.rhythm &&
          typeof song.rhythm === "string" &&
          song.rhythm.trim() !== ""
        ) {
          stats.songs.withStringRhythm++;

          // Extract and normalize rhythms from the string
          const validRhythms = extractRhythmsFromString(song.rhythm);

          // Add to unique set
          for (const rhythm of validRhythms) {
            uniqueRhythms.add(rhythm);
          }
        }

        processed++;
        lastId = song._id;

        // Progress update every 100 songs
        if (processed % 100 === 0) {
          console.log(`   Progress: ${processed}/${stats.songs.total}`);
        }
      } catch (error) {
        console.error(
          `   ❌ Error processing song ${song._id}:`,
          error.message
        );
        stats.songs.errors++;
        processed++;
      }
    }
  }

  stats.songs.processed = processed;
  stats.rhythms.unique = uniqueRhythms.size;

  console.log(`   ✓ Processed: ${stats.songs.processed} songs`);
  console.log(
    `   ✓ Found ${stats.songs.withStringRhythm} songs with string rhythms`
  );
  console.log(`   ✓ Extracted ${stats.rhythms.unique} unique valid rhythms`);
  console.log(`   ✓ Split ${stats.normalization.split} multi-rhythm strings`);
  console.log(`   ✓ Mapped ${stats.normalization.mapped} incorrect formats`);
  console.log(`   ⊘ Filtered ${stats.normalization.filtered} invalid rhythms`);

  if (stats.songs.errors > 0) {
    console.log(`   ❌ Errors: ${stats.songs.errors}`);
  }

  return uniqueRhythms;
}

/**
 * Insert rhythms into rhythm collection and return mapping of rhythm string to ObjectId
 * @returns {Map<string, ObjectId>} Map of rhythm string to ObjectId
 */
async function insertRhythms(client, rhythms) {
  console.log("\n🥁 Inserting rhythms into rhythm collection...");

  if (rhythms.size === 0) {
    console.log("   No rhythms to insert");
    return new Map();
  }

  const chordDb = client.db(DATABASE_CHORD);
  const rhythmsCollection = chordDb.collection(COLLECTION_RHYTHMS);
  const { ObjectId } = require("mongodb");

  // Map to store rhythm string -> ObjectId mapping
  const rhythmMap = new Map();

  // Convert Set to Array for processing
  const rhythmsArray = Array.from(rhythms);
  const batchSize = 50;
  let processed = 0;

  for (let i = 0; i < rhythmsArray.length; i += batchSize) {
    const batch = rhythmsArray.slice(i, i + batchSize);

    // Process each rhythm in batch
    for (const rhythmTitle of batch) {
      try {
        // Safety check: Only insert whitelisted rhythms
        if (!RHYTHM_WHITELIST.has(rhythmTitle)) {
          console.warn(
            `   ⚠️  Skipping non-whitelisted rhythm: "${rhythmTitle}"`
          );
          stats.rhythms.errors++;
          continue;
        }

        // Use upsert to handle duplicates gracefully
        // $setOnInsert only sets the title if the document doesn't exist
        const result = await rhythmsCollection.updateOne(
          { title: rhythmTitle },
          {
            $setOnInsert: {
              title: rhythmTitle,
            },
          },
          { upsert: true }
        );

        let rhythmId;
        if (result.upsertedCount > 0) {
          // Newly inserted - use the upserted _id value
          rhythmId = result.upsertedId;
          stats.rhythms.inserted++;
        } else {
          // Already exists - fetch the existing document to get its _id
          const existingRhythm = await rhythmsCollection.findOne(
            { title: rhythmTitle },
            { projection: { _id: 1 } } // Only fetch _id field
          );
          if (existingRhythm && existingRhythm._id) {
            rhythmId = existingRhythm._id; // Just the _id value
          }
          stats.rhythms.duplicates++;
        }

        // Store the mapping - only store if we have a valid _id
        if (rhythmId) {
          rhythmMap.set(rhythmTitle, rhythmId);
        }

        processed++;

        // Progress update every 50 rhythms
        if (processed % 50 === 0) {
          console.log(`   Progress: ${processed}/${rhythmsArray.length}`);
        }
      } catch (error) {
        console.error(
          `   ❌ Error inserting rhythm "${rhythmTitle}":`,
          error.message
        );
        stats.rhythms.errors++;
        processed++;
      }
    }
  }

  console.log(`   ✓ Inserted: ${stats.rhythms.inserted} new rhythms`);
  console.log(`   ⊘ Skipped: ${stats.rhythms.duplicates} duplicates`);
  if (stats.rhythms.errors > 0) {
    console.log(`   ❌ Errors: ${stats.rhythms.errors}`);
  }

  return rhythmMap;
}

/**
 * Update songs to replace string rhythm values with array of ObjectId references
 */
async function updateSongsWithRhythmIds(client, rhythmMap) {
  console.log("\n🔄 Updating songs with rhythm ObjectIds...");

  if (rhythmMap.size === 0) {
    console.log("   No rhythm mappings available");
    return;
  }

  const tabDb = client.db(DATABASE_TAB);
  const songsCollection = tabDb.collection(COLLECTION_SONGS);

  // Process songs in batches to handle trimming and matching
  const batchSize = 100;
  let processed = 0;
  let lastId = null;

  while (true) {
    // Build query for batch - only get songs with string rhythms
    const query = lastId
      ? { _id: { $gt: lastId }, rhythm: { $type: "string" } }
      : { rhythm: { $type: "string" } };

    // Fetch batch
    const songs = await songsCollection
      .find(query)
      .sort({ _id: 1 })
      .limit(batchSize)
      .toArray();

    if (songs.length === 0) {
      break; // No more songs
    }

    // Process each song in batch
    for (const song of songs) {
      try {
        if (song.rhythm && typeof song.rhythm === "string") {
          // Extract and normalize rhythms from the string
          const validRhythms = extractRhythmsFromString(song.rhythm);

          // Map to ObjectIds
          const rhythmIds = [];
          for (const rhythm of validRhythms) {
            const rhythmId = rhythmMap.get(rhythm);
            if (rhythmId) {
              rhythmIds.push(rhythmId);
            }
          }

          // Update song with array of ObjectIds (or empty array if no valid rhythms)
          if (rhythmIds.length > 0) {
            await songsCollection.updateOne(
              { _id: song._id },
              {
                $set: {
                  rhythm: rhythmIds,
                  updatedAt: new Date(),
                },
              }
            );
            stats.songs.updated++;
          } else {
            // No valid rhythms found, set to empty array
            await songsCollection.updateOne(
              { _id: song._id },
              {
                $set: {
                  rhythm: [],
                  updatedAt: new Date(),
                },
              }
            );
            stats.songs.updated++;
          }
        }

        processed++;
        lastId = song._id;

        // Progress update every 50 songs
        if (processed % 50 === 0) {
          console.log(`   Progress: ${processed} songs processed`);
        }
      } catch (error) {
        console.error(`   ❌ Error updating song ${song._id}:`, error.message);
        stats.songs.errors++;
        processed++;
      }
    }
  }

  console.log(`   ✓ Total songs updated: ${stats.songs.updated}`);
  if (stats.songs.errors > 0) {
    console.log(`   ❌ Errors: ${stats.songs.errors}`);
  }
}

/**
 * Verify extraction
 */
async function verifyExtraction(client) {
  console.log("\n🔍 Verifying extraction...");

  const tabDb = client.db(DATABASE_TAB);
  const chordDb = client.db(DATABASE_CHORD);
  const songsCollection = tabDb.collection(COLLECTION_SONGS);
  const rhythmsCollection = chordDb.collection(COLLECTION_RHYTHMS);

  // Count songs with string rhythms (should be 0 after update)
  const songsWithStringRhythm = await songsCollection.countDocuments({
    rhythm: { $type: "string" },
  });

  // Count songs with array rhythms (ObjectId arrays)
  const songsWithArrayRhythm = await songsCollection.countDocuments({
    rhythm: { $type: "array" },
  });

  // Count total rhythms in collection
  const totalRhythms = await rhythmsCollection.countDocuments();

  console.log(`   Songs with string rhythms: ${songsWithStringRhythm}`);
  console.log(`   Songs with array rhythms: ${songsWithArrayRhythm}`);
  console.log(`   Total rhythms in collection: ${totalRhythms}`);

  if (totalRhythms > 0 && songsWithArrayRhythm > 0) {
    console.log("   ✅ Rhythms successfully inserted and songs updated");
    return true;
  } else {
    console.log("   ⚠️  Verification incomplete");
    return false;
  }
}

/**
 * Main function
 */
async function main() {
  console.log("🚀 Starting Rhythm Extraction");
  console.log(`   Tab Database: ${DATABASE_TAB}`);
  console.log(`   Chord Database: ${DATABASE_CHORD}`);
  console.log(`   MongoDB URL: ${MONGODB_URL.replace(/\/\/.*@/, "//***@")}`);

  let client;

  try {
    // Connect to MongoDB
    console.log("\n📡 Connecting to MongoDB...");
    client = new MongoClient(MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    await client.connect();
    console.log("   ✓ Connected");

    const tabDb = client.db(DATABASE_TAB);

    // Extract unique rhythms
    const uniqueRhythms = await extractUniqueRhythms(tabDb);

    // Insert rhythms into rhythm collection and get rhythm string -> ObjectId mapping
    let rhythmMap = new Map();
    if (uniqueRhythms.size > 0) {
      rhythmMap = await insertRhythms(client, uniqueRhythms);
    }

    // Update songs to replace string rhythms with ObjectId references
    if (rhythmMap.size > 0) {
      await updateSongsWithRhythmIds(client, rhythmMap);
    }

    // Verify extraction
    await verifyExtraction(client);

    // Print summary
    console.log("\n📊 Extraction Summary:");
    console.log("   Songs:");
    console.log(`     Total: ${stats.songs.total}`);
    console.log(`     Processed: ${stats.songs.processed}`);
    console.log(`     With string rhythms: ${stats.songs.withStringRhythm}`);
    console.log(`     Updated with ObjectIds: ${stats.songs.updated}`);
    if (stats.songs.errors > 0) {
      console.log(`     Errors: ${stats.songs.errors}`);
    }
    console.log("   Rhythms:");
    console.log(`     Unique found: ${stats.rhythms.unique}`);
    console.log(`     Inserted: ${stats.rhythms.inserted}`);
    console.log(`     Duplicates skipped: ${stats.rhythms.duplicates}`);
    if (stats.rhythms.errors > 0) {
      console.log(`     Errors: ${stats.rhythms.errors}`);
    }
    console.log("   Normalization:");
    console.log(
      `     Multi-rhythm strings split: ${stats.normalization.split}`
    );
    console.log(`     Formats corrected: ${stats.normalization.mapped}`);
    console.log(
      `     Invalid rhythms filtered: ${stats.normalization.filtered}`
    );

    console.log("\n✅ Extraction completed successfully!");
  } catch (error) {
    console.error("\n❌ Extraction failed:", error);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
      console.log("\n📡 Disconnected from MongoDB");
    }
  }
}

// Run extraction
if (require.main === module) {
  main().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
}

module.exports = {
  extractUniqueRhythms,
  insertRhythms,
  updateSongsWithRhythmIds,
};
