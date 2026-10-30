import UIKit
import WebKit
import Network

@main
final class AppDelegate: UIResponder, UIApplicationDelegate {
    var window: UIWindow?
    func application(_ application: UIApplication, didFinishLaunchingWithOptions options: [UIApplication.LaunchOptionsKey:Any]?) -> Bool {
        let window=UIWindow(frame: UIScreen.main.bounds)
        window.rootViewController=GameController()
        window.makeKeyAndVisible()
        self.window=window
        return true
    }
}

final class GameController: UIViewController, WKScriptMessageHandler, WKNavigationDelegate {
    var web: WKWebView!
    var server: LocalAssets?
    let pt=Locale.preferredLanguages.first?.hasPrefix("pt") ?? false
    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor=UIColor(red:246/255,green:245/255,blue:235/255,alpha:1)
        let config=WKWebViewConfiguration()
        config.websiteDataStore = .default()
        config.userContentController.add(self,name:"exportWorld")
        config.userContentController.addUserScript(WKUserScript(source:"window.ChimpiNative={exportWorld:(content,name)=>window.webkit.messageHandlers.exportWorld.postMessage({content:content,name:name})}",injectionTime:.atDocumentStart,forMainFrameOnly:true))
        web=WKWebView(frame:.zero,configuration:config)
        web.navigationDelegate=self
        web.isOpaque=false
        web.backgroundColor=view.backgroundColor
        web.scrollView.isScrollEnabled=false
        web.translatesAutoresizingMaskIntoConstraints=false
        view.addSubview(web)
        NSLayoutConstraint.activate([web.leadingAnchor.constraint(equalTo:view.safeAreaLayoutGuide.leadingAnchor),web.trailingAnchor.constraint(equalTo:view.safeAreaLayoutGuide.trailingAnchor),web.topAnchor.constraint(equalTo:view.safeAreaLayoutGuide.topAnchor),web.bottomAnchor.constraint(equalTo:view.safeAreaLayoutGuide.bottomAnchor)])
        do {
            let assets=Bundle.main.bundleURL.appendingPathComponent("assets",isDirectory:true)
            server=try LocalAssets(root:assets)
            server?.start { [weak self] url in DispatchQueue.main.async { self?.web.load(URLRequest(url:url)) } }
        } catch {
            let alert=UIAlertController(title:"ChimpiConstruções",message:pt ? "Não foi possível abrir o jogo" : "Could not open the game",preferredStyle:.alert)
            alert.addAction(UIAlertAction(title:"OK",style:.default))
            DispatchQueue.main.async { self.present(alert,animated:true) }
        }
        NotificationCenter.default.addObserver(self,selector:#selector(pauseGame),name:UIApplication.willResignActiveNotification,object:nil)
    }
    @objc func pauseGame(){web.evaluateJavaScript("(()=>{let h=document.getElementById('gameHUD');let m=document.getElementById('modalBackdrop');if(h&&!h.classList.contains('hidden')&&m&&m.classList.contains('hidden'))document.getElementById('pauseButton').click()})()",completionHandler:nil)}
    func webView(_ webView: WKWebView, decidePolicyFor action: WKNavigationAction, decisionHandler: @escaping (WKNavigationActionPolicy)->Void) {
        guard let url=action.request.url else {decisionHandler(.cancel);return}
        if url.host=="127.0.0.1" {decisionHandler(.allow)} else {decisionHandler(.cancel)}
    }
    func userContentController(_ controller: WKUserContentController,didReceive message: WKScriptMessage) {
        guard message.name=="exportWorld",message.frameInfo.isMainFrame,message.frameInfo.request.url?.host=="127.0.0.1",let data=message.body as? [String:Any],let content=data["content"] as? String,content.utf8.count<=3_000_000 else {return}
        let name=(data["name"] as? String ?? "Mundo.chimpi.json").components(separatedBy:CharacterSet.alphanumerics.union(CharacterSet(charactersIn:"_.-")).inverted).joined(separator:"-")
        let file=FileManager.default.temporaryDirectory.appendingPathComponent(String(name.prefix(100)))
        do {try content.write(to:file,atomically:true,encoding:.utf8);let picker=UIDocumentPickerViewController(forExporting:[file],asCopy:true);present(picker,animated:true)} catch { }
    }
    deinit {NotificationCenter.default.removeObserver(self)}
}

