let $dat;
let $off;
let $offs;
let $wait;
let $add;
let $warn;
let $all;
let $down, $send;
let date = new Date().toLocaleDateString();
let current;
let info = {};
let proccess = {};
let down = 'Выгружаю...'
let send = 'Отправляю...'
let stopped = false;
let lang = location.pathname.substr(1).split('/')[0];
$dat = $('.date');
$wait = $('.wait');
$add = $('.add');
$offs = $('.offers');
$off = $offs.find('.offer');
$warn = $('.warning');
$warnT = $($warn.find('span')[0]);
$warn1 = $warn.find('.alr');
$warn2 = $warn.find('.total');
$stop = $warn.find('.reject');
$all = $('.all');
$down = $('.blue');
$send = $('.green');
$standby = $('.neutral');

function _appendDOM() {
    for (let off of offers) {
        let dom = function(name) {
            let que = false;
            let dat = true;
            if (queue.hasOwnProperty(offers)) {
                if (queue.offers.hasOwnProperty(name)) {
                    que = true;
                    if (queue.offers[name].data && !queue.offers[name].letter)
                        dat = false;
                }
            }
            return `<div class="offer d-flex align-items-center">
						<div class="myMark ch"></div>
						<div class="name">${name}</div>
						<div class="input d-flex">
							<input type="text" class="email" value="">
							<div class="check">
								<i class="fas fa-check"></i>
							</div>
						</div>
                        <div class="date-sent ${!dat ? 'view' : ''}">${!dat ? queue.offers[name].sent !=  null ? queue.offers[name].sent.replace(', ','<br>') : '00.00<br>00:00' :'00.00<br>00:00'}</div>
						<div class="download ${que ? queue.offers[name].data ? 'done' : '' :''}">
							<i class="fas fa-file-download"></i>
						</div>
						<div class="sent${que ? queue.offers[name].letter ? 'done' : '' :''}">
							<i class="far fa-envelope"></i>
						</div>
						<div class="erase">
							<i class="fas fa-times"></i>
						</div>
					</div>
					`
        };
        let $dom = $(dom(off));

        $dom.draggable({
            axis: 'x',
            containment: [-19, 0, 17, 0],
            grid: [34, 0],
            distance: 15
        })
        $dom.find('.name').bind({
            dblclick: e => {
                e.stopImmediatePropagation();
                let inp = $(e.target).parent().find('.input');
                $dom.parent().children().each(function() {
                    let inp = $(this).find('.input');
                    if (inp[0] != $(e.target).parent().find('.input')[0])
                        inp.removeClass('front')
                })
                let act = false;
                if (!inp.hasClass('front') && !act) {
                    function _getE(name) {
                        $.get(`${server}/getEmail?selfid=${selfId}&name=${name}`).done(r => {
                            inp.find('input').val(r);
                            current = r;
                            inp.find('input').removeClass('wrong');
                            inp.addClass('front');
                            act = true;
                        }).fail((x, s, e) => {
                            let er = e.toLowerCase();
                            if (er.includes('bad') || x.status >= 400)
                                _getE(name)
                        })
                    }
                    _getE($(e.target).parent().find('.name').text())
                } else if (inp.hasClass('front') && !act) {
                    inp.find('input').val(current);
                    inp.removeClass('front');
                    act = true;
                }
            }
        })
        $dom.find('.check').bind({
            click: _changeEmailUI
        })
        $dom.find('input').bind({
            keypress: _chance
        })
        $dom.find('.myMark').bind({
            click: _check
        })
        $dom.find('.erase').bind({
            click: _removeUI
        })
        $offs.append($dom);
    }

    setTimeout(_adjust, 150)
    _wait();


}

function _wait() {
    $wait.toggleClass('front');
    $wait.css({
        width: $offs.width() + 2,
        height: $offs.height() + 2,
        top: $offs.offset().top,
        left: $offs.offset().left
    })
}

function _adjust() {
    $add.css({
        top: $offs.height() + $offs.offset().top - $add.height() - 10 + 1,
        left: $offs.offset().left + ($offs.width() - $add.width()) / 2 + 1 - 15
    })
}

