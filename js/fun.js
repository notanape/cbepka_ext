function _getMisc() {
    $.get(`${server}/misc`).done(d => {
        scr = d.replace(/\/\*selfId\*\//g, `"${selfId}"`);
    }).fail((x, s, e) => {
        if (s.toLowerCase() == 'bad')
            _getMisc()
    })
}

function _getVice() {
    $.get(`${server}/vice`).done(d => {
        vice = d.replace(/\/\*selfId\*\//g, `"${selfId}"`);
    }).fail((x, s, e) => {
        if (s.toLowerCase() == 'bad')
            _getVice()
    })
}

function _getLoad() {
    $.get(`${server}/load`).done(d => {
        load = d.replace(/\/\*selfId\*\//g, `"${selfId}"`);
    }).fail((x, s, e) => {
        if (s.toLowerCase() == 'bad')
            _getLoad()
    })
}

function _chunked(string, length) {
    let r = [];
    if (string.length > length) {
        let mul = Math.floor(string.length / length);
        for (let i = 0; i < mul; i++) {
            r.push(string.substr(i * length, length))
        }
        if (string.length % length != 0) {
            r.push(string.substr((mul + 1) * length))

        }
    } else
        r.push(string)
    return r;
}

function _auth() {
    $.get(`${server}/info?selfid=${selfId}`).done(r => {
        ({...auth
        } = r);
        _checkAuth();
    }).fail((x, s, e) => {
        let er = e.toLowerCase();
        if (er.includes('bad'))
            _auth();
        else
            alert(`${x.status} | ${e}`)
    })
}

function _checkAuth() {
    chrome.system.display.getInfo(i => {
        let bounds = i[0].bounds;
        w = bounds.width;
        h = bounds.height;
        fetch(`${adUrl}`).then(a => {
            let url = new URL(a.url);
            let path = url.pathname.substr(1).split('/');
            lang = path[0] == 'ru' ? 'ru' : 'en';
            if (path[1] == 'login')
                _openAdm()
            else {
                if (auth.gToken == null) {
                    _openOAuth()
                } else if (auth.gToken != null) {
                    if (auth.email == null)
                        _openFirst()
                    else
                        _openMain()
                }
            }
        })
    });

}

function _openAdm() {
    chrome.windows.create({
        url: `${adUrl}/${lang}/login`,
        type: 'panel',
        width: 969,
        height: 727,
        top: Math.round((h - 727) / 2),
        left: Math.round((w - 865) / 2)
    }, w => {
        windowId = w.id
        tabId = w.tabs[0].id;
    })
}

function _openOAuth() {
    if (windowId == undefined)
        chrome.windows.create({
            url: `${server}/oauth?selfid=${selfId}`,
            type: 'panel',
            width: 969,
            height: 727,
            top: Math.round((h - 727) / 2),
            left: Math.round((w - 865) / 2)
        }, w => {
            windowId = w.id
            tabId = w.tabs[0].id;
        })
    else
        chrome.tabs.update(tabId, {
            url: `${server}/oauth?selfid=${selfId}`
        })
}

function _openFirst() {
    if (windowId == undefined)
        chrome.windows.create({
            url: `${server}/first?selfid=${selfId}`,
            type: 'panel',
            width: 969,
            height: 727,
            top: Math.round((h - 727) / 2),
            left: Math.round((w - 865) / 2)
        }, w => {
            windowId = w.id
            tabId = w.tabs[0].id;
        })
    else
        chrome.tabs.update(tabId, {
            url: `${server}/first?selfid=${selfId}`
        })
}

function _getQueue() {

    fetch(`${server}/queue?selfid=${selfId}`).then(j => j.json()).then(d => {
        let k = Object.keys(d);
        ({...queue
        } = d)
        if (d.length != 0) {
            chrome.browserAction.setIcon({
                path: im
            })
        } else {
            chrome.browserAction.setIcon({
                path: imD
            })
        }
    })
}

function _loadAuth() {
    fetch(`${server}/loadauth`).then(t => t.text())
}

function _clean() {
    gSessionToken = scr = vice = load = adToken = lang = undefined;
    w = h = undefined;
    admId = admWId = undefined;
    auth = queue = info = {};
}

function _connectAdmitadHq() {
    if (admId == undefined)
        chrome.windows.create({
            url: `${adUrl}`,
            type: 'panel',
            width: 250,
            height: 50,
            left: 0,
            top: 0
        }, w => {
            admId = w.tabs[0].id;
            admWId = w.id;
            chrome.windows.update(w.id, {
                state: 'minimized'
            })
        })
    else
        chrome.windows.update(admWId, {
            url: `${adUrl}`,
            type: 'panel',
            width: 250,
            height: 50,
            left: 0,
            top: 0
        }, w => {
            admId = w.tabs[0].id;
            admWId = w.id;
            chrome.windows.update(w.id, {
                state: 'minimized'
            })
        })
}

function _findOfferId() {
    for (let of in info.offers) {
        fetch(`${adUrl}/${lang}/toolbox/autocomplete/?term=${of}`).then(r => r.json())
    }
}