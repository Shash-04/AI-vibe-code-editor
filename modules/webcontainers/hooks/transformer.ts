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

type WebContainerFileSystem = Record<string, WebContainerFile | WebContainerDirectory>;

export function transformToWebContainerFormat(template: { folderName: string; items: TemplateItem[] }): WebContainerFileSystem {
    function processItem(item: TemplateItem): WebContainerFile | WebContainerDirectory {
        if (item.folderName !== undefined && item.items !== undefined) {
            // This is a directory
            const directoryContents: WebContainerFileSystem = {};

            item.items.forEach(subItem => {
                let key: string;
                if (subItem.folderName !== undefined) {
                    key = subItem.folderName;
                } else {
                    const name = subItem.filename || "";
                    const ext = subItem.fileExtension;
                    key = ext ? `${name}.${ext}` : name;
                }
                
                if (key) {
                    directoryContents[key] = processItem(subItem);
                }
            });

            return {
                directory: directoryContents
            };
        } else {
            // This is a file
            return {
                file: {
                    contents: item.content || ""
                }
            };
        }
    }

    const result: WebContainerFileSystem = {};

    // Flatten the root folder items so they are at the top level of the WebContainer
    template.items.forEach(item => {
        let key: string;
        if (item.folderName !== undefined) {
            key = item.folderName;
        } else {
            const name = item.filename || "";
            const ext = item.fileExtension;
            key = ext ? `${name}.${ext}` : name;
        }

        if (key) {
            result[key] = processItem(item);
        }
    });

    return result;
}
