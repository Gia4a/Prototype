interface SearchResultItem {
    title: string;
    snippet: string;
    filePath: string | null;
}

export function formatSpecificRecipe(
    results: SearchResultItem[],
    targetFileName: string = "mojito.txt"
): string | null {
    const recipeItem = results.find(
        (item) => item.filePath && item.filePath.endsWith(targetFileName)
    );

    if (!recipeItem || !recipeItem.snippet) {
        const targetedItemExists = results.some(item => item.filePath && item.filePath.endsWith(targetFileName));
        if (!targetedItemExists) {
            return `No recipe item found with filePath ending in "${targetFileName}".`;
        }
        return `Recipe item for "${targetFileName}" found, but it has no snippet.`;
    }

    const snippet = recipeItem.snippet;
    let ingredientsSection = "";
    let instructionsSection = "";

    // Updated regex for ingredients
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

    if (ingredientsSection || instructionsSection) {
        let formattedRecipe = "";
        if (ingredientsSection) {
            formattedRecipe += "Ingredients\n" + ingredientsSection;
        }
        if (instructionsSection) {
            if (formattedRecipe) {
                formattedRecipe += "\n\n";
            }
            formattedRecipe += "Steps\n" + instructionsSection;
        }
        return formattedRecipe.trim();
    }

    return `Could not parse "Ingredients:" or "Instructions:" sections from the snippet for "${recipeItem.title}". Snippet was:\n${snippet}`;
}

export function findAndFormatFirstTextRecipe(
    results: SearchResultItem[]
): string | null {
    const recipeFileItem = results.find(
        (item) => item.filePath && item.filePath.toLowerCase().endsWith(".txt")
    );

    if (!recipeFileItem) {
        return null; // No .txt file found
    }
    if (!recipeFileItem.snippet) {
        // .txt file found, but it has no snippet to parse
        return `Recipe file "${recipeFileItem.title}" found, but it has no snippet.`;
    }

    const snippet = recipeFileItem.snippet;
    let ingredientsSection = "";
    let instructionsSection = "";

    // Updated regex for ingredients
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

    if (ingredientsSection || instructionsSection) {
        let formattedRecipe = "";
        if (ingredientsSection) {
            formattedRecipe += "Ingredients\n" + ingredientsSection;
        }
        if (instructionsSection) {
            if (formattedRecipe) {
                formattedRecipe += "\n\n";
            }
            formattedRecipe += "Steps\n" + instructionsSection;
        }
        return formattedRecipe.trim();
    }

    return `Could not parse "Ingredients:" or "Instructions:" sections from the snippet for "${recipeFileItem.title}". Snippet was:\n${snippet}`;
}