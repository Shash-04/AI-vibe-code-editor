interface TemplateItem {
    filename?: string;
    fileExtension?: string;
    content?: string;
    folderName?: string;
    items?: TemplateItem[];
}

interface WebContainerFile {
    file: {
        contents: string;
    };
}

interface WebContainerDirectory {
    directory: {
        [key: string]: WebContainerFile | WebContainerDirectory;
    };
}

type WebContainerFileSystem = Record<
    string,
    WebContainerFile | WebContainerDirectory
>;

export function transformToWebContainerFormat(
    template: { items: TemplateItem[] }
): WebContainerFileSystem {
    function processItem(item: TemplateItem): WebContainerFile | WebContainerDirectory {
        // ✅ Directory if items exist
        if (Array.isArray(item.items)) {
            const directory: WebContainerFileSystem = {};

            for (const subItem of item.items) {
                const key = getItemKey(subItem);
                directory[key] = processItem(subItem);
            }

            return { directory };
        }

        // ✅ File
        return {
            file: {
                contents: item.content ?? ""
            }
        };
    }

    function getItemKey(item: TemplateItem): string {
        if (item.folderName) return item.folderName;

        if (!item.filename) {
            throw new Error("File item missing filename");
        }

        return item.fileExtension
            ? `${item.filename}.${item.fileExtension}`
            : item.filename;
    }

    const fs: WebContainerFileSystem = {};

    for (const item of template.items) {
        const key = getItemKey(item);
        fs[key] = processItem(item);
    }

    return fs;
}
