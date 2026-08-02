export interface PrinterPlugin {
  print(options: { html: string; name?: string }): Promise<void>;
}
