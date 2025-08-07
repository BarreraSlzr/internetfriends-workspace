export const FileUtilities = {
  async exists(path: string): Promise<boolean> {
    const file = Bun.file(path);
    return await file.exists();
  },
};

export const StringUtils = {
  toSnakeCase(str: string): string {
    return str.replace(/([A-Z])/g, "_$1").toLowerCase().replace(/^_/, "");
  },
};