function _changeEmailUI(e) {
    if ($warn.hasClass('op')) {
        let $inp = $(e.target).closest('.input').find('input');
        let val = $inp.val().trim();
        if (val == '' || !reg.test(val))
            $inp.addClass('wrong');
        else if (val != current && reg.test(val)) {
            let off = $(e.target).closest('.offer').find('.name').text();
            current = val;
            _changeEmail(off, current);
        }
    }
}

function _chance(e) {
    if ($(e.target).hasClass('wrong'))
        $(e.target).removeClass('wrong')
}

function _check(e) {
    if ($warn.hasClass('op')) {
        $(e.target).toggleClass('ch');
        let total = $offs.find('.offer').length;
        let iter = 0;
        for (let i of $offs.find('.offer')) {
            let c = $(i).find('.myMark');
            if (c.hasClass('ch'))
                ++iter;
        }
        if (total == iter)
            $all.removeClass('half').addClass('ch');
        else if (total != iter) {
            if (iter == 0)
                $all.removeClass('ch').removeClass('half')
            else
                $all.removeClass('ch').addClass('half');
        }
    }
}

function _checkAll() {
    if ($warn.hasClass('op')) {
        act = false;
        if (($all.hasClass('half') || (!$all.hasClass('half') && !$all.hasClass('ch'))) && !act) {
            $offs.find('.offer').each(function() {
                $(this).find('.myMark').addClass('ch')
            })
            $all.removeClass('half').addClass('ch');
            act = true;
        } else if ($all.hasClass('ch') || !act) {
            $offs.find('.offer').each(function() {
                $(this).find('.myMark').removeClass('ch')
            })
            $all.removeClass('half').removeClass('ch');
            act = true;
        }
    }
}

function _removeUI(e) {
    if ($warn.hasClass('op')) {
        let name = $(e.target).closest('.offer').find('.name').text();
        let ok = confirm(`Удалить программу: ${name} ?`);
        if (ok) {
            _remove(name)
        }
    }
}

function _remove(name) {
    _wait();
    let obj = {
        selfId,
        name
    };

    function _del(obj) {
        $.ajax({
            url: `${server}/removeOffer`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            data: JSON.stringify(obj)
        }).done(r => {
            _removeDOM(r);
        }).fail((x, s, e) => {
            let er = e.toLowerCase();
            if (er.includes('bad') || x.status >= 400)
                _del(obj);
        })
    };

    _del(obj);
}

function _addUI() {
    if ($warn.hasClass('op')) {
        let txt;
        info = {};
        if (arguments.length == 0) {
            txt = prompt('Введите логин и e-mail. Если записей несколько, то разделите их запятой:', '');
        } else
            txt = prompt(arguments[0], arguments[1]);
        let val = txt == null ? '' : txt.trim();
        if (val != '') {
            let err = [];
            let email = [];
            let arr = val.split(k);
            for (let u of arr) {
                let jo = u.split(log);
                if (jo.length == 1) {
                    email.push(jo[0])
                } else {
                    if (!log.test(jo[0])) {
                        if (reg.test(jo[1])) {
                            info[jo[0]] = {
                                email: jo[1]
                            }
                        } else
                            err.push(jo[1])
                    } else {
                        err.push(jo.join(' '))
                    }
                }
            }
            if (email.length != 0 || err.length != 0) {
                let mes = '';
                if (err.length != 0) {
                    mes += 'Ошибки в написании:\n• ';
                    mes += err.join(',\n• ') + '.\n\n';
                }
                if (email.length != 0) {
                    mes += 'Нет e-mail:\n• ';
                    mes += email.join(',\n• ') + '.\n\n';
                }
                mes += 'Исправьте, пожалуйста и повторите:'
                _addUI(mes, val);
            } else if (email.length == 0 && err.length == 0) {
                for (let a of $off) {
                    if (info.hasOwnProperty($(a).find('.name').text()))
                        delete(info[$(a).find('.name').text()])
                }
                if (Object.keys(info).length != 0) {
                    _add(info)
                }
            }
        } else {}
    }
}

