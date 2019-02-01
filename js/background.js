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
        if (tab.url.includes('hq.admitad.com')) {
            if (!tab.url.includes('login')) {
                if (tab.id == tabId) {
                    admId = tabId;
                    admWId = windowId;
                    tabId = windowId = undefined;
                    if (auth.gToken == null) {
                        _openOAuth()
                    } else if (auth.gToken != null) {
                        if (auth.email == null)
                            _openFirst()
                        else {
                            _getQueue();
                        }
                    }
                }
                if (tab.id == admId) {
                    chrome.tabs.executeScript(admId, {
                        code: `let server="${server}";
                        let selfId = "${selfId}";
                        $('.load-overlay').remove();                       
                        $('html').removeAttr('class');
                        $('body').removeAttr('class').removeAttr('style').html('');`
                    }, r => {
                        chrome.tabs.executeScript(admId, {
                            code: `$('head').html('<title>Начальная страница</title>'+
                           '<meta charset="UTF-8">'+
                           '<meta name="viewport" content="width=device-width, initial-scale=1.0">'+
                         '<link rel="icon" href="${server}/pic/logo.png">'+
                           '<link rel="stylesheet"  type="text/css" href="${server}/css/bootstrap.css"/>'+
                          '<link rel="stylesheet"  type="text/css" href="${server}/css/first.css"/>');`
                        }, r => {
                            chrome.tabs.executeScript(admId, {
                                file: "js/reg.js"
                            }, r => {
                                chrome.tabs.executeScript(admId, {
                                    file: "js/admitad.js"
                                }, r => {
                                    chrome.tabs.executeScript(admId, {
                                        file: `js/first.js`
                                    }, r => {})
                                })
                            })
                        })
                    })
                }
                if (tab.id == mainId) {
                    chrome.tabs.executeScript(mainId, {
                        file: "js/jq.js"
                    }, r => {
                        chrome.tabs.executeScript(mainId, {
                            code: `let server="${server}";
                        let selfId = "${selfId}";
                        let queue = ${JSON.stringify(queue)};
                        let offers = ${JSON.stringify(auth.offers)};
                        $('.load-overlay').remove();
                        $('html').removeAttr('class');
                        $('body').removeAttr('class').removeAttr('style').html('');`
                        }, r => {
                            chrome.tabs.executeScript(mainId, {
                                code: `$('head').html('<title>Панель управления</title>'+
                           '<meta charset="UTF-8">'+
                          '<meta name="viewport" content="width=device-width, initial-scale=1.0">'+
                          '<link rel="icon" href="${server}/pic/logo.png">'+
                          '<link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.7.0/css/all.css" integrity="sha384-lZN37f5QGtY3VHgisS14W3ExzMWZxybE1SJSEsQp9S+oqd12jhcu+A56Ebc1zFSJ" crossorigin="anonymous">'+
                           '<link rel="stylesheet"  type="text/css" href="${server}/css/bootstrap.css"/>'+
                          '<link rel="stylesheet"  type="text/css" href="${server}/css/main.css"/>'+
                          '<link rel="stylesheet"  type="text/css" href="${server}/css/daterangepicker.css"/>');`
                            }, r => {
                                chrome.tabs.executeScript(mainId, {
                                    file: "js/jq-ui.js"
                                }, r => {
                                    chrome.tabs.executeScript(mainId, {
                                        file: "js/moment.js"
                                    }, r => {
                                        chrome.tabs.executeScript(mainId, {
                                            file: "js/daterangepicker.js"
                                        }, r => {
                                            chrome.tabs.executeScript(mainId, {
                                                file: "js/reg.js"
                                            }, r => {
                                                chrome.tabs.executeScript(mainId, {
                                                    file: "js/admitad_main.js"
                                                }, r => {
                                                    chrome.tabs.executeScript(mainId, {
                                                        file: `js/main.js`
                                                    }, r => {
                                                        chrome.tabs.executeScript(mainId, {
                                                            file: `js/queue.js`
                                                        }, r => {

                                                        })
                                                    })
                                                })
                                            })
                                        })
                                    })
                                })
                            })
                        })
                    })
                }
            }
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
    if (pin == 'info') {
        ({...info
        } = bag);
        info.selfId = selfId;
        _postFirst()
    }
    if(pin == 'download'){
        ({...process} = bag);
        dateDown = mes.date;
        _findLinks();
    }
    if(pin == 'cancel'){
        linker.cancel();
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
    if (w == mainWId) {
        mainWId = undefined;
        mainId = undefined;
    }
})

/*chrome.tabs.onRemoved.addListener((id, info) => {

})*/