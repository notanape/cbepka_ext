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
                    else {
                        if (admId != undefined) {
                            mainWId = admWId;
                            mainId = admId;
                            admWId = admId = undefined;
                        } else {
                            mainWId = windowId;
                            mainId = tabId;
                            windowId = tabId = undefined;
                        }
                        _openMain()
                    }
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
        left: Math.round((w - 969) / 2)
    }, w => {
        windowId = w.id
        tabId = w.tabs[0].id;
    })
}

function _openOAuth() {
    if (admWId == undefined)
        chrome.windows.create({
            url: `${server}/oauth?selfid=${selfId}`,
            type: 'panel',
            width: 969,
            height: 727,
            top: Math.round((h - 727) / 2),
            left: Math.round((w - 969) / 2)
        }, w => {
            admWId = w.id
            admId = w.tabs[0].id;
        })
    else
        chrome.tabs.update(admId, {
            url: `${server}/oauth?selfid=${selfId}`
        })
}

function _openFirst() {
    if (admWId == undefined)
        chrome.windows.create({
            url: `${server}/first?selfid=${selfId}`,
            type: 'panel',
            width: 969,
            height: 727,
            top: Math.round((h - 727) / 2),
            left: Math.round((w - 969) / 2)
        }, w => {
            admWId = w.id
            admId = w.tabs[0].id;
        })
    else
        chrome.tabs.update(admId, {
            url: `${server}/first?selfid=${selfId}`
        })
}

function _getQueue() {

    $.get(`${server}/queue?selfid=${selfId}`).done(r => {
        ({...queue
        } = r)
        _openMain();
    }).fail((x, s, e) => {
        let er = e.toLowerCase();
        if (er.includes('bad') || x.status >= 400)
            _getQueue()
    })
}

function _loadAuth() {
    $.get(`${server}/loadauth`).done(r => {}).fail((x, s, e) => {
        let er = e.toLowerCase();
        if (er.includes('bad') || x.status >= 400)
            _loadAuth()
    })
}

function _postFirst() {
    $.ajax({
        url: `${server}/first`,
        headers: {
            'Content-Type': 'application/json'
        },
        method: 'POST',
        data: JSON.stringify(info)
    }).done(r => {
        for (let i in info.offers)
            auth.offers.push(i);
        _getQueue();
    }).fail((x, s, e) => {
        if (e.toLowerCase().includes('bad'))
            _postFirst()
    })
}

function _openMain() {
    auth.offers.sort((a, b) => {
        let aI = a.toLowerCase();
        let bI = b.toLowerCase();
        let aZ = aI[0];
        let bZ = bI[0];
        if (aZ > bZ)
            return 1
        else if (aZ < bZ)
            return -1
        else if (aZ == bZ) {
            aZ = aI[1];
            bZ = bI[1];
            if (aZ > bZ)
                return 1
            else if (aZ < bZ)
                return -1
            else if (aZ == bZ) {
                aZ = aI[2];
                bZ = bI[2];
                if (aZ > bZ)
                    return 1
                else if (aZ < bZ)
                    return -1
                else if (aZ == bZ)
                    return 0
            }
        }
    })
    if (admWId == undefined)
        chrome.windows.create({
            url: `${server}/main?selfid=${selfId}`,
            type: 'panel',
            width: 480,
            height: 710,
            top: Math.round((h - 710) / 2),
            left: Math.round((w - 480) / 2)
        }, w => {
            mainWId = w.id
            mainId = w.tabs[0].id;
        })
    else {
        mainWId = admWId;
        mainId = admId;
        admWId = admId = undefined;
        chrome.windows.update(mainWId, {
            width: 480,
            height: 710,
            top: Math.round((h - 710) / 2),
            left: Math.round((w - 480) / 2)
        }, r => {
            chrome.tabs.update(mainId, {
                url: `${server}/main?selfid=${selfId}`
            })
        })
    }

}

function _findLinks() {
    linker = new Linker();
    linker.setObj(process);
    linker.setTime(dateDown);
    linker.setExtraHour(1);
    linker.setSelfId(selfId);
    linker.forEachLink(linker.getObj(), linker.getTime());
}

function _clean() {
    gSessionToken = scr = vice = load = adToken = lang = undefined;
    w = h = undefined;
    admId = admWId = undefined;
    mainId = mainWId = undefined;
    linker = undefined;
    auth = queue = info = process = {};
}