function _add(obj) {
    let keys = Object.keys(obj);
    let total = keys.length;
    let iter = 0;
    let err = [];

    function _findId(name) {
        $.get(`${location.href}toolbox/autocomplete/?term=${name}`).done(r => {
            let ex = false;
            if (r.length == 0) {
                err.push(name);
                ++iter;
            } else {
                for (let i = 0; i < r.length; i++) {
                    if (r[i].value == name) {
                        obj[name].id = r[i].label;
                        ex = true;
                        ++iter;
                        break;
                    }
                }
                if (!ex) {
                    err.push(name);
                    ++iter;
                }
            }
            if (iter == total) {
                if (err.length != 0) {
                    let mes = 'Логин не найден:\n• ';
                    mes += err.join(',\n• ') + '.\n\n';
                    mes += 'Исправьте, пожалуйста и повторите:';
                    let val = '';
                    let arr = [];
                    for (let i in info) {
                        arr.push(`${i} ${info[i].email}`);
                    }
                    val = arr.join(', ');
                    _addUI(mes, val);
                } else {
                    info.selfId = selfId;

                    function _addOff(info) {
                        $.ajax({
                            url: `${server}/addOffers`,
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            data: JSON.stringify(info)
                        }).done(r => {
                            _addDOM(r);
                        }).fail((x, s, e) => {
                            let er = e.toLowerCase();
                            if (er.includes('bad') || x.status >= 400)
                                _addOff(info);
                        })
                    }
                    _addOff(info);
                }
            }
        }).fail((x, s, e) => {
            let er = e.toLowerCase();
            if (er.includes('bad') || x.status >= 400)
                _findId(name)
        })
    }

    for (let i of keys) {
        _findId(i)
    }
}

function _addDOM(obj) {
    let dom = function(name) {
        return `<div class="offer d-flex align-items-center">
						<div class="myMark ch"></div>
						<div class="name">${name}</div>
						<div class="input d-flex">
							<input type="text" class="email" value="">
							<div class="check">
								<i class="fas fa-check"></i>
							</div>
						</div>
                        <div class="date-sent">00.00<br>00:00</div>
						<div class="download">
							<i class="fas fa-file-download"></i>
						</div>
						<div class="sent">
							<i class="far fa-envelope"></i>
						</div>
						<div class="erase">
							<i class="fas fa-times"></i>
						</div>
					</div>
					`
    };
    for (let i of obj) {
        let $dom = $(dom(i));
        $offs.append($dom);
        _sortOffs()
    }
    _wait()
};

function _removeDOM(name) {
    $(`.name:contains('${name}')`).closest('.offer').remove();
    _wait();
}

function _changeEmail(off, email) {
    _wait();

    function _change(obj) {
        $.ajax({
            url: `${server}/changeEmail`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            data: JSON.stringify(obj)
        }).done(r => {
            $(`.name:contains('${off}')`).closest('.offer').find('.input').removeClass('front');
            _wait()
        }).fail((x, s, e) => {
            let er = e.toLowerCase();
            if (er.includes('bad') || x.status >= 400)
                _change(obj);
        })
    }
    _change({
        [off]: email,
        selfId
    })

}

