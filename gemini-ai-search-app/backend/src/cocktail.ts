interface SearchResultItem {
    id: string;
    title: string;
    filePath: string | null;
    snippet: string;
}

// Helper function to parse snippet for ingredients and instructions
function parseSnippetForRecipe(snippet: string): string | null {
    let ingredientsSection = "";
    let instructionsSection = "";

    const ingredientsMatch = snippet.match(
        /Ingredients:\s*([\s\S]*?)(?=\s*Instructions:|$)/i
    );
    if (ingredientsMatch && ingredientsMatch[1]) {
        ingredientsSection = ingredientsMatch[1]
            .trim()
            .split('\n')
            .map(line => line.replace(/^\s*[\*\-]\s*/, '').trim())
            .filter(line => line.length > 0)
            .join('\n');
    }

    const instructionsMatch = snippet.match(/Instructions:\s*([\s\S]*)/i);
    if (instructionsMatch && instructionsMatch[1]) {
        instructionsSection = instructionsMatch[1]
            .trim()
            .split('\n')
            .map(line => line.replace(/^\s*\d+\.\s*/, '').trim())
            .filter(line => line.length > 0)
            .join('\n');
    }

    // --- MODIFIED CONDITION ---
    // Only return a formatted recipe if BOTH sections were successfully parsed and are non-empty.
    if (ingredientsSection && instructionsSection) {
        let formattedRecipe = "Ingredients\n" + ingredientsSection;
        formattedRecipe += "\n\nSteps\n" + instructionsSection;
        return formattedRecipe.trim(); // .trim() is good practice, though should be non-empty if both sections are present.
    }
    
    return null; // Return null if a complete recipe (both parts) isn't found
}

export function extractBestRecipe(results: SearchResultItem[]): string | null {
    for (const item of results) {
        if (item.snippet &&
            item.snippet.toLowerCase().includes('ingredients:') &&
            item.snippet.toLowerCase().includes('instructions:')) {
            
            const formattedRecipe = parseSnippetForRecipe(item.snippet);
            if (formattedRecipe) {
                // console.log(`Formatted recipe from item: "${item.title}"`); // For server logging
                return formattedRecipe; // Return the first successfully parsed complete recipe
            }
        }
    }

    // If loop completes, no item had a complete, parsable recipe.
    // We can add informational messages here if needed for logging,
    // similar to before, but the primary goal is to return the first complete one.
    
    // Optional: Check for items that had keywords but failed parsing
    const potentialButFailed = results.find(item =>
        item.snippet &&
        item.snippet.toLowerCase().includes('ingredients:') &&
        item.snippet.toLowerCase().includes('instructions:') &&
        !parseSnippetForRecipe(item.snippet)
    );
    if (potentialButFailed) {
        return `Found item "${potentialButFailed.title}" with recipe keywords, but could not parse Ingredients/Instructions. Snippet: ${potentialButFailed.snippet.substring(0,150)}...`;
    }
    
    // Optional: Check for items that looked like candidates but were missing one keyword
    const missingKeyword = results.find(item =>
        item.snippet &&
        (item.snippet.toLowerCase().includes('ingredients:') || item.snippet.toLowerCase().includes('instructions:')) &&
        !(item.snippet.toLowerCase().includes('ingredients:') && item.snippet.toLowerCase().includes('instructions:'))
    );
    if (missingKeyword) {
        return `Found item "${missingKeyword.title}" with partial recipe keywords. Snippet: ${missingKeyword.snippet.substring(0,150)}...`;
    }

    return null; // No suitable recipe found or parsed
}