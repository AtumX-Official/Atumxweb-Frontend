declare module "*.svg?url" {
    const content: string;
    export default content;
  }

declare module "*.pdf" {
  const content: string;
  export default content;
}