final class LocalAssets {
    let listener: NWListener
    let root: URL
    let queue=DispatchQueue(label:"com.snoopyos.chimpi.local")
    let stateFile: URL
    init(root:URL) throws {
        self.root=root.standardizedFileURL
        let directory=try FileManager.default.url(for:.applicationSupportDirectory,in:.userDomainMask,appropriateFor:nil,create:true).appendingPathComponent("ChimpiConstrucoes",isDirectory:true)
        try FileManager.default.createDirectory(at:directory,withIntermediateDirectories:true)
        stateFile=directory.appendingPathComponent("state.json")
        let parameters=NWParameters.tcp
        parameters.requiredLocalEndpoint = .hostPort(host:NWEndpoint.Host("127.0.0.1"),port:.any)
        listener=try NWListener(using:parameters)
    }
    func start(ready:@escaping (URL)->Void) {
        listener.stateUpdateHandler = { [weak self] state in
            guard let self=self else{return}
            if case .ready=state,let port=self.listener.port?.rawValue,let url=URL(string:"http://127.0.0.1:\(port)/index.html"){ready(url)}
        }
        listener.newConnectionHandler = { [weak self] connection in
            guard let self=self else{return}
            connection.start(queue:self.queue)
            self.receive(connection,buffer:Data())
        }
        listener.start(queue:queue)
    }
    func receive(_ connection:NWConnection,buffer:Data) {
        connection.receive(minimumIncompleteLength:1,maximumLength:65536) { [weak self] data,_,complete,error in
            guard let self=self else{connection.cancel();return}
            var buffer=buffer
            if let data=data {buffer.append(data)}
            if buffer.count>8_100_000 {self.send(connection,status:413,body:Data());return}
            guard let range=buffer.range(of:Data("\r\n\r\n".utf8)),let header=String(data:buffer[..<range.lowerBound],encoding:.utf8) else {
                if complete || error != nil {connection.cancel()} else {self.receive(connection,buffer:buffer)}
                return
            }
            let lines=header.components(separatedBy:"\r\n")
            let first=lines[0].split(separator:" ")
            guard first.count>=2 else{self.send(connection,status:400,body:Data());return}
            var headers=[String:String]()
            for line in lines.dropFirst(){let pair=line.split(separator:":",maxSplits:1);if pair.count==2{headers[String(pair[0]).lowercased()]=String(pair[1]).trimmingCharacters(in:.whitespaces)}}
            let length=Int(headers["content-length"] ?? "0") ?? 0
            guard length>=0 && length<=8_000_000 else{self.send(connection,status:413,body:Data());return}
            if buffer.count<range.upperBound+length {if complete {self.send(connection,status:400,body:Data())}else{self.receive(connection,buffer:buffer)};return}
            self.handle(connection,method:String(first[0]),target:String(first[1]),headers:headers,body:buffer.subdata(in:range.upperBound..<(range.upperBound+length)))
        }
    }
    func handle(_ connection:NWConnection,method:String,target:String,headers:[String:String],body:Data) {
        let path=URLComponents(string:"http://127.0.0.1"+target)?.path ?? "/"
        if path=="/api/state" {
            if method=="GET" {send(connection,body:(try? Data(contentsOf:stateFile)) ?? Data("{}".utf8),mime:"application/json");return}
            if method=="POST",let port=listener.port?.rawValue,headers["origin"]=="http://127.0.0.1:\(port)",headers["host"]=="127.0.0.1:\(port)",let object=(try? JSONSerialization.jsonObject(with:body)) as? [String:Any],Set(object.keys).isSubset(of:["worlds","current","settings","avatar"]) {
                do {try body.write(to:stateFile,options:.atomic);send(connection,status:204,body:Data())}catch{send(connection,status:500,body:Data())};return
            }
            send(connection,status:403,body:Data());return
        }
        guard method=="GET" else{send(connection,status:405,body:Data());return}
        let relative=path=="/" ? "index.html" : String(path.dropFirst())
        let file=root.appendingPathComponent(relative).standardizedFileURL
        guard file.path.hasPrefix(root.path+"/"),let data=try? Data(contentsOf:file) else{send(connection,status:404,body:Data());return}
        let types=["html":"text/html; charset=utf-8","js":"text/javascript; charset=utf-8","css":"text/css; charset=utf-8","json":"application/json; charset=utf-8","webmanifest":"application/manifest+json","png":"image/png","svg":"image/svg+xml","ico":"image/x-icon"]
        send(connection,body:data,mime:types[file.pathExtension] ?? "application/octet-stream")
    }
    func send(_ connection:NWConnection,status:Int=200,body:Data,mime:String="text/plain") {
        let names=[200:"OK",204:"No Content",400:"Bad Request",403:"Forbidden",404:"Not Found",405:"Method Not Allowed",413:"Payload Too Large",500:"Internal Server Error"]
        let header="HTTP/1.1 \(status) \(names[status] ?? "Error")\r\nContent-Type: \(mime)\r\nContent-Length: \(body.count)\r\nCache-Control: no-store\r\nService-Worker-Allowed: /\r\nConnection: close\r\n\r\n"
        var response=Data(header.utf8);response.append(body)
        connection.send(content:response,completion:.contentProcessed({_ in connection.cancel()}))
    }
}
