package com.rental.manager.printer;

import android.content.Context;
import android.print.PrintAttributes;
import android.print.PrintDocumentAdapter;
import android.print.PrintManager;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "Printer")
public class PrinterPlugin extends Plugin {

    private WebView webView;

    @PluginMethod
    public void print(final PluginCall call) {
        final String html = call.getString("html", "");
        final String name = call.getString("name", "Document");

        getActivity().runOnUiThread(new Runnable() {
            @Override
            public void run() {
                webView = new WebView(getActivity());
                webView.setWebViewClient(new WebViewClient() {
                    @Override
                    public void onPageFinished(WebView view, String url) {
                        try {
                            PrintManager pm = (PrintManager) getActivity().getSystemService(Context.PRINT_SERVICE);
                            PrintDocumentAdapter adapter = webView.createPrintDocumentAdapter(name);
                            pm.print(name, adapter, new PrintAttributes.Builder().build());
                            call.resolve();
                        } catch (Exception e) {
                            call.reject("打印失败：" + e.getMessage());
                        }
                    }
                });
                webView.loadDataWithBaseURL(null, html, "text/html; charset=utf-8", "UTF-8", null);
            }
        });
    }
}