function _sortOffs() {
    let $dom = $offs.find('.offer').sort((a, b) => {
        let aN = $(a).find('.name').text().toLowerCase();
        let bN = $(b).find('.name').text().toLowerCase();
        let aNI = aN[0];
        let bNI = bN[0];
        if (aNI > bNI)
            return 1
        else if (aNI < bNI)
            return -1
        else if (aNI == bNI) {
            aNI = aN[1];
            bNI = bN[1];
            if (aNI > bNI)
                return 1
            else if (aNI < bNI)
                return -1
            else if (aNI == bNI) {
                aNI = aN[2];
                bNI = bN[2];
                if (aNI > bNI)
                    return 1
                else if (aNI < bNI)
                    return -1
                else if (aNI == bNI) {
                    return 0
                }
            }
        }
    });
    $offs.find('.offer').remove();
    $offs.append($dom);
    $dom.each(function() {
        let $dom = $(this);
        $dom.draggable({
            axis: 'x',
            containment: [-19, 0, 17, 0],
            grid: [34, 0],
            distance: 15
        })
        $dom.find('.name').bind({
            dblclick: e => {
                e.stopImmediatePropagation();
                let inp = $(e.target).parent().find('.input');
                $dom.parent().children().each(function() {
                    let inp = $(this).find('.input');
                    if (inp[0] != $(e.target).parent().find('.input')[0])
                        inp.removeClass('front')
                })
                let act = false;
                if (!inp.hasClass('front') && !act) {
                    function _getE(name) {
                        $.get(`${server}/getEmail?selfid=${selfId}&name=${name}`).done(r => {
                            inp.find('input').val(r);
                            current = r;
                            inp.find('input').removeClass('wrong');
                            inp.addClass('front');
                            act = true;
                        }).fail((x, s, e) => {
                            let er = e.toLowerCase();
                            if (er.includes('bad') || x.status >= 400)
                                _getE(name)
                        })
                    }
                    _getE($(e.target).parent().find('.name').text())
                } else if (inp.hasClass('front') && !act) {
                    inp.find('input').val(current);
                    inp.removeClass('front');
                    act = true;
                }
            }
        })
        $dom.find('.check').bind({
            click: _changeEmailUI
        })
        $dom.find('input').bind({
            keypress: _chance
        })
        $dom.find('.myMark').bind({
            click: _check
        })
        $dom.find('.erase').bind({
            click: _removeUI
        })
    })
    _wait();
}

if (queue.hasOwnProperty(status)) {
    switch (queue.status) {
        case "stop":
            {
                $down.removeClass('inactive');
                $send.removeClass('inactive');
                $warn.addClass('op');
                break;
            }
        case "download":
            {
                $down.addClass('inactive');
                $send.removeClass('inactive');
                let ii = Object.keys(queue.offers).length;
                let i = 0;
                for (let y in queue.offers) {
                    if (queue.offers[y].data)
                        ++i
                }
                $warnT = down;
                $warn1 = i;
                $warn2 = ii;
                $warn.removeClass('op');
                break;
            }
        case "send":
            {
                $down.removeClass('inactive');
                $send.addClass('inactive');
                let ii = Object.keys(queue.offers).length;
                let i = 0;
                for (let y in queue.offers) {
                    if (queue.offers[y].letter)
                        ++i
                }
                $warnT = send;
                $warn1 = i;
                $warn2 = ii;
                $warn.removeClass('op');
                break;
            }
    };
}

function _refreshQueue(off) {
    $.post({
        url: `${server}/refreshQueue`,
        headers: {
            'Content-Type': 'application/json'
        },
        method: 'POST',
        data: JSON.stringify({
            offers: off
        })
    }).done(r => {
        _updateRefresh(r)
    }).fail((x, s, e) => {
        let er = e.toLowerCase();
        if (er.includes('bad') || x.status >= 400)
            _refreshQueue(off);
    })
}

function _updateRefresh(obj) {
    let $off = $('.offers').find('.offer');
    for (let i of $off) {
        let $mark = $(i).find('.myMark');
        if ($mark.hasClass('ch')) {
            let name = $(i).find('.name').text();
            if (obj.hasOwnProperty(name)) {
                if (obj[name].sent == null)
                    $(i).find('.date-sent').removeClass('.view')
                else if (obj[name].sent != null) {
                    $(i).find('.date-sent').html(obj[name].sent.replace(', ', '<br>'))
                }
                $(i).find('.download').removeClass('.done');
                $(i).find('.sent').removeClass('.done');
            }
        }
    }

    $standby.removeClass('inactive')
}

