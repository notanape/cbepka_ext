chrome.management.getSelf(app => {
    selfId = app.id;
});
chrome.contentSettings.popups.set({
    primaryPattern: pop + "/*",
    setting: "allow"
})

chrome.runtime.onInstalled.addListener(detail => {
    if (detail.reason == 'update')
        _loadAuth();
})

chrome.browserAction.onClicked.addListener(tab => {
    _clean();
    _auth();
})

chrome.windows.onCreated.addListener(w => {
    _getQueue();
    /*_getMisc(), _getVice(), _getLoad();*/
})

chrome.tabs.onUpdated.addListener((id, info, tab) => {
    if (info.status == "loading") {

        /*chrome.tabs.executeScript(id, {
            file: 'js/jq.js'
        }, r => {
            chrome.tabs.executeScript(id, {
                code: scr
            }, r => {
                chrome.tabs.executeScript(id, {
                    code: vice
                })
            })
        })*/
    }
    if (info.status == "complete") {
        if (tab.id == tabId) {
            if (tab.url.includes('hq.admitad.com')) {
                if (!tab.url.includes('login')) {
                    if (auth.gToken == null) {
                        _openOAuth()
                    } else if (auth.gToken != null) {
                        if (auth.email == null)
                            _openFirst()
                        else
                            _openMain()
                    }
                }
            }
        }
        if (tab.id == admId) {
            chrome.tabs.executeScript(admId, {
                code: `let selfId = "${selfId}";
                        let server = "${server}";`
            }, r => {
                chrome.tabs.executeScript(admId, {
                    file: "js/admitad.js"
                }, r => {
                    _findOfferId()
                })
            })
        }
        /*chrome.tabs.executeScript(id, {
            code: scr
        }, r => {
            chrome.tabs.executeScript(id, {
                code: load
            })
        })*/

    }
})

chrome.runtime.onMessage.addListener((mes, sender, response) => {
    let pin = mes.pin;
    let bag = mes.bag;

});

chrome.runtime.onMessageExternal.addListener((mes, sender, response) => {
    let pin = mes.pin;
    let bag = mes.bag;
    if (pin == 'offers') {
        ({...info
        } = bag);
        _connectAdmitadHq()
    }
})

chrome.windows.onRemoved.addListener(w => {
    if (w == windowId) {
        windowId = undefined;
        tabId = undefined;
    }
    if (w == admWId) {
        admWId = undefined;
        admId = undefined;
    }
})

/*chrome.tabs.onRemoved.addListener((id, info) => {

})*/