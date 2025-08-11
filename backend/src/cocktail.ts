interface SearchResultItem {
    id: string;
    title: string;
    filePath: string | null;
    snippet: string;
}

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

export interface BestRecipe { // Define a new interface for the structured recipe
    title: string;
    recipe: string;
}

export function extractBestRecipe(results: SearchResultItem[]): BestRecipe | null {
    for (const item of results) {
        if (item.snippet) {
            const recipeDetails = parseSnippetForRecipe(item.snippet);
            if (recipeDetails) {
                // Return an object containing both the title and the recipe string
                return { title: item.title, recipe: recipeDetails };
            }
        }
    }
    return null;
}