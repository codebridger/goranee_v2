#!/usr/bin/env node

/**
 * Migration Script: Convert Songs and Artists to Multi-Language Schema
 *
 * This script migrates existing songs and artists from the old schema
 * to the new multi-language nested object structure.
 *
 * Usage:
 *   node scripts/migrate-to-multilang.js
 *
 * Environment Variables:
 *   MONGODB_URL - MongoDB connection string (default: mongodb://localhost:27017)
 *
 * Safety:
 *   - Always backup your database before running this script
 *   - Test on a staging/local environment first
 *   - Script skips already migrated documents
 *   - Old fields (title, title_seo, sections, name, name_seo, bio) are DELETED after migration
 *   - Rhythm stays in main object (not language-specific)
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
const DATABASE_NAME = "goranee_tab";
const COLLECTION_SONGS = "songs";
const COLLECTION_ARTISTS = "artists";

// Statistics
const stats = {
  songs: { total: 0, migrated: 0, skipped: 0, errors: 0 },
  artists: { total: 0, migrated: 0, skipped: 0, errors: 0 },
};

/**
 * Check if a document is already migrated
 */
function isMigrated(doc) {
  return (
    doc.content &&
    doc.content["ckb-IR"] &&
    typeof doc.content["ckb-IR"] === "object"
  );
}

/**
 * Migrate a single song document
 */
function migrateSong(song) {
  // Check if already migrated
  if (isMigrated(song)) {
    return null; // Skip
  }

  // Extract old fields (rhythm stays in main object, not language-specific)
  const defaultContent = {
    title: song.title || "",
    title_seo: song.title_seo || null,
    sections: song.sections || [],
  };

  // Create new structure and remove old fields (keep rhythm in main object)
  const update = {
    $set: {
      content: {
        "ckb-IR": defaultContent,
        "ckb-Latn": null,
        kmr: null,
      },
      // Keep rhythm in main object (it's not language-specific)
      rhythm: song.rhythm || null,
      updatedAt: new Date(),
    },
    $unset: {
      title: "",
      title_seo: "",
      sections: "",
      // Note: rhythm is NOT unset - it stays in the main object
    },
  };

  return update;
}

/**
 * Migrate a single artist document
 */
function migrateArtist(artist) {
  // Check if already migrated
  if (isMigrated(artist)) {
    return null; // Skip
  }

  // Extract old fields
  const defaultContent = {
    name: artist.name || "",
    name_seo: artist.name_seo || null,
    bio: artist.bio || null,
  };

  // Create new structure and remove old fields
  const update = {
    $set: {
      content: {
        "ckb-IR": defaultContent,
        "ckb-Latn": null,
        kmr: null,
      },
      updatedAt: new Date(),
    },
    $unset: {
      name: "",
      name_seo: "",
      bio: "",
    },
  };

  return update;
}

/**
 * Migrate all songs
 */
async function migrateSongs(db) {
  console.log("\n🎵 Migrating songs...");

  const collection = db.collection(COLLECTION_SONGS);

  // Count total songs
  stats.songs.total = await collection.countDocuments();
  console.log(`   Found ${stats.songs.total} songs`);

  if (stats.songs.total === 0) {
    console.log("   No songs to migrate");
    return;
  }

  // Process songs in batches
  const batchSize = 100;
  let processed = 0;
  let lastId = null;

  while (true) {
    // Build query for batch
    const query = lastId ? { _id: { $gt: lastId } } : {};

    // Fetch batch
    const songs = await collection
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
        const update = migrateSong(song);

        if (update === null) {
          stats.songs.skipped++;
        } else {
          await collection.updateOne({ _id: song._id }, update);
          stats.songs.migrated++;
        }

        processed++;
        lastId = song._id;

        // Progress update every 100 songs
        if (processed % 100 === 0) {
          console.log(`   Progress: ${processed}/${stats.songs.total}`);
        }
      } catch (error) {
        console.error(`   ❌ Error migrating song ${song._id}:`, error.message);
        stats.songs.errors++;
        processed++;
      }
    }
  }

  console.log(`   ✓ Migrated: ${stats.songs.migrated}`);
  console.log(`   ⊘ Skipped: ${stats.songs.skipped}`);
  if (stats.songs.errors > 0) {
    console.log(`   ❌ Errors: ${stats.songs.errors}`);
  }
}

