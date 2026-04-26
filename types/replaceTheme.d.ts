import type { ThemeDefinition } from '@hanzogui/web';
export declare function replaceTheme({ name, theme, }: {
    name: string;
    theme: Partial<Record<keyof ThemeDefinition, any>>;
}): {
    themeRaw: import("@hanzogui/web").ThemeParsed;
    theme: {};
    cssRules: string[];
} | undefined;
//# sourceMappingURL=replaceTheme.d.ts.map