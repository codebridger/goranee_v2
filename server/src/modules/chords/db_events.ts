import { DatabaseTrigger } from "@modular-rest/server";
import mongoose from "mongoose";
import { notifySongUpdated, notifyArtistUpdated } from "./indexing_service";

/**
 * Helper function to update artist song counts
 * Recalculates the total number of songs for each artist and updates their chords field
 */
async function updateArtistSongCounts(
  artistIds: (string | mongoose.Types.ObjectId)[]
): Promise<void> {
  if (!artistIds || artistIds.length === 0) {
    return;
  }

  try {
    // Get mongoose connection for the "tab" database
    // Find the connection that matches our database (with prefix "goranee_")
    const connections = mongoose.connections;
    let connection: mongoose.Connection | null = null;

    for (const conn of connections) {
      if (
        conn.name &&
        (conn.name.includes("tab") || conn.name === "goranee_tab")
      ) {
        connection = conn;
        break;
      }
    }

    if (!connection) {
      console.error("Could not find database connection for 'tab' database");
      return;
    }

    // Get models
    const SongModel = connection.model("song");
    const ArtistModel = connection.model("artist");

    // Convert artist IDs to ObjectIds and remove duplicates
    const uniqueArtistIds = Array.from(
      new Set(
        artistIds
          .map((id) => {
            try {
              if (id instanceof mongoose.Types.ObjectId) {
                return id;
              }
              if (typeof id === "string") {
                // Use constructor with string parameter
                return new (mongoose.Types.ObjectId as any)(id);
              }
              return null;
            } catch {
              return null;
            }
          })
          .filter((id): id is mongoose.Types.ObjectId => id !== null)
      )
    );

    // Update count for each artist
    for (const artistId of uniqueArtistIds) {
      try {
        // Count all songs where this artist appears in the artists array
        const songCount = await SongModel.countDocuments({
          artists: artistId,
        });

        // Update the artist's chords field
        await ArtistModel.updateOne(
          { _id: artistId },
          { $set: { chords: songCount } }
        );
      } catch (error) {
        console.error(
          `Error updating song count for artist ${artistId}:`,
          error
        );
      }
    }
  } catch (error) {
    console.error("Error in updateArtistSongCounts:", error);
  }
}

/**
 * Get database triggers for the song collection
 * These triggers automatically update artist song counts when songs are created, deleted, or updated
 */
export function getSongTriggers(): DatabaseTrigger[] {
  return [
    // Trigger after song is created
    new DatabaseTrigger("insert-one", async (context) => {
      const song = context.queryResult;
      if (song && song.artists && Array.isArray(song.artists)) {
        await updateArtistSongCounts(song.artists);
      }
      // Notify search engines about new song
      if (song?._id) {
        notifySongUpdated(String(song._id)).catch((err) =>
          console.error("Failed to notify IndexNow for new song:", err)
        );
      }
    }),

    // Trigger after song is deleted
    new DatabaseTrigger("remove-one", async (context) => {
      const song = context.queryResult;
      if (song && song.artists && Array.isArray(song.artists)) {
        await updateArtistSongCounts(song.artists);
      }
    }),

    // Trigger after song is updated
    new DatabaseTrigger("update-one", async (context) => {
      const updatedSong = context.queryResult;
      const updateData = context.update;

      // Check if artists array was modified in the update
      const artistsChanged =
        (updateData && updateData.$set && "artists" in updateData.$set) ||
        (updateData && "artists" in updateData);

      if (artistsChanged) {
        // Get new artists from update data or from the updated document
        const newArtists =
          updateData?.$set?.artists ||
          updateData?.artists ||
          updatedSong?.artists;

        // Get old artists from the updated document (before update)
        // Note: queryResult might contain the updated document, so we try to get old from query
        const oldArtists = context.query?.artists || updatedSong?.artists;

        // Get all affected artist IDs (both old and new)
        const affectedArtistIds = new Set<string | mongoose.Types.ObjectId>();

        if (oldArtists && Array.isArray(oldArtists)) {
          oldArtists.forEach((id: any) => affectedArtistIds.add(id));
        }

        if (newArtists && Array.isArray(newArtists)) {
          newArtists.forEach((id: any) => affectedArtistIds.add(id));
        }

        // If we couldn't determine old/new, use the updated document's artists
        // Since we're recalculating, this will still work correctly
        if (affectedArtistIds.size === 0 && updatedSong?.artists) {
          updatedSong.artists.forEach((id: any) => affectedArtistIds.add(id));
        }

        if (affectedArtistIds.size > 0) {
          await updateArtistSongCounts(Array.from(affectedArtistIds));
        }
      }

      // Notify search engines about song update
      if (updatedSong?._id) {
        notifySongUpdated(String(updatedSong._id)).catch((err) =>
          console.error("Failed to notify IndexNow for song update:", err)
        );
      }
    }),
  ];
}
