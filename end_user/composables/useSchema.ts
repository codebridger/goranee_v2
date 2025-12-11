import type { LanguageCode } from '~/constants/routes'
import type { ContentLanguageCode } from '~/types/song.type'
import type { Artist } from '~/types/song.type'

/**
 * Composable for generating JSON-LD structured data (Schema.org)
 * Provides utilities for creating, cleaning, and validating schema markup
 */
export const useSchema = () => {

	/**
	 * Convert language code to BCP 47 format for schema.org
	 * Schema.org's inLanguage property requires BCP 47 language tags (IETF standard)
	 * BCP 47 combines: ISO 639 (language) + ISO 15924 (script) + ISO 3166-1 (region)
	 */
	const getLanguageCode = (lang: LanguageCode): string => {
		const langMap: Record<LanguageCode, string> = {
			'ckb-IR': 'ckb-Arab-IR', // Sorani Kurdish in Arabic script, Iran region (BCP 47)
			'ckb-Latn': 'ckb-Latn', // Sorani Kurdish in Latin script (BCP 47)
			'kmr': 'kmr', // Kurmanji Kurdish (BCP 47)
			'en': 'en', // English (BCP 47)
		}
		return langMap[lang] || 'ckb-Arab-IR' // Default to Sorani Kurdish
	}

	/**
	 * Type-safe helper to extract artist name from Artist object
	 * Respects current language and falls back to other languages if needed
	 */
	const getArtistName = (artist: Artist | string, currentLang: LanguageCode): string | null => {
		if (typeof artist === 'string') return null

		// Try to get name from content based on current language
		// Only use languages that exist in Artist.content type (exclude 'en')
		if (currentLang !== 'en' && currentLang in artist.content) {
			const langContent = artist.content[currentLang as ContentLanguageCode]
			if (langContent?.name) {
				return langContent.name
			}
		}

		// Fallback: try other languages (only ContentLanguageCode, not 'en')
		const fallbackLangs: ContentLanguageCode[] = ['ckb-IR', 'ckb-Latn', 'kmr']
		for (const lang of fallbackLangs) {
			const content = artist.content?.[lang]
			if (content?.name) {
				return content.name
			}
		}

		// Last resort: check if backend added a direct name property (for backward compatibility)
		if ('name' in artist && typeof (artist as any).name === 'string') {
			return (artist as any).name
		}

		return null
	}

	/**
	 * Clean object from MongoDB internal fields and ensure valid JSON-LD
	 * This function preserves @type fields and removes only MongoDB internal fields
	 */
	const cleanObject = (obj: unknown): unknown => {
		if (obj === null || obj === undefined) return null
		if (typeof obj !== 'object') return obj
		if (Array.isArray(obj)) {
			return obj.map(cleanObject).filter(item => item !== null)
		}

		const cleaned: Record<string, unknown> = {}
		for (const [key, value] of Object.entries(obj)) {
			// Skip MongoDB internal fields (starting with _)
			// Note: @type is a valid JSON-LD field and doesn't start with _, so it's preserved
			if (key.startsWith('_')) continue
			// Skip undefined values
			if (value === undefined) continue
			// Recursively clean nested objects
			if (typeof value === 'object' && value !== null) {
				const cleanedValue = cleanObject(value)
				if (cleanedValue !== null) {
					cleaned[key] = cleanedValue
				}
			} else {
				cleaned[key] = value
			}
		}
		return cleaned
	}

	/**
	 * Validate and stringify structured data for JSON-LD script tag
	 * Returns empty array if validation fails
	 */
	const validateAndStringifySchema = (structuredData: unknown): Array<{ type: string; innerHTML: string }> => {
		const cleaned = cleanObject(structuredData)

		// Validate that cleaned data is an object
		if (!cleaned || typeof cleaned !== 'object') {
			console.error('Invalid structured data after cleaning:', cleaned)
			return []
		}

		// Validate that @type is present and is a string
		if (!('@type' in cleaned) || typeof cleaned['@type'] !== 'string') {
			console.error('Invalid @type in structured data:', cleaned)
			return []
		}

		// Validate that @context is present
		if (!('@context' in cleaned) || typeof cleaned['@context'] !== 'string') {
			console.error('Invalid @context in structured data:', cleaned)
			return []
		}

		try {
			const jsonString = JSON.stringify(cleaned)
			return [{
				type: 'application/ld+json',
				innerHTML: jsonString,
			}]
		} catch (error) {
			console.error('Error stringifying structured data:', error)
			return []
		}
	}

	/**
	 * Format date for schema.org (ISO 8601 format)
	 * Ensures dateModified is not earlier than dateCreated
	 */
	const formatDates = (createdAt?: Date | string, updatedAt?: Date | string): { dateCreated?: string; dateModified?: string } => {
		const result: { dateCreated?: string; dateModified?: string } = {}

		if (createdAt) {
			try {
				const createdDate = new Date(createdAt)
				if (!isNaN(createdDate.getTime())) {
					result.dateCreated = createdDate.toISOString()

					// Set dateModified - ensure it's not earlier than dateCreated
					if (updatedAt) {
						const updatedDate = new Date(updatedAt)
						if (!isNaN(updatedDate.getTime())) {
							// If updatedAt is earlier than createdAt, use createdAt as dateModified
							result.dateModified = updatedDate >= createdDate
								? updatedDate.toISOString()
								: createdDate.toISOString()
						} else {
							result.dateModified = createdDate.toISOString()
						}
					} else {
						// If no updatedAt, use createdAt as dateModified
						result.dateModified = createdDate.toISOString()
					}
				}
			} catch (error) {
				console.warn('Error parsing dates for schema:', error)
			}
		}

		return result
	}

	/**
	 * Create MusicComposition schema for songs
	 */
	const createMusicCompositionSchema = (params: {
		name: string
		language: LanguageCode
		composers: Array<{ '@type': 'Person'; name: string; url?: string }>
		image?: string
		dateCreated?: Date | string
		dateModified?: Date | string
	}) => {
		const { name, language, composers, image, dateCreated, dateModified } = params

		type Composer = {
			'@type': 'Person'
			name: string
			url?: string
		}

		// Ensure composer is always defined (required field)
		let composerValue: Composer | Composer[]
		if (composers.length === 0) {
			composerValue = {
				'@type': 'Person',
				name: 'Unknown Artist',
			}
		} else if (composers.length === 1) {
			composerValue = composers[0]!
		} else {
			composerValue = composers
		}

		const structuredData = {
			'@context': 'https://schema.org',
			'@type': 'MusicComposition',
			name: String(name || 'Untitled Song'),
			inLanguage: getLanguageCode(language),
			composer: composerValue,
			inAlbum: {
				'@type': 'MusicAlbum',
				name: 'Goranee Kurdish Chords',
			},
			...(image ? { image: String(image) } : {}),
			...formatDates(dateCreated, dateModified),
		}

		return structuredData
	}

	/**
	 * Create Person schema for artists
	 */
	const createPersonSchema = (params: {
		name: string
		language: LanguageCode
		url: string
		description?: string
		image?: string
		dateCreated?: Date | string
		dateModified?: Date | string
	}) => {
		const { name, language, url, description, image, dateCreated, dateModified } = params

		const structuredData = {
			'@context': 'https://schema.org',
			'@type': 'Person',
			name: String(name),
			inLanguage: getLanguageCode(language),
			url: String(url),
			...(description ? { description: String(description) } : {}),
			...(image ? { image: String(image) } : {}),
			...formatDates(dateCreated, dateModified),
		}

		return structuredData
	}

	return {
		getLanguageCode,
		getArtistName,
		cleanObject,
		validateAndStringifySchema,
		formatDates,
		createMusicCompositionSchema,
		createPersonSchema,
	}
}
