export type TemplateItem = {
  [key: string]: TemplateItem | undefined;
} & {
  key: string;
  type: string;
  getByWishId: (id: string) => TemplateItem | undefined;
  addProps: (props: any) => void;
  setCallback: (
    eventName: string,
    callback: (nativeEvent: any) => void,
  ) => void;
  describe: () => string;
  setChildren: (children: TemplateItem[]) => void;
  getTag: () => number;
};
