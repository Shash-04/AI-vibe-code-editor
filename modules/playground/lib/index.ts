import { TemplateFile, TemplateFolder } from "./path-to-json";

//SUPPORTING HOOK FOR FILEEXPLORER
//SUPPORTING HOOK FOR FILEEXPLORER
//SUPPORTING HOOK FOR FILEEXPLORER

export function findFilePath(
    file: TemplateFile,
    folder: TemplateFolder,
    pathSoFar: string[] = []
): string | null {
    for (const item of folder.items) {
        if ("folderName" in item) {
            const res = findFilePath(file, item, [...pathSoFar, item.folderName]);
            if (res) return res;
        } else {
            if (
                item.filename === file.filename &&
                item.fileExtension === file.fileExtension
            ) {
                return [
                    ...pathSoFar,
                    item.filename + (item.fileExtension ? "." + item.fileExtension : ""),
                ].join("/");
            }
        }
    }
    return null;
}



/**
 * Finds the first file in a template tree (depth-first, preferring files at the
 * shallowest level). Used to auto-open a file on load so the editor shows
 * content and the WebContainer preview mounts and boots.
 */
export function findFirstFile(folder: TemplateFolder): TemplateFile | null {
    // Prefer a file at the current level before descending into folders.
    const fileHere = folder.items.find(
        (item) => !("folderName" in item)
    ) as TemplateFile | undefined;
    if (fileHere) return fileHere;

    for (const item of folder.items) {
        if ("folderName" in item) {
            const found = findFirstFile(item);
            if (found) return found;
        }
    }
    return null;
}

/**
 * Generates a unique file ID based on file location in folder structure
 * @param file The template file
 * @param rootFolder The root template folder containing all files
 * @returns A unique file identifier including full path
 */
export const generateFileId = (file: TemplateFile, rootFolder: TemplateFolder): string => {
    // Find the file's path in the folder structure
    const path = findFilePath(file, rootFolder)?.replace(/^\/+/, '') || '';

    // Handle empty/undefined file extension
    const extension = file.fileExtension?.trim();
    const extensionSuffix = extension ? `.${extension}` : '';

    // Combine path and filename
    return path
        ? `${path}/${file.filename}${extensionSuffix}`
        : `${file.filename}${extensionSuffix}`;
}