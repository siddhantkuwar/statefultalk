"use server"

import type { Character } from "./types"
// Direct import of the JSON file
// This assumes characters.json is in the same 'lib' directory
import characterData from "./characters.json"

// The imported data is already an array of Character, assuming the JSON structure matches
const allCharacters: Character[] = characterData as Character[]

async function loadCharacters(): Promise<Character[]> {
  console.log("[CharacterActions] Attempting to load characters via direct import.")
  if (!allCharacters || allCharacters.length === 0) {
    // This case should ideally not happen if the import is successful and the file is not empty
    console.error("[CharacterActions] Character data is empty or failed to import correctly.")
    // You might want to throw an error here or return an empty array
    // For now, let's log and return what we have (which might be empty)
    return []
  }
  console.log(`[CharacterActions] ${allCharacters.length} characters loaded from imported JSON.`)
  return allCharacters
}

export async function getCharacterByHandleServer(handle: string): Promise<Character | undefined> {
  console.log(`[CharacterActions] getCharacterByHandleServer called for handle: ${handle}`)
  try {
    const characters = await loadCharacters() // This will now use the imported data
    const character = characters.find((char) => char.handle === handle)
    if (character) {
      console.log(`[CharacterActions] Found character for handle ${handle}: ${character.name}`)
    } else {
      console.log(`[CharacterActions] No character found for handle ${handle}`)
    }
    return character
  } catch (error) {
    console.error(`[CharacterActions] Error in getCharacterByHandleServer for ${handle}:`, error)
    return undefined
  }
}

export async function getAllCharacters(): Promise<Character[]> {
  console.log("[CharacterActions] getAllCharacters called.")
  try {
    const characters = await loadCharacters() // This will now use the imported data
    console.log(`[CharacterActions] Returning ${characters.length} characters from getAllCharacters.`)
    return characters
  } catch (error) {
    console.error("[CharacterActions] Error in getAllCharacters:", error)
    return []
  }
}
