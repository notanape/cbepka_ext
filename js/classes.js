class Linker {

    constructor() {
        this.obj;
        this.time;
        this.total;
        this.iter;
        this.selfId;
        this.timeout;
        this.undone;
        this.totalUndone;
        this.iterUndone;
        this.hour = 0;
    }

    cancel() {
        clearInterval(this.timeout);
        this.cancel = true;
    }

    setExtraHour(hour) {
        this.hour = parseInt(hour);
    }

    getExtraHour() {
        return this.hour * 60 * 60 * 1000
    }

    setObj(obj) {
        this.obj = obj;
        this.total = Object.keys(this.obj).length;
        this.iter = 0;
    }

    setUndone(obj) {
        this.undone = obj;
        this.totalUndone = Object.keys(this.obj).length;
        this.iterUndone = 0;
    }

    setDowns(obj) {
        this.total = Object.keys(this.obj).length;
        this.iter = 0;
    }

    setTime(time) {
        this.time = time;
    }

    setSelfId(selfId) {
        this.selfId = selfId;
    }

    getSelfId(selfId) {
        return this.selfId;
    }

    getObj() {
        return this.obj;
    }

    getUndone() {
        return this.undone;
    }

    getTime() {
        return this.time;
    }

    iter() {
        ++this.iter;
        if (this.iter == this.total) {
            this.iter = 0;
            this.updateQueue({
                selfId: this.getSelfId(),
                offers: this.getObj()
            });
        }
    }

    iterDown() {
        ++this.iterUndone;
        if (this.iterUndone == this.totalUndone) {
            this.iterUndone = 0;
            this.doneUndone()
        }
    }

    getIter() {
        return this.iter;
    }

    forEachLink(obj, time) {
        let k = Object.keys(obj);
        for (let i of k)
            this.getLink(i, time)
    }

    forEachDownload(obj) {
        let undone = {};

        for (let i in this.getObj().offers)
            if (!this.getObj().offers[i].data) {
                undone[i] = {
                    link: this.getObj().offers[i].link,
                    date: this.getObj().offers[i].date
                };
            }
        setUndone(undone);
        if (Object.keys(getUndone()).length != 0)
            this.startInterval(getUndone())
    }

    async getLink(name, time) {
        let _promise = new Promise((resolve, reject) => {
            let time = time;

            function _id(name) {
                $.get(`${server}/id?selfid=${selfid}&offer=${name}`).done(r => {
                    _link(name, r);
                }).fail((x, s, e) => {
                    let er = e.toLowerCase();
                    if (er.includes('bad') || x.status >= 400)
                        _id(name)
                })
            }

            function _link(name, id) {
                fetch(`https://www.admitad.com/sid${id}/en/aboard/campaign`).then(d => {
                    this.obj[name].link = d.url.substring(0, d.url.length - 1);
                }).catch(e => {
                    _link(name, id)
                })
            }

            function _makeDownload(name, link) {
                $.get(`${link}/payments/export/?search=&created-start=${time[0]}&created-end=${time[1]}&closed-start=&closed-end=&state=open&mode=default`).done(r => {
                    let date = new Date().getTime() + getExtraHour();
                    let range = [date - 2 * 1000, date + 2 * 1000];
                    this.obj[name].date = [];
                    [...obj[name].date] = range;
                    resolve();
                }).fail((x, s, e) => {
                    let er = e.toLowerCase();
                    if (er.includes('bad') || x.status >= 400)
                        _makeDownload(name, link)
                })
            }

            _id(name);
        })
        await _promise;
        this.iter();
    }

    updateQueue(obj) {
        $.ajax({
            url: `${server}/updateQueue`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            data: JSON.stringify(obj)
        }).done(r => {
            forEachDownload(this.getObj().offers);
        }).fail((x, s, e) => {
            let er = e.toLowerCase();
            if (er.includes('bad') || x.status >= 400)
                updateQueue(obj)
        })
    }

    updateOne(obj, res) {
        if (!cancel)
            $.ajax({
                url: `${server}/updateOne`,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                data: JSON.stringify(obj)
            }).done(r => {
                res()
            }).fail((x, s, e) => {
                let er = e.toLowerCase();
                if (er.includes('bad') || x.status >= 400)
                    updateQueue(obj, res)
            })
        else {
            res();
        }
    }

    startInterval(obj) {
        this.timeout = setTimeout(() => {
            for (let i in obj) {
                this.getDownload(i)
            }
        }, 2 * 1000)
    }

    doneUndone() {
        if (!cancel)
            this.forEachDownload(this.getObj().offers)
    }

    async getDownload(name) {
        let link = this.getObj().link;
        let _promise = new Promise((resolve, reject) => {

            function _getD(link) {
                $.get(`${link}/payments/exports/`).done(r => {
                    let d = new DOMParser();
                    let b = d.parseFromString(r, 'text/html');
                    let times = $('[datetime]', b);
                    if (times.length != 0) {
                        for (let o of times) {
                            let date = new Date($(o).attr('datetime')).getTime();
                            if (this.getUndone()[name].date[0] < date && this.getUndone()[name].date[1] > date) {
                                this.obj.offers[name].data = true;
                                this.obj.offers[name].link = $(o).parent().parent().find('a.download')[0].href;
                                this.updateOne({
                                    selfId: this.getSelfId(),
                                    [name]: {
                                        data: true,
                                        link: $(o).parent().parent().find('a.download')[0].href
                                    }
                                })
                            }
                        }
                    }
                    resolve()
                }).fail((x, s, e) => {
                    let er = e.toLowerCase();
                    if (er.includes('bad') || x.status >= 400)
                        _getD(link)
                })
            }

            _getD(link)
        })

        await _promise;
        this.iterDown();

    }

}