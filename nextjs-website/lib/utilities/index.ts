export const _FileUtilities = {
  async exists(path: string): Promise<boolean> {
    const file = Bun.file(path);
    return await file.exists();
  },
};

export const _StringUtils = {
  toSnakeCase(str: string): string {
    return str.replace(/([A-Z])/g, "_$1").toLowerCase().replace(/^_/, "");
  },
};
