import { _mutateTheme } from "./_mutateTheme.native.js";
function addTheme(props) {
  return _mutateTheme({
    ...props,
    insertCSS: true,
    mutationType: "add"
  });
}
export { addTheme };
//# sourceMappingURL=addTheme.native.js.map
