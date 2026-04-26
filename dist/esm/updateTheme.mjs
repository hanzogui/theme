import { _mutateTheme } from "./_mutateTheme.mjs";
function updateTheme({
  name,
  theme
}) {
  return _mutateTheme({
    name,
    theme,
    insertCSS: true,
    mutationType: "update"
  });
}
export { updateTheme };
//# sourceMappingURL=updateTheme.mjs.map