/**
 * Migrate all artists
 */
async function migrateArtists(db) {
  console.log("\n👤 Migrating artists...");

  const collection = db.collection(COLLECTION_ARTISTS);

  // Count total artists
  stats.artists.total = await collection.countDocuments();
  console.log(`   Found ${stats.artists.total} artists`);

  if (stats.artists.total === 0) {
    console.log("   No artists to migrate");
    return;
  }

  // Process artists in batches
  const batchSize = 100;
  let processed = 0;
  let lastId = null;

  while (true) {
    // Build query for batch
    const query = lastId ? { _id: { $gt: lastId } } : {};

    // Fetch batch
    const artists = await collection
      .find(query)
      .sort({ _id: 1 })
      .limit(batchSize)
      .toArray();

    if (artists.length === 0) {
      break; // No more artists
    }

    // Process each artist in batch
    for (const artist of artists) {
      try {
        const update = migrateArtist(artist);

        if (update === null) {
          stats.artists.skipped++;
        } else {
          await collection.updateOne({ _id: artist._id }, update);
          stats.artists.migrated++;
        }

        processed++;
        lastId = artist._id;

        // Progress update every 50 artists
        if (processed % 50 === 0) {
          console.log(`   Progress: ${processed}/${stats.artists.total}`);
        }
      } catch (error) {
        console.error(
          `   ❌ Error migrating artist ${artist._id}:`,
          error.message
        );
        stats.artists.errors++;
        processed++;
      }
    }
  }

  console.log(`   ✓ Migrated: ${stats.artists.migrated}`);
  console.log(`   ⊘ Skipped: ${stats.artists.skipped}`);
  if (stats.artists.errors > 0) {
    console.log(`   ❌ Errors: ${stats.artists.errors}`);
  }
}

/**
 * Verify migration
 */
async function verifyMigration(db) {
  console.log("\n🔍 Verifying migration...");

  const songsCollection = db.collection(COLLECTION_SONGS);
  const artistsCollection = db.collection(COLLECTION_ARTISTS);

  // Check songs
  const totalSongs = await songsCollection.countDocuments();
  const migratedSongs = await songsCollection.countDocuments({
    "content.ckb-IR": { $exists: true, $ne: null },
  });

  console.log(`   Songs: ${migratedSongs}/${totalSongs} have new structure`);

  // Check artists
  const totalArtists = await artistsCollection.countDocuments();
  const migratedArtists = await artistsCollection.countDocuments({
    "content.ckb-IR": { $exists: true, $ne: null },
  });

  console.log(
    `   Artists: ${migratedArtists}/${totalArtists} have new structure`
  );

  if (migratedSongs === totalSongs && migratedArtists === totalArtists) {
    console.log("   ✅ All documents migrated successfully!");
    return true;
  } else {
    console.log("   ⚠️  Some documents may not be migrated");
    return false;
  }
}

/**
 * Main migration function
 */
async function main() {
  console.log("🚀 Starting Multi-Language Schema Migration");
  console.log(`   Database: ${DATABASE_NAME}`);
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

    const db = client.db(DATABASE_NAME);

    // Run migrations
    await migrateSongs(db);
    await migrateArtists(db);

    // Verify migration
    await verifyMigration(db);

    // Print summary
    console.log("\n📊 Migration Summary:");
    console.log("   Songs:");
    console.log(`     Total: ${stats.songs.total}`);
    console.log(`     Migrated: ${stats.songs.migrated}`);
    console.log(`     Skipped: ${stats.songs.skipped}`);
    if (stats.songs.errors > 0) {
      console.log(`     Errors: ${stats.songs.errors}`);
    }
    console.log("   Artists:");
    console.log(`     Total: ${stats.artists.total}`);
    console.log(`     Migrated: ${stats.artists.migrated}`);
    console.log(`     Skipped: ${stats.artists.skipped}`);
    if (stats.artists.errors > 0) {
      console.log(`     Errors: ${stats.artists.errors}`);
    }

    console.log("\n✅ Migration completed successfully!");
  } catch (error) {
    console.error("\n❌ Migration failed:", error);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
      console.log("\n📡 Disconnected from MongoDB");
    }
  }
}

// Run migration
if (require.main === module) {
  main().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
}

module.exports = { migrateSongs, migrateArtists, migrateSong, migrateArtist };
