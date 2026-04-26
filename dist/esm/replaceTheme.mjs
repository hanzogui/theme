import { _mutateTheme } from "./_mutateTheme.mjs";
function replaceTheme({
  name,
  theme
}) {
  const next = _mutateTheme({
    name,
    theme,
    insertCSS: true,
    mutationType: "replace"
  });
  return next;
}
export { replaceTheme };
//# sourceMappingURL=replaceTheme.mjs.map
