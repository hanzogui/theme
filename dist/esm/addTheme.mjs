import { _mutateTheme } from "./_mutateTheme.mjs";
function addTheme(props) {
  return _mutateTheme({
    ...props,
    insertCSS: true,
    mutationType: "add"
  });
}
export { addTheme };
//# sourceMappingURL=addTheme.mjs.map