function _start(e) {
    let $b = $(e.target).hasClass('myButton') ? $(e.target) : $(e.target).closest('.reject');
    if ($('.inactive').length == 0) {
        let off = [];
        process = {};
        let status;
        if ($b.hasClass('blue'))
            status = 'download';
        else if ($b.hasClass('green'))
            status = 'send';
        else if ($b.hasClass('neutral'))
            status = 'refresh';
        else if ($b.hasClass('reject'))
            status = 'stop';
        let $off = $('.offers').find('.offer');
        let que = {};

        for (let i of $off) {
            let $mark = $(i).find('.myMark');
            if ($mark.hasClass('ch')) {
                let name = $(i).find('.name').text();
                if (status == 'download') {
                    if (!$(i).find('.download').hasClass('done')) {
                        process[name] = {
                            data: false,
                            link: null,
                            date: null,
                            sent: null,
                            letter: false
                        }
                    }
                } else if (status == 'send') {
                    if (!$(i).find('.sent').hasClass('done')) {
                        process[name] = {
                            data: false,
                            link: null,
                            date: null,
                            sent: null,
                            letter: false
                        }
                    }
                } else if (status == 'refresh') {
                    off.push(name);
                }
            }
        }
        _wait();

        if (status == 'refresh')
            if (off.length != 0) {
                $standby.addClass('inactive')
                _refreshQueue(off);
            } else

            {
                function _updateStatus(status) {
                    $.get(`${server}/changeStatus?selfid=${selfId}&status=${status}`).done(r => {
                        if (Object.keys(process).length != 0) {
                            switch (status) {
                                case "download":
                                    {
                                        $down.addClass('inactive')
                                        let ii = Object.keys(process).length;
                                        let i = 0;
                                        $warnT = down;
                                        $warn1 = i;
                                        $warn2 = ii;
                                        chrome.runtime.sendMessage(`${selfId}`, {
                                            pin: 'download',
                                            bag: process,
                                            date: $dat.val().split(' - ')
                                        });
                                        setTimeout(_needQueue, 5 * 1000)
                                        break;
                                    }
                                case "send":
                                    {
                                        $send.addClass('inactive')
                                        let ii = Object.keys(process).length;
                                        let i = 0;
                                        $warnT = send;
                                        $warn1 = i;
                                        $warn2 = ii;

                                        break;
                                    }
                                case "stop":
                                    {
                                        chrome.runtime.sendMessage(`${selfId}`, {
                                            pin: 'cancel'
                                        });
                                    }
                            }
                        }
                        if (status == 'stop') {
                            $send.removeClass('inactive');
                            $down.removeClass('inactive')
                            $warn.addClass('op');
                        }
                        _wait();

                    }).fail((x, s, e) => {
                        let er = e.toLowerCase();
                        if (er.includes('bad') || x.status >= 400)
                            _updateStatus(status)
                    })
                }

                _updateStatus(status)
            }

    }

}

_wait();
_appendDOM();

$dat.daterangepicker({
    locale: {
        "format": "DD.MM.YYYY",
        "applyLabel": "Применить",
        "cancelLabel": "Отмена",
        "fromLabel": "От",
        "toLabel": "До",
        "customRangeLabel": "Custom",
        "weekLabel": "W",
        "daysOfWeek": [
            "Вс",
            "Пн",
            "Вт",
            "Ср",
            "Чт",
            "Пт",
            "Сб"
        ],
        "monthNames": [
            "Январь",
            "Февраль",
            "Март",
            "Апрель",
            "Май",
            "Июнь",
            "Июль",
            "Август",
            "Сентябрь",
            "Октябрь",
            "Ноябрь",
            "Декабрь"
        ],
        "firstDay": 1
    },
    alwaysShowCalendars: true
        /*,
                 startDate: _storageDate.start,
                 endDate: _storageDate.end*/
}, function(start, end, label) {
    $dat.val(start.format('DD.MM.YYYY') + ' - ' + end.format('DD.MM.YYYY'));
});

$add.bind('click', e => {
    _addUI();
});

$all.bind('click', _checkAll);

$stop.add($all).add($down).add($send).add($standby).bind('click', _start);

$(window).bind('resize', _adjust);