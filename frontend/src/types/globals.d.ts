// Allow side-effect imports of CSS files (e.g. import '../styles/tailwind.css')
declare module '*.css' {
  const content: Record<string, string>;
  export default content;
}
