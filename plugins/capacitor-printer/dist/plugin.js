import { registerPlugin } from '@capacitor/core';

export interface PrinterPlugin {
  print(options: { html: string; name?: string }): Promise<void>;
}

const Printer = registerPlugin<PrinterPlugin>('Printer');

export { Printer };
