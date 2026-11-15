package com.snoopyos.chimpiconstrucoes;

import android.app.Activity;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.view.WindowInsets;
import android.webkit.JavascriptInterface;
import android.webkit.ServiceWorkerClient;
import android.webkit.ServiceWorkerController;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import android.widget.Toast;
import androidx.webkit.WebViewAssetLoader;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;

public class MainActivity extends Activity {
    private WebView web;
    private ValueCallback<Uri[]> upload;
    private String exportData;
    private final boolean portuguese = java.util.Locale.getDefault().getLanguage().equals("pt");

    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        FrameLayout frame = new FrameLayout(this);
        frame.setBackgroundColor(Color.rgb(246,245,235));
        frame.setOnApplyWindowInsetsListener((view, insets) -> {
            if (Build.VERSION.SDK_INT >= 30) {
                android.graphics.Insets bars = insets.getInsets(WindowInsets.Type.systemBars());
                view.setPadding(bars.left,bars.top,bars.right,bars.bottom);
            } else view.setPadding(insets.getSystemWindowInsetLeft(),insets.getSystemWindowInsetTop(),insets.getSystemWindowInsetRight(),insets.getSystemWindowInsetBottom());
            return insets;
        });
        web = new WebView(this);
        web.setBackgroundColor(Color.rgb(246,245,235));
        frame.addView(web,new FrameLayout.LayoutParams(-1,-1));
        setContentView(frame);
        WebSettings settings = web.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(true);
        settings.setMediaPlaybackRequiresUserGesture(true);
        if (Build.VERSION.SDK_INT >= 29) settings.setForceDark(WebSettings.FORCE_DARK_OFF);
        WebViewAssetLoader loader = new WebViewAssetLoader.Builder().addPathHandler("/assets/",new WebViewAssetLoader.AssetsPathHandler(this)).build();
        web.setWebViewClient(new WebViewClient() {
            @Override public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) { return loader.shouldInterceptRequest(request.getUrl()); }
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri uri=request.getUrl();
                if ("https".equals(uri.getScheme()) && "appassets.androidplatform.net".equals(uri.getHost())) return false;
                if (request.hasGesture()) { try {startActivity(new Intent(Intent.ACTION_VIEW,uri));} catch (Exception ignored) {} }
                return true;
            }
        });
        ServiceWorkerController.getInstance().setServiceWorkerClient(new ServiceWorkerClient() {
            @Override public WebResourceResponse shouldInterceptRequest(WebResourceRequest request) { return loader.shouldInterceptRequest(request.getUrl()); }
        });
        web.setWebChromeClient(new WebChromeClient() {
            @Override public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> result, FileChooserParams params) {
                if (upload!=null) upload.onReceiveValue(null);
                upload=result;
                Intent intent=new Intent(Intent.ACTION_OPEN_DOCUMENT).setType("application/json").addCategory(Intent.CATEGORY_OPENABLE);
                try { startActivityForResult(intent,41); } catch(Exception error){upload.onReceiveValue(null);upload=null;}
                return true;
            }
        });
        web.addJavascriptInterface(new ExportBridge(),"ChimpiNative");
        web.loadUrl("https://appassets.androidplatform.net/assets/index.html");
    }

    public class ExportBridge {
        @JavascriptInterface public void exportWorld(String content,String name) {
            if(content==null || content.length()>3_000_000)return;
            exportData=content;
            String safe=name==null?"Mundo.chimpi.json":name.replaceAll("[^\\p{L}\\p{N}_.-]","-");
            runOnUiThread(()->{
                Intent intent=new Intent(Intent.ACTION_CREATE_DOCUMENT).setType("application/json").addCategory(Intent.CATEGORY_OPENABLE).putExtra(Intent.EXTRA_TITLE,safe);
                startActivityForResult(intent,42);
            });
        }
    }

    @Override protected void onActivityResult(int request,int result,Intent data) {
        super.onActivityResult(request,result,data);
        if(request==41 && upload!=null){upload.onReceiveValue(result==RESULT_OK && data!=null && data.getData()!=null?new Uri[]{data.getData()}:null);upload=null;}
        if(request==42 && result==RESULT_OK && data!=null && data.getData()!=null && exportData!=null){
            try(OutputStream out=getContentResolver().openOutputStream(data.getData())){
                if(out!=null)out.write(exportData.getBytes(StandardCharsets.UTF_8));
                Toast.makeText(this,portuguese?"Mundo exportado":"World exported",Toast.LENGTH_SHORT).show();
            }catch(Exception error){Toast.makeText(this,portuguese?"Não foi possível exportar":"Could not export",Toast.LENGTH_LONG).show();}
            exportData=null;
        }
    }

    @Override public void onBackPressed() {
        web.evaluateJavascript("(()=>{let m=document.getElementById('modalBackdrop');if(m&&!m.classList.contains('hidden')){document.getElementById('closeModal').click();return 'handled'}let h=document.getElementById('gameHUD');if(h&&!h.classList.contains('hidden')){document.getElementById('pauseButton').click();return 'handled'}return 'exit'})()",result->{if("\"exit\"".equals(result))finish();});
    }
    @Override protected void onPause(){super.onPause();web.evaluateJavascript("(()=>{let h=document.getElementById('gameHUD');let m=document.getElementById('modalBackdrop');if(h&&!h.classList.contains('hidden')&&m&&m.classList.contains('hidden'))document.getElementById('pauseButton').click()})()",null);web.onPause();}
    @Override protected void onResume(){super.onResume();if(web!=null)web.onResume();}
    @Override protected void onDestroy(){if(upload!=null)upload.onReceiveValue(null);if(web!=null){web.removeJavascriptInterface("ChimpiNative");web.destroy();}super.onDestroy();}
}
