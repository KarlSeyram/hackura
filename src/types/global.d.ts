
export {};

declare global {
  interface Window {
    gapi: any;
    google: {
      accounts: {
        oauth2: {
          initTokenClient(config: any): any;
        };
      };
      picker: {
        ViewId: {
            DOCS: string;
        };
        Action: {
            PICKED: string;
        };
        PickerBuilder: new () => any;
        View: new (viewId: string) => any;
      };
    };
  }
}